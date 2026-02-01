import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { CryptoDashboardStore } from './crypto-dashboard.store';

@Component({
  selector: 'app-crypto-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1>Criptos en tiempo real</h1>
      <ul>
        @for (asset of assets(); track asset.id) {
          <li>
            <strong>{{ asset.symbol }}</strong>
            <span>
              {{
                asset.price
                  | number: asset.symbol === 'ADA' || asset.symbol === 'XRP' ? '1.4-4' : '1.2-2'
              }}
            </span>
            <small>{{ asset.changePercent | number: '1.2-2' }}%</small>
          </li>
        }
      </ul>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoDashboardComponent implements OnInit {
  private readonly store = inject(CryptoDashboardStore);
  readonly assets = this.store.sortedAssets;

  ngOnInit(): void {
    this.store.init();
  }
}
