import { Component, OnInit, ViewContainerRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams }
  from '@angular/http';
import * as HIHCommon from '../../../model/common';
import * as HIHFinance from '../../../model/financemodel';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
  TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent,
  ITdDataTableColumn, ITdDataTableSelectEvent
} from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UIStatusService } from '../../../services/uistatus.service';
import { TdDialogService } from '@covalent/core';

@Component({
  selector: 'finance-order-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  private _apiUrl: string;
  public listData: Array<HIHFinance.Order> = [];

  columns: ITdDataTableColumn[] = [
    { name: 'Id', label: '#', tooltip: 'ID' },
    { name: 'Name', label: 'Name', tooltip: 'Name' },
    { name: 'ValidFromString', label: 'From', tooltip: 'Valid from' },
    { name: 'ValidToString', label: 'To', tooltip: 'Valid to' },
    { name: 'Comment', label: 'Comment' }
  ];
  filteredData: any[];
  filteredTotal: number;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 5;
  sortBy: string = 'Id';
  selectable: boolean = true;
  selectedRows: any[] = [];
  searchBox = {
    searchVisible: false
  };
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  constructor(private _http: Http,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _zone: NgZone,
    private _uistatus: UIStatusService,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _dataTableService: TdDataTableService) {
    if (environment.DebugLogging) {
      console.log("Entering constructor of FinanceOrderList");
    }

    this._apiUrl = environment.ApiUrl + "api/financeorder";
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceOrderList");
    }

    this._uistatus.setFinanceModule("Order");
    this._uistatus.setFinanceSubModule("List Mode");
    this.loadOrderList();
  }

  loadOrderList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadOrderList of FinanceOrderList");
    }

    var headers = new Headers();
    this._http.get(this._apiUrl, { headers: headers })
      .map(this.extractOrderListData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this.listData = data;
          this.filter();
          // this.filteredData = this.listData;
          // this.filteredTotal = this.listData.length;
        }
      },
      error => {
        // It should be handled already
      },
      () => {
        // Finished
      });
  }

  private extractOrderListData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractData of FinanceOrderList");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHFinance.Order>();
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.Order();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of FinanceOrderList");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }

  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }

  // selectEvent(selectEvent: ITdDataTableSelectEvent): void {
  //   if (selectEvent.selected) {
  //     this._zone.run(() => {
  //       this.listSelectRows.push(selectEvent.row.Id);
  //     });
  //   } else {
  //     this._zone.run(() => {
  //       for (let idx = 0; idx < this.listSelectRows.length; idx++) {
  //         if (+this.listSelectRows[idx] === +selectEvent.row.Id) {
  //           this.listSelectRows.splice(idx);
  //           break;
  //         }
  //       }
  //     });
  //   }
  // }

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  filter(): void {
    if (this.listData) {
      let newData: any[] = this.listData;
      newData = this._dataTableService.filterData(newData, this.searchTerm, true);
      this.filteredTotal = newData.length;
      newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
      newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
      this.filteredData = newData;
    }
  }

  public onCreateOrder() {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering onCreateOrder of FinanceOrderList");
    }

    this._router.navigate(['/finance/order/create']);
  }

  public onEditOrder() {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering onEditOrder of FinanceOrderList");
    }

    if (this.selectedRows.length != 1) {
      this._dialogService.openAlert({
        message: "Select one and only one row to continue!",
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: "Selection error", //OPTIONAL, hides if not provided
        closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
      });
      return;
    }

    this._router.navigate(['/finance/order/edit/' + this.selectedRows[0].Id.toString()]);
  }

  public onDeleteOrder() : void {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering onDeleteOrder of FinanceOrderList");
    }
    if (this.selectedRows.length <= 0) {
      this._dialogService.openAlert({
        message: "Select one and only one row to continue!",
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: "Selection error", //OPTIONAL, hides if not provided
        closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
      });
      return;
    }    
  }
}
