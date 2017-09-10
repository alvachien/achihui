import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinanceComponent } from './finance.component';
import { AccountCategoryComponent } from './account-category';
import { AccountCategoryDetailComponent } from './account-category-detail';
import { AccountCategoryListComponent } from './account-category-list';

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
            component: AccountCategoryListComponent
          },
          {
            path: 'create',
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
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class FinanceRoutingModule { }
