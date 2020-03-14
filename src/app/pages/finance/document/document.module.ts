import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { FinanceUIModule } from '../finance-ui.module';

import { DocumentRoutingModule } from './document-routing.module';
import { DocumentComponent } from './document.component';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentDetailComponent } from './document-detail/document-detail.component';
import { DocumentHeaderComponent } from './document-header/document-header.component';
import { DocumentItemsComponent } from './document-items/document-items.component';
import { DocumentNormalCreateComponent } from './document-normal-create/document-normal-create.component';
import { DocumentTransferCreateComponent } from './document-transfer-create/document-transfer-create.component';
import { DocumentDownpaymentCreateComponent } from './document-downpayment-create/document-downpayment-create.component';
import { DocumentAssetBuyCreateComponent } from './document-asset-buy-create/document-asset-buy-create.component';
import { DocumentAssetSoldCreateComponent } from './document-asset-sold-create/document-asset-sold-create.component';
import { DocumentLoanCreateComponent } from './document-loan-create/document-loan-create.component';
import { DocumentAssetValueChangeCreateComponent } from './document-asset-value-change-create';
import { DocumentNormalMassCreateComponent } from './document-normal-mass-create';
import { AccountModule } from '../account/account.module';

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
  ],
  imports: [
    CommonModule,
    FinanceUIModule,
    DocumentRoutingModule,
    TranslocoModule,
    AccountModule,
  ]
})
export class DocumentModule { }
