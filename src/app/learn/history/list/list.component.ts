import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import * as HIHCommon from '../../../model/common';
import * as HIHLearn from '../../../model/learnmodel';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UIStatusService } from '../../../services/uistatus.service';

@Component({
  selector: 'learn-history-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  private _apiUrl: string;
  public listData: Array<HIHLearn.LearnHistory>;
  columns: ITdDataTableColumn[] = [
    { name: 'UserId', label: 'User', tooltip: 'User ID' },
    { name: 'UserDisplayAs', label: 'Display As', tooltip: 'Display As' },
    { name: 'ObjectId', label: 'Object Id', tooltip: 'Object ID' },
    { name: 'ObjectName', label: 'Object Name', tooltip: 'Object Name' },
    { name: 'LearnDateString', label: 'Date', tooltip: 'Learn Date' },
    { name: 'UpdatedAt', label: 'Updated at' },
  ];
  filteredData: any[];
  filteredTotal: number;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 10;
  sortBy: string = 'UpdatedAt';
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
    private _zone: NgZone,
    private _dataTableService: TdDataTableService) {
    if (environment.DebugLogging) {
      console.log("Entering constructor of LearnHistoryList");
    }

    this._apiUrl = environment.ApiUrl + "api/learnhistory";
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of LearnHistoryList");
    }

    this._uistatus.setLearnSubModule("History List");
    this.loadHistoryList();
  }

  loadHistoryList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadHistoryList of LearnHistoryList");
    }

    var headers = new Headers();
    this._http.get(this._apiUrl, { headers: headers })
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this.listData = data;
          this.filter();
        }
      },
      error => {
        // It should be handled already
      });
  }

  private extractData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractData of LearnHistoryList");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHLearn.LearnHistory>();
      for (let alm of body.contentList) {
        let alm2 = new HIHLearn.LearnHistory();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of LearnHistoryList");
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

  public onCreateHistory(): void {
    if (environment.DebugLogging) {
      console.log("Entering onCreateHistory of LearnHistoryList");
    }

    this._router.navigate(['/learn/history/create']);
  }
  public onDisplayHistory(): void {
    if (environment.DebugLogging) {
      console.log("Entering onDisplayHistory of LearnHistoryList");
    }

    this._router.navigate(['/learn/history/display/' + this.selectedRows[0].generateKey()]);
  }
  public onEditHistory(): void {
    if (environment.DebugLogging) {
      console.log("Entering onEditHistory of LearnHistoryList");
    }

    this._router.navigate(['/learn/history/edit/' + this.selectedRows[0].generateKey()]);
  }
  public onDeleteHistory(): void {
    if (environment.DebugLogging) {
      console.log("Entering onDeleteHistory of LearnHistoryList");
    }
  }
}
