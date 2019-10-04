import { Component, OnInit } from '@angular/core';
import { ReplaySubject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';

import { FinanceStorageService, UIStatusService } from '../../../../services';
import { LogLevel, Account, Document, UIDisplayString, UIDisplayStringUtil,
  OverviewScopeEnum,
  getOverviewScopeRange, UICommonLabelEnum, BaseListModel,
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
  listOfDocs: Document[] = [];
  selectedDocScope: OverviewScopeEnum;
  isReload = false;
  pageIndex = 1;
  pageSize = 10;
  totalDocumentCount = 1;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,) {
      this.isLoadingResults = false;
    }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);
    this.selectedDocScope = OverviewScopeEnum.CurrentMonth;

    this.fetchData();
  }

  fetchData(reset: boolean = false): void {
    if (reset) {
      this.pageIndex = 1;
    }
    this.isLoadingResults = true;
    const { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this.selectedDocScope);
    this._storageService.fetchAllDocuments(bgn, end, this.pageSize, this.pageIndex * this.pageSize)
      .pipe(
        map((revdata: BaseListModel<Document>) => {
          if (revdata) {
            if (revdata.totalCount) {
              this.totalDocumentCount = +revdata.totalCount;
            } else {
              this.totalDocumentCount = 0;
            }

            if (revdata.contentList) {
              return revdata.contentList;
            }
          }

          return [];
        }),
        catchError((error: any) => {
          // popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          //   error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));

          return of([]);
        }),
      ).subscribe((data: any) => {
        this.isLoadingResults = false;
        this.listOfDocs = data;
      });
  }
}
