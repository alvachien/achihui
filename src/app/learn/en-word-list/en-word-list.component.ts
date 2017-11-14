import { Component, OnInit, ViewChild, HostBinding, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, EnWord, EnWordExplain } from '../../model';
import { LearnStorageService } from '../../services';

/**
 * Data source of en Word
 */
export class EnWordDataSource extends DataSource<any> {
  constructor(private _storageService: LearnStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<EnWord[]> {
    const displayDataChanges = [
      this._storageService.listEnWordChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.EnWords.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-learn-en-word-list',
  templateUrl: './en-word-list.component.html',
  styleUrls: ['./en-word-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EnWordListComponent implements OnInit {

  displayedColumns = ['id', 'word' ];
  dataSource: EnWordDataSource | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LearnStorageService,
    private _router: Router) { }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering EnWordListComponent ngOnInit...');
    }

    this.dataSource = new EnWordDataSource(this._storageService, this.paginator);

    Observable.forkJoin([
      this._storageService.fetchAllEnWords()
    ]).subscribe((x) => {
      // Just ensure the REQUEST has been sent
      if (x) {

      }
    });
  }

  public onCreateEnWord() {
    this._router.navigate(['/learn/enword/create']);
  }

  public onDisplayEnWord(obj: EnWord) {
    this._router.navigate(['/learn/enword/display', obj.ID]);
  }

  public onChangeEnWord(obj: EnWord) {
    this._router.navigate(['/learn/enword/edit', obj.ID]);
  }

  public onDeleteEnWord(obj: any) {
  }

  public onRefresh(): void {
    this._storageService.fetchAllEnWords(true);
  }
}
