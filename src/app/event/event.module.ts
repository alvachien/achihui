import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventComponent } from './event.component';
import { CategoryComponent } from './category/category.component';
import { EventListComponent } from './event-list/event-list.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { RecurrEventComponent } from './recurr-event/recurr-event.component';
import { RecurrEventDetailComponent } from './recurr-event-detail/recurr-event-detail.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    EventComponent, 
    CategoryComponent, 
    EventListComponent, 
    EventDetailComponent, 
    RecurrEventComponent, 
    RecurrEventDetailComponent
  ]
})
export class EventModule { }
