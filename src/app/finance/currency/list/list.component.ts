import { Component, OnInit, OnDestroy, ViewContainerRef }  from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams }
  from '@angular/http';
import * as HIHCommon from '../../../model/common';
import * as HIHFinance from '../../../model/financemodel';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UIStatusService } from '../../../services/uistatus.service';
import { BufferService } from '../../../services/buff.service';
import { AuthService } from '../../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { TdDialogService } from '@covalent/core';

@Component({
  selector: 'finance-currency-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  private _apiUrl: string;
  public listData: Array<HIHFinance.Currency> = [];

  clnhdrstring: string[] = ["Finance.Currency", "Common.Name", "Finance.CurrencySymbol", "Finance.LocalCurrency", "Common.SystemFlag"];
  columns: ITdDataTableColumn[];

  filteredData: any[];
  filteredTotal: number;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 10;
  sortBy: string = 'Currency';
  selectable: boolean = true;
  selectedRows: any[] = [];
  searchBox = {
    searchVisible: false
  };
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  constructor(private _http: Http,
     private _router: Router,
     private activateRoute: ActivatedRoute,
     private uistatus: UIStatusService,
     private _dataTableService: TdDataTableService,
     private _tranService: TranslateService,
     private _buffService: BufferService,
     private _authService: AuthService,
     private _viewContainerRef: ViewContainerRef,
     private _dialogService: TdDialogService) {
    this._apiUrl = environment.ApiUrl + "/api/financecurrency";
    this.columns = [
      { name: 'Currency', label: 'Currency', tooltip: 'Currency' },
      { name: 'DisplayName', label: 'Name', tooltip: 'Name' },
      { name: 'Symbol', label: 'Symbol', tooltip: 'Symbol' },
      { name: 'IsLocalCurrency', label: 'Local Currency' },
      { name: 'SysFlag', label: 'System Flag' },
    ];

    // Subscribe for language change
    this._tranService.onDefaultLangChange.subscribe(x => {
      this.loadHeaderString();
    }, error => {
    }, () => {
    });
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceCurrencyList");
    }

    this.loadCurrencyList();
  }

  loadCurrencyList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadCurrencyList of FinanceCurrencyList");
    }

    this._buffService.getCurrencies().subscribe(data => {
        if (data instanceof Array && data.length > 0) {
          let ardisp: string[] = [];
          for(let ci of data) {
            ardisp.push(ci.Name);
          }

          this.listData = data;
          this._tranService.get(ardisp).subscribe(str => {
            for(let ci2 of this.listData) {
              ci2.DisplayName = str[ci2.Name];
            }
          }, error => {
            for(let ci2 of this.listData) {
              ci2.DisplayName = ci2.Name;
            }
          }, () => {
            this.filter();
          });
        }
      },
      error => {
        // It should be handled already
      },
      () => {
        // Finished
      });
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of FinanceCurrencyList");
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
  
  public onCreateCurrency() {
    if (environment.DebugLogging) {
      console.log("Entering onCreateCurrency of FinanceCurrencyList");
    }
    
    this._router.navigate(['/finance/currency/create']);
  }

  public onDisplayCurrency() {
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

    this._router.navigate(['/finance/currency/display/' + this.selectedRows[0].Currency]);
  }

  private loadHeaderString() : void {    
    this._tranService.get(this.clnhdrstring).subscribe(x => {
      for(let i = 0; i < this.columns.length; i++) {
        this.columns[i].label = x[this.clnhdrstring[i]];
      }
    }, error => {
    }, () => {
    });    
  }
}
