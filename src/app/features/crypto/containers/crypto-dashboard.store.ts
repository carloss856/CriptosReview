import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CryptoPriceFeedService } from '../../../core/services/crypto-price-feed.service';
import { CryptoAsset } from '../models/crypto-asset.model';

@Injectable({ providedIn: 'root' })
export class CryptoDashboardStore {
  private readonly storageKey = 'crypto_thresholds';
  private readonly destroyRef = inject(DestroyRef);
  private readonly feed = inject(CryptoPriceFeedService);

  private readonly assetsSignal = signal<CryptoAsset[]>([]);
  private readonly thresholdsSignal = signal<Record<string, number>>({});
  readonly assets = this.assetsSignal.asReadonly();
  private initialized = false;

  readonly assetsWithThresholds = computed(() => {
    const thresholds = this.thresholdsSignal();
    return this.assetsSignal().map((asset) => ({
      ...asset,
      threshold: thresholds[asset.id] ?? undefined
    }));
  });

  readonly sortedAssets = computed(() =>
    [...this.assetsWithThresholds()].sort((a, b) => a.symbol.localeCompare(b.symbol))
  );

  init(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.thresholdsSignal.set(this.loadThresholds());
    this.feed
      .getAssets$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((assets) => this.assetsSignal.set(assets));
  }

  setThreshold(assetId: string, value: number | null): void {
    this.thresholdsSignal.update((current) => {
      const next = { ...current };
      if (value === null || value <= 0) {
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
      const cleaned = Object.fromEntries(Object.entries(thresholds)) as Record<string, number>;
      localStorage.setItem(this.storageKey, JSON.stringify(cleaned));
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }
}
