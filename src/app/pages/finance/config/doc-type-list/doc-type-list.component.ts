import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LogLevel, DocumentType } from '../../../../model';
import { FinanceStorageService, UIStatusService, } from '../../../../services';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-finance-doc-type-list',
  templateUrl: './doc-type-list.component.html',
  styleUrls: ['./doc-type-list.component.less'],
})
export class DocTypeListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: DocumentType[];

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,) {
      this.isLoadingResults = false;
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug('AC_HIH_UI [Debug]: Entering DocTypeListComponent constructor...');
      }
    }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this._storageService.fetchAllDocTypes()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: DocumentType[]) => {
        this.dataSet = x;
    }, (error: any) => {
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngOnDestroy() {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
