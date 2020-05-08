import { Injectable, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, } from '@angular/forms';

import { QuestionBankItem, TemplateDocLoan, CheckVersionResult, } from '../model';
import { TranslocoService } from '@ngneat/transloco';

@Injectable()
export class UIStatusService {
  // tslint:disable:variable-name
  private _currLang: string;
  get CurrentLanguage(): string {
    return this._currLang;
  }
  set CurrentLanguage(cl: string) {
    if (cl && cl !== this._currLang) {
      this._currLang = cl;
      this.onLanguageChanged();
      this.langChangeEvent.emit(this._currLang);
    }
  }

  private _latestError: string;
  get latestError(): string {
    return this._latestError;
  }
  set latestError(le: string) {
    this._latestError = le;
  }

  private _versionInfo: CheckVersionResult;
  get versionResult(): CheckVersionResult {
    return this._versionInfo;
  }
  set versionResult(rst: CheckVersionResult) {
    this._versionInfo = rst;
  }

  private _selectedLoanTmp: TemplateDocLoan = null;
  get SelectedLoanTmp(): TemplateDocLoan {
    return this._selectedLoanTmp;
  }
  set SelectedLoanTmp(tmpdoc: TemplateDocLoan | null) {
    this._selectedLoanTmp = tmpdoc;
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
