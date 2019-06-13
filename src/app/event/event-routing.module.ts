import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventComponent } from './event.component';
import { CategoryComponent } from './category';
import { CategoryListComponent } from './category-list';
import { EventListComponent } from './event-list';
import { EventDetailComponent } from './event-detail';
import { GeneralEventComponent } from './general-event';
import { RecurrEventComponent } from './recurr-event';
import { RecurrEventListComponent } from './recurr-event-list';
import { RecurrEventDetailComponent } from './recurr-event-detail';
import { HabitListComponent } from './habit-list';
import { HabitDetailComponent } from './habit-detail';
import { HabitComponent } from './habit';
import { OverviewComponent } from './overview';

const routes: Routes = [
  {
    path: '',
    component: EventComponent,
    children: [
      {
        path: 'overview',
        component: OverviewComponent,
      },
      {
        path: 'general',
        component: GeneralEventComponent,
        children: [
          {
            path: '',
            component: EventListComponent,
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: EventDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: EventDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: EventDetailComponent,
            data: {animation: 'DetailPage'},
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
            data: {animation: 'ListPage'},
          },
        ],
      },
      {
        path: 'habit',
        component: HabitComponent,
        children: [
          {
            path: '',
            component: HabitListComponent,
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: HabitDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: HabitDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: HabitDetailComponent,
            data: {animation: 'DetailPage'},
          },
        ],
      },
      {
        path: 'recur',
        component: RecurrEventComponent,
        children: [
          {
            path: '',
            component: RecurrEventListComponent,
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: RecurrEventDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: RecurrEventDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: RecurrEventDetailComponent,
            data: {animation: 'DetailPage'},
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
