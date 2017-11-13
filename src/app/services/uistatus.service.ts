import { Injectable, EventEmitter } from '@angular/core';
import { OverviewScopeEnum, QuestionBankTypeEnum, TagTypeEnum, UICommonLabelEnum, 
  UIDisplayString, UIDisplayStringUtil } from '../model';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class UIStatusService {
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

  public arrLabels: UIDisplayString[] = [];

  constructor(private _tranService: TranslateService) { 
    this._arrOverviewScopes = UIDisplayStringUtil.getOverviewScopeStrings();
    this._arrQuestionBankType = UIDisplayStringUtil.getQuestionBankTypeStrings();
    this._arrTagType = UIDisplayStringUtil.getTagTypeStrings();
    this._arrRepayMethod = UIDisplayStringUtil.getRepaymentMethodStrings();
    this._arrEnPOS = UIDisplayStringUtil.getEnPOSStrings();

    this.arrLabels = UIDisplayStringUtil.getUICommonLabelStrings();
  }

  public langChangeEvent: EventEmitter<string> = new EventEmitter<string>(null);

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

  private onLanguageChanged() {
    let arstrings: string[] = [];
    for(let lab of this.arrLabels) {
      arstrings.push(lab.i18nterm);
    }

    this._tranService.get(arstrings).subscribe(x => {
      for(let attr in x) {
        for(let lab of this.arrLabels) {
          if (lab.i18nterm === attr) {
            lab.displaystring = x[attr];
          }
        }
      }
    });
  }

  public getUILabel(le: UICommonLabelEnum): string {
    for(let lab of this.arrLabels) {
      if (lab.value === le) {
        return lab.displaystring;
      }
    }

    return '';
  }
}
