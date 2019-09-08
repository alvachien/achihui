import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { TranslateModule } from '@ngx-translate/core';

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
    NzButtonModule,
    ReportRoutingModule,
    TranslateModule.forChild(),
  ]
})
export class ReportModule { }
