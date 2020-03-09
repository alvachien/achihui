import { Injectable, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, } from '@angular/forms';
import { QuestionBankItem, } from '../model';
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

  public langChangeEvent: EventEmitter<string> = new EventEmitter<string>(undefined);

  constructor(private _tranService: TranslocoService) {
  }

  /**
   * Generate form group for Questions
   * @param questions Questions
   */
  public generateLearnQuestionFormGroup(questions: QuestionBankItem[]): FormGroup {
    let group: any = {};

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
