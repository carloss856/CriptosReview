import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CryptoMetricsWorkerService } from '../../../core/services/crypto-metrics-worker.service';
import { CryptoPriceFeedService } from '../../../core/services/crypto-price-feed.service';
import { CryptoAsset } from '../models/crypto-asset.model';
import { Metrics } from '../models/metrics.model';

type CryptoAssetVM = CryptoAsset & {
  threshold?: number;
  movingAverage?: number;
  volatility?: number;
};

@Injectable({ providedIn: 'root' })
export class CryptoDashboardStore {
  private readonly storageKey = 'crypto_thresholds';
  private readonly windowSize = 50;
  private readonly tickInterval = 5;
  private readonly destroyRef = inject(DestroyRef);
  private readonly feed = inject(CryptoPriceFeedService);
  private readonly metricsWorker = inject(CryptoMetricsWorkerService);

  private readonly assetsSignal = signal<CryptoAsset[]>([]);
  private readonly thresholdsSignal = signal<Record<string, number>>({});
  private readonly priceHistorySignal = signal<Record<string, number[]>>({});
  private readonly metricsSignal = signal<Record<string, Metrics>>({});
  readonly assets = this.assetsSignal.asReadonly();
  private initialized = false;
  private tickCounter = 0;

  readonly assetsWithThresholds = computed<CryptoAssetVM[]>(() => {
    const thresholds = this.thresholdsSignal();
    const metrics = this.metricsSignal();
    return this.assetsSignal().map((asset) => {
      const metric = metrics[asset.id];
      return {
        ...asset,
        threshold: thresholds[asset.id] ?? undefined,
        movingAverage: metric?.movingAverage,
        volatility: metric?.volatility
      };
    });
  });

  readonly sortedAssets = computed<CryptoAssetVM[]>(() =>
    [...this.assetsWithThresholds()].sort((a, b) => a.symbol.localeCompare(b.symbol))
  );

  init(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.thresholdsSignal.set(this.loadThresholds());
    this.metricsWorker.results$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.metricsSignal.update((current) => ({
          ...current,
          [result.assetId]: {
            assetId: result.assetId,
            movingAverage: result.movingAverage,
            volatility: result.volatility
          }
        }));
      });
    this.feed
      .getAssets$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((assets) => {
        this.assetsSignal.set(assets);
        this.tickCounter += 1;
        const history = this.updatePriceHistory(assets);
        this.priceHistorySignal.set(history);

        if (this.tickCounter % this.tickInterval === 0) {
          assets.forEach((asset) => {
            const series = history[asset.id] ?? [];
            if (series.length >= 2) {
              this.metricsWorker.calculate(asset.id, series);
            }
          });
        }
      });
  }

  setThreshold(assetId: string, value: number | null): void {
    this.thresholdsSignal.update((current) => {
      const next = { ...current };
      if (value === null || !Number.isFinite(value)) {
        delete next[assetId];
      } else {
        next[assetId] = value;
      }

      this.saveThresholds(next);
      return next;
    });
  }

  clearThreshold(assetId: string): void {
    this.thresholdsSignal.update((current) => {
      const next = { ...current };
      delete next[assetId];
      this.saveThresholds(next);
      return next;
    });
  }

  private loadThresholds(): Record<string, number> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw) as Record<string, number>;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private saveThresholds(thresholds: Record<string, number>): void {
    try {
      const cleaned = Object.fromEntries(
        Object.entries(thresholds).filter(([, value]) => Number.isFinite(value))
      ) as Record<string, number>;
      localStorage.setItem(this.storageKey, JSON.stringify(cleaned));
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }

  private updatePriceHistory(assets: CryptoAsset[]): Record<string, number[]> {
    const current = this.priceHistorySignal();
    const next: Record<string, number[]> = { ...current };

    assets.forEach((asset) => {
      const history = [...(current[asset.id] ?? []), asset.price];
      const trimmed = history.slice(-this.windowSize);
      next[asset.id] = trimmed;
    });

    return next;
  }
}
