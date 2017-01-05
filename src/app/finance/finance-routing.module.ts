import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FinanceComponent } from './finance.component';
import { AccountComponent } from './account/account.component';
import { ListComponent as AccountListComponent } from './account/list/list.component';
import { DetailComponent as AccountDetailComponent } from './account/detail/detail.component';
import { DocumentComponent } from './document/document.component';
import { ListComponent as DocumentListComponent } from './document/list/list.component';
import { DetailComponent as DocumentDetailComponent } from './document/detail/detail.component';

const financeRoutes: Routes = [
  {
    path: '',
    component: FinanceComponent,
    children: [
      {
        path: 'account',
        component: AccountComponent,
        children: [
          {
            path: '',
            component: AccountListComponent
          },
          {
            path: ':id',
            component: AccountDetailComponent
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
            path: ':id',
            component: DocumentDetailComponent
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