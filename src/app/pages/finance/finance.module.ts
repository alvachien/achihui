import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { FinanceRoutingModule } from './finance-routing.module';
import { FinanceComponent } from '../finance/finance.component';
import { CurrencyComponent } from './currency/currency.component';

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
    FinanceRoutingModule,
  ]
})
export class FinanceModule { }
