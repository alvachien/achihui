import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy, } from '@angular/core';
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Order, UICommonLabelEnum, momentDateFormat } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-finance-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'name', 'ValidFrom', 'ValidTo', 'comment'];
  dataSource: MatTableDataSource<Order> = new MatTableDataSource<Order>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  includeInvalid: boolean = false;
  isLoadingResults: boolean;

  constructor(private _dialog: MatDialog,
    public _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _router: Router) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering OrderListComponent constructor...');
    }
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering OrderListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;

    this._storageService.fetchAllOrders().pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug('AC_HIH_UI [Debug]: Entering OrderListComponent ngOnInit, fetchAllOrders.');
      }

      this._buildDataSource(x);
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.log(`AC_HIH_UI [Error]: Entering OrderListComponent ngOnInit, fetchAllOrders, failed with ${error}`);
      }
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering OrderListComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering OrderListComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCreateOrder(): void {
    this._router.navigate(['/finance/order/create']);
  }

  public onDisplayOrder(acnt: Order): void {
    this._router.navigate(['/finance/order/display', acnt.Id]);
  }

  public onChangeOrder(acnt: Order): void {
    this._router.navigate(['/finance/order/edit', acnt.Id]);
  }

  public onDeleteOrder(acnt: any): void {
    // Show a confirmation dialog for the deletion
    const dlginfo: MessageDialogInfo = {
      Header: this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfirmTitle),
      Content: this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfrimContent),
      Button: MessageDialogButtonEnum.yesno,
    };

    this._dialog.open(MessageDialogComponent, {
      disableClose: false,
      width: '500px',
      data: dlginfo,
    }).afterClosed().subscribe((x2: any) => {
      // Do nothing!
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering OrderListComponent, onDeleteOrder, Message dialog result ${x2}`);
      }

      if (x2) {
        // Todo!
      }
    });
  }

  public onRefresh(): void {
    this.isLoadingResults = true;
    this.includeInvalid = !this.includeInvalid;

    this._storageService.fetchAllOrders(true).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      this._buildDataSource(x);
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }

  private _buildDataSource(arOrders: Order[]): void {
    let mtoday: moment.Moment = moment();
    let mtoday2: moment.Moment = moment(mtoday.format(momentDateFormat), momentDateFormat);
    if (arOrders) {
      this.dataSource.data = arOrders.filter((value: Order) => {
        if (this.includeInvalid !== true) {
          if (value.ValidFrom.isBefore(mtoday2) && value.ValidTo.isAfter(mtoday2)) {
            return true;
          } else {
            return false;
          }
        }

        return true;
      });
    }
  }
}
