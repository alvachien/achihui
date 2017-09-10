import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, HomeDefDetailService, LearnStorageService } from '../services';

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
    LearnRoutingModule,
    UIDependModule,
    TranslateModule.forChild()
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
    HistoryDetailComponent
  ],
  providers: [
  ]
})
export class LearnModule { }
