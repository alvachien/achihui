import { Component, OnInit, ViewContainerRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams }
  from '@angular/http';
import * as HIHCommon from '../../model/common';
import * as HIHFinance from '../../model/financemodel';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent,
  ITdDataTableColumn, ITdDataTableSelectEvent
} from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UIStatusService } from '../../services/uistatus.service';
import { AuthService } from '../../services/auth.service';
import { TdDialogService } from '@covalent/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  private _apiUrl: string;
  public listData: Array<HIHFinance.Account> = [];

  clnhdrstring: string[] = ["Common.ID", "Common.Category", "Common.Category", "Common.Name", "Common.Comment"];
  columns: ITdDataTableColumn[] = [];
  filteredData: any[];
  filteredTotal: number;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 20;
  sortBy: string = 'Name';
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
    private _authService: AuthService,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _dataTableService: TdDataTableService,
    private _tranService: TranslateService) {
    if (environment.DebugLogging) {
      console.log("Entering constructor of OverviewComponent");
    }

    this._apiUrl = environment.ApiUrl + "/api/financeaccount";
    this.columns = [
      { name: 'Id', label: '#', tooltip: 'ID' },
      { name: 'CategoryId', label: 'Category', tooltip: 'Category ID' },
      { name: 'CategoryName', label: 'Category Name', tooltip: 'Category' },
      { name: 'Name', label: 'Name', tooltip: 'Name' },
      { name: 'Comment', label: 'Comment', tooltip: 'Comment' }
    ];

    this._uistatus.subjCurLanguage.subscribe(x => {
      if (environment.DebugLogging) {
        console.log("Language changed in FinanceAccountList:" + x);
      }
      
      this.loadHeaderString();
    });
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceAccountList");
    }

    //this.loadAccountList();
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
