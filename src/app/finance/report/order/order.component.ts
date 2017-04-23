import { Component, OnInit, ViewContainerRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  selector: 'finance-report-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  private _apiUrl: string;
  public listData: Array<HIHFinance.OrderReport> = [];

  clnhdrstring: string[] = ["Finance.Order", "Finance.Incoming", "Finance.Outgoing", "Finance.Balance"];
  columns: ITdDataTableColumn[] = [];
  filteredData: any[];
  filteredTotal: number;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 10;
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  showLegend = true;
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#FAEBD7', '#7FFFD4', '#8A2BE2', 'A52A2A', '993300', '9966FF', '#6495ED']
  };
  showLabels = true;
  rstDebit: any[] = [];
  rstCredit: any[] = [];

  constructor(private _http: Http,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _zone: NgZone,
    private _uistatus: UIStatusService,
    private _authService: AuthService,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _dataTableService: TdDataTableService,
    private _tranService: TranslateService) { 
    this._apiUrl = environment.ApiUrl + "/api/financereportorder";
    this.columns = [
      { name: 'OrderName', label: 'Order', tooltip: 'Order' },
      { name: 'DebitBalance', label: 'Debit', tooltip: 'Debit', numeric: true, format: v => v.toFixed(2) },
      { name: 'CreditBalance', label: 'Credit', tooltip: 'Credit', numeric: true, format: v => v.toFixed(2) },
      { name: 'Balance', label: 'Balance', tooltip: 'Balance', numeric: true, format: v => v.toFixed(2) }
    ];

    this._uistatus.subjCurLanguage.subscribe(x => {
      if (environment.DebugLogging) {
        console.log("Language changed in OrderComponent:" + x);
      }
      
      this.loadHeaderString();
    });
  }

  ngOnInit() {
    this.loadOrderReport();
  }

  loadOrderReport(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadOrderReport of OrderComponent");
    }

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized) {
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    }
    this._http.get(this._apiUrl, { headers: headers })
      .map(this.extractData)
      .subscribe(data => {
        if (data instanceof Array) {
          this.listData = data;
          this.filter();
        }

        this.rstDebit = [];
        this.rstCredit = [];
        for(let ld of this.listData) {
          if (ld.DebitBalance > 0) {
            this.rstDebit.push({
              name: ld.OrderName,
              value: ld.DebitBalance
            });
          }
          if (ld.CreditBalance > 0) {
            this.rstCredit.push({
              name: ld.OrderName,
              value: ld.CreditBalance
            });
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

  private extractData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractData of OrderComponent");
    }

    let body = res.json();
    if (body && body instanceof Array) {
      let sets = new Array<HIHFinance.OrderReport>();
      for (let alm of body) {
        let alm2 = new HIHFinance.OrderReport();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

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
      newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
      this.filteredData = newData;
    }
  }
  
  private loadHeaderString(): void {
    this._tranService.get(this.clnhdrstring).subscribe(x => {
      for(let i = 0; i < this.columns.length; i ++) {
        this.columns[i].label = x[this.clnhdrstring[i]];
      }
    }, error => {
    }, () => {
    });    
  }
}
