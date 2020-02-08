import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzResultModule } from 'ng-zorro-antd/result';
import { TranslocoModule } from '@ngneat/transloco';

import { NotFoundRoutingModule } from './not-found-routing.module';
import { NotFoundComponent } from './not-found.component';

@NgModule({
  declarations: [
    NotFoundComponent,
  ],
  imports: [
    CommonModule,
    NzResultModule,
    TranslocoModule,
    NotFoundRoutingModule,
  ]
})
export class NotFoundModule { }
