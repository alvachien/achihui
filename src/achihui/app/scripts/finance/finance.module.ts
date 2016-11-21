import { NgModule }         from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { CommonModule }     from '@angular/common';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from "ng2-translate/ng2-translate";

import { UIRefModule }      from '../uiref.module';
import { FinanceService }   from '../services/finance.service';
import { FinanceComponent } from './finance.component';
import { financeRouting }   from './finance.routing';
import { FinanceSettingComponent } from './finance.setting.component';
import { FinanceCurrencyComponent } from './finance.currency.component';
import { FinanceDocTypeComponent } from './finance.doctype.component';
import { FinanceAccountCategoryComponent } from './finance.acntctgy.component';
import { TranTypeComponent }            from './trantype.component';
import { TranTypeListComponent }        from './trantype.list.component';
import { TranTypeDetailComponent }      from './trantype.detail.component';
import { AccountComponent }             from './account.component';
import { AccountListComponent }         from './account.list.component';
import { AccountDetailComponent }       from './account.detail.component';
import { AccountDetailDPComponent }     from './account.detail.dp.component';
import { ControllingCenterComponent }   from './controllingcenter.component';
import { ControllingCenterListComponent } from './controllingcenter.list.component';
import { ControllingCenterDetailComponent } from './controllingcenter.detail.component';
import { OrderComponent }               from './order.component';
import { OrderListComponent }           from './order.list.component';
import { OrderDetailComponent }         from './order.detail.component';

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
        financeRouting        
    ],
    declarations: [
        FinanceComponent,
        FinanceSettingComponent,
        FinanceCurrencyComponent,
        FinanceDocTypeComponent,
        FinanceAccountCategoryComponent,
        TranTypeComponent,
        TranTypeListComponent,
        TranTypeDetailComponent,
        AccountComponent,
        AccountListComponent,
        AccountDetailComponent,
        AccountDetailDPComponent,
        ControllingCenterComponent,
        ControllingCenterListComponent,
        ControllingCenterDetailComponent,
        OrderComponent,
        OrderListComponent,
        OrderDetailComponent
    ],
    providers: [
        FinanceService
    ]
})
export class FinanceModule { }
