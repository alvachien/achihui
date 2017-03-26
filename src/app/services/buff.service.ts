import { Injectable } from '@angular/core';
import * as HIHFinance from '../model/financemodel';

@Injectable()
export class BufferService {
  public arrayCurrency: HIHFinance.Currency[] = [];

  constructor() {
  }

  public bufferCurrencies(arCurr: HIHFinance.Currency[]) {
    this.arrayCurrency = arCurr;
  }
  public resetCurrencies() {
    this.arrayCurrency = [];
  }
}
