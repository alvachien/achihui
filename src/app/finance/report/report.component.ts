import { Component, OnInit, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatPaginator, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, BalanceSheetReport, ControlCenterReport, OrderReport } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

/**
 * Data source of BS
 */
export class ReportBSDataSource extends DataSource<any> {
  constructor(private _parentComponent: ReportComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<BalanceSheetReport[]> {
    const displayDataChanges = [
      this._parentComponent.ReportBSEvent,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._parentComponent.ReportBS.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

/**
 * Data source of CC
 */
export class ReportCCDataSource extends DataSource<any> {
  constructor(private _parentComponent: ReportComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ControlCenterReport[]> {
    const displayDataChanges = [
      this._parentComponent.ReportCCEvent,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._parentComponent.ReportCC.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

/**
 * Data source of Order
 */
export class ReportOrderDataSource extends DataSource<any> {
  constructor(private _parentComponent: ReportComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<OrderReport[]> {
    const displayDataChanges = [
      this._parentComponent.ReportOrderEvent,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._parentComponent.ReportOrder.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-finance-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit {
  displayedBSColumns = ['Account', 'Category', 'Debit', 'Credit', 'Balance'];
  dataSourceBS: ReportBSDataSource | null;
  ReportBS: BalanceSheetReport[] = [];
  ReportBSEvent: EventEmitter<null> = new EventEmitter<null>(null);
  @ViewChild('paginatorBS') paginatorBS: MatPaginator;

  displayedCCColumns = ['ControlCenter', 'Debit', 'Credit', 'Balance'];
  dataSourceCC: ReportCCDataSource | null;
  ReportCC: ControlCenterReport[] = [];
  ReportCCEvent: EventEmitter<null> = new EventEmitter<null>(null);
  @ViewChild('paginatorCC') paginatorCC: MatPaginator;

  includeInvalid: boolean = false;
  displayedOrderColumns = ['Order', 'Debit', 'Credit', 'Balance'];
  dataSourceOrder: ReportOrderDataSource | null;
  ReportOrder: OrderReport[] = [];
  ReportOrderEvent: EventEmitter<null> = new EventEmitter<null>(null);
  @ViewChild('paginatorOrder') paginatorOrder: MatPaginator;

  view: any[] = [700, 400];
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };
  dataBSAccountDebit: any[] = [];
  dataBSAccountCredit: any[] = [];
  dataBSCategoryDebit: any[] = [];
  dataBSCategoryCredit: any[] = [];
  dataCCDebit: any[] = [];
  dataCCCredit: any[] = [];
  dataOrderDebit: any[] = [];
  dataOrderCredit: any[] = [];

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
  }

  ngOnInit() {
    this.dataSourceBS = new ReportBSDataSource(this, this.paginatorBS);
    this.dataSourceCC = new ReportCCDataSource(this, this.paginatorCC);
    this.dataSourceOrder = new ReportOrderDataSource(this, this.paginatorOrder);

    Observable.forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._storageService.getReportBS(),
      this._storageService.getReportCC(),
      this._storageService.getReportOrder(),
    ]).subscribe((x) => {
      this.ReportBS = [];
      this.dataBSAccountDebit = [];
      this.dataBSAccountCredit = [];
      this.dataBSCategoryDebit = [];
      this.dataBSCategoryCredit = [];
      this.dataCCDebit = [];
      this.dataCCCredit = [];
      this.ReportCC = [];
      this.ReportOrder = [];

      let idxbs = 4, idxcc = 5, idxorder = 6;
      if (x[idxbs] instanceof Array && x[idxbs].length > 0) {
        for (let bs of x[idxbs]) {
          let rbs: BalanceSheetReport  = new BalanceSheetReport();
          rbs.onSetData(bs);

          if (rbs.DebitBalance) {
            this.dataBSAccountDebit.push({
              name: rbs.AccountName,
              value: rbs.DebitBalance,
            });

            let ctgyExist = false;
            for (let cd of this.dataBSCategoryDebit) {
              if (cd.name === rbs.AccountCategoryName) {
                ctgyExist = true;

                cd.value += rbs.DebitBalance;
                break;
              }
            }

            if (!ctgyExist) {
              this.dataBSCategoryDebit.push({
                name: rbs.AccountCategoryName,
                value: rbs.DebitBalance,
              });
            }
          }

          if (rbs.CreditBalance) {
            this.dataBSAccountCredit.push({
              name: rbs.AccountName,
              value: rbs.CreditBalance,
            });

            let ctgyExist = false;
            for (let cd of this.dataBSCategoryCredit) {
              if (cd.name === rbs.AccountCategoryName) {
                ctgyExist = true;

                cd.value += rbs.CreditBalance;
                break;
              }
            }

            if (!ctgyExist) {
              this.dataBSCategoryCredit.push({
                name: rbs.AccountCategoryName,
                value: rbs.CreditBalance,
              });
            }
          }

          this.ReportBS.push(rbs);
        }
      }

      if (x[idxcc] instanceof Array && x[idxcc].length > 0) {
        for (let bs of x[idxcc]) {
          let rbs: ControlCenterReport  = new ControlCenterReport();
          rbs.onSetData(bs);

          if (rbs.DebitBalance) {
            this.dataCCDebit.push({
              name: rbs.ControlCenterName,
              value: rbs.DebitBalance,
            });
          }

          if (rbs.CreditBalance) {
            this.dataCCCredit.push({
              name: rbs.ControlCenterName,
              value: rbs.CreditBalance,
            });
          }

          this.ReportCC.push(rbs);
        }
      }

      if (x[idxorder] instanceof Array && x[idxorder].length > 0) {
        for (let bs of x[idxorder]) {
          let rbs: OrderReport  = new OrderReport();
          rbs.onSetData(bs);

          if (rbs.DebitBalance) {
            this.dataCCDebit.push({
              name: rbs.OrderName,
              value: rbs.DebitBalance,
            });
          }

          if (rbs.CreditBalance) {
            this.dataCCCredit.push({
              name: rbs.OrderName,
              value: rbs.CreditBalance,
            });
          }

          this.ReportOrder.push(rbs);
        }
      }

      // Trigger the events
      this.ReportBSEvent.emit();
      this.ReportCCEvent.emit();
      this.ReportOrderEvent.emit();
    });
  }

  public onBSAccountDebitSelect($event) {
  }
  public onBSAccountCreditSelect($event) {
  }
  public onBSCategoryDebitSelect($event) {
  }
  public onBSCategoryCreditSelect($event) {
  }
  public onCCDebitSelect($event) {
  }
  public onCCCreditSelect($event) {
  }
  public onOrderDebitSelect($event) {
  }
  public onOrderCreditSelect($event) {
  }

  // Refresh the Order Report
  public onReportOrderRefresh() {

  }
}
