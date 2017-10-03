import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MD_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE_PROVIDER, MAT_DATE_LOCALE } from '@angular/material';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';
import { MD_MOMENT_DATE_FORMATS, MomentDateAdapter } from '../utility';

import { FinanceRoutingModule } from './finance-routing.module';
import { FinanceComponent } from './finance.component';
import { AccountCategoryComponent } from './account-category';
import { AccountCategoryListComponent } from './account-category-list';
import { AccountCategoryDetailComponent } from './account-category-detail';
import { DocumentTypeComponent } from './document-type';
import { DocumentTypeListComponent } from './document-type-list';
import { DocumentTypeDetailComponent } from './document-type-detail';
import { TranTypeComponent } from './tran-type';
import { TranTypeListComponent } from './tran-type-list';
import { TranTypeDetailComponent } from './tran-type-detail';
import { AccountComponent } from './account';
import { AccountListComponent } from './account-list';
import { AccountDetailComponent } from './account-detail';
import { ControlCenterComponent } from './control-center';
import { ControlCenterListComponent } from './control-center-list';
import { ControlCenterDetailComponent } from './control-center-detail';
import { OrderComponent } from './order';
import { OrderListComponent } from './order-list';
import { OrderDetailComponent } from './order-detail';
import { DocumentComponent } from './document';
import { DocumentListComponent } from './document-list';
import { DocumentDetailComponent } from './document-detail';
import { ReportComponent } from './report';
import { DocumentNormalDetailComponent } from './document-normal-detail';
import { DocumentTransferDetailComponent } from './document-transfer-detail';
import { DocumentAdvancepaymentDetailComponent } from './document-advancepayment-detail';
import { DocumentExchangeDetailComponent } from './document-exchange-detail';
import { DocumentItemOverviewComponent } from './document-item-overview';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FinanceRoutingModule,
    UIDependModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    FinanceComponent,
    AccountCategoryComponent,
    AccountCategoryListComponent,
    AccountCategoryDetailComponent,
    DocumentTypeComponent,
    DocumentTypeListComponent,
    DocumentTypeDetailComponent,
    TranTypeComponent,
    TranTypeListComponent,
    TranTypeDetailComponent,
    AccountComponent,
    AccountListComponent,
    AccountDetailComponent,
    DocumentComponent,
    DocumentListComponent,
    DocumentDetailComponent,
    ControlCenterComponent,
    ControlCenterListComponent,
    ControlCenterDetailComponent,
    OrderComponent,
    OrderListComponent,
    OrderDetailComponent,
    ReportComponent,
    DocumentNormalDetailComponent,
    DocumentTransferDetailComponent,
    DocumentAdvancepaymentDetailComponent,
    DocumentExchangeDetailComponent,
    DocumentItemOverviewComponent,
  ],
  providers: [
    MAT_DATE_LOCALE_PROVIDER,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MD_DATE_FORMATS, useValue: MD_MOMENT_DATE_FORMATS },
  ],
})
export class FinanceModule { }
