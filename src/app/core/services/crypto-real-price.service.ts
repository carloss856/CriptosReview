import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { catchError, scan, shareReplay, switchMap } from 'rxjs/operators';

import { CryptoAsset } from '../../features/crypto/models/crypto-asset.model';

type CoinGeckoResponse = Record<string, { usd: number; usd_24h_change?: number }>;

type AssetMeta = {
  assetId: string;
  apiId: string;
  symbol: string;
  name: string;
  decimals: number;
  seedPrice: number;
};

@Injectable({ providedIn: 'root' })
export class CryptoRealPriceService {
  private readonly refreshMs = 60000;

  private readonly assetCatalog: AssetMeta[] = [
    { assetId: 'btc', apiId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', decimals: 2, seedPrice: 52350 },
    { assetId: 'eth', apiId: 'ethereum', symbol: 'ETH', name: 'Ethereum', decimals: 2, seedPrice: 2840 },
    { assetId: 'sol', apiId: 'solana', symbol: 'SOL', name: 'Solana', decimals: 2, seedPrice: 112 },
    { assetId: 'ada', apiId: 'cardano', symbol: 'ADA', name: 'Cardano', decimals: 4, seedPrice: 0.46 },
    { assetId: 'xrp', apiId: 'ripple', symbol: 'XRP', name: 'XRP', decimals: 4, seedPrice: 0.61 }
  ];

  private readonly apiUrl =
    '/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,ripple&vs_currencies=usd&include_24hr_change=true';

  private readonly assets$: Observable<CryptoAsset[]> = timer(0, this.refreshMs).pipe(
    switchMap(() =>
      this.http.get<CoinGeckoResponse>(this.apiUrl).pipe(catchError(() => of(null)))
    ),
    scan(
      (prev, response) => (response ? this.mapResponse(response, prev) : prev),
      this.initialAssets
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private readonly http: HttpClient) {}

  getAssets$(): Observable<CryptoAsset[]> {
    return this.assets$;
  }

  private get initialAssets(): CryptoAsset[] {
    return this.assetCatalog.map((meta) => ({
      id: meta.assetId,
      symbol: meta.symbol,
      name: meta.name,
      price: meta.seedPrice,
      changePercent: 0
    }));
  }

  private mapResponse(response: CoinGeckoResponse, prev: CryptoAsset[]): CryptoAsset[] {
    const previousById = new Map(prev.map((asset) => [asset.id, asset]));

    return this.assetCatalog.map((meta) => {
      const entry = response[meta.apiId];
      if (!entry) {
        return (
          previousById.get(meta.assetId) ?? {
            id: meta.assetId,
            symbol: meta.symbol,
            name: meta.name,
            price: meta.seedPrice,
            changePercent: 0
          }
        );
      }

      return {
        id: meta.assetId,
        symbol: meta.symbol,
        name: meta.name,
        price: this.round(entry.usd, meta.decimals),
        changePercent: this.round(entry.usd_24h_change ?? 0, 2)
      };
    });
  }

  private round(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }
}
