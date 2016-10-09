import { NgModule }         from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { CommonModule }     from '@angular/common';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from "ng2-translate/ng2-translate";

import { EventComponent } from './event.component';
import { eventRouting }   from './event.routing';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, '/locales/', '.json'),
            deps: [Http]
        }),
        eventRouting        
    ],
    declarations: [
        EventComponent
    ],

    providers: [
        //AlbumService,
        //AlbumDetailResolve
    ]
})
export class EventModule { }
