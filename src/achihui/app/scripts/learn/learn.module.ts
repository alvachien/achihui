import { NgModule }         from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { CommonModule }     from '@angular/common';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from "ng2-translate/ng2-translate";

import { TinyMceDirective2 } from '../directives/tinymce.directive';

import { SimpleTinyComponent } from '../tinymce.component';
import { LearnService } from '../services/learn.service';
import { LearnComponent }   from './learn.component';
import { learnRouting }     from './learn.routing';
import { CategoryListComponent } from './category.list.component';
import { ObjectComponent } from './object.component';
import { ObjectListComponent } from './object.list.component';
import { ObjectDetailComponent } from './object.detail.component';
import { HistoryComponent } from './history.component';
import { HistoryListComponent } from './history.list.component';
import { HistoryDetailComponent } from './history.detail.component';
import { AwardComponent } from './award.component';
import { AwardListComponent } from './award.list.component';
import { AwardDetailComponent } from './award.detail.component';
import { PlanComponent } from './plan.component';
import { PlanListComponent } from './plan.list.component';
import { PlanDetailComponent } from './plan.detail.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, '/app/locales/', '.json'),
            deps: [Http]
        }),
        learnRouting
    ],
    declarations: [
        TinyMceDirective2,
        SimpleTinyComponent,
        LearnComponent,
        CategoryListComponent,
        ObjectComponent,
        ObjectListComponent,
        ObjectDetailComponent,
        HistoryComponent,
        HistoryListComponent,
        HistoryDetailComponent,
        AwardComponent,
        AwardListComponent,
        AwardDetailComponent,
        PlanComponent,
        PlanListComponent,
        PlanDetailComponent
    ],
    providers: [
        LearnService
        //AlbumService,
        //AlbumDetailResolve
    ]
})
export class LearnModule { }
