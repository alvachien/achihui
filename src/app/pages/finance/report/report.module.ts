import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { ReportRoutingModule } from './report-routing.module';
import { ControlCenterReportComponent } from './control-center-report';
import { OrderReportComponent } from './order-report';
import { AccountReportComponent } from './account-report';
import { TranTypeReportComponent } from './tran-type-report';
import { ReportComponent } from './report.component';
import { DocumentItemViewModule } from '../document-item-view/document-item-view.module';
import { TranTypeMonthOnMonthReportComponent } from './tran-type-month-on-month-report';
import { AccountMonthOnMonthReportComponent } from './account-month-on-month-report';
import { ControlCenterMonthOnMonthReportComponent } from './control-center-month-on-month-report';

@NgModule({
  declarations: [
    ControlCenterReportComponent,
    OrderReportComponent,
    AccountReportComponent,
    ReportComponent,
    TranTypeReportComponent,
    TranTypeMonthOnMonthReportComponent,
    AccountMonthOnMonthReportComponent,
    ControlCenterMonthOnMonthReportComponent,
  ],
  imports: [
    CommonModule,
    FinanceUIModule,
    ReportRoutingModule,
    TranslocoModule,
    DocumentItemViewModule,
    NzListModule,
    NzProgressModule,
    NzCascaderModule,
    NzSelectModule,
  ]
})
export class ReportModule { }
