import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';
import { NzTransferModule } from 'ng-zorro-antd/transfer';

import { DocumentItemInsightComponent } from './document-item-insight.component';
import { DocumentItemInsightRoutingModule } from './document-item-insight-routing.module';

@NgModule({
  declarations: [
    DocumentItemInsightComponent,
  ],
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    FinanceUIModule, 
    TranslocoModule,
    NzTransferModule,
    DocumentItemInsightRoutingModule,
  ]
})
export class DocumentItemInsightModule { }
