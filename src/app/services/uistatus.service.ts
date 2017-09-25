import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class UIStatusService {

  constructor() { }

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
