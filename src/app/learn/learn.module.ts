import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MD_DATE_FORMATS, DateAdapter } from '@angular/material';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';
import { MOMENT_DATE_FORMATS, MomentDateAdapter } from '../utility';

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
  ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MD_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS },
  ]
})
export class LearnModule { }
