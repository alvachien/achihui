import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzResultModule } from 'ng-zorro-antd/result';

import { LackAuthorityRoutingModule } from './lack-authority-routing.module';
import { LackAuthorityComponent } from './lack-authority.component';


@NgModule({
  declarations: [LackAuthorityComponent],
  imports: [
    CommonModule,
    NzResultModule,
    LackAuthorityRoutingModule
  ]
})
export class LackAuthorityModule { }
