import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CryptoAsset } from '../../models/crypto-asset.model';
import { PriceFlashDirective } from '../../../../shared/directives/price-flash.directive';

type CryptoAssetViewModel = CryptoAsset & {
  movingAverage?: number;
  volatility?: number;
};

type ChartOption = {
  key: string;
  label: string;
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
  @Input() chartPoints: number[] = [];
  @Input() chartRange = '';
  @Input() chartOptions: ChartOption[] = [];
  @Output() thresholdChange = new EventEmitter<{ assetId: string; value: number | null }>();
  @Output() thresholdClear = new EventEmitter<string>();
  @Output() chartRangeChange = new EventEmitter<{ assetId: string; range: string }>();
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

  get assetIcon(): string {
    switch (this.asset.symbol) {
      case 'BTC':
        return '₿';
      case 'ETH':
        return 'Ξ';
      case 'SOL':
        return '◎';
      case 'ADA':
        return '₳';
      case 'XRP':
        return '✕';
      default:
        return this.asset.symbol;
    }
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

  get sparklinePoints(): string {
    if (!this.chartPoints.length) {
      return '0,16 100,16';
    }

    const min = Math.min(...this.chartPoints);
    const max = Math.max(...this.chartPoints);
    const range = max - min || 1;
    const height = 32;
    const padding = 2;
    const usableHeight = height - padding * 2;

    return this.chartPoints
      .map((value, index) => {
        const x = (index / Math.max(this.chartPoints.length - 1, 1)) * 100;
        const y = height - padding - ((value - min) / range) * usableHeight;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
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

  onRangeSelect(range: string): void {
    this.chartRangeChange.emit({ assetId: this.asset.id, range });
  }
}
