import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { ConfigRoutingModule } from './config-routing.module';
import { ConfigComponent } from './config.component';
import { AccountCategoryListComponent } from './account-category-list';
import { DocTypeListComponent } from './doc-type-list';
import { AssetCategoryListComponent } from './asset-category-list';
import { TranTypeHierarchyComponent } from './tran-type-hierarchy';
import { TranTypeListComponent } from './tran-type-list';

@NgModule({
  declarations: [
    ConfigComponent,
    AccountCategoryListComponent,
    DocTypeListComponent,
    AssetCategoryListComponent,
    TranTypeHierarchyComponent,
    TranTypeListComponent,
  ],
  imports: [
    CommonModule,
    FinanceUIModule,
    ConfigRoutingModule,
    TranslocoModule,
  ]
})
export class ConfigModule { }
