import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { BookCategoryHierarchyComponent } from './book-category-hierarchy';
import { BookCategoryListComponent } from './book-category-list';
import { OrganizationTypeListComponent } from './organization-type-list';
import { PersonRoleListComponent } from './person-role-list';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'hih-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTabsModule,
    NzModalModule,
    TranslocoModule,
    BookCategoryListComponent,
    BookCategoryHierarchyComponent,
    OrganizationTypeListComponent,
    PersonRoleListComponent,
  ],
})
export class ConfigComponent {}
