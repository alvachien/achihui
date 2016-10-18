import { NgModule }         from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { CommonModule }     from '@angular/common';
import { HttpModule, Http } from '@angular/http';

import { FinanceService }   from '../services/finance.service';
import { FinanceComponent } from './finance.component';
import { financeRouting }   from './finance.routing';
import { FinanceSettingComponent } from './finance.setting.component';
import { FinanceCurrencyComponent } from './finance.currency.component';
import { FinanceDocTypeComponent } from './finance.doctype.component';
import { FinanceAccountCategoryComponent } from './finance.acntctgy.component';
import { FinanceTranTypeListComponent } from './finance.trantype.list.component';
import { FinanceTranTypeDetailComponent } from './finance.trantype.detail.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        financeRouting        
    ],
    declarations: [
        FinanceComponent,
        FinanceSettingComponent,
        FinanceCurrencyComponent,
        FinanceDocTypeComponent,
        FinanceAccountCategoryComponent,
        FinanceTranTypeListComponent,
        FinanceTranTypeDetailComponent
    ],

    providers: [
        FinanceService,
        //AlbumDetailResolve
    ]
})
export class FinanceModule { }
