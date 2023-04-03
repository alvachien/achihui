import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';

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
    NzSegmentedModule,
    DocumentItemInsightRoutingModule,
  ]
})
export class DocumentItemInsightModule { }
