import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../environments/environment';
import { LogLevel, AppLanguage } from '../model';
import { LanguageService } from '../services';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

/**
 * Data source of Language
 */
export class LanguageDataSource extends DataSource<any> {
  constructor(private _storageService: LanguageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<AppLanguage[]> {
    const displayDataChanges = [
      this._storageService.listDataChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.Languages.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
})
export class LanguageComponent implements OnInit {

  displayedColumns = ['lcid', 'isoname', 'enname', 'nvname', 'appflag'];
  dataSource: LanguageDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LanguageService) {
  }

  ngOnInit() {
    this.dataSource = new LanguageDataSource(this._storageService, this.paginator);

    this._storageService.fetchAllLanguages();
  }
}
