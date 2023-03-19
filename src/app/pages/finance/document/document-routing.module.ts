import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DocumentListComponent } from "./document-list";
import { DocumentDetailComponent } from "./document-detail";
import { DocumentNormalCreateComponent } from "./document-normal-create";
import { DocumentDownpaymentCreateComponent } from "./document-downpayment-create";
import { DocumentTransferCreateComponent } from "./document-transfer-create";
import { DocumentAssetBuyCreateComponent } from "./document-asset-buy-create";
import { DocumentAssetSoldCreateComponent } from "./document-asset-sold-create";
import { DocumentLoanCreateComponent } from "./document-loan-create";
import { DocumentAssetValueChangeCreateComponent } from "./document-asset-value-change-create";
import { DocumentNormalMassCreateComponent } from "./document-normal-mass-create";
import { DocumentRecurredMassCreateComponent } from "./document-recurred-mass-create";
import { DocumentLoanRepayCreateComponent } from "./document-loan-repay-create";

const routes: Routes = [
  { path: "", component: DocumentListComponent },
  { path: "list", component: DocumentListComponent },

  { path: "createnormal", component: DocumentNormalCreateComponent },
  { path: "createtransfer", component: DocumentTransferCreateComponent },
  { path: "masscreatenormal", component: DocumentNormalMassCreateComponent },
  {
    path: "masscreaterecurred",
    component: DocumentRecurredMassCreateComponent,
  },

  { path: "createadp", component: DocumentDownpaymentCreateComponent },
  { path: "createadr", component: DocumentDownpaymentCreateComponent },
  { path: "createassetbuy", component: DocumentAssetBuyCreateComponent },
  { path: "createassetsold", component: DocumentAssetSoldCreateComponent },
  { path: "createbrwfrm", component: DocumentLoanCreateComponent },
  { path: "createlendto", component: DocumentLoanCreateComponent },
  {
    path: "createassetvalchg",
    component: DocumentAssetValueChangeCreateComponent,
  },
  { path: "createloanrepay", component: DocumentLoanRepayCreateComponent },
  {
    path: "createloanrepay/:docid",
    component: DocumentLoanRepayCreateComponent,
  },

  { path: "edit/:id", component: DocumentDetailComponent },
  { path: "display/:id", component: DocumentDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentRoutingModule {}
