import { Injectable, EventEmitter } from '@angular/core';
import { OverviewScopeEnum, OverviewScope, OverviewScopeUIString, 
  QuestionBankType, QuestionBankTypeEnum, QuestionBankTypeUIString,
  TagTypeEnum, TagTypeUIString, TagType } from '../model';

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

  constructor() { 
    this._arrOverviewScopes = OverviewScope.getOverviewScopeStrings();
    this._arrQuestionBankType = QuestionBankType.getQuestionBankTypeStrings();
    this._arrTagType = TagType.getTagTypeStrings();
  }

  public langChangeEvent: EventEmitter<string> = new EventEmitter<string>(null);

  private _currLang: string;
  get CurrentLanguage(): string {
    return this._currLang;
  }
  set CurrentLanguage(cl: string) {
    if (cl && cl !== this._currLang) {
      this._currLang = cl;
      this.langChangeEvent.emit(this._currLang);
    }
  }
}
