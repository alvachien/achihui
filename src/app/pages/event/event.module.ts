import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

import { EventRoutingModule } from './event-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TranslocoModule,
    EventRoutingModule,
  ]
})
export class EventModule { }
