import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, TranType, TranTypeLevelEnum, UIDisplayStringUtil } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';

// !!! Second option !!!
// /**
//  * Data access object for Tran. Type List
//  */
// export class TranTypeListDao {
//   constructor(private _storageService: FinanceStorageService) {    
//   }
  
//   getTranTypeList(): Observable<TranType[]> {
//     // const href = 'https://api.github.com/search/issues';
//     // const requestUrl =
//     //     `${href}?q=repo:angular/material2&sort=${sort}&order=${order}&page=${page + 1}`;

//     // return this.http.get<GithubApi>(requestUrl);
//     return this._storageService.fetchAllTranTypes();
//   }
// }
// !!! Second option !!!

// !!! First option !!!
// /**
//  * Data source of Tran. type
//  */
// export class TranTypeDataSource extends DataSource<any> {
//   constructor(private _storageService: FinanceStorageService,
//     private _paginator: MatPaginator) {
//     super();
//   }

//   /** Connect function called by the table to retrieve one stream containing the data to render. */
//   connect(): Observable<TranType[]> {
//     const displayDataChanges = [
//       this._storageService.listTranTypeChange,
//       this._paginator.page,
//     ];

//     return Observable.merge(...displayDataChanges).map(() => {
//       const data = this._storageService.TranTypes.slice();

//       // Grab the page's slice of data.
//       const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
//       return data.splice(startIndex, this._paginator.pageSize);
//     });
//   }

//   disconnect() { }
// }
// !!! First option !!!

@Component({
  selector: 'hih-finance-tran-type-list',
  templateUrl: './tran-type-list.component.html',
  styleUrls: ['./tran-type-list.component.scss'],
})
export class TranTypeListComponent implements OnInit, AfterViewInit {

  displayedColumns = ['id', 'name', 'expflag', 'fulldisplay', 'hierlvl', 'parent', 'comment'];
  // !!! Second option !!!
  //ttDatabase: TranTypeListDao | null;
  //dataSource = new MatTableDataSource();
  // resultsLength = 0;
  // isLoadingResults = false;
  // !!! Second option !!!

  // !!! First option !!!
  //dataSource = new TranTypeDataSource();
  // !!! First option !!!

  dataSource: MatTableDataSource<TranType> = new MatTableDataSource<TranType>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    private _router: Router) { }

  ngOnInit() {
    // !!! First option !!!
    // this.dataSource = new TranTypeDataSource(this._storageService, this.paginator);

    // this._storageService.fetchAllTranTypes().subscribe((x) => {
    //   // Just ensure the REQUEST has been sent
    // });
    // !!! First option !!!

    this._storageService.fetchAllTranTypes().subscribe((x) => {
      this.dataSource.data = x;
    });    
  }

  ngAfterViewInit() {
    // !!! Second option !!!
    // this.ttDatabase = new TranTypeListDao(this._storageService);
    // // If the user changes the sort order, reset back to the first page.
    // this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // merge(this.sort.sortChange, this.paginator.page)
    //   .pipe(
    //     startWith({}),
    //     switchMap(() => {
    //       this.isLoadingResults = true;
    //       return this.ttDatabase!.getTranTypeList();
    //     }),
    //     map(data => {
    //       // Flip flag to show that loading has finished.
    //       this.isLoadingResults = false;
    //       this.resultsLength = data.length;

    //       return data;
    //     }),
    //     catchError(() => {
    //       this.isLoadingResults = false;
    //       return observableOf([]);
    //     })
    //   ).subscribe(data => this.dataSource.data = data);
    // !!! Second option !!!

    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }  

  getTranTypeLevelString(trantype: TranTypeLevelEnum): string {
    return UIDisplayStringUtil.getTranTypeLevelDisplayString(trantype);
  } 
}
