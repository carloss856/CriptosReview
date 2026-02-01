import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CryptoAsset } from '../../models/crypto-asset.model';
import { PriceFlashDirective } from '../../../../shared/directives/price-flash.directive';

type CryptoAssetViewModel = CryptoAsset & {
  movingAverage?: number;
  volatility?: number;
};

@Component({
  selector: 'app-crypto-asset-card',
  standalone: true,
  imports: [CommonModule, PriceFlashDirective],
  templateUrl: './crypto-asset-card.component.html',
  styleUrls: ['./crypto-asset-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoAssetCardComponent {
  @Input({ required: true }) asset!: CryptoAssetViewModel;
  @Output() thresholdChange = new EventEmitter<{ assetId: string; value: number | null }>();
  @Output() thresholdClear = new EventEmitter<string>();
  thresholdDraft: string | null = null;

  get priceDigits(): string {
    return this.asset.symbol === 'ADA' || this.asset.symbol === 'XRP' ? '1.4-4' : '1.2-2';
  }

  get changeClass(): string {
    if (this.asset.changePercent > 0) {
      return 'is-positive';
    }

    if (this.asset.changePercent < 0) {
      return 'is-negative';
    }

    return '';
  }

  get changeLabel(): string {
    const sign =
      this.asset.changePercent > 0 ? '+' : this.asset.changePercent < 0 ? '-' : '';
    return `${sign}${Math.abs(this.asset.changePercent).toFixed(2)}%`;
  }

  get isAlert(): boolean {
    return this.asset.threshold !== undefined && this.asset.price >= this.asset.threshold;
  }

  get movingAverageLabel(): string {
    return this.asset.movingAverage === undefined ? '—' : this.asset.movingAverage.toFixed(2);
  }

  get volatilityLabel(): string {
    return this.asset.volatility === undefined ? '—' : this.asset.volatility.toFixed(4);
  }

  get thresholdStep(): string {
    return this.asset.symbol === 'ADA' || this.asset.symbol === 'XRP' ? '0.0001' : '0.01';
  }

  get thresholdDisplayValue(): string | number {
    return this.thresholdDraft ?? (this.asset.threshold ?? '');
  }

  onThresholdInput(rawValue: string): void {
    this.thresholdDraft = rawValue;
  }

  onThresholdCommit(rawValue: string): void {
    const trimmed = rawValue.trim();
    this.thresholdDraft = null;

    if (trimmed === '') {
      this.thresholdChange.emit({ assetId: this.asset.id, value: null });
      return;
    }

    const normalized = trimmed.replace(',', '.');
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      return;
    }

    this.thresholdChange.emit({ assetId: this.asset.id, value: parsed });
  }

  onClearThreshold(): void {
    this.thresholdDraft = null;
    this.thresholdClear.emit(this.asset.id);
  }
}
