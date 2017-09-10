import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';

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

@NgModule({
  imports: [
    CommonModule,
    FinanceRoutingModule,
    UIDependModule,
    TranslateModule.forChild()
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
    ReportComponent
  ]
})
export class FinanceModule { }
