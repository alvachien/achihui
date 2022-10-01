import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NormalEventRoutingModule } from './normal-event-routing.module';
import { NormalEventListComponent } from './normal-event-list/normal-event-list.component';
import { NormalEventDetailComponent } from './normal-event-detail/normal-event-detail.component';


@NgModule({
  declarations: [
    NormalEventListComponent,
    NormalEventDetailComponent
  ],
  imports: [
    CommonModule,
    NormalEventRoutingModule
  ]
})
export class NormalEventModule { }
