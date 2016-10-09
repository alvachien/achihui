import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { EventComponent } from './event.component';
import { eventRouting } from './event.routing';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
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
