import { Component, OnInit } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams }
  from '@angular/http';
import * as HIHCommon from '../../../model/common';
import * as HIHFinance from '../../../model/financemodel';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent,
  ITdDataTableColumn, ITdDataTableSelectEvent
} from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UIStatusService } from '../../../services/uistatus.service';
import { AuthService } from '../../../services/auth.service';
import { TdDialogService } from '@covalent/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'finance-transactions-orderlist',
  templateUrl: './orderlist.component.html',
  styleUrls: ['./orderlist.component.scss']
})
export class OrderlistComponent implements OnInit {

  public arOrders: Array<HIHFinance.Order> = [];
  public listData: HIHFinance.DocumentItemWithBalance[] = [];
  public currentOrderName: string;

  clnhdrstring: string[] = ["Common.ID", "Common.ID", "Finance.TransactionDate", "Finance.Amount", "Finance.Amount", "Common.Comment"];
  columns: ITdDataTableColumn[] = [];

  filteredData: any[] = [];
  filteredTotal: number = 0;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 20;
  sortBy: string = 'TranDateString';
  selectable: boolean = true;
  selectedRows: any[] = [];
  searchBox = {
    searchVisible: false
  };
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  constructor(private _http: Http,
    private _uistatus: UIStatusService,
    private _authService: AuthService,
    private _dialogService: TdDialogService,
    private _dataTableService: TdDataTableService,
    private _tranService: TranslateService) {
    this.columns = [
      { name: 'DocId', label: '#', tooltip: 'ID' },
      { name: 'ItemId', label: 'Item Id', tooltip: 'Item ID' },
      { name: 'TranDateString', label: 'Tran. Date', tooltip: 'Tran. Date' },
      { name: 'TranTypeName', label: 'Tran. type', tooltip: 'Tran. type' },
      { name: 'TranAmount_LC', label: 'Amount', tooltip: 'Amount', numeric: true, format: (value) => { if (value) return value.toFixed(2); return 0.0;  } },
      { name: 'Balance', label: 'Balance', tooltip: 'Balance', numeric: true, format: (value) => { if (value) return value.toFixed(2); return 0.0;  } },
      { name: 'AccountName', label: 'Account', tooltip: 'Account' },
      { name: 'ControlCenterName', label: 'Control center', tooltip: 'control center' },      
      { name: 'Desp', label: 'Desp', tooltip: 'Desp' }
    ];
  }

  ngOnInit() {
    this.loadOrderList();
  }

  loadOrderList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadOrderList of FinanceAccountList");
    }

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized) {
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    }
    let apiUrl = environment.ApiUrl + "/api/financeorder";

    this._http.get(apiUrl, { headers: headers })
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this.arOrders = data;

          if (this.arOrders.length > 0) {
            this.showDocItems(this.arOrders[0]);
          }
        }
      },
      error => {
        // It should be handled already
      },
      () => {
        // Finished
      });
  }
  
  showDocItems(ordobj: HIHFinance.Order) {
    if (environment.DebugLogging) {
      console.log("Entering showDocItems of FinanceAccountList");
    }

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized) {
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    }
    let apiUrl = environment.ApiUrl + "/api/financedocumentitem";
    let params: URLSearchParams = new URLSearchParams();
    params.set('ordid', ordobj.Id.toString());
    this.currentOrderName = ordobj.Name;

    this._http.get(apiUrl, { search: params, headers: headers })
      .map(res => {
        let body = res.json();
        let arrRst = [];
        if (body && body instanceof Array) {
          for (let alm of body) {
            let alm2 = new HIHFinance.DocumentItemWithBalance();
            alm2.onSetData(alm);
            arrRst.push(alm2);
          }
          return arrRst;
        }
      })
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this.listData = data;
          this.filter();
        }
      },
      error => {
        // It should be handled already
      },
      () => {
        // Finished
      });
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

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  filter(): void {
    let newData: any[] = this.listData;
    newData = this._dataTableService.filterData(newData, this.searchTerm, true);
    this.filteredTotal = newData.length;
    newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }

  private extractData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractData of FinanceAccountList");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHFinance.ControllingCenter>();
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.ControllingCenter();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of FinanceAccountList");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }  
}
