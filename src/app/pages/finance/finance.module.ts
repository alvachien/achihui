import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinanceRoutingModule } from './finance-routing.module';
import { FinanceComponent } from '../finance/finance.component';
import { CurrencyComponent } from './currency/currency.component';

@NgModule({
  declarations: [
    FinanceComponent,
    CurrencyComponent
  ],
  imports: [
    CommonModule,
    FinanceRoutingModule
  ]
})
export class FinanceModule { }
