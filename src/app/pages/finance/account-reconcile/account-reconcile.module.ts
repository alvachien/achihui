import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzElementPatchModule } from 'ng-zorro-antd/core/element-patch'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslocoModule } from '@ngneat/transloco';

import { AccountReconcileRoutingModule } from './account-reconcile-routing.module';
import { ReconcileByMonthComponent } from './reconcile-by-month';

@NgModule({
  declarations: [
    ReconcileByMonthComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NzStepsModule,
    NzSwitchModule,
    NzSelectModule,
    NzButtonModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzInputModule,
    NzInputNumberModule,
    NzTableModule,
    NzModalModule,
    NzToolTipModule,
    NzIconModule,
    NzElementPatchModule,
    
    NzDatePickerModule,
    TranslocoModule,

    AccountReconcileRoutingModule
  ]
})
export class AccountReconcileModule { }
