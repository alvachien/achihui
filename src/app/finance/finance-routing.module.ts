import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FinanceComponent } from './finance.component';
import { SettingComponent } from './setting/setting.component';
import { CurrencyComponent } from './currency/currency.component';
import { ListComponent as CurrencyListComponent } from './currency/list/list.component';
import { DetailComponent as CurrencyDetailComponent } from './currency/detail/detail.component';
import { ControlCenterComponent } from './controlcenter/controlcenter.component';
import { ListComponent as ControlCenterListComponent } from './controlcenter/list/list.component';
import { DetailComponent as ControlCenterDetailComponent } from './controlcenter/detail/detail.component';
import { OrderComponent } from './order/order.component';
import { ListComponent as OrderListComponent } from './order/list/list.component';
import { DetailComponent as OrderDetailComponent } from './order/detail/detail.component';
import { AccountCategoryComponent } from './accountcategory/accountcategory.component';
import { ListComponent as AccountCategoryListComponent } from './accountcategory/list/list.component';
import { DetailComponent as AccountCategoryDetailComponent } from './accountcategory/detail/detail.component';
import { AccountComponent } from './account/account.component';
import { ListComponent as AccountListComponent } from './account/list/list.component';
import { DetailComponent as AccountDetailComponent } from './account/detail/detail.component';
import { DocumentComponent } from './document/document.component';
import { ListComponent as DocumentListComponent } from './document/list/list.component';
import { DetailComponent as DocumentDetailComponent } from './document/detail/detail.component';
import { DocumentTypeComponent } from './documenttype/documenttype.component';
import { ListComponent as DocumentTypeListComponent } from './documenttype/list/list.component';
import { DetailComponent as DocumentTypeDetailComponent } from './documenttype/detail/detail.component';
import { TransactionTypeComponent } from './transactiontype/transactiontype.component';
import { ListComponent as TransactionTypeListComponent } from './transactiontype/list/list.component';
import { DetailComponent as TransactionTypeDetailComponent } from './transactiontype/detail/detail.component';
import { ReportComponent } from './report/report.component';
import { BalanceSheetComponent as ReportBalanceSheetComponent } from './report/balancesheet/balancesheet.component';
import { ControlCenterComponent as ReportControlCenterComponent } from './report/controlcenter/controlcenter.component';
import { OrderComponent as ReportOrderComponent } from './report/order/order.component';


const financeRoutes: Routes = [
  {
    path: '',
    component: FinanceComponent,
    children: [
      {
        path: 'setting',
        component: SettingComponent
      },
      {
        path: 'currency',
        component: CurrencyComponent,
        children: [
          {
            path: '',
            component: CurrencyListComponent
          },
          {
            path:'create',
            component: CurrencyDetailComponent
          },
          {
            path: 'display/:id',
            component: CurrencyDetailComponent
          },
          {
            path: 'edit/:id',
            component: CurrencyDetailComponent
          }
        ]
      },
      {
        path: 'accountcategory',
        component: AccountCategoryComponent,
        children: [
          {
            path: '',
            component: AccountCategoryListComponent
          },
          {
            path:'create',
            component: AccountCategoryDetailComponent
          },
          {
            path: 'display/:id',
            component: AccountCategoryDetailComponent
          },
          {
            path: 'edit/:id',
            component: AccountCategoryDetailComponent
          }
        ]
      },
      {
        path: 'account',
        component: AccountComponent,
        children: [
          {
            path: '',
            component: AccountListComponent
          },
          {
            path:'create',
            component: AccountDetailComponent
          },
          {
            path: 'display/:id',
            component: AccountDetailComponent
          },
          {
            path: 'edit/:id',
            component: AccountDetailComponent
          }
        ]
      },
      {
        path: 'controlcenter',
        component: ControlCenterComponent,
        children: [
          {
            path: '',
            component: ControlCenterListComponent
          },
          {
            path:'create',
            component: ControlCenterDetailComponent
          },
          {
            path: 'display/:id',
            component: ControlCenterDetailComponent
          },
          {
            path: 'edit/:id',
            component: ControlCenterDetailComponent
          }
        ]
      },
      {
        path: 'order',
        component: OrderComponent,
        children: [
          {
            path: '',
            component: OrderListComponent
          },
          {
            path:'create',
            component: OrderDetailComponent
          },
          {
            path: 'display/:id',
            component: OrderDetailComponent
          },
          {
            path: 'edit/:id',
            component: OrderDetailComponent
          }
        ]
      },
      {
        path: 'documenttype',
        component: DocumentTypeComponent,
        children: [
          {
            path: '',
            component: DocumentTypeListComponent
          },
          {
            path:'create',
            component: DocumentTypeDetailComponent
          },
          {
            path: 'display/:id',
            component: DocumentTypeDetailComponent
          },
          {
            path: 'edit/:id',
            component: DocumentTypeDetailComponent
          }
        ]
      },
      {
        path: 'document',
        component: DocumentComponent,
        children: [
          {
            path: '',
            component: DocumentListComponent
          },
          {
            path:'create',
            component: DocumentDetailComponent
          },
          {
            path: 'display/:id',
            component: DocumentDetailComponent
          },
          {
            path: 'edit/:id',
            component: DocumentDetailComponent
          }
        ]
      },
      {
        path: 'transactiontype',
        component: TransactionTypeComponent,
        children: [
          {
            path: '',
            component: TransactionTypeListComponent
          },
          {
            path:'create',
            component: TransactionTypeDetailComponent
          },
          {
            path: 'display/:id',
            component: TransactionTypeDetailComponent
          },
          {
            path: 'edit/:id',
            component: TransactionTypeDetailComponent
          }
        ]
      },
      {
        path: 'report',
        component: ReportComponent,
        children: [
          {
            path: '',
            component: ReportBalanceSheetComponent
          },
          {
            path: 'controlcenter',
            component: ReportControlCenterComponent
          },
          {
            path: 'order',
            component: ReportOrderComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(financeRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class FinanceRoutingModule { } 
