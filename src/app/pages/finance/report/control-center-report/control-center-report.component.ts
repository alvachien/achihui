import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, NzDrawerService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { LogLevel, FinanceReportByControlCenter, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  momentDateFormat, Account, AccountCategory, ControlCenter, GeneralFilterOperatorEnum, GeneralFilterValueType, GeneralFilterItem, } from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';
import { DocumentItemViewComponent } from '../../document-item-view';

@Component({
  selector: 'hih-finance-report-controlcenter',
  templateUrl: './control-center-report.component.html',
  styleUrls: ['./control-center-report.component.less'],
})
export class ControlCenterReportComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults = false;
  dataSet: any[] = [];
  arReportByControlCenter: FinanceReportByControlCenter[] = [];
  arControlCenter: ControlCenter[] = [];
  baseCurrency: string;

  constructor(
    public odataService: FinanceOdataService,
    private homeService: HomeDefOdataService,
    private modalService: NzModalService,
    private drawerService: NzDrawerService,
    private router: Router,
    ) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterReportComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
    this.baseCurrency = this.homeService.ChosedHome.BaseCurrency;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    // Load data
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchAllReportsByControlCenter(),
      this.odataService.fetchAllControlCenters(),
    ])
    .pipe(takeUntil(this._destroyed$),
      finalize(() => this.isLoadingResults = false))
    .subscribe({
      next: (x: any[]) => {
        this.arReportByControlCenter = x[0];
        this.arControlCenter = x[1];

        this.buildReportList();
      },
      error: (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering ControlCenterReportComponent ngOnInit forkJoin failed ${error}`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      },
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering ControlCenterReportComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onDisplayMasterData(ccid: number) {
    this.router.navigate(['/finance/controlcenter/display/' + ccid.toString()]);
  }

  onDisplayDebitData(ccid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'ControlCenterID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ccid,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    fltrs.push({
      fieldName: 'Amount',
      operator: GeneralFilterOperatorEnum.LargerThan,
      lowValue: 0,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<DocumentItemViewComponent, {
      filterDocItem: GeneralFilterItem[],
    }, string>({
      nzTitle: 'Document Items',
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
  onDisplayCreditData(ccid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'ControlCenterID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ccid,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    fltrs.push({
      fieldName: 'Amount',
      operator: GeneralFilterOperatorEnum.LessThan,
      lowValue: 0,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<DocumentItemViewComponent, {
      filterDocItem: GeneralFilterItem[],
    }, string>({
      nzTitle: 'Document Items',
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
  onDisplayBalanceData(ccid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'ControlCenterID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ccid,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<DocumentItemViewComponent, {
      filterDocItem: GeneralFilterItem[],
    }, string>({
      nzTitle: 'Document Items',
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }

  private buildReportList(): void {
    this.dataSet = [];
    this.arReportByControlCenter.forEach((bal: FinanceReportByControlCenter) => {
      const ccobj = this.arControlCenter.find((cc: ControlCenter) => {
        return cc.Id === bal.ControlCenterId;
      });
      if (ccobj) {
        this.dataSet.push({
          ControlCenterId: bal.ControlCenterId,
          ControlCenterName: ccobj.Name,
          DebitBalance: bal.DebitBalance,
          CreditBalance: bal.CreditBalance,
          Balance: bal.Balance,
        });
      }
    });
  }
}
