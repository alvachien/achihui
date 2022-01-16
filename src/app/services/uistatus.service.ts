import { Injectable, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, } from '@angular/forms';

import { QuestionBankItem, TemplateDocLoan, CheckVersionResult, } from '../model';
import { TranslocoService } from '@ngneat/transloco';

@Injectable()
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

  public langChangeEvent: EventEmitter<string> = new EventEmitter<string>(undefined);

  constructor(private _tranService: TranslocoService) {
  }

  /**
   * Generate form group for Questions
   * @param questions Questions
   */
  public generateLearnQuestionFormGroup(questions: QuestionBankItem[]): FormGroup {
    const group: any = {};

    questions.forEach((question: any) => {
      group[question.ID] = question ? new FormControl(question.Question || '', Validators.required)
                                    : new FormControl(question.Question || '');
    });

    return new FormGroup(group);
  }

  private onLanguageChanged(): void {
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
}
