import { Injectable } from '@angular/core';
import { Observable, interval, scan, shareReplay, startWith } from 'rxjs';

import { CryptoAsset } from '../../features/crypto/models/crypto-asset.model';

@Injectable({ providedIn: 'root' })
export class CryptoPriceFeedService {
  private readonly initialAssets: CryptoAsset[] = [
    { id: 'btc', symbol: 'BTC', name: 'Bitcoin', price: 52350, changePercent: 0 },
    { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: 2840, changePercent: 0 },
    { id: 'sol', symbol: 'SOL', name: 'Solana', price: 112, changePercent: 0 },
    { id: 'ada', symbol: 'ADA', name: 'Cardano', price: 0.46, changePercent: 0 },
    { id: 'xrp', symbol: 'XRP', name: 'XRP', price: 0.61, changePercent: 0 }
  ];

  private readonly basePriceById: Record<string, number> = this.initialAssets.reduce(
    (acc, asset) => {
      acc[asset.id] = asset.price;
      return acc;
    },
    {} as Record<string, number>
  );

  private readonly volatilityBySymbol: Record<string, number> = {
    BTC: 0.0025,
    ETH: 0.003,
    SOL: 0.005,
    ADA: 0.006,
    XRP: 0.006
  };

  private readonly assets$: Observable<CryptoAsset[]> = interval(200).pipe(
    startWith(0),
    scan((assets) => this.nextAssets(assets), this.initialAssets),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  getAssets$(): Observable<CryptoAsset[]> {
    return this.assets$;
  }

  private nextAssets(assets: CryptoAsset[]): CryptoAsset[] {
    return assets.map((asset) => {
      const volatility = this.volatilityBySymbol[asset.symbol] ?? 0.003;
      const delta = (Math.random() * 2 - 1) * volatility;
      const nextPrice = Math.max(0.01, asset.price * (1 + delta));
      const basePrice = this.basePriceById[asset.id] ?? asset.price;
      const changePercent = ((nextPrice - basePrice) / basePrice) * 100;
      const decimals = this.decimalsBySymbol(asset.symbol);

      return {
        ...asset,
        price: this.round(nextPrice, decimals),
        changePercent: this.round(changePercent, 2)
      };
    });
  }

  private decimalsBySymbol(symbol: string): number {
    return symbol === 'ADA' || symbol === 'XRP' ? 4 : 2;
  }

  private round(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }
}
