import { Component, OnInit, ViewChild, HostBinding, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
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
    const displayDataChanges: any[] = [
      this._storageService.listEnSentChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.EnSentences.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-learn-en-sentence-list',
  templateUrl: './en-sentence-list.component.html',
  styleUrls: ['./en-sentence-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EnSentenceListComponent implements OnInit {

  displayedColumns: string[] = ['id', 'sent' ];
  dataSource: EnSentenceDataSource | undefined = undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;

  constructor(public _storageService: LearnStorageService,
    private _router: Router) {
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering EnSentenceListComponent ngOnInit...');
    }

    this.isLoadingResults = true;
    this.dataSource = new EnSentenceDataSource(this._storageService, this.paginator);

    this._storageService.fetchAllEnSentences()
      .subscribe((x: any) => {
        // Just ensure the REQUEST has been sent
        if (x) {
          // Do nothing
        }
      }, (error: any) => {
        // Do nothing
      }, () => {
        this.isLoadingResults = false;
      });
  }

  public onCreateEnSentence(): void {
    this._router.navigate(['/learn/ensent/create']);
  }

  public onDisplayEnSentence(obj: EnSentence): void {
    this._router.navigate(['/learn/ensent/display', obj.ID]);
  }

  public onChangeEnSentence(obj: EnSentence): void {
    this._router.navigate(['/learn/ensent/edit', obj.ID]);
  }

  public onDeleteEnSentence(obj: any): void {
    // Empty
  }

  public onRefresh(): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllEnSentences(true).subscribe((x: any) => {
      // Do nothing
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
