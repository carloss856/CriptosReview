import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { CryptoAssetCardComponent } from '../components/crypto-asset-card/crypto-asset-card.component';
import { CryptoDashboardStore } from './crypto-dashboard.store';

@Component({
  selector: 'app-crypto-dashboard',
  standalone: true,
  imports: [CommonModule, CryptoAssetCardComponent],
  templateUrl: './crypto-dashboard.component.html',
  styleUrls: ['./crypto-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoDashboardComponent implements OnInit {
  private readonly store = inject(CryptoDashboardStore);
  readonly assets = this.store.sortedAssets;
  readonly dataSource = this.store.dataSource;
  readonly chartOptions = this.store.chartOptions;
  readonly theme = signal<'light' | 'dark'>('light');

  ngOnInit(): void {
    this.store.init();
    const storedTheme = localStorage.getItem('crypto_theme');
    this.setTheme(storedTheme === 'dark' ? 'dark' : 'light');
  }

  onThresholdChange(payload: { assetId: string; value: number | null }): void {
    this.store.setThreshold(payload.assetId, payload.value);
  }

  onThresholdClear(assetId: string): void {
    this.store.clearThreshold(assetId);
  }

  onChartRangeChange(payload: { assetId: string; range: string }): void {
    this.store.setChartRange(
      payload.assetId,
      payload.range as 'sec' | 'min' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
    );
  }

  setDataSource(source: 'simulated' | 'real'): void {
    this.store.setDataSource(source);
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private setTheme(mode: 'light' | 'dark'): void {
    this.theme.set(mode);
    document.body.classList.toggle('theme-dark', mode === 'dark');
    localStorage.setItem('crypto_theme', mode);
  }
}
