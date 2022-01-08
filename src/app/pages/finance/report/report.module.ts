import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzProgressModule } from 'ng-zorro-antd/progress';

import { ReportRoutingModule } from './report-routing.module';
import { ControlCenterReportComponent } from './control-center-report/control-center-report.component';
import { OrderReportComponent } from './order-report/order-report.component';
import { AccountReportComponent } from './account-report/account-report.component';
import { ReportComponent } from './report.component';
import { DocumentItemViewModule } from '../document-item-view/document-item-view.module';

@NgModule({
  declarations: [
    ControlCenterReportComponent,
    OrderReportComponent,
    AccountReportComponent,
    ReportComponent,
  ],
  imports: [
    CommonModule,
    FinanceUIModule,
    ReportRoutingModule,
    TranslocoModule,
    DocumentItemViewModule,
    NzListModule,
    NzProgressModule,
  ]
})
export class ReportModule { }
