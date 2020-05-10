import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

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
    NzDescriptionsModule,
  ]
})
export class UserDetailModule { }
