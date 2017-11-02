import { Injectable, EventEmitter } from '@angular/core';
import { OverviewScopeEnum, OverviewScope, OverviewScopeUIString, 
  QuestionBankType, QuestionBankTypeEnum, QuestionBankTypeUIString,
  TagTypeEnum, TagTypeUIString, TagType, UICommonLabelEnum, UICommonLabelUIString, UICommonLabel } from '../model';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class UIStatusService {
  private _arrOverviewScopes: OverviewScopeUIString[] = [];
  get OverviewScopeStrings(): OverviewScopeUIString[] {
    return this._arrOverviewScopes;
  }

  private _arrQuestionBankType: QuestionBankTypeUIString[] = [];
  get QuestionBankTypeStrings(): QuestionBankTypeUIString[] {
    return this._arrQuestionBankType;
  }

  private _arrTagType: TagTypeUIString[] = [];
  get TagTypeStrings(): TagTypeUIString[] {
    return this._arrTagType;
  }

  public arrLabels: UICommonLabelUIString[] = [];

  constructor(private _tranService: TranslateService) { 
    this._arrOverviewScopes = OverviewScope.getOverviewScopeStrings();
    this._arrQuestionBankType = QuestionBankType.getQuestionBankTypeStrings();
    this._arrTagType = TagType.getTagTypeStrings();

    this.arrLabels = UICommonLabel.getUICommonLabelStrings();
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
