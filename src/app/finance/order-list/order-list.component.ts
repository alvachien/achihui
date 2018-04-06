import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, Order, UICommonLabelEnum } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

/**
 * Data source of Order
 */
export class OrderDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Order[]> {
    const displayDataChanges: any[] = [
      this._storageService.listOrderChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data: any = this._storageService.Orders.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-finance-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit {

  displayedColumns: string[] = ['id', 'name', 'ValidFrom', 'ValidTo', 'comment'];
  dataSource: OrderDataSource | undefined;
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
      console.log('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...');
    }

    this.isLoadingResults = true;
    this.dataSource = new OrderDataSource(this._storageService, this.paginator);

    this._storageService.fetchAllOrders().subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
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

    this._storageService.fetchAllOrders(true, this.includeInvalid).subscribe((x: any) => {
      // Ensure the HTTP get is fired
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
