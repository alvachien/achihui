import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { AccountRoutingModule } from './account-routing.module';
import { AccountComponent } from './account.component';
import { AccountListComponent } from './account-list';
import { AccountDetailComponent } from './account-detail';
import { AccountHierarchyComponent } from './account-hierarchy';
import { AccountExtraDownpaymentComponent } from './account-extra-downpayment/account-extra-downpayment.component';
import { AccountExtraAssetComponent } from './account-extra-asset/account-extra-asset.component';
import { AccountExtraLoanComponent } from './account-extra-loan/account-extra-loan.component';

@NgModule({
  declarations: [
    AccountComponent,
    AccountListComponent,
    AccountHierarchyComponent,
    AccountDetailComponent,
    AccountExtraDownpaymentComponent,
    AccountExtraAssetComponent,
    AccountExtraLoanComponent,
  ],
  imports: [
    CommonModule,
    FinanceUIModule,
    AccountRoutingModule,
    TranslocoModule,
  ],
  exports: [
    AccountExtraDownpaymentComponent,
    AccountExtraAssetComponent,
    AccountExtraLoanComponent,
  ]
})
export class AccountModule { }
