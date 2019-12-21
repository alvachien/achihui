import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { LogLevel, Account, Document, UIDisplayString, UIDisplayStringUtil,
  OverviewScopeEnum,
  getOverviewScopeRange, UICommonLabelEnum, BaseListModel, ModelUtility, ConsoleLogTypeEnum,
} from '../../../../model';

@Component({
  selector: 'hih-fin-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.less'],
})
export class DocumentListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  listOfDocs: Document[] = [];
  selectedDocScope: OverviewScopeEnum;
  isReload = false;
  pageIndex = 1;
  pageSize = 10;
  totalDocumentCount = 1;
  mapOfExpandData: { [key: string]: boolean } = {};
  
  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,) {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent constructor...', ConsoleLogTypeEnum.debug);
      this.isLoadingResults = false;
    }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent OnInit...', ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this.selectedDocScope = OverviewScopeEnum.All;

    this.fetchData();
  }

  ngOnDestroy() {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  fetchData(reset: boolean = false): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent fetchData...', ConsoleLogTypeEnum.debug);
    if (reset) {
      this.pageIndex = 1;
    }
    this.isLoadingResults = true;
    const { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this.selectedDocScope);
    this.odataService.fetchAllDocuments(bgn, end, this.pageSize, this.pageIndex * this.pageSize)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((revdata: BaseListModel<Document>) => {
        if (revdata) {
          if (revdata.totalCount) {
            this.totalDocumentCount = +revdata.totalCount;
          } else {
            this.totalDocumentCount = 0;
          }

          this.listOfDocs = revdata.contentList;
        } else {
          this.totalDocumentCount = 0;
          this.listOfDocs = [];
        }        
      }, (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentListComponent fetchData, fetchAllDocuments failed ${error}...`,
          ConsoleLogTypeEnum.error);

        // TBD.
      }, () => {
        this.isLoadingResults = false;
      });
  }
}
