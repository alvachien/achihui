import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinanceComponent } from './finance.component';
import { TranTypeComponent } from './tran-type';
import { TranTypeListComponent } from './tran-type-list';
import { TranTypeTreeComponent } from './tran-type-tree';
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
import { DocumentAssetBuyInCreateComponent } from './document-asset-buy-in-create';
import { DocumentAssetSoldoutCreateComponent } from './document-asset-soldout-create';
import { DocumentAssetValChgCreateComponent } from './document-asset-valchg-create';
import { DocumentNormalCreateComponent } from './document-normal-create';
import { DocumentNormalMassCreateComponent } from './document-normal-mass-create';
import { DocumentNormalMassCreate2Component } from './document-normal-mass-create2';
import { DocumentTransferCreateComponent } from './document-transfer-create';
import { DocumentLoanCreateComponent } from './document-loan-create';
import { DocumentExchangeCreateComponent } from './document-exchange-create';
import { DocumentRepaymentExCreateComponent } from './document-repayment-ex-create';
import { DocumentItemSearchListComponent } from './document-item-search-list';
import { ReportComponent } from './report';
import { ConfigComponent } from './config';
import { PlanComponent } from './plan';
import { PlanDetailComponent } from './plan-detail';
import { PlanListComponent } from './plan-list';

const routes: Routes = [
  {
    path: '',
    component: FinanceComponent,
    children: [
      {
        path: 'overview',
        component: DocumentItemOverviewComponent,
        data: {animation: 'DetailPage'},
      },
      {
        path: 'config',
        component: ConfigComponent,
        data: {animation: 'ListPage'},
      },
      {
        path: 'trantype',
        component: TranTypeComponent,
        children: [
          {
            path: '',
            component: TranTypeTreeComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'list',
            component: TranTypeListComponent,
            data: {animation: 'ListPage'},
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
            data: {animation: 'ListPage'},
          },
          {
            path: 'tree',
            component: AccountTreeComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'create',
            component: AccountDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: AccountDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: AccountDetailComponent,
            data: {animation: 'DetailPage'},
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
            data: {animation: 'ListPage'},
          },
          {
            path: 'tree',
            component: ControlCenterTreeComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'create',
            component: ControlCenterDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: ControlCenterDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: ControlCenterDetailComponent,
            data: {animation: 'DetailPage'},
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
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: OrderDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: OrderDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: OrderDetailComponent,
            data: {animation: 'DetailPage'},
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
            data: {animation: 'ListPage'},
          },
          // {
          //   path: 'create',
          //   component: DocumentDetailComponent,
          // },
          {
            path: 'createnormal',
            component: DocumentNormalCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'masscreatenormal',
            component: DocumentNormalMassCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'masscreatenormal2',
            component: DocumentNormalMassCreate2Component,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'createtransfer',
            component: DocumentTransferCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'createadp',
            component: DocumentADPCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'createadr',
            component: DocumentADPCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'createexg',
            component: DocumentExchangeCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'createbrwfrm',
            // component: DocumentLoanDetailComponent,
            component: DocumentLoanCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'createlendto',
            // component: DocumentLoanDetailComponent,
            component: DocumentLoanCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'createassetbuy',
            component: DocumentAssetBuyInCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'createassetsold',
            component: DocumentAssetSoldoutCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'createassetvalchg',
            component: DocumentAssetValChgCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'createrepayex',
            component: DocumentRepaymentExCreateComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: DocumentDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: DocumentDetailComponent,
            data: {animation: 'DetailPage'},
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
        data: {animation: 'DetailPage'},
      },
      {
        path: 'report',
        component: ReportComponent,
        data: {animation: 'ListPage'},
      },
      {
        path: 'plan',
        component: PlanComponent,
        children: [
          {
            path: '',
            component: PlanListComponent,
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: PlanDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: PlanDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: PlanDetailComponent,
            data: {animation: 'DetailPage'},
          },
        ],
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
