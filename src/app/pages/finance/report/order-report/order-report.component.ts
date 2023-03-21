import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { translate } from '@ngneat/transloco';
import { Router } from '@angular/router';
import * as moment from 'moment';

import {
  LogLevel,
  FinanceReportByOrder,
  ModelUtility,
  ConsoleLogTypeEnum,
  UIDisplayStringUtil,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  GeneralFilterItem,
  Order,
} from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';
import { DocumentItemViewComponent } from '../../document-item-view';

@Component({
  selector: 'hih-finance-report-order',
  templateUrl: './order-report.component.html',
  styleUrls: ['./order-report.component.less'],
})
export class OrderReportComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  dataSet: any[] = [];
  arReportByOrder: FinanceReportByOrder[] = [];
  arOrder: Order[] = [];
  baseCurrency: string;
  // Filters
  validOrderOnly = false;

  constructor(
    public odataService: FinanceOdataService,
    private homeService: HomeDefOdataService,
    private modalService: NzModalService,
    private drawerService: NzDrawerService,
    private router: Router
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderReportComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
    this.baseCurrency = this.homeService.ChosedHome!.BaseCurrency;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    // Load data
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    forkJoin([this.odataService.fetchReportByOrder(), this.odataService.fetchAllOrders()])
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: any[]) => {
          this.arReportByOrder = x[0] as FinanceReportByOrder[];
          this.arOrder = x[1] as Order[];

          this.buildReportList();
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering OrderReportComponent ngOnInit forkJoin failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderReportComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onOrderValidityChanged(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrderReportComponent onOrderValidityChanged...',
      ConsoleLogTypeEnum.debug
    );

    // Valid order
    this.buildReportList();
  }

  onDisplayMasterData(ccid: number) {
    this.router.navigate(['/finance/order/display/' + ccid.toString()]);
  }

  onDisplayDebitData(ccid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'OrderID',
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
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
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

    drawerRef.afterClose.subscribe((data) => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
  onDisplayCreditData(ccid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'OrderID',
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
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
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

    drawerRef.afterClose.subscribe((data) => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
  onDisplayBalanceData(ccid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'OrderID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ccid,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
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

    drawerRef.afterClose.subscribe((data) => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
  private buildReportList(): void {
    this.dataSet = [];
    const dt = moment();
    const ords = this.arOrder.filter((value) => {
      return this.validOrderOnly ? value.ValidFrom!.isBefore(dt) && value.ValidTo!.isAfter(dt) : true;
    });
    this.arReportByOrder.forEach((bal: FinanceReportByOrder) => {
      const ordobj = ords.find((cc: Order) => {
        return cc.Id === bal.OrderId;
      });
      if (ordobj) {
        this.dataSet.push({
          OrderId: bal.OrderId,
          OrderName: ordobj.Name,
          ValidFrom: ordobj.ValidFrom,
          ValidTo: ordobj.ValidTo,
          DebitBalance: bal.DebitBalance,
          CreditBalance: bal.CreditBalance,
          Balance: bal.Balance,
        });
      }
    });
  }
}
