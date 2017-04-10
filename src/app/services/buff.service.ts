import { Injectable } from '@angular/core';
import * as HIHFinance from '../model/financemodel';
import * as HIHUser from '../model/userinfo';

@Injectable()
export class BufferService {
  public arrayCurrency: HIHFinance.Currency[] = [];
  public isCurrencyBufferred: boolean;
  public arrayAccountCategory: HIHFinance.AccountCategory[] = [];
  public arrayDocumentType: HIHFinance.DocumentType[] = [];
  public arrayUser: Array<HIHUser.UserDetail> = [];
  public isUserBufferred: boolean;

  constructor() {
    this.isCurrencyBufferred = false;
    this.isUserBufferred = false;
  }

  public bufferCurrencies(arCurr: HIHFinance.Currency[]) {
    this.arrayCurrency = arCurr;
    this.isUserBufferred = true;
  }
  public resetCurrencies(): void {
    this.arrayCurrency = [];
    this.isUserBufferred = false;
  }
  public bufferAccountCategories(arAcntCat: HIHFinance.AccountCategory[]) {
    this.arrayAccountCategory = arAcntCat;
  }
  public resetAccountCategories(): void {
    this.arrayAccountCategory = [];
  }
  public bufferUser(arUser: HIHUser.UserDetail[]) {
    this.arrayUser = arUser;
    this.isUserBufferred = true;
  }
  public resetUser(): void {
    this.arrayUser = [];
    this.isUserBufferred = false;
  }
}
