import { Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject, LearnHistory } from '../../model';
import { LearnStorageService } from '../../services';

/**
 * Data source of Learn history
 */
export class LearnHistoryDataSource extends DataSource<any> {
  constructor(private _storageService: LearnStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<LearnHistory[]> {
    const displayDataChanges = [
      this._storageService.listHistoryChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.Histories.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-learn-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
})
export class HistoryListComponent implements OnInit {

  displayedColumns = ['objid', 'objname', 'usrname', 'learndate'];
  dataSource: LearnHistoryDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LearnStorageService,
    private _router: Router) { }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HistoryListComponent ngOnInit...');
    }

    this.dataSource = new LearnHistoryDataSource(this._storageService, this.paginator);

    Observable.forkJoin([
      this._storageService.fetchAllCategories(),
      this._storageService.fetchAllObjects(),
      this._storageService.fetchAllHistories(),
    ]).subscribe((x) => {
      // Just ensure the REQUEST has been sent
      if (x) {
      }
    });
  }

  public onCreateHistory() {
    this._router.navigate(['/learn/history/create']);
  }

  public onDisplayHistory(hist: LearnHistory) {
    this._router.navigate(['/learn/history/display', hist.generateKey()]);
  }

  public onChangeHistory(hist: LearnHistory) {
    this._router.navigate(['/learn/history/edit', hist.generateKey()]);
  }

  public onDeleteHistory(hist: any) {
  }

  public onRefresh(): void {
    this._storageService.fetchAllHistories(true);
  }
}
