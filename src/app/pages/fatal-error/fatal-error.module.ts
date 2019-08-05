import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzResultModule } from 'ng-zorro-antd/result';

import { FatalErrorRoutingModule } from './fatal-error-routing.module';
import { FatalErrorComponent } from './fatal-error.component';


@NgModule({
  declarations: [FatalErrorComponent],
  imports: [
    CommonModule,
    NzResultModule,
    FatalErrorRoutingModule
  ]
})
export class FatalErrorModule { }
