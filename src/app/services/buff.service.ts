import { Injectable } from '@angular/core';
import * as HIHFinance from '../model/financemodel';

@Injectable()
export class BufferService {
  public arrayCurrency: HIHFinance.Currency[] = [];
  public arrayAccountCategory: HIHFinance.AccountCategory[] = [];

  constructor() {
  }

  public bufferCurrencies(arCurr: HIHFinance.Currency[]) {
    this.arrayCurrency = arCurr;
  }
  public resetCurrencies(): void {
    this.arrayCurrency = [];
  }
  public bufferAccountCategories(arAcntCat: HIHFinance.AccountCategory[]) {
    this.arrayAccountCategory = arAcntCat;
  }
  public resetAccountCategories(): void {
    this.arrayAccountCategory = [];
  }
}
