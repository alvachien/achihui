import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';

import { AppLanguage, ModelUtility, ConsoleLogTypeEnum } from '../../model';
import { LanguageOdataService } from '../../services';

@Component({
  selector: 'hih-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.less'],
})
export class LanguageComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  public dataSource: AppLanguage[] = [];
  isLoadingResults: boolean;

  constructor(
    public odataService: LanguageOdataService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LanguageComponent constructor...`,
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LanguageComponent OnInit...`,
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService.fetchAllLanguages()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (x: AppLanguage[]) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LanguageComponent OnInit fetchAllLanguages...`,
            ConsoleLogTypeEnum.debug);
  
          this.dataSource = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering LanguageComponent OnInit fetchAllLanguages, failed ${error}...`,
            ConsoleLogTypeEnum.error);
  
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true
          });
        }
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LanguageComponent ngOnDestroy...`,
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
