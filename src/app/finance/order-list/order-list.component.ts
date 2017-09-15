import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdDialog, MdPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, Order } from '../../model';
import { FinanceStorageService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

/**
 * Data source of Order
 */
export class OrderDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Order[]> {
    const displayDataChanges = [
      this._storageService.listOrderChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.Orders.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-finance-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit {

  displayedColumns = ['id', 'name', 'ValidFrom', 'ValidTo', 'comment'];
  dataSource: OrderDataSource | null;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(private _dialog: MdDialog,
    public _storageService: FinanceStorageService,
    private _router: Router) { }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...');
    }

    this.dataSource = new OrderDataSource(this._storageService, this.paginator);

    this._storageService.fetchAllOrders().subscribe(x => {
      // Just ensure the REQUEST has been sent
    });
  }

  public onCreateOrder() {
    this._router.navigate(['/finance/order/create']);
  }

  public onDisplayOrder(acnt: Order) {
    this._router.navigate(['/finance/order/display', acnt.Id]);
  }

  public onChangeOrder(acnt: Order) {
    this._router.navigate(['/finance/order/edit', acnt.Id]);
  }

  public onDeleteOrder(acnt: any) {
    // Show a confirmation dialog for the deletion
    const dlginfo: MessageDialogInfo = {
      Header: 'Common.DeleteConfirmation',
      Content: 'ConfirmToDeleteSelectedItem',
      Button: MessageDialogButtonEnum.yesno
    };

    this._dialog.open(MessageDialogComponent, {
      disableClose: false,
      width: '500px',
      data: dlginfo
    }).afterClosed().subscribe(x2 => {
      // Do nothing!
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
      }

      if (x2) {
        // Todo!
      }
    });
  }
}
