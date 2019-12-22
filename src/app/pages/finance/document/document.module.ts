import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { TranslocoModule } from '@ngneat/transloco';

import { DocumentRoutingModule } from './document-routing.module';
import { DocumentComponent } from './document.component';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentDetailComponent } from './document-detail/document-detail.component';
import { DocumentHeaderComponent } from './document-header/document-header.component';
import { DocumentItemsComponent } from './document-items/document-items.component';
import { DocumentNormalCreateComponent } from './document-normal-create/document-normal-create.component';
import { DocumentTransferCreateComponent } from './document-transfer-create/document-transfer-create.component';
import { DocumentDownpaymentCreateComponent } from './document-downpayment-create/document-downpayment-create.component';
import { DocumentAssetBuyCreateComponent } from './document-asset-buy-create/document-asset-buy-create.component';
import { DocumentAssetSoldCreateComponent } from './document-asset-sold-create/document-asset-sold-create.component';
import { DocumentLoanCreateComponent } from './document-loan-create/document-loan-create.component';

@NgModule({
  declarations: [
    DocumentComponent,
    DocumentListComponent,
    DocumentDetailComponent,
    DocumentHeaderComponent,
    DocumentItemsComponent,
    DocumentNormalCreateComponent,
    DocumentTransferCreateComponent,
    DocumentDownpaymentCreateComponent,
    DocumentAssetBuyCreateComponent,
    DocumentAssetSoldCreateComponent,
    DocumentLoanCreateComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzBreadCrumbModule,
    NzPageHeaderModule,
    NzTableModule,
    NzDividerModule,
    NzTreeModule,
    NzSpinModule,
    NzTagModule,
    NzDescriptionsModule,
    NzTabsModule,
    NzGridModule,
    NzDatePickerModule,
    NzButtonModule,
    NzSelectModule,
    NzDropDownModule,
    NzStepsModule,
    DocumentRoutingModule,
    TranslocoModule,
  ]
})
export class DocumentModule { }
