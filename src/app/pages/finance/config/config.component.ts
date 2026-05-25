import { Component } from '@angular/core';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { TranslocoModule } from '@jsverse/transloco';

import { HomeDefOdataService } from '@services/index';
import { AccountCategoryListComponent } from './account-category-list';
import { AssetCategoryListComponent } from './asset-category-list';
import { DocTypeListComponent } from './doc-type-list';
import { TranTypeHierarchyComponent } from './tran-type-hierarchy';
import { TranTypeListComponent } from './tran-type-list';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'hih-finance-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzResultModule,
    NzTabsModule,
    AccountCategoryListComponent,
    AssetCategoryListComponent,
    DocTypeListComponent,
    TranTypeHierarchyComponent,
    TranTypeListComponent,
    TranslocoModule,
    NzModalModule,
  ]
})
export class ConfigComponent {
  constructor(private homeService: HomeDefOdataService) { }

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome?.IsChild ?? false;
  }
}
