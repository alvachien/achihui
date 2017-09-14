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
  selector: 'hih-home-def-list',
  templateUrl: './home-def-list.component.html',
  styleUrls: ['./home-def-list.component.scss']
})
export class HomeDefListComponent implements OnInit {

  displayedColumns = ['id', 'name', 'host', 'currency', 'details'];
  dataSource: HomeDefDataSource | null;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(public _homedefService: HomeDefDetailService,
    private _router: Router) { }

  ngOnInit() {
    this.dataSource = new HomeDefDataSource(this._homedefService, this.paginator);
  }

  public onCreateHome() {
    this._router.navigate(['/homedef/create']);
  }

  public onDisplayHome(row: HomeDef) {
    this._router.navigate(['/homedef/display/' + row.ID.toString()])
  }

  public onChooseHome(row: HomeDef) {
    this._homedefService.ChosedHome = row;

    if (this._homedefService.RedirectURL) {
      let url = this._homedefService.RedirectURL;
      this._homedefService.RedirectURL = '';

      this._router.navigate([url]);
    }
  }
}
