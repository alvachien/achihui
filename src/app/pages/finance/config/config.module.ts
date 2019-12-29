import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
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
    NzTabsModule,
    NzTableModule,
    NzBreadCrumbModule,
    NzPageHeaderModule,
    NzSpinModule,
    ConfigRoutingModule,
    TranslocoModule,
  ]
})
export class ConfigModule { }
