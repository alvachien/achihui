import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FinanceComponent } from './finance.component';
import { financeRouting } from './finance.routing';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        financeRouting
    ],
    declarations: [
        FinanceComponent
    ],

    providers: [
        //AlbumService,
        //AlbumDetailResolve
    ]
})
export class FinanceModule { }
