import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Order, UICommonLabelEnum, momentDateFormat } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';

@Component({
  selector: 'hih-finance-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['id', 'name', 'ValidFrom', 'ValidTo', 'comment'];
  dataSource: MatTableDataSource<Order> = new MatTableDataSource<Order>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  includeInvalid: boolean = false;
  isLoadingResults: boolean;

  constructor(private _dialog: MatDialog,
    public _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _router: Router) {
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering OrderListComponent ngOnInit...');
    }

    this.isLoadingResults = true;

    this._storageService.fetchAllOrders().subscribe((x: any) => {
      this._buildDataSource();
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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
        console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
      }

      if (x2) {
        // Todo!
      }
    });
  }

  public onRefresh(): void {
    this.isLoadingResults = true;
    this.includeInvalid = !this.includeInvalid;

    this._storageService.fetchAllOrders(true).subscribe((x: any) => {
      this._buildDataSource();
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }

  private _buildDataSource(): void {
    let mtoday: moment.Moment = moment();
    let mtoday2: moment.Moment = moment(mtoday.format(momentDateFormat), momentDateFormat);
    this.dataSource.data = this._storageService.Orders.filter((value: Order) => {
      if (this.includeInvalid !== true) {
        if (value._validFrom.isBefore(mtoday2) && value._validTo.isAfter(mtoday2)) {
          return true;
        } else {
          return false;
        }
      }

      return true;
    });
  }
}
