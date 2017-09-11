import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, ControlCenter } from '../../model';
import { FinanceStorageService } from '../../services';

/**
 * Data source of Control center
 */
export class ControlCenterDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ControlCenter[]> {
    const displayDataChanges = [
      this._storageService.listControlCenterChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.ControlCenters.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'app-control-center-list',
  templateUrl: './control-center-list.component.html',
  styleUrls: ['./control-center-list.component.scss'],
})
export class ControlCenterListComponent implements OnInit {

  displayedColumns = ['id', 'name', 'comment'];
  dataSource: ControlCenterDataSource | null;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router) { }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit...');
    }

    this.dataSource = new ControlCenterDataSource(this._storageService, this.paginator);

    this._storageService.fetchAllControlCenters();
  }

  public onCreateCC() {
    this._router.navigate(['/finance/controlcenter/create']);
  }

  public onDisplayCC(acnt: ControlCenter) {
    this._router.navigate(['/finance/controlcenter/display', acnt.Id]);
  }

  public onChangeCC(acnt: ControlCenter) {
    this._router.navigate(['/finance/controlcenter/edit', acnt.Id]);
  }

  public onDeleteCC(acnt: any) {

  }
}
