import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceUIModule } from './finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { FinanceRoutingModule } from './finance-routing.module';
import { FinanceAssetDepreciationDlgComponent, FinanceComponent } from '../finance/finance.component';
import { CurrencyComponent } from './currency';

@NgModule({
  declarations: [
    FinanceComponent, 
    FinanceAssetDepreciationDlgComponent, 
    CurrencyComponent
  ],
  imports: [
    CommonModule,
    FinanceUIModule,
    TranslocoModule,
    FinanceRoutingModule,
    NzToolTipModule,
  ],
})
export class FinanceModule {}
