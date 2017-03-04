import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LearnComponent } from './learn.component';
import { ObjectComponent } from './object/object.component';
import { ListComponent as ObjectListComponent } from './object/list/list.component';
import { DetailComponent as ObjectDetailComponent } from './object/detail/detail.component';
import { HistoryComponent } from './history/history.component';
import { ListComponent as HistoryListComponent } from './history/list/list.component';
import { DetailComponent as HistoryDetailComponent } from './history/detail/detail.component';
import { CategoryComponent } from './category/category.component';
import { ListComponent as CategoryListComponent } from './category/list/list.component';
import { DetailComponent as CategoryDetailComponent } from './category/detail/detail.component';

const learnRoutes: Routes = [
  {
    path: '',
    component: LearnComponent,
    children: [
      {
        path: 'category',
        component: CategoryComponent,
        children: [
          {
            path:'',
            component: CategoryListComponent
          },
          {
            path:'create',
            component: CategoryDetailComponent
          },
          {
            path: 'display/:id',
            component: CategoryDetailComponent
          },
          {
            path: 'edit/:id',
            component: CategoryDetailComponent
          }
        ]
      },
      {
        path: 'object',
        component: ObjectComponent,
        children: [
          {
            path: '',
            component: ObjectListComponent
          },
          {
            path:'create',
            component: ObjectDetailComponent
          },
          {
            path: 'display/:id',
            component: ObjectDetailComponent
          },
          {
            path: 'edit/:id',
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
            path:'create',
            component: HistoryDetailComponent
          },
          {
            path: 'display/:id',
            component: HistoryDetailComponent
          },
          {
            path: 'edit/:id',
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
