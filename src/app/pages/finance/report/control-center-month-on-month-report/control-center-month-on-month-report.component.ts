import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';

import { ConsoleLogTypeEnum, ControlCenter, ModelUtility } from 'src/app/model';

@Component({
  selector: 'hih-control-center-month-on-month-report',
  templateUrl: './control-center-month-on-month-report.component.html',
  styleUrls: ['./control-center-month-on-month-report.component.less'],
})
export class ControlCenterMonthOnMonthReportComponent implements OnInit {

  constructor() { }

  arControlCenters: ControlCenter[] = [];
  selectedCCID: number | null = null;
  selectedPeriod = '3';
  chartOption: EChartsOption | null = null;

  get isGoButtonDisabled(): boolean {
    if (this.selectedCCID === null) {
      return true;
    }
    
    return false;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterMonthOnMonthReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
  }

  onChanges(event: any): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ControlCenterMonthOnMonthReportComponent onChanges with ${this.selectedCCID}, ${this.selectedPeriod}`,
      ConsoleLogTypeEnum.debug);
  }

  refreshData(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ControlCenterMonthOnMonthReportComponent refreshData`,
      ConsoleLogTypeEnum.debug);
    if (this.selectedCCID === null) {
      return;
    }
  }
}
