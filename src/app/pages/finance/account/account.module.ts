import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { TranslocoModule } from '@ngneat/transloco';

import { AccountRoutingModule } from './account-routing.module';
import { AccountComponent } from './account.component';
import { AccountListComponent } from './account-list';
import { AccountDetailComponent } from './account-detail';
import { AccountHierarchyComponent } from './account-hierarchy';
import { AccountExtraDownpaymentComponent } from './account-extra-downpayment/account-extra-downpayment.component';
import { AccountExtraAssetComponent } from './account-extra-asset/account-extra-asset.component';
import { AccountExtraLoanComponent } from './account-extra-loan/account-extra-loan.component';

@NgModule({
  declarations: [
    AccountComponent,
    AccountListComponent,
    AccountHierarchyComponent,
    AccountDetailComponent,
    AccountExtraDownpaymentComponent,
    AccountExtraAssetComponent,
    AccountExtraLoanComponent,
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
    NzSelectModule,
    NzTagModule,
    NzDescriptionsModule,
    NzTabsModule,
    NzCheckboxModule,
    NzGridModule,
    NzButtonModule,
    NzInputModule,
    NzInputNumberModule,
    NzDatePickerModule,
    AccountRoutingModule,
    TranslocoModule,
  ],
  exports: [
    AccountExtraDownpaymentComponent,
    AccountExtraAssetComponent,
    AccountExtraLoanComponent,
  ]
})
export class AccountModule { }
