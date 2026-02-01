import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { CryptoAssetCardComponent } from '../components/crypto-asset-card/crypto-asset-card.component';
import { CryptoDashboardStore } from './crypto-dashboard.store';

@Component({
  selector: 'app-crypto-dashboard',
  standalone: true,
  imports: [CryptoAssetCardComponent],
  templateUrl: './crypto-dashboard.component.html',
  styleUrls: ['./crypto-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoDashboardComponent implements OnInit {
  private readonly store = inject(CryptoDashboardStore);
  readonly assets = this.store.sortedAssets;

  ngOnInit(): void {
    this.store.init();
  }

  onThresholdChange(payload: { assetId: string; value: number | null }): void {
    this.store.setThreshold(payload.assetId, payload.value);
  }

  onThresholdClear(assetId: string): void {
    this.store.clearThreshold(assetId);
  }
}
