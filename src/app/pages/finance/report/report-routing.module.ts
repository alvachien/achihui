import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportComponent } from './report.component';
import { AccountReportComponent } from './account-report';
import { ControlCenterReportComponent } from './control-center-report';
import { OrderReportComponent } from './order-report';
import { TranTypeReportComponent  } from './tran-type-report';
import { TranTypeMonthOnMonthReportComponent } from './tran-type-month-on-month-report';
import { AccountMonthOnMonthReportComponent } from './account-month-on-month-report';
import { ControlCenterMonthOnMonthReportComponent } from './control-center-month-on-month-report';
import { CashReportComponent } from './cash-report';
import { CashMonthOnMonthReportComponent } from './cash-month-on-month-report';

const routes: Routes = [
  { path: '', component: ReportComponent },
  { path: 'account', component: AccountReportComponent },
  { path: 'accountmom', component: AccountMonthOnMonthReportComponent },
  { path: 'controlcenter', component: ControlCenterReportComponent },
  { path: 'controlcentermom', component: ControlCenterMonthOnMonthReportComponent },
  { path: 'order', component: OrderReportComponent },
  { path: 'trantype', component: TranTypeReportComponent },
  { path: 'trantypemom', component: TranTypeMonthOnMonthReportComponent },
  { path: 'cash', component: CashReportComponent },
  { path: 'cashmom', component: CashMonthOnMonthReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
