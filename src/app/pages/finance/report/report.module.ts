import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { ControlCenterReportComponent } from './control-center-report/control-center-report.component';
import { OrderReportComponent } from './order-report/order-report.component';
import { AccountReportComponent } from './account-report/account-report.component';
import { ReportComponent } from './report.component';


@NgModule({
  declarations: [
    ControlCenterReportComponent,
    OrderReportComponent,
    AccountReportComponent,
    ReportComponent,
  ],
  imports: [
    CommonModule,
    ReportRoutingModule
  ]
})
export class ReportModule { }
