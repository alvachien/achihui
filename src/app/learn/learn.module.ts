import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE_PROVIDER, MAT_DATE_LOCALE } from '@angular/material';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { LearnRoutingModule } from './learn-routing.module';
import { LearnComponent } from './learn.component';
import { ObjectComponent } from './object';
import { ObjectListComponent } from './object-list';
import { ObjectDetailComponent } from './object-detail';
import { CategoryComponent } from './category';
import { CategoryListComponent } from './category-list';
import { CategoryDetailComponent } from './category-detail';
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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LearnRoutingModule,
    UIDependModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    LearnComponent,
    ObjectComponent,
    ObjectListComponent,
    ObjectDetailComponent,
    CategoryComponent,
    CategoryListComponent,
    CategoryDetailComponent,
    HistoryComponent,
    HistoryListComponent,
    HistoryDetailComponent,
    QuestionBankComponent,
    QuestionBankListComponent,
    QuestionBankDetailComponent,
    EnWordComponent,
    EnWordListComponent,
    EnWordDetailComponent,
    EnSentenceComponent,
    EnSentenceListComponent,
    EnSentenceDetailComponent,
  ],
  providers: [
    MAT_DATE_LOCALE_PROVIDER,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class LearnModule { }
