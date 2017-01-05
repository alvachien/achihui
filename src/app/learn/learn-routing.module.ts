import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LearnComponent } from './learn.component';
import { ObjectComponent } from './object/object.component';
import { ListComponent as ObjectListComponent } from './object/list/list.component';
import { DetailComponent as ObjectDetailComponent } from './object/detail/detail.component';
import { HistoryComponent } from './history/history.component';
import { ListComponent as HistoryListComponent } from './history/list/list.component';
import { DetailComponent as HistoryDetailComponent } from './history/detail/detail.component';

const learnRoutes: Routes = [
  {
    path: '',
    component: LearnComponent,
    children: [
      {
        path: 'object',
        component: ObjectComponent,
        children: [
          {
            path: '',
            component: ObjectListComponent
          },
          {
            path: ':id',
            component: ObjectDetailComponent
          }
        ]
      },
      {
        path: 'history',
        component: HistoryComponent,
        children: [
          {
            path: '',
            component: HistoryListComponent
          },
          {
            path: ':id',
            component: HistoryDetailComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(learnRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class LearnRoutingModule { }