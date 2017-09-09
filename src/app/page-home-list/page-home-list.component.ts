import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, HomeMember, HomeDefJson, HomeMemberJson } from '../model';
import { HomeDefDetailService } from '../services';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

/**
 * Data source of Home def.
 */
export class HomeDefDataSource extends DataSource<any> {
  constructor(private _homedefService: HomeDefDetailService, 
    private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<HomeDef[]> {
    const displayDataChanges = [
      this._homedefService.listDataChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._homedefService.HomeDefs.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'app-page-home-list',
  templateUrl: './page-home-list.component.html',
  styleUrls: ['./page-home-list.component.scss']
})
export class PageHomeListComponent implements OnInit {
  displayedColumns = ['id', 'name', 'host', 'details'];
  dataSource: HomeDefDataSource | null;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(public _homedefService: HomeDefDetailService,
    private _router: Router) { }

  ngOnInit() {
    this.dataSource = new HomeDefDataSource(this._homedefService, this.paginator);
  }

  public onCreateHome() {
    this._router.navigate(['/homedetail']);    
  }

  public onChooseHome(row: HomeDef) {
    this._homedefService.ChosedHome = row;
  }
}
