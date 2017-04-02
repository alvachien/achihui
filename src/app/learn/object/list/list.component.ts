import { Component, OnInit }  from '@angular/core';
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
  selector: 'learn-object-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  private _apiUrl: string;
  public listData: Array<HIHLearn.LearnObject> ;
  columns: ITdDataTableColumn[] = [
    { name: 'Id', label: '#', tooltip: 'ID of the Category' },
    { name: 'CategoryName', label: 'Category', tooltip: 'Category' },
    { name: 'Name', label: 'Name', tooltip: 'Name of the category' },
    { name: 'UpdatedAt', label: 'Updated at' },
  ];
  filteredData: any[];
  filteredTotal: number;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 5;
  sortBy: string = 'UpdatedAt';
  selectable: boolean = true;
  selectedRows: any[] = [];
  searchBox = {
    searchVisible: false
  };
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  constructor(private _http: Http,
     private router: Router,
     private activateRoute: ActivatedRoute,
     private uistatus: UIStatusService,
     private _dataTableService: TdDataTableService) {
    this._apiUrl = environment.ApiUrl + "api/learnobject";
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of LearnObjectList");
    }
    this.uistatus.setLearnSubModule("Object List");
    this.loadObjectList();
  }

  loadObjectList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadObjectList of LearnObjectList");
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
      console.log("Entering extractData of LearnObjectList");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHLearn.LearnObject>();
      for (let alm of body.contentList) {
        let alm2 = new HIHLearn.LearnObject();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of LearnObjectList");
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
  
  public onCreateObject() {
    if (environment.DebugLogging) {
      console.log("Entering onCreateObject of LearnObjectList");
    }
    this.router.navigate(['/learn/object/create']);
  }

  public onDisplayObject() {
    if (environment.DebugLogging) {
      console.log("Entering onDisplayObject of LearnObjectList");
    }

    this.router.navigate(['/learn/object/display/' + this.selectedRows[0].Id.toString() ]);
  }

  public onEditObject() {
    if (environment.DebugLogging) {
      console.log("Entering onEditObject of LearnObjectList");
    }

    this.router.navigate(['/learn/object/edit/' + this.selectedRows[0].Id.toString() ]);
  }

  public onDeleteObject() {
    if (environment.DebugLogging) {
      console.log("Entering onDeleteObject of LearnObjectList");
    }

    // Todo
  }
}
