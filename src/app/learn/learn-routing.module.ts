import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LearnComponent } from './learn.component';
import { CategoryComponent } from './category';
import { CategoryListComponent } from './category-list';
import { CategoryDetailComponent } from './category-detail';
import { ObjectComponent } from './object';
import { ObjectListComponent } from './object-list';
import { ObjectDetailComponent } from './object-detail';
import { HistoryComponent } from './history';
import { HistoryListComponent } from './history-list';
import { HistoryDetailComponent } from './history-detail';
import { QuestionBankComponent } from './question-bank';
import { QuestionBankListComponent } from './question-bank-list';
import { QuestionBankDetailComponent } from './question-bank-detail';

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
            path: '',
            component: CategoryListComponent,
          },
          {
            path: 'create',
            component: CategoryDetailComponent,
          },
          {
            path: 'display/:id',
            component: CategoryDetailComponent,
          },
          {
            path: 'edit/:id',
            component: CategoryDetailComponent,
          },
        ],
      },
      {
        path: 'object',
        component: ObjectComponent,
        children: [
          {
            path: '',
            component: ObjectListComponent,
          },
          {
            path: 'create',
            component: ObjectDetailComponent,
          },
          {
            path: 'display/:id',
            component: ObjectDetailComponent,
          },
          {
            path: 'edit/:id',
            component: ObjectDetailComponent,
          },
        ],
      },
      {
        path: 'history',
        component: HistoryComponent,
        children: [
          {
            path: '',
            component: HistoryListComponent,
          },
          {
            path: 'create',
            component: HistoryDetailComponent,
          },
          {
            path: 'display/:id',
            component: HistoryDetailComponent,
          },
          {
            path: 'edit/:id',
            component: HistoryDetailComponent,
          },
        ],
      },
      {
        path: 'questionbank',
        component: QuestionBankComponent,
        children: [
          {
            path: '',
            component: QuestionBankListComponent,
          },
          {
            path: 'create',
            component: QuestionBankDetailComponent,
          },
          {
            path: 'display/:id',
            component: QuestionBankDetailComponent,
          },
          {
            path: 'edit/:id',
            component: QuestionBankDetailComponent,
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
export class LearnRoutingModule { }
