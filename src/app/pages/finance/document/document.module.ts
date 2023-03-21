import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { FinanceUIModule } from '../finance-ui.module';

import { DocumentRoutingModule } from './document-routing.module';
import { DocumentComponent } from './document.component';
import { DocumentListComponent } from './document-list';
import { DocumentDetailComponent } from './document-detail';
import { DocumentHeaderComponent } from './document-header';
import { DocumentItemsComponent } from './document-items';
import { DocumentNormalCreateComponent } from './document-normal-create';
import { DocumentTransferCreateComponent } from './document-transfer-create';
import { DocumentDownpaymentCreateComponent } from './document-downpayment-create';
import { DocumentAssetBuyCreateComponent } from './document-asset-buy-create';
import { DocumentAssetSoldCreateComponent } from './document-asset-sold-create';
import { DocumentLoanCreateComponent } from './document-loan-create';
import { DocumentAssetValueChangeCreateComponent } from './document-asset-value-change-create';
import { DocumentNormalMassCreateComponent } from './document-normal-mass-create';
import { DocumentRecurredMassCreateComponent } from './document-recurred-mass-create';
import { DocumentNormalMassCreateItemComponent } from './document-normal-mass-create-item';
import { AccountModule } from '../account/account.module';
import { DocumentLoanRepayCreateComponent } from './document-loan-repay-create';
import { DocumentChangeDateDialogComponent } from './document-change-date-dialog';
import { DocumentChangeDespDialogComponent } from './document-change-desp-dialog';

@NgModule({
  declarations: [
    DocumentComponent,
    DocumentListComponent,
    DocumentDetailComponent,
    DocumentHeaderComponent,
    DocumentItemsComponent,
    DocumentNormalCreateComponent,
    DocumentTransferCreateComponent,
    DocumentDownpaymentCreateComponent,
    DocumentAssetBuyCreateComponent,
    DocumentAssetSoldCreateComponent,
    DocumentLoanCreateComponent,
    DocumentAssetValueChangeCreateComponent,
    DocumentNormalMassCreateComponent,
    DocumentRecurredMassCreateComponent,
    DocumentNormalMassCreateItemComponent,
    DocumentLoanRepayCreateComponent,
    DocumentChangeDateDialogComponent,
    DocumentChangeDespDialogComponent,
  ],
  imports: [CommonModule, FinanceUIModule, DocumentRoutingModule, TranslocoModule, AccountModule],
})
export class DocumentModule {}
