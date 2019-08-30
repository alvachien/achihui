import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { HomeDefRoutingModule } from './home-def-routing.module';
import { HomeDefComponent } from './home-def.component';
import { HomeDefListComponent } from './home-def-list';
import { HomeDefDetailComponent } from './home-def-detail';

@NgModule({
  declarations: [
    HomeDefComponent,
    HomeDefListComponent,
    HomeDefDetailComponent,
  ],
  imports: [
    CommonModule,
    HomeDefRoutingModule,
    NzBreadCrumbModule,
    NzPageHeaderModule,
    NzTableModule,
    NzDividerModule,
  ]
})
export class HomeDefModule { }
