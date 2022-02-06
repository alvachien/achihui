import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { DocumentItemViewComponent } from './';


@NgModule({
  declarations: [
    DocumentItemViewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FinanceUIModule,
    TranslocoModule,
  ],
  exports: [
    DocumentItemViewComponent,
  ],
})
export class DocumentItemViewModule { 
}
