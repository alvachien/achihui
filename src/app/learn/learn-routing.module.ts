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
import { EnWordComponent } from './en-word';
import { EnWordListComponent } from './en-word-list';
import { EnWordDetailComponent } from './en-word-detail';
import { EnSentenceComponent } from './en-sentence';
import { EnSentenceListComponent } from './en-sentence-list';
import { EnSentenceDetailComponent } from './en-sentence-detail';
import { CategoryTreeComponent } from './category-tree';
import { ObjectTreeComponent } from './object-tree';

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
            data: {animation: 'ListPage'},
          },
          {
            path: 'tree',
            component: CategoryTreeComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'create',
            component: CategoryDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: CategoryDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: CategoryDetailComponent,
            data: {animation: 'DetailPage'},
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
            data: {animation: 'ListPage'},
          },
          {
            path: 'tree',
            component: ObjectTreeComponent,
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: ObjectDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: ObjectDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: ObjectDetailComponent,
            data: {animation: 'DetailPage'},
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
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: HistoryDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: HistoryDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: HistoryDetailComponent,
            data: {animation: 'DetailPage'},
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
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: QuestionBankDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: QuestionBankDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: QuestionBankDetailComponent,
            data: {animation: 'DetailPage'},
          },
        ],
      },
      {
        path: 'enword',
        component: EnWordComponent,
        children: [
          {
            path: '',
            component: EnWordListComponent,
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: EnWordDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: EnWordDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: EnWordDetailComponent,
            data: {animation: 'DetailPage'},
          },
        ],
      },
      {
        path: 'ensent',
        component: EnSentenceComponent,
        children: [
          {
            path: '',
            component: EnSentenceListComponent,
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: EnSentenceDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: EnSentenceDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: EnSentenceDetailComponent,
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
export class LearnRoutingModule { }
