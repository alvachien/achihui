import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecurEventRoutingModule } from './recur-event-routing.module';
import { RecurEventListComponent } from './recur-event-list/recur-event-list.component';
import { RecurEventDetailComponent } from './recur-event-detail/recur-event-detail.component';
import { EventUIModule } from '../event-ui.module';


@NgModule({
  declarations: [
    RecurEventListComponent,
    RecurEventDetailComponent
  ],
  imports: [
    CommonModule,
    EventUIModule,
    RecurEventRoutingModule
  ]
})
export class RecurEventModule { }
