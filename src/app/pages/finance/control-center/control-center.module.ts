import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { ControlCenterRoutingModule } from './control-center-routing.module';
import { ControlCenterComponent } from './control-center.component';
import { ControlCenterListComponent } from './control-center-list';
import { ControlCenterDetailComponent } from './control-center-detail';
import { ControlCenterHierarchyComponent } from './control-center-hierarchy';


@NgModule({
  declarations: [
    ControlCenterComponent,
    ControlCenterListComponent,
    ControlCenterDetailComponent,
    ControlCenterHierarchyComponent,
  ],
  imports: [
    CommonModule,
    NzBreadCrumbModule,
    NzPageHeaderModule,
    NzTableModule,
    NzDividerModule,
    NzTreeModule,
    NzSpinModule,
    NzTagModule,
    NzDescriptionsModule,
    NzTabsModule,
    NzGridModule,
    ControlCenterRoutingModule
  ]
})
export class ControlCenterModule { }
