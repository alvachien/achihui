import { NgModule }         from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { CommonModule }     from '@angular/common';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from "ng2-translate/ng2-translate";
import { UIRefModule }      from '../uiref.module';

import { EventService } from '../services/event.service';

import { EventComponent } from './event.component';
import { EventListComponent } from './event.list.component';
import { EventDetailComponent } from './event.detail.component';
import { eventRouting }   from './event.routing';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        UIRefModule,
        //TranslateModule.forRoot({
        //    provide: TranslateLoader,
        //    useFactory: (http: Http) => new TranslateStaticLoader(http, '/app/locales/', '.json'),
        //    deps: [Http]
        //}),
        eventRouting        
    ],
    declarations: [
        EventComponent,
        EventListComponent,
        EventDetailComponent
    ],

    providers: [
        EventService,
        //AlbumDetailResolve
    ]
})
export class EventModule { }
