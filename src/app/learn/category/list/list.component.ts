import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams }
  from '@angular/http';
import * as HIHCommon from '../../../model/common';
import * as HIHLearn from '../../../model/learnmodel';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UIStatusService } from '../../../services/uistatus.service';
import { BufferService } from '../../../services/buff.service';

@Component({
  selector: 'learn-category-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  private _apiUrl: string;
  public listData: Array<HIHLearn.LearnCategory> ;
  columns: ITdDataTableColumn[] = [
    { name: 'Id', label: '#', tooltip: 'ID of the Category' },
    { name: 'ParentId', label: 'Parent', tooltip: 'Parent ID' },
    { name: 'Name', label: 'Name', tooltip: 'Name of the category' },
    { name: 'Comment', label: 'Comment' },
    { name: 'SysFlag', label: 'System Flag' },
    { name: 'UpdatedAt', label: 'Updated at' },
  ];
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
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  constructor(private _http: Http,
     private _router: Router,
     private _activateRoute: ActivatedRoute,
     private _uistatus: UIStatusService,
     private _buffService: BufferService,
     private _dataTableService: TdDataTableService) {
    this._apiUrl = environment.ApiUrl + "/api/learncategory";
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of LearnCategoryList");
    }

    this._uistatus.setLearnModule("Learning.LearningCategory");
    this._uistatus.setLearnSubModule("Common.ListView");
    this.loadCategoryList();
  }

  loadCategoryList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadCategoryList of LearnCategoryList");
    }

    this._buffService.getLearnCategories().subscribe(data => {
        if (data instanceof Array) {
          this.listData = data;
          this.filter();
        }          
      },
      error => {
        // It should be handled already
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
    if (this.listData) {
      let newData: any[] = this.listData;
      newData = this._dataTableService.filterData(newData, this.searchTerm, true);
      this.filteredTotal = newData.length;
      newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
      newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
      this.filteredData = newData;
    }
  }
  
  public onCreateCategory():void {
    if (environment.DebugLogging) {
      console.log("Entering onCreateCategory of LearnCategoryList");
    }

    this._router.navigate(['/learn/category/create']);
  }
  public onDisplayCategory():void {
    if (environment.DebugLogging) {
      console.log("Entering onDisplayCategory of LearnCategoryList");
    }

    this._router.navigate(['/learn/category/display/' + this.selectedRows[0].Id.toString()]);
  }
  public onEditCategory():void {
    if (environment.DebugLogging) {
      console.log("Entering onEditCategory of LearnCategoryList");
    }

    this._router.navigate(['/learn/category/edit/' + this.selectedRows[0].Id.toString()]);
  }
  public onDeleteCategory():void {
    if (environment.DebugLogging) {
      console.log("Entering onDeleteCategory of LearnCategoryList");
    }
  }
}
