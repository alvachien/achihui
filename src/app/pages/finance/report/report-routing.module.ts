import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportComponent } from './report.component';
import { AccountReportComponent } from './account-report';
import { ControlCenterReportComponent } from './control-center-report';
import { OrderReportComponent } from './order-report';
import { TranTypeReportComponent  } from './tran-type-report';
import { TranTypeMonthOnMonthReportComponent } from './tran-type-month-on-month-report';

const routes: Routes = [
  { path: '', component: ReportComponent },
  { path: 'account', component: AccountReportComponent },
  { path: 'controlcenter', component: ControlCenterReportComponent },
  { path: 'order', component: OrderReportComponent },
  { path: 'trantype', component: TranTypeReportComponent },
  { path: 'trantypemom', component: TranTypeMonthOnMonthReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
