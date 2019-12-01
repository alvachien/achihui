import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { TranslateModule } from '@ngx-translate/core';

import { ConfigRoutingModule } from './config-routing.module';
import { ConfigComponent } from './config.component';
import { AccountCategoryListComponent } from './account-category-list/account-category-list.component';
import { DocTypeListComponent } from './doc-type-list/doc-type-list.component';
import { AssetTypeListComponent } from './asset-type-list/asset-type-list.component';
import { TranTypeHierarchyComponent } from './tran-type-hierarchy/tran-type-hierarchy.component';
import { TranTypeListComponent } from './tran-type-list/tran-type-list.component';

@NgModule({
  declarations: [
    ConfigComponent,
    AccountCategoryListComponent,
    DocTypeListComponent,
    AssetTypeListComponent,
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
    TranslateModule.forChild(),
  ]
})
export class ConfigModule { }
