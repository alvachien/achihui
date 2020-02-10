import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { TranslocoModule, } from '@ngneat/transloco';

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
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    HomeDefRoutingModule,
    NzBreadCrumbModule,
    NzPageHeaderModule,
    NzTableModule,
    NzSpinModule,
    NzDividerModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzResultModule,
    TranslocoModule,
  ]
})
export class HomeDefModule { }
