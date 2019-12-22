import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentListComponent } from './document-list';
import { DocumentDetailComponent } from './document-detail';
import { DocumentNormalCreateComponent } from './document-normal-create';
import { DocumentDownpaymentCreateComponent } from './document-downpayment-create';
import { DocumentTransferCreateComponent } from './document-transfer-create';
import { DocumentAssetBuyCreateComponent } from './document-asset-buy-create';
import { DocumentAssetSoldCreateComponent } from './document-asset-sold-create';
import { DocumentLoanCreateComponent } from './document-loan-create';

const routes: Routes = [
  { path: '', component: DocumentListComponent },
  
  { path: 'createnormal', component: DocumentNormalCreateComponent },
  { path: 'createtransfer', component: DocumentTransferCreateComponent },

  { path: 'createadp', component: DocumentDownpaymentCreateComponent },
  { path: 'createadr', component: DocumentDownpaymentCreateComponent },
  { path: 'createassetbuy', component: DocumentAssetBuyCreateComponent },
  { path: 'createassetsold', component: DocumentAssetSoldCreateComponent },
  { path: 'createbrwfrm', component: DocumentLoanCreateComponent },

  { path: 'edit', component: DocumentDetailComponent },
  { path: 'display', component: DocumentDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentRoutingModule { }
