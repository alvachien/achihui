import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { DocumentItemViewComponent } from './';


@NgModule({
  declarations: [
    DocumentItemViewComponent,
  ],
  imports: [
    CommonModule,
    FinanceUIModule,
    TranslocoModule,
  ],
  exports: [
    DocumentItemViewComponent,
  ]
})
export class DocumentItemViewModule { }
