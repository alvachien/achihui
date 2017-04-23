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

  clnhdrstring: string[] = ["Finance.Account", "Finance.Incoming", "Finance.Outgoing", "Finance.Balance"];
  columns: ITdDataTableColumn[] = [];
  filteredData: any[];
  filteredTotal: number;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 20;
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  showLegend = true;
  colorScheme = {
    domain: [
      '#5AA454', '#A10A28', '#C7B42C', '#AAAAAA',
      '#D2691E', '#FF7F50', '#6495ED', '#FFF8DC', '#DC143C', '#00FFFF', '#00008B',
      '#F0F8FF', '#FAEBD7', '#00FFFF', '#7FFFD4', '#F0FFFF', '#F5F5DC', '#FFE4C4', // '#000000'
      '#FFEBCD', '#0000FF', '#8A2BE2', '#A52A2A', '#DEB887', '#5F9EA0', '#7FFF00'
      ]
  };
  showLabels = true;
  rstDebit: any[] = [];
  rstCredit: any[] = [];
  rstAssets: any[] = [];
  rstLiabilities: any[] = [];

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

        this.rstDebit = [];
        this.rstCredit = [];
        this.rstAssets = [];
        this.rstLiabilities = [];
        for(let ld of this.listData) {
          if (ld.DebitBalance > 0) {
            this.rstDebit.push({
              name: ld.AccountName,
              value: ld.DebitBalance
            });
          }
          if (ld.CreditBalance > 0) {
            this.rstCredit.push({
              name: ld.AccountName,
              value: ld.CreditBalance
            });
          }

          if (ld.Balance > 0) {
            this.rstAssets.push({
              name: ld.AccountName,
              value: ld.Balance
            });
          } else if(ld.Balance < 0) {
            this.rstLiabilities.push({
              name: ld.AccountName,
              value: ld.Balance * (-1)
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

