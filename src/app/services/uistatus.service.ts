import { Injectable, EventEmitter } from '@angular/core';
import { OverviewScopeEnum, OverviewScope, OverviewScopeUIString } from '../model';

@Injectable()
export class UIStatusService {
  private _arrOverviewScopes: OverviewScopeUIString[] = [];
  get OverviewScopeStrings(): OverviewScopeUIString[] {
    return this._arrOverviewScopes;
  }

  constructor() { 
    this._arrOverviewScopes = OverviewScope.getOverviewScopeStrings();
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
