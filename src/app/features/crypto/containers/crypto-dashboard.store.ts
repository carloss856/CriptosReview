import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

import { CryptoMetricsWorkerService } from '../../../core/services/crypto-metrics-worker.service';
import { CryptoPriceFeedService } from '../../../core/services/crypto-price-feed.service';
import { CryptoRealChartService } from '../../../core/services/crypto-real-chart.service';
import { CryptoRealPriceService } from '../../../core/services/crypto-real-price.service';
import { CryptoAsset } from '../models/crypto-asset.model';
import { Metrics } from '../models/metrics.model';

type SimRange = 'sec' | 'min' | 'hour' | 'day';
type RealRange = 'day' | 'week' | 'month' | 'year' | 'all';
type ChartRange = SimRange | RealRange;
type ChartOption = { key: ChartRange; label: string };

type CryptoAssetVM = CryptoAsset & {
  threshold?: number;
  movingAverage?: number;
  volatility?: number;
  chartPoints?: number[];
  chartRange?: ChartRange;
};

@Injectable({ providedIn: 'root' })
export class CryptoDashboardStore {
  private readonly storageKey = 'crypto_thresholds';
  private readonly windowSize = 50;
  private readonly tickInterval = 5;
  private readonly simMaxPoints = 60;
  private readonly simRates: Record<SimRange, number> = {
    sec: 1,
    min: 5,
    hour: 60,
    day: 300
  };
  private readonly simChartOptions: ChartOption[] = [
    { key: 'sec', label: '1S' },
    { key: 'min', label: '1M' },
    { key: 'hour', label: '1H' },
    { key: 'day', label: '1D' }
  ];
  private readonly realChartOptions: ChartOption[] = [
    { key: 'day', label: '1D' },
    { key: 'week', label: '1S' },
    { key: 'month', label: '1M' },
    { key: 'year', label: '1A' },
    { key: 'all', label: 'MAX' }
  ];
  private readonly destroyRef = inject(DestroyRef);
  private readonly feed = inject(CryptoPriceFeedService);
  private readonly realFeed = inject(CryptoRealPriceService);
  private readonly realCharts = inject(CryptoRealChartService);
  private readonly metricsWorker = inject(CryptoMetricsWorkerService);

  private readonly assetsSignal = signal<CryptoAsset[]>([]);
  private readonly thresholdsSignal = signal<Record<string, number>>({});
  private readonly priceHistorySignal = signal<Record<string, number[]>>({});
  private readonly metricsSignal = signal<Record<string, Metrics>>({});
  private readonly dataSourceSignal = signal<'simulated' | 'real'>('simulated');
  private readonly chartRangesSignal = signal<Record<string, ChartRange>>({});
  private readonly simHistorySignal = signal<Record<string, Record<SimRange, number[]>>>({});
  private readonly realHistorySignal = signal<Record<string, number[]>>({});
  private readonly dataSource$ = toObservable(this.dataSourceSignal);
  private readonly chartRanges$ = toObservable(this.chartRangesSignal);
  private readonly assets$ = toObservable(this.assetsSignal);
  private readonly assetIds$ = this.assets$.pipe(
    map((assets) => assets.map((asset) => asset.id).join('|')),
    distinctUntilChanged()
  );
  readonly assets = this.assetsSignal.asReadonly();
  readonly dataSource = this.dataSourceSignal.asReadonly();
  readonly chartRanges = this.chartRangesSignal.asReadonly();
  readonly chartOptions = computed<ChartOption[]>(() =>
    this.dataSourceSignal() === 'real' ? this.realChartOptions : this.simChartOptions
  );
  private initialized = false;
  private tickCounter = 0;

  readonly assetsWithThresholds = computed<CryptoAssetVM[]>(() => {
    const thresholds = this.thresholdsSignal();
    const metrics = this.metricsSignal();
    const chartRanges = this.chartRangesSignal();
    const simHistory = this.simHistorySignal();
    const realHistory = this.realHistorySignal();
    const source = this.dataSourceSignal();
    return this.assetsSignal().map((asset) => {
      const metric = metrics[asset.id];
      const range = this.getRangeForAsset(chartRanges, asset.id, source);
      const chartPoints =
        source === 'real'
          ? realHistory[asset.id] ?? []
          : this.isSimRange(range)
            ? simHistory[asset.id]?.[range] ?? []
            : [];
      return {
        ...asset,
        threshold: thresholds[asset.id] ?? undefined,
        movingAverage: metric?.movingAverage,
        volatility: metric?.volatility,
        chartPoints,
        chartRange: range
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
    combineLatest([this.dataSource$, this.chartRanges$, this.assetIds$])
      .pipe(
        switchMap(([source, ranges]) => {
          if (source !== 'real') {
            return of({});
          }

          const assets = this.assetsSignal();
          if (!assets.length) {
            return of({});
          }

          const requests = assets.map((asset) =>
            this.isRealRange(ranges[asset.id] ?? 'day')
              ? this.realCharts
                  .getHistory$(asset.id, (ranges[asset.id] ?? 'day') as RealRange)
                  .pipe(map((prices) => ({ id: asset.id, prices })))
              : of({ id: asset.id, prices: [] })
          );

          return combineLatest(requests).pipe(
            map((entries) =>
              entries.reduce(
                (acc, entry) => ({ ...acc, [entry.id]: entry.prices }),
                {} as Record<string, number[]>
              )
            )
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((series) => this.realHistorySignal.set(series));
    this.dataSource$
      .pipe(
        tap(() => {
          this.tickCounter = 0;
          this.priceHistorySignal.set({});
          this.metricsSignal.set({});
          this.simHistorySignal.set({});
          this.realHistorySignal.set({});
        }),
        switchMap((source) =>
          source === 'real' ? this.realFeed.getAssets$() : this.feed.getAssets$()
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((assets) => {
        this.assetsSignal.set(assets);
        this.tickCounter += 1;
        this.ensureChartRanges(assets);
        const history = this.updatePriceHistory(assets);
        this.priceHistorySignal.set(history);

        if (this.dataSourceSignal() === 'simulated') {
          this.updateSimHistory(assets);
        }

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

  setDataSource(source: 'simulated' | 'real'): void {
    this.dataSourceSignal.set(source);
  }

  setChartRange(assetId: string, range: ChartRange): void {
    this.chartRangesSignal.update((current) => ({
      ...current,
      [assetId]: range
    }));
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

  private updateSimHistory(assets: CryptoAsset[]): void {
    const current = this.simHistorySignal();
    const next: Record<string, Record<SimRange, number[]>> = { ...current };

    assets.forEach((asset) => {
      const existing = current[asset.id] ?? { sec: [], min: [], hour: [], day: [] };
      const updated: Record<SimRange, number[]> = { ...existing };

      (Object.keys(this.simRates) as SimRange[]).forEach((range) => {
        if (this.tickCounter % this.simRates[range] === 0) {
          const series = [...(existing[range] ?? []), asset.price];
          updated[range] = series.slice(-this.simMaxPoints);
        }
      });

      next[asset.id] = updated;
    });

    this.simHistorySignal.set(next);
  }

  private isSimRange(range: ChartRange): range is SimRange {
    return range === 'sec' || range === 'min' || range === 'hour' || range === 'day';
  }

  private isRealRange(range: ChartRange): range is RealRange {
    return range === 'day' || range === 'week' || range === 'month' || range === 'year' || range === 'all';
  }

  private getRangeForAsset(
    ranges: Record<string, ChartRange>,
    assetId: string,
    source: 'simulated' | 'real'
  ): ChartRange {
    const fallback: ChartRange = source === 'real' ? 'day' : 'sec';
    const current = ranges[assetId];
    if (!current) {
      return fallback;
    }

    if (source === 'real' && this.isRealRange(current)) {
      return current;
    }

    if (source === 'simulated' && this.isSimRange(current)) {
      return current;
    }

    return fallback;
  }

  private ensureChartRanges(assets: CryptoAsset[]): void {
    this.chartRangesSignal.update((current) => {
      const source = this.dataSourceSignal();
      const next = { ...current };
      assets.forEach((asset) => {
        const desired = this.getRangeForAsset(current, asset.id, source);
        next[asset.id] = desired;
      });
      return next;
    });
  }
}
