import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { UserDetailRoutingModule } from './user-detail-routing.module';
import { UserDetailComponent } from './user-detail';

@NgModule({
  declarations: [
    UserDetailComponent,
  ],
  imports: [
    CommonModule,
    UserDetailRoutingModule,
    TranslocoModule,
    NzPageHeaderModule,
    NzSwitchModule,
    NzDescriptionsModule,
  ]
})
export class UserDetailModule { }
