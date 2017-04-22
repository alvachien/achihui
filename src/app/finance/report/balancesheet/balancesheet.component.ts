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
  selector: 'finance-report-balancesheet',
  templateUrl: './balancesheet.component.html',
  styleUrls: ['./balancesheet.component.scss']
})
export class BalanceSheetComponent implements OnInit {
  private _apiUrl: string;
  public listData: Array<HIHFinance.BalanceSheetReport> = [];

  clnhdrstring: string[] = ["Finance.Account", "Finance.Debit", "Finance.Credit", "Finance.Balance"];
  columns: ITdDataTableColumn[] = [];
  filteredData: any[];
  filteredTotal: number;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 10;
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

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
    this._apiUrl = environment.ApiUrl + "/api/financereportbs";
    this.columns = [
      { name: 'AccountName', label: 'Account', tooltip: 'Account' },
      { name: 'DebitBalance', label: 'Debit', tooltip: 'Debit', numeric: true, format: v => v.toFixed(2) },
      { name: 'CreditBalance', label: 'Credit', tooltip: 'Credit', numeric: true, format: v => v.toFixed(2) },
      { name: 'Balance', label: 'Balance', tooltip: 'Balance', numeric: true, format: v => v.toFixed(2) }
    ];

    this._uistatus.subjCurLanguage.subscribe(x => {
      if (environment.DebugLogging) {
        console.log("Language changed in BalanceSheetComponent:" + x);
      }
      
      this.loadHeaderString();
    });
  }

  ngOnInit() {
    this.loadBalanceSheet();
  }

  loadBalanceSheet(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadBalanceSheet of BalanceSheetComponent");
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
      console.log("Entering extractData of BalanceSheetComponent");
    }

    let body = res.json();
    if (body && body instanceof Array) {
      let sets = new Array<HIHFinance.BalanceSheetReport>();
      for (let alm of body) {
        let alm2 = new HIHFinance.BalanceSheetReport();
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

