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
import { TranTypeDetailComponent } from './tran-type-detail';
import { AccountComponent } from './account';
import { AccountListComponent } from './account-list';
import { AccountDetailComponent } from './account-detail';
import { ControlCenterComponent } from './control-center';
import { ControlCenterListComponent } from './control-center-list';
import { ControlCenterDetailComponent } from './control-center-detail';
import { OrderComponent } from './order';
import { OrderListComponent } from './order-list';
import { OrderDetailComponent } from './order-detail';
import { DocumentComponent } from './document';
import { DocumentListComponent } from './document-list';
import { DocumentDetailComponent } from './document-detail';
import { DocumentNormalDetailComponent } from './document-normal-detail';
import { DocumentTransferDetailComponent } from './document-transfer-detail';
import { DocumentAdvancepaymentDetailComponent } from './document-advancepayment-detail';
import { ReportComponent } from './report';

const routes: Routes = [
  {
    path: '',
    component: FinanceComponent,
    children: [
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
        path: 'account',
        component: AccountComponent,
        children: [
          {
            path: '',
            component: AccountListComponent,
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
          {
            path: 'create',
            component: DocumentDetailComponent,
          },
          {
            path: 'createnormal',
            component: DocumentNormalDetailComponent,
          },
          {
            path: 'createtransfer',
            component: DocumentTransferDetailComponent,
          },
          {
            path: 'createadp',
            component: DocumentAdvancepaymentDetailComponent,
          },
          {
            path: 'display/:id',
            component: DocumentDetailComponent,
          },
          {
            path: 'displaynormal/:id',
            component: DocumentNormalDetailComponent,
          },
          {
            path: 'displaytransfer/:id',
            component: DocumentTransferDetailComponent,
          },
          {
            path: 'displayadp',
            component: DocumentAdvancepaymentDetailComponent,
          },
          {
            path: 'edit/:id',
            component: DocumentDetailComponent,
          },
          {
            path: 'editnormal/:id',
            component: DocumentNormalDetailComponent,
          },
          {
            path: 'edittransfer/:id',
            component: DocumentTransferDetailComponent,
          },
          {
            path: 'editadp',
            component: DocumentAdvancepaymentDetailComponent,
          },
        ],
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
