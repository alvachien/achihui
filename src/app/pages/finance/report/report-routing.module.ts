import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportComponent } from './report.component';
import { AccountReportComponent } from './account-report';
import { ControlCenterReportComponent } from './control-center-report';
import { OrderReportComponent } from './order-report';

const routes: Routes = [
  { path: '', component: ReportComponent },
  { path: 'account', component: AccountReportComponent },
  { path: 'controlcenter', component: ControlCenterReportComponent },
  { path: 'order', component: OrderReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
