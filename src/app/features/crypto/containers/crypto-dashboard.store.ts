import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CryptoPriceFeedService } from '../../../core/services/crypto-price-feed.service';
import { CryptoAsset } from '../models/crypto-asset.model';

@Injectable({ providedIn: 'root' })
export class CryptoDashboardStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly feed = inject(CryptoPriceFeedService);

  private readonly assetsSignal = signal<CryptoAsset[]>([]);
  readonly assets = this.assetsSignal.asReadonly();
  private initialized = false;

  readonly sortedAssets = computed(() =>
    [...this.assetsSignal()].sort((a, b) => a.symbol.localeCompare(b.symbol))
  );

  init(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.feed
      .getAssets$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((assets) => this.assetsSignal.set(assets));
  }
}
