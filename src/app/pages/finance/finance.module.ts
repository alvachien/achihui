import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinanceRoutingModule } from './finance-routing.module';
import { FinanceComponent } from '../finance/finance.component';
import { AccountComponent } from './account/account.component';


@NgModule({
  declarations: [FinanceComponent, AccountComponent],
  imports: [
    CommonModule,
    FinanceRoutingModule
  ]
})
export class FinanceModule { }
