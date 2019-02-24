import { Injectable, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, } from '@angular/forms';
import { OverviewScopeEnum, QuestionBankTypeEnum, TagTypeEnum, UICommonLabelEnum,
  UIDisplayString, UIDisplayStringUtil, TemplateDocLoan, QuestionBase, } from '../model';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class UIStatusService {
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

  private _arrOverviewScopes: UIDisplayString[] = [];
  get OverviewScopeStrings(): UIDisplayString[] {
    return this._arrOverviewScopes;
  }

  private _arrQuestionBankType: UIDisplayString[] = [];
  get QuestionBankTypeStrings(): UIDisplayString[] {
    return this._arrQuestionBankType;
  }

  private _arrTagType: UIDisplayString[] = [];
  get TagTypeStrings(): UIDisplayString[] {
    return this._arrTagType;
  }

  private _arrRepayMethod: UIDisplayString[] = [];
  get RepaymentMethods(): UIDisplayString[] {
    return this._arrRepayMethod;
  }

  private _arrEnPOS: UIDisplayString[] = [];
  get EnPOSStrings(): UIDisplayString[] {
    return this._arrEnPOS;
  }

  private _arrTranTypeLevel: UIDisplayString[] = [];
  get TranTypeLevelStrings(): UIDisplayString[] {
    return  this._arrTranTypeLevel;
  }

  private _latestError: string;
  get latestError(): string {
    return this._latestError;
  }
  set latestError(le: string) {
    this._latestError = le;
  }

  private _docTempLoan: TemplateDocLoan;
  get currentTemplateLoanDoc(): TemplateDocLoan {
    return this._docTempLoan;
  }
  set currentTemplateLoanDoc(doc: TemplateDocLoan) {
    this._docTempLoan = doc;
  }

  public arrLabels: UIDisplayString[] = [];
  public langChangeEvent: EventEmitter<string> = new EventEmitter<string>(undefined);

  constructor(private _tranService: TranslateService) {
    this._arrOverviewScopes = UIDisplayStringUtil.getOverviewScopeStrings();
    this._arrQuestionBankType = UIDisplayStringUtil.getQuestionBankTypeStrings();
    this._arrTagType = UIDisplayStringUtil.getTagTypeStrings();
    this._arrRepayMethod = UIDisplayStringUtil.getRepaymentMethodStrings();
    this._arrEnPOS = UIDisplayStringUtil.getEnPOSStrings();
    this._arrTranTypeLevel = UIDisplayStringUtil.getTranTypeLevelDisplayStrings();

    this.arrLabels = UIDisplayStringUtil.getUICommonLabelStrings();
  }

  public getUILabel(le: UICommonLabelEnum): string {
    for (let lab of this.arrLabels) {
      if (lab.value === le) {
        return lab.displaystring ? lab.displaystring : lab.i18nterm;
      }
    }

    return '';
  }

  /**
   * Generate form group for Questions
   * @param questions Questions
   */
  public generateLearnQuestionFormGroup(questions: QuestionBase<any>[]): FormGroup {
    let group: any = {};

    questions.forEach((question: any) => {
      group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
                                              : new FormControl(question.value || '');
    });

    return new FormGroup(group);
  }

  private onLanguageChanged(): void {
    let arstrings: string[] = [];
    for (let lab of this.arrLabels) {
      arstrings.push(lab.i18nterm);
    }

    this._tranService.get(arstrings).subscribe((x: any) => {
      for (let attr in x) {
        for (let lab of this.arrLabels) {
          if (lab.i18nterm === attr) {
            lab.displaystring = x[attr];
          }
        }
      }
    });
  }
}
