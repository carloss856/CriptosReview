import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type CryptoMetricsResult = {
  assetId: string;
  movingAverage: number;
  volatility: number;
};

@Injectable({ providedIn: 'root' })
export class CryptoMetricsWorkerService {
  private readonly resultsSubject = new Subject<CryptoMetricsResult>();
  readonly results$: Observable<CryptoMetricsResult> = this.resultsSubject.asObservable();

  private worker?: Worker;

  constructor() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(
        new URL('../workers/crypto-metrics.worker', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (event: MessageEvent) => {
        if (event.data?.type !== 'RESULT') {
          return;
        }

        this.resultsSubject.next(event.data.payload as CryptoMetricsResult);
      };

      this.worker.onerror = () => {
        this.worker?.terminate();
        this.worker = undefined;
      };
    }
  }

  calculate(assetId: string, prices: number[]): void {
    if (!prices.length) {
      return;
    }

    if (this.worker) {
      this.worker.postMessage({ type: 'CALC', payload: { assetId, prices } });
      return;
    }

    const result = this.calculateFallback(assetId, prices);
    setTimeout(() => this.resultsSubject.next(result), 0);
  }

  private calculateFallback(assetId: string, prices: number[]): CryptoMetricsResult {
    if (!prices.length) {
      return { assetId, movingAverage: 0, volatility: 0 };
    }

    const movingAverage = prices.reduce((acc, value) => acc + value, 0) / prices.length;

    if (prices.length < 2) {
      return { assetId, movingAverage, volatility: 0 };
    }

    const returns: number[] = [];
    for (let i = 1; i < prices.length; i += 1) {
      const prev = prices[i - 1];
      const curr = prices[i];
      if (prev === 0) {
        continue;
      }

      returns.push((curr - prev) / prev);
    }

    if (returns.length < 2) {
      return { assetId, movingAverage, volatility: 0 };
    }

    const mean = returns.reduce((acc, value) => acc + value, 0) / returns.length;
    const variance =
      returns.reduce((acc, value) => acc + (value - mean) ** 2, 0) / returns.length;

    return { assetId, movingAverage, volatility: Math.sqrt(variance) };
  }
}
