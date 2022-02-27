import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { AccountRoutingModule } from './account-routing.module';
import { AccountComponent } from './account.component';
import { AccountListComponent } from './account-list';
import { AccountDetailComponent } from './account-detail';
import { AccountHierarchyComponent } from './account-hierarchy';
import { AccountExtraDownpaymentComponent } from './account-extra-downpayment';
import { AccountExtraAssetComponent } from './account-extra-asset';
import { AccountExtraLoanComponent } from './account-extra-loan';
import { DocumentItemViewModule } from '../document-item-view/document-item-view.module';
// Dialogs
import { AccountChangeNameDialogComponent } from './account-change-name-dialog';
import { AccountSettleDialogComponent } from './account-settle-dialog';

@NgModule({
  declarations: [
    AccountComponent,
    AccountListComponent,
    AccountHierarchyComponent,
    AccountDetailComponent,
    AccountExtraDownpaymentComponent,
    AccountExtraAssetComponent,
    AccountExtraLoanComponent,
    AccountChangeNameDialogComponent,
    AccountSettleDialogComponent,
  ],
  imports: [
    CommonModule,
    FinanceUIModule,
    AccountRoutingModule,
    TranslocoModule,
    DocumentItemViewModule,
  ],
  exports: [
    AccountExtraDownpaymentComponent,
    AccountExtraAssetComponent,
    AccountExtraLoanComponent,
  ]
})
export class AccountModule { }
