import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@angular/material';
import { CovalentCoreModule } from '@covalent/core';
import { UIRefModule } from '../uiref.module';

import { FinanceComponent } from './finance.component';
import { ListComponent as AccountListComponent } from './account/list/list.component';
import { DetailComponent as AccountDetailComponent } from './account/detail/detail.component';
import { ListComponent as DocumentListComponent } from './document/list/list.component';
import { DetailComponent as DocumentDetailComponent } from './document/detail/detail.component';
import { FinanceRoutingModule } from './finance-routing.module';
import { AccountComponent } from './account/account.component';
import { DocumentComponent } from './document/document.component';

@NgModule({
  imports: [
    CommonModule,    
    MaterialModule.forRoot(),
    CovalentCoreModule.forRoot(),
    UIRefModule,
    FinanceRoutingModule
  ],
  declarations: [
    FinanceComponent, 
    AccountListComponent, 
    AccountDetailComponent, 
    DocumentListComponent, 
    DocumentDetailComponent, 
    AccountComponent, 
    DocumentComponent
  ]
})
export class FinanceModule { }
