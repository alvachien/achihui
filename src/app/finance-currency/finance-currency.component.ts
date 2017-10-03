import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../environments/environment';
import { LogLevel, Currency } from '../model';
import { FinCurrencyService } from '../services';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

/**
 * Data source of Currency
 */
export class CurrencyDataSource extends DataSource<any> {
  constructor(private _currService: FinCurrencyService,
    private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Currency[]> {
    const displayDataChanges = [
      this._currService.listDataChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._currService.Currencies.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-finance-currency',
  templateUrl: './finance-currency.component.html',
  styleUrls: ['./finance-currency.component.scss'],
})
export class FinanceCurrencyComponent implements OnInit {

  displayedColumns = ['curr', 'name', 'symbol'];
  dataSource: CurrencyDataSource | null;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(public _currService: FinCurrencyService,
    private _router: Router) {
    this._currService.fetchAllCurrencies().subscribe((x) => {
    });
  }

  ngOnInit() {
    this.dataSource = new CurrencyDataSource(this._currService, this.paginator);
  }
}
