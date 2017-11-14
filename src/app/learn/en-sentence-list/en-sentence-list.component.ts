import { Component, OnInit, ViewChild, HostBinding, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, EnSentence, EnSentenceExplain } from '../../model';
import { LearnStorageService } from '../../services';

/**
 * Data source of En. Sentence
 */
export class EnSentenceDataSource extends DataSource<any> {
  constructor(private _storageService: LearnStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<EnSentence[]> {
    const displayDataChanges = [
      this._storageService.listEnSentChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.EnSentences.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-learn-en-sentence-list',
  templateUrl: './en-sentence-list.component.html',
  styleUrls: ['./en-sentence-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EnSentenceListComponent implements OnInit {

  displayedColumns = ['id', 'sent' ];
  dataSource: EnSentenceDataSource | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LearnStorageService,
    private _router: Router) { }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering EnSentenceListComponent ngOnInit...');
    }

    this.dataSource = new EnSentenceDataSource(this._storageService, this.paginator);

    Observable.forkJoin([
      this._storageService.fetchAllEnSentences()
    ]).subscribe((x) => {
      // Just ensure the REQUEST has been sent
      if (x) {

      }
    });
  }

  public onCreateEnSentence() {
    this._router.navigate(['/learn/ensent/create']);
  }

  public onDisplayEnSentence(obj: EnSentence) {
    this._router.navigate(['/learn/ensent/display', obj.ID]);
  }

  public onChangeEnSentence(obj: EnSentence) {
    this._router.navigate(['/learn/ensent/edit', obj.ID]);
  }

  public onDeleteEnSentence(obj: any) {
  }

  public onRefresh(): void {
    this._storageService.fetchAllEnSentences(true);
  }
}
