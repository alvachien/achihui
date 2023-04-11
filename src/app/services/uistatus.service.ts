import { Injectable, EventEmitter } from '@angular/core';

import { TemplateDocLoan, CheckVersionResult, ModelUtility, ConsoleLogTypeEnum } from '../model';
import { TranslocoService } from '@ngneat/transloco';
import { Router } from '@angular/router';
import * as moment from 'moment';

export interface DocInsightOption {
  SelectedDataRange: moment.Moment[];
  SelectedAccount?: number;
  TransactionDirection?: boolean;
  TrnasactionType?: number;
  ExcludeTransfer?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UIStatusService {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _currLang: string | null = null;
  get CurrentLanguage(): string | null {
    return this._currLang;
  }
  set CurrentLanguage(cl: string | null) {
    if (cl && cl !== this._currLang) {
      this._currLang = cl;
      this.onLanguageChanged();
      this.langChangeEvent.emit(this._currLang);
    }
  }

  // Last error set
  private _latestError: string | null = null;
  get latestError(): string | null {
    return this._latestError;
  }
  set latestError(le: string | null) {
    this._latestError = le;
  }

  // Version info.
  private _versionInfo: CheckVersionResult | null = null;
  get versionResult(): CheckVersionResult | null {
    return this._versionInfo;
  }
  set versionResult(rst: CheckVersionResult | null) {
    this._versionInfo = rst;
  }

  // Selected loan template
  private _selectedLoanTmp: TemplateDocLoan | null = null;
  get SelectedLoanTmp(): TemplateDocLoan | null {
    return this._selectedLoanTmp;
  }
  set SelectedLoanTmp(tmpdoc: TemplateDocLoan | null) {
    this._selectedLoanTmp = tmpdoc;
  }

  // Fatal error
  private _fatalError = false;
  get fatalError(): boolean {
    return this._fatalError;
  }
  set fatalError(err: boolean) {
    this._fatalError = err;
  }

  // Document list page
  docListDateRange: Date[] = [];

  // Document insight option
  _docInsightOption?: DocInsightOption;
  get docInsightOption(): DocInsightOption | undefined {
    return this._docInsightOption;
  }
  set docInsightOption(option: DocInsightOption | undefined) {
    this._docInsightOption = option;
  }
  // Finance overview option
  _finOverviewExcludeTransfer = false;
  get FinanceOverviewExcludeTransfer(): boolean {
    return this._finOverviewExcludeTransfer;
  }
  set FinanceOverviewExcludeTransfer(exc_tran: boolean) {
    this._finOverviewExcludeTransfer = exc_tran;
  }

  public langChangeEvent: EventEmitter<string> = new EventEmitter<string>(undefined);

  constructor(private _tranService: TranslocoService, private _router: Router) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering UIStatusService constructor...`,
      ConsoleLogTypeEnum.debug
    );
  }

  private onLanguageChanged(): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering UIStatusService onLanguageChanged...`,
      ConsoleLogTypeEnum.debug
    );
    // this._tranService.get(arstrings).subscribe((x: any) => {
    //   for (let attr in x) {
    //     for (let lab of this.arrLabels) {
    //       if (lab.i18nterm === attr) {
    //         lab.displaystring = x[attr];
    //       }
    //     }
    //   }
    // });
  }

  // Navigation: Documents
  displayFinanceDocument(docid: number): void {
    this._router.navigate(['/finance/document/display/', docid]);
  }
  editFinanceDocument(docid: number): void {
    this._router.navigate(['/finance/document/edit/', docid]);
  }
}
