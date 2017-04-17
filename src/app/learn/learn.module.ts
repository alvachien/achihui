import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { CovalentCoreModule } from '@covalent/core';
import { UIRefModule } from '../uiref.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

import { LearnComponent } from './learn.component';
import { ListComponent as ObjectListComponent } from './object/list/list.component';
import { DetailComponent as ObjectDetailComponent } from './object/detail/detail.component';
import { LearnRoutingModule } from './learn-routing.module';
import { ObjectComponent } from './object/object.component';
import { HistoryComponent } from './history/history.component';
import { ListComponent as HistoryListComponent } from './history/list/list.component';
import { DetailComponent as HistoryDetailComponent } from './history/detail/detail.component';
import { CategoryComponent } from './category/category.component';
import { ListComponent as CategoryListComponent } from './category/list/list.component';
import { DetailComponent as CategoryDetailComponent } from './category/detail/detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LearnRoutingModule,
    UIRefModule,
    TranslateModule,
    MaterialModule,
    CovalentCoreModule.forRoot()
  ],
  declarations: [
    LearnComponent, 
    CategoryComponent,
    CategoryListComponent,
    CategoryDetailComponent,
    ObjectListComponent, 
    ObjectDetailComponent, 
    ObjectComponent, 
    HistoryComponent, 
    HistoryListComponent, 
    HistoryDetailComponent
  ]
})
export class LearnModule { }
