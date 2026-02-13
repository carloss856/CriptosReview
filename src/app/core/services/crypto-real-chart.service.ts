import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, scan, shareReplay, switchMap } from 'rxjs/operators';

type CoinGeckoMarketChart = {
  prices: [number, number][];
};

type RealRange = 'day' | 'week' | 'month' | 'year' | 'all';

@Injectable({ providedIn: 'root' })
export class CryptoRealChartService {
  private readonly refreshMs = 300000;
  private readonly cache = new Map<string, Observable<number[]>>();

  private readonly apiIdByAssetId: Record<string, string> = {
    btc: 'bitcoin',
    eth: 'ethereum',
    sol: 'solana',
    ada: 'cardano',
    xrp: 'ripple'
  };

  private readonly daysByRange: Record<RealRange, string> = {
    day: '1',
    week: '7',
    month: '30',
    year: '365',
    all: 'max'
  };

  constructor(private readonly http: HttpClient) {}

  getHistory$(assetId: string, range: RealRange): Observable<number[]> {
    const apiId = this.apiIdByAssetId[assetId];
    if (!apiId) {
      return of([]);
    }

    const key = `${assetId}-${range}`;
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    const days = this.daysByRange[range];
    const url = `/api/v3/coins/${apiId}/market_chart?vs_currency=usd&days=${days}`;

    const stream = timer(0, this.refreshMs).pipe(
      switchMap(() =>
        this.http.get<CoinGeckoMarketChart>(url).pipe(catchError(() => of(null)))
      ),
      map((response) => (response?.prices?.length ? response.prices.map((entry) => entry[1]) : null)),
      scan((previous, next) => (next && next.length ? next : previous), [] as number[]),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(key, stream);
    return stream;
  }
}
