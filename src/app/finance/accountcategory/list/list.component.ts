import { Component, OnInit }  from '@angular/core';
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
import { TranslateService } from '@ngx-translate/core';
import { TdDialogService } from '@covalent/core';

@Component({
  selector: 'finance-accountcategory-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  private _apiUrl: string;
  public listData: Array<HIHFinance.AccountCategory> = [];

  clnhdrstring: string[] = ["Common.ID", "Common.Name", "Finance.AssetFlag", "Common.Comment", "Common.SystemFlag"];
  columns: ITdDataTableColumn[];
  filteredData: any[];
  filteredTotal: number;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 20;
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
     private _uistatus: UIStatusService,
     private _buffService: BufferService,
     private _dataTableService: TdDataTableService,
     private _tranService: TranslateService) {
    if (environment.DebugLogging) {
      console.log("Entering constructor of FinanceAccountCategoryList");
    }

    this._apiUrl = environment.ApiUrl + "/api/financeaccountcategory";
    this.columns = [
      { name: 'Id', label: '#', tooltip: 'ID' },
      { name: 'Name', label: 'Name', tooltip: 'Name' },
      { name: 'AssetFlag', label: 'Asset Flag', tooltip: 'Asset Flag' },
      { name: 'Comment', label: 'Comment' },
      { name: 'SysFlag', label: 'System Flag' },
    ];

    this._uistatus.subjCurLanguage.subscribe(x => {
      this.loadHeaderString();
    });
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceAccountCategoryList");
    }

    this.loadAccountCategoryList();
  }

  loadAccountCategoryList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadAccountCategoryList of FinanceAccountCategoryList");
    }

    this._buffService.getAccountCategories()
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

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of FinanceAccountCategoryList");
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
  
  public onCreateAccountCategory() {
    if (environment.DebugLogging) {
      console.log("Entering onCreateAccountCategory of FinanceAccountCategoryList");
    }
    this._router.navigate(['/finance/accountcategory/create']);
  }

  public onDisplayAccountCategory() {
    if (environment.DebugLogging) {
      console.log("Entering onDisplayAccountCategory of FinanceAccountCategoryList");
    }
    this._router.navigate(['/finance/accountcategory/display/' + this.selectedRows[0].Currency]);
  }

  private loadHeaderString() : void {
    this._tranService.get(this.clnhdrstring).subscribe(x => {
      for(let i = 0; i < this.columns.length; i ++) {
        this.columns[i].label = x[this.clnhdrstring[i]];
      }
    }, error => {
    }, () => {
    });    
  }
}
