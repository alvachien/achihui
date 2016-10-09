import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LearnComponent } from './learn.component';
import { learnRouting } from './learn.routing';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        learnRouting
    ],
    declarations: [
        LearnComponent
    ],

    providers: [
        //AlbumService,
        //AlbumDetailResolve
    ]
})
export class LearnModule { }
