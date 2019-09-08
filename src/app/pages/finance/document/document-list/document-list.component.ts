import { Component, OnInit } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FinanceStorageService, UIStatusService } from '../../../../services';
import { LogLevel, Account, Document, UIDisplayString, UIDisplayStringUtil,
  OverviewScopeEnum,
  getOverviewScopeRange, UICommonLabelEnum, Book,
} from '../../../../model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'hih-fin-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.less'],
})
export class DocumentListComponent implements OnInit {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: Document[] = [];

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,) {
      this.isLoadingResults = false;
    }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    forkJoin(this._storageService.fetchAllAccountCategories(), this._storageService.fetchAllAccounts(this.isReload))
      .pipe(takeUntil(this._destroyed$))
      .subscribe((data: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering DocumentListComponent _refreshTree, forkJoin...');
        }

        if (data instanceof Array && data.length > 0) {
          // Parse the data
          this.dataSet = data[1] as Account[];
        }
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error('AC_HIH_UI [Error]: Entering DocumentListComponent _refreshTree, forkJoin, failed...');
        }

        // popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString(), undefined);
      }, () => {
        this.isLoadingResults = false;
      });
  }

}
