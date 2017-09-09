import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LearnComponent } from './learn.component';
import { CategoryComponent } from './category';
import { CategoryListComponent } from './category-list';
import { CategoryDetailComponent } from './category-detail';
import { ObjectComponent } from './object';
import { ObjectListComponent } from './object-list';
import { ObjectDetailComponent } from './object-detail';

const routes: Routes = [
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
      // {
      //   path: 'history',
      //   component: HistoryComponent,
      //   children: [
      //     {
      //       path: '',
      //       component: HistoryListComponent
      //     },
      //     {
      //       path: ':id',
      //       component: HistoryDetailComponent
      //     }
      //   ]
      // }
    ]
  }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearnRoutingModule { }
