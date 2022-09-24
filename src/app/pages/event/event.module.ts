import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

import { EventRoutingModule } from './event-routing.module';
import { EventComponent } from './event.component';
import { OverviewComponent } from './overview/overview.component';

@NgModule({
  declarations: [
    EventComponent,
    OverviewComponent
  ],
  imports: [
    CommonModule,
    TranslocoModule,
    EventRoutingModule,
  ]
})
export class EventModule { }
