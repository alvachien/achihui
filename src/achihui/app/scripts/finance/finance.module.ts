import { NgModule }         from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { CommonModule }     from '@angular/common';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from "ng2-translate/ng2-translate";

import { FinanceService }   from '../services/finance.service';
import { FinanceComponent } from './finance.component';
import { financeRouting }   from './finance.routing';
import { FinanceSettingComponent } from './finance.setting.component';
import { FinanceCurrencyComponent } from './finance.currency.component';
import { FinanceDocTypeComponent } from './finance.doctype.component';
import { FinanceAccountCategoryComponent } from './finance.acntctgy.component';
import { FinanceTranTypeListComponent } from './finance.trantype.list.component';
import { FinanceTranTypeDetailComponent } from './finance.trantype.detail.component';
import { FinanceAccountComponent } from './finance.account.component';
import { FinanceAccountListComponent } from './finance.account.list.component';
import { FinanceAccountCreateComponent } from './finance.account.create.component';
import { FinanceControllingCenterListComponent } from './finance.controllingcenter.list.component';
import { FinanceOrderListComponent } from './finance.order.list.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, '/app/locales/', '.json'),
            deps: [Http]
        }),
        financeRouting        
    ],
    declarations: [
        FinanceComponent,
        FinanceSettingComponent,
        FinanceCurrencyComponent,
        FinanceDocTypeComponent,
        FinanceAccountCategoryComponent,
        FinanceTranTypeListComponent,
        FinanceTranTypeDetailComponent,
        FinanceAccountComponent,
        FinanceAccountListComponent,
        FinanceAccountCreateComponent,
        FinanceControllingCenterListComponent,
        FinanceOrderListComponent
    ],

    providers: [
        FinanceService
    ]
})
export class FinanceModule { }
