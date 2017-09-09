import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';

import { FinanceRoutingModule } from './finance-routing.module';
import { FinanceComponent } from './finance.component';
import { AccountCategoryComponent } from './account-category';
import { AccountCategoryListComponent } from './account-category-list';
import { AccountCategoryDetailComponent } from './account-category-detail';

@NgModule({
  imports: [
    CommonModule,
    FinanceRoutingModule,
    UIDependModule,
    TranslateModule.forChild()
  ],
  declarations: [
    FinanceComponent,
    AccountCategoryComponent, 
    AccountCategoryListComponent, 
    AccountCategoryDetailComponent
  ]
})
export class FinanceModule { }
