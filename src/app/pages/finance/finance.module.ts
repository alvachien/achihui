import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceUIModule } from './finance-ui.module';
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
    FinanceUIModule,
    TranslocoModule,
    FinanceRoutingModule,
  ],
})
export class FinanceModule { }
