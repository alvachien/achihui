import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { DocumentItemInsightComponent } from './document-item-insight.component';

@NgModule({
  declarations: [
    DocumentItemInsightComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, FinanceUIModule, TranslocoModule
  ]
})
export class DocumentItemInsightModule { }
