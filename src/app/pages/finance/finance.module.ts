import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { TranslocoModule } from '@ngneat/transloco';

import { FinanceRoutingModule } from './finance-routing.module';
import { FinanceComponent } from '../finance/finance.component';
import { CurrencyComponent } from './currency';

@NgModule({
  declarations: [
    FinanceComponent,
    CurrencyComponent,
  ],
  imports: [
    CommonModule,
    NzBreadCrumbModule,
    NzPageHeaderModule,
    NzTableModule,
    NzDividerModule,
    NzStatisticModule,
    NzGridModule,
    NzCardModule,
    NzSpinModule,
    TranslocoModule,
    FinanceRoutingModule,
  ]
})
export class FinanceModule { }
