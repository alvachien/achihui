import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE_PROVIDER, MAT_DATE_LOCALE } from '@angular/material';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MATERIAL_COMPATIBILITY_MODE } from '@angular/material';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';
import { MD_MOMENT_DATE_FORMATS, MomentDateAdapter } from '../utility';

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
    MAT_DATE_LOCALE_PROVIDER,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MD_MOMENT_DATE_FORMATS },
    { provide: MATERIAL_COMPATIBILITY_MODE, useValue: true },
  ],
})
export class LearnModule { }
