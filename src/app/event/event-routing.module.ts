import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventComponent } from './event.component';
import { CategoryComponent } from './category';
import { CategoryListComponent } from './category-list';
import { EventListComponent } from './event-list';
import { EventDetailComponent } from './event-detail';
import { GeneralEventComponent } from './general-event';
import { RecurrEventComponent } from './recurr-event';
import { RecurrEventDetailComponent } from './recurr-event-detail';

const routes: Routes = [
  {
    path: '',
    component: EventComponent,
    children: [
      {
        path: 'general',
        component: GeneralEventComponent,
        children: [
          {
            path: '',
            component: EventListComponent,
          },
          {
            path: 'create',
            component: EventDetailComponent,
          },
          {
            path: 'display/:id',
            component: EventDetailComponent,
          },
          {
            path: 'edit/:id',
            component: EventDetailComponent,
          },
        ],
      },
      {
        path: 'category',
        component: CategoryComponent,
        children: [
          {
            path: '',
            component: CategoryListComponent,
          },
        ],
      },
      {
        path: 'recur',
        component: RecurrEventComponent,
        children: [
          {
            path: 'create',
            component: RecurrEventDetailComponent,
          },
          {
            path: 'display/:id',
            component: RecurrEventDetailComponent,
          },
          {
            path: 'edit/:id',
            component: RecurrEventDetailComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventRoutingModule { }
