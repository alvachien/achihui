import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE_PROVIDER, MAT_DATE_LOCALE } from '@angular/material';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { FinanceRoutingModule } from './finance-routing.module';
import { FinanceComponent } from './finance.component';
import { TranTypeComponent } from './tran-type';
import { TranTypeListComponent } from './tran-type-list';
import { TranTypeTreeComponent } from './tran-type-tree';
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
import { DocumentItemOverviewComponent } from './document-item-overview';
import { DocumentNormalCreateComponent } from './document-normal-create';
import { DocumentTransferCreateComponent } from './document-transfer-create';
import { DocumentLoanCreateComponent } from './document-loan-create';
import { DocumentExchangeCreateComponent } from './document-exchange-create';
import { DocumentAssetBuyInCreateComponent } from './document-asset-buy-in-create';
import { DocumentAssetSoldoutCreateComponent } from './document-asset-soldout-create';
import { DocumentAssetValChgCreateComponent } from './document-asset-valchg-create';
import { DocumentRepaymentExCreateComponent } from './document-repayment-ex-create';
import { DocumentADPCreateComponent } from './document-adpcreate';
import { AccountExtLoanExComponent } from './account-ext-loan-ex';
import { AccountExtADPExComponent } from './account-ext-adpex';
import { AccountTreeComponent } from './account-tree';
import { DocumentItemByAccountComponent } from './document-item-by-account';
import { DocumentItemByAccountCategoryComponent } from './document-item-by-account-category';
import { ControlCenterTreeComponent } from './control-center-tree';
import { DocumentItemByControlCenterComponent } from './document-item-by-control-center';
import { DocumentItemSearchListComponent } from './document-item-search-list';
import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIAccountCtgyFilterExPipe, } from './pipes';
import { AccountExtCreditCardComponent } from './account-ext-credit-card';
import { ConfigComponent } from './config';
import { AccountExtAssetExComponent } from './account-ext-asset-ex';
import { PlanComponent } from './plan';
import { PlanDetailComponent } from './plan-detail';
import { PlanListComponent } from './plan-list';
import { DocumentHeaderComponent } from './document-header';
import { DocumentItemsComponent } from './document-items';

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
    TranTypeComponent,
    TranTypeListComponent,
    TranTypeTreeComponent,
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
    DocumentItemOverviewComponent,
    DocumentAssetBuyInCreateComponent,
    DocumentAssetSoldoutCreateComponent,
    DocumentAssetValChgCreateComponent,
    AccountTreeComponent,
    DocumentItemByAccountComponent,
    DocumentItemByAccountCategoryComponent,
    ControlCenterTreeComponent,
    DocumentItemByControlCenterComponent,
    DocumentItemSearchListComponent,
    UIAccountStatusFilterPipe,
    UIAccountCtgyFilterPipe,
    UIAccountCtgyFilterExPipe,
    UIOrderValidFilterPipe,
    AccountExtCreditCardComponent,
    ConfigComponent,
    AccountExtAssetExComponent,
    DocumentADPCreateComponent,
    DocumentNormalCreateComponent,
    DocumentTransferCreateComponent,
    DocumentLoanCreateComponent,
    DocumentExchangeCreateComponent,
    PlanComponent,
    PlanDetailComponent,
    PlanListComponent,
    DocumentRepaymentExCreateComponent,
    AccountExtLoanExComponent,
    AccountExtADPExComponent,
    DocumentHeaderComponent,
    DocumentItemsComponent,
  ],
  providers: [
    MAT_DATE_LOCALE_PROVIDER,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class FinanceModule { }
