import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinanceComponent } from './finance.component';
import { AccountCategoryComponent } from './account-category';
import { AccountCategoryDetailComponent } from './account-category-detail';
import { AccountCategoryListComponent } from './account-category-list';
import { DocumentTypeComponent } from './document-type';
import { DocumentTypeListComponent } from './document-type-list';
import { DocumentTypeDetailComponent } from './document-type-detail';
import { TranTypeComponent } from './tran-type';
import { TranTypeListComponent } from './tran-type-list';
import { TranTypeTreeComponent } from './tran-type-tree';
import { TranTypeDetailComponent } from './tran-type-detail';
import { AssetCategoryComponent } from './asset-category';
import { AssetCategoryListComponent } from './asset-category-list';
import { AssetCategoryDetailComponent } from './asset-category-detail';
import { AccountComponent } from './account';
import { AccountListComponent } from './account-list';
import { AccountTreeComponent } from './account-tree';
import { AccountDetailComponent } from './account-detail';
import { ControlCenterComponent } from './control-center';
import { ControlCenterListComponent } from './control-center-list';
import { ControlCenterTreeComponent } from './control-center-tree';
import { ControlCenterDetailComponent } from './control-center-detail';
import { OrderComponent } from './order';
import { OrderListComponent } from './order-list';
import { OrderDetailComponent } from './order-detail';
import { DocumentComponent } from './document';
import { DocumentListComponent } from './document-list';
import { DocumentDetailComponent } from './document-detail';
import { DocumentADPCreateComponent } from './document-adpcreate';
import { DocumentItemOverviewComponent } from './document-item-overview';
import { DocumentLoanDetailComponent } from './document-loan-detail';
import { DocumentAssetBuyInCreateComponent } from './document-asset-buy-in-create';
import { DocumentAssetSoldoutCreateComponent } from './document-asset-soldout-create';
import { DocumentAssetValChgCreateComponent } from './document-asset-valchg-create';
import { DocumentNormalCreateComponent } from './document-normal-create';
import { DocumentTransferCreateComponent } from './document-transfer-create';
import { DocumentRepaymentCreateComponent } from './document-repayment-create';
import { DocumentLoanCreateComponent } from './document-loan-create';
import { DocumentExchangeCreateComponent } from './document-exchange-create';
import { DocumentItemSearchListComponent } from './document-item-search-list';
import { DocumentRepaymentDetailComponent } from './document-repayment-detail';
import { ReportComponent } from './report';
import { ConfigComponent } from './config';

const routes: Routes = [
  {
    path: '',
    component: FinanceComponent,
    children: [
      {
        path: 'overview',
        component: DocumentItemOverviewComponent,
      },
      {
        path: 'config',
        component: ConfigComponent,
      },
      {
        path: 'acntctgy',
        component: AccountCategoryComponent,
        children: [
          {
            path: '',
            component: AccountCategoryListComponent,
          },
          {
            path: 'create',
            component: AccountCategoryDetailComponent,
          },
          {
            path: 'display/:id',
            component: AccountCategoryDetailComponent,
          },
          {
            path: 'edit/:id',
            component: AccountCategoryDetailComponent,
          },
        ],
      },
      {
        path: 'doctype',
        component: DocumentTypeComponent,
        children: [
          {
            path: '',
            component: DocumentTypeListComponent,
          },
          {
            path: 'create',
            component: DocumentTypeDetailComponent,
          },
          {
            path: 'display/:id',
            component: DocumentTypeDetailComponent,
          },
          {
            path: 'edit/:id',
            component: DocumentTypeDetailComponent,
          },
        ],
      },
      {
        path: 'trantype',
        component: TranTypeComponent,
        children: [
          {
            path: '',
            component: TranTypeTreeComponent,
          },
          {
            path: 'list',
            component: TranTypeListComponent,
          },
          {
            path: 'create',
            component: TranTypeDetailComponent,
          },
          {
            path: 'display/:id',
            component: TranTypeDetailComponent,
          },
          {
            path: 'edit/:id',
            component: TranTypeDetailComponent,
          },
        ],
      },
      {
        path: 'assetctgy',
        component: AssetCategoryComponent,
        children: [
          {
            path: '',
            component: AssetCategoryListComponent,
          },
          {
            path: 'create',
            component: AssetCategoryDetailComponent,
          },
          {
            path: 'display/:id',
            component: AssetCategoryDetailComponent,
          },
          {
            path: 'edit/:id',
            component: AssetCategoryDetailComponent,
          },
        ],
      },
      {
        path: 'account',
        component: AccountComponent,
        children: [
          {
            path: '',
            component: AccountListComponent,
          },
          {
            path: 'tree',
            component: AccountTreeComponent,
          },
          {
            path: 'create',
            component: AccountDetailComponent,
          },
          {
            path: 'display/:id',
            component: AccountDetailComponent,
          },
          {
            path: 'edit/:id',
            component: AccountDetailComponent,
          },
        ],
      },
      {
        path: 'controlcenter',
        component: ControlCenterComponent,
        children: [
          {
            path: '',
            component: ControlCenterListComponent,
          },
          {
            path: 'tree',
            component: ControlCenterTreeComponent,
          },
          {
            path: 'create',
            component: ControlCenterDetailComponent,
          },
          {
            path: 'display/:id',
            component: ControlCenterDetailComponent,
          },
          {
            path: 'edit/:id',
            component: ControlCenterDetailComponent,
          },
        ],
      },
      {
        path: 'order',
        component: OrderComponent,
        children: [
          {
            path: '',
            component: OrderListComponent,
          },
          {
            path: 'create',
            component: OrderDetailComponent,
          },
          {
            path: 'display/:id',
            component: OrderDetailComponent,
          },
          {
            path: 'edit/:id',
            component: OrderDetailComponent,
          },
        ],
      },
      {
        path: 'document',
        component: DocumentComponent,
        children: [
          {
            path: '',
            component: DocumentListComponent,
          },
          // {
          //   path: 'create',
          //   component: DocumentDetailComponent,
          // },
          {
            path: 'createnormal',
            component: DocumentNormalCreateComponent,
          },
          {
            path: 'createtransfer',
            component: DocumentTransferCreateComponent,
          },
          {
            path: 'createadp',
            component: DocumentADPCreateComponent,
          },
          {
            path: 'createadr',
            component: DocumentADPCreateComponent,
          },
          {
            path: 'createexg',
            component: DocumentExchangeCreateComponent,
          },
          {
            path: 'createbrwfrm',
            component: DocumentLoanDetailComponent,
          },
          {
            path: 'createlendto',
            component: DocumentLoanDetailComponent,
          },
          {
            path: 'createassetbuy',
            component: DocumentAssetBuyInCreateComponent,
          },
          {
            path: 'createassetsold',
            component: DocumentAssetSoldoutCreateComponent,
          },
          {
            path: 'createassetvalchg',
            component: DocumentAssetValChgCreateComponent,
          },
          {
            path: 'createrepay',
            component: DocumentRepaymentDetailComponent,
          },
          {
            path: 'display/:id',
            component: DocumentDetailComponent,
          },
          {
            path: 'edit/:id',
            component: DocumentDetailComponent,
          },
          // {
          //   path: 'editnormal/:id',
          //   component: DocumentNormalDetailComponent,
          // },
          // {
          //   path: 'edittransfer/:id',
          //   component: DocumentTransferDetailComponent,
          // },
          // {
          //   path: 'editadp/:id',
          //   component: DocumentAdvancepaymentDetailComponent,
          // },
          // {
          //   path: 'editadr/:id',
          //   component: DocumentAdvancepaymentDetailComponent,
          // },
          // {
          //   path: 'editexg/:id',
          //   component: DocumentExchangeDetailComponent,
          // },
          // {
          //   path: 'editbrwfrm/:id',
          //   component: DocumentLoanDetailComponent,
          // },
          // {
          //   path: 'editlendto/:id',
          //   component: DocumentLoanDetailComponent,
          // },
          // {
          //   path: 'editassetbuy/:id',
          //   component: DocumentNormalDetailComponent,
          // },
          // {
          //   path: 'editassetsold/:id',
          //   component: DocumentNormalDetailComponent,
          // },
          // {
          //   path: 'editrepay/:id',
          //   component: DocumentRepaymentDetailComponent,
          // },
        ],
      },
      {
        path: 'search',
        component: DocumentItemSearchListComponent,
      },
      {
        path: 'report',
        component: ReportComponent,
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class FinanceRoutingModule { }
