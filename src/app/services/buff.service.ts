import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import * as HIHFinance from '../model/financemodel';
import * as HIHLearn from '../model/learnmodel';
import * as HIHUser from '../model/userinfo';
import * as HIHUI from '../model/uimodel';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class BufferService {
  // Currency
  public arrayCurrency: HIHFinance.Currency[] = [];
  private _isCurrencyBufferred: boolean;
  // Finance account category
  public arrayAccountCategory: HIHFinance.AccountCategory[] = [];
  private _isAccountCategoryBufferred: boolean;
  // Finance document type
  public arrayDocumentType: HIHFinance.DocumentType[] = [];
  private _isDocumentTypeBufferred: boolean;
  // Finance transaction type
  public arrayTransactionType: HIHFinance.TranType[] = [];
  private _isTransactionTypeBufferred: boolean;
  // Finance setting
  public arrayFinanceSetting: HIHFinance.Setting[] = [];
  private _isFinanceSettingBufferred: boolean;
  // User
  public arrayUser: Array<HIHUser.UserDetail> = [];
  private _isUserBufferred: boolean;
  // Learn category
  public arrayLearnCategory: Array<HIHLearn.LearnCategory> = [];
  private _isLearnCategoryBufferred: boolean;
  // Frequency type
  public arrayUIRepeatFrequency: Array<HIHUI.UIRepeatFrequency> = [];
  private _isUIRepeatFrequencyBufferred: boolean;

  constructor(
    private _http: Http,
    private _tranService: TranslateService,
    private _authService: AuthService
  ) {
    this._isCurrencyBufferred = false;
    this._isUserBufferred = false;
    this._isAccountCategoryBufferred = false;
    this._isDocumentTypeBufferred = false;
    this._isTransactionTypeBufferred = false;
    this._isFinanceSettingBufferred = false;
    this._isLearnCategoryBufferred = false;
    this._isUIRepeatFrequencyBufferred = false;
  }

  // Repeat frequency
  public bufferRepeatFrequencies(arFrq?: HIHUI.UIRepeatFrequency[]): Observable<HIHUI.UIRepeatFrequency[]> | void  {
    if (environment.DebugLogging) {
      console.log("Entering bufferRepeatFrequencies of BufferService");
    }

    if (arFrq && arFrq instanceof Array) {
      this.arrayUIRepeatFrequency = arFrq;
      this._isUIRepeatFrequencyBufferred = true;

      // Return nothing!
    } else {
      return this.getRepeatFrequencies();
    }
  }
  public getRepeatFrequencies() : Observable<HIHUI.UIRepeatFrequency[]> {
    if (environment.DebugLogging) {
      console.log("Entering getRepeatFrequencies of BufferService");
    }

    if (this._isUIRepeatFrequencyBufferred) {
      return Observable.of(this.arrayUIRepeatFrequency);
    } else {
      this.arrayUIRepeatFrequency = HIHUI.UIRepeatFrequency.getRepeatFrequencies();
      let strar: string[] = [];
      for(let rf of this.arrayUIRepeatFrequency) {
        strar.push(rf.DisplayString);
      }

      return this._tranService.get(strar)
        .map(data => this.internalBufferFrequency(data, this));
    }
  }
  public resetRepeatFrequencies(): void {
    this.arrayUIRepeatFrequency = [];
    this._isUIRepeatFrequencyBufferred = false;
  }
  get isRepeatFrequencyBufferred(): boolean {
    return this._isUIRepeatFrequencyBufferred;
  }
  set isRepeatFrequencyBufferred(buf: boolean) {
    this._isUIRepeatFrequencyBufferred = buf;
  }

  // Currency
  public bufferCurrencies(arCurr?: HIHFinance.Currency[]): Observable<HIHFinance.Currency[]> | void  {
    if (environment.DebugLogging) {
      console.log("Entering bufferCurrencies of BufferService");
    }

    if (arCurr && arCurr instanceof Array) {
      this.arrayCurrency = arCurr;
      this._isCurrencyBufferred = true;

      // Return nothing!
    } else {
      return this.getCurrencies();
    }
  }
  public getCurrencies() : Observable<HIHFinance.Currency[]> {
    if (environment.DebugLogging) {
      console.log("Entering getCurrencies of BufferService");
    }

    if (this._isCurrencyBufferred) {
      return Observable.of(this.arrayCurrency);
    } else {
      let headers = new Headers();
      headers.append('Accept', 'application/json');
      if (this._authService.authSubject.getValue().isAuthorized)
        headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
      let strApi = environment.ApiUrl + "/api/financecurrency";

      return this._http.get(strApi, { headers: headers })
        .map(res => this.internalBufferCurrencyData(res, this));
    }
  }
  public resetCurrencies(): void {
    this.arrayCurrency = [];
    this._isCurrencyBufferred = false;
  }
  get isCurrencyBufferred(): boolean {
    return this._isCurrencyBufferred;
  }
  set isCurrencyBufferred(buf: boolean) {
    this._isCurrencyBufferred = buf;
  }

  // Account category
  public bufferAccountCategories(arAcntCat: HIHFinance.AccountCategory[]): Observable<HIHFinance.AccountCategory[]> | void {
    if (environment.DebugLogging) {
      console.log("Entering bufferAccountCategories of BufferService");
    }

    if (arAcntCat && arAcntCat instanceof Array) {
      this.arrayAccountCategory = arAcntCat;
      this._isAccountCategoryBufferred = true;

      // Return nothing!
    } else {
      return this.getAccountCategories();
    }
  }
  public getAccountCategories(): Observable<HIHFinance.AccountCategory[]> {
    if (environment.DebugLogging) {
      console.log("Entering getAccountCategories of BufferService");
    }

    if (this._isAccountCategoryBufferred) {
      return Observable.of(this.arrayAccountCategory);
    } else {
      let headers = new Headers();
      headers.append('Accept', 'application/json');
      if (this._authService.authSubject.getValue().isAuthorized)
        headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
      let strApi = environment.ApiUrl + "/api/financeaccountcategory";

      return this._http.get(strApi, { headers: headers })
        .map(res => this.internalBufferAccountCategoryData(res, this));
    }    
  }
  public resetAccountCategories(): void {
    this.arrayAccountCategory = [];
    this._isAccountCategoryBufferred = false;
  }
  get isAccountCategoryBufferred(): boolean {
    return this._isAccountCategoryBufferred;
  }
  set isAccountCategoryBufferred(buf: boolean) {
    this._isAccountCategoryBufferred = buf;
  }

  // Document type  
  public bufferDocumentTypes(arDocType?: HIHFinance.DocumentType[]): Observable<HIHFinance.DocumentType[]> | void {
    if (environment.DebugLogging) {
      console.log("Entering bufferDocumentTypes of BufferService");
    }

    if (arDocType && arDocType instanceof Array) {
      this.arrayDocumentType = arDocType;
      this._isDocumentTypeBufferred = true;

      // Return nothing!
    } else {
      return this.getDocumentTypes();
    }
  }
  public getDocumentTypes() : Observable<HIHFinance.DocumentType[]> {
    if (environment.DebugLogging) {
      console.log("Entering getDocumentTypes of BufferService");
    }

    if (this._isDocumentTypeBufferred) {
      return Observable.of(this.arrayDocumentType);
    } else {
      let headers = new Headers();
      headers.append('Accept', 'application/json');
      if (this._authService.authSubject.getValue().isAuthorized)
        headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
      let strApi = environment.ApiUrl + "/api/financedoctype";

      return this._http.get(strApi, { headers: headers })
        .map(res => this.internalBufferDocTypeData(res, this));
    }
  }
  public resetDocumentTypes(): void {
    this.arrayDocumentType = [];
    this._isDocumentTypeBufferred = false;
  }
  get isDocumentTypeBufferred(): boolean {
    return this._isDocumentTypeBufferred;
  }
  set isDocumentTypeBufferred(buf: boolean) {
    this._isDocumentTypeBufferred = buf;
  }

  // Transaction type
  public bufferTransactionTypes(arTranType?: HIHFinance.TranType[]): Observable<HIHFinance.TranType[]> | void {
    if (environment.DebugLogging) {
      console.log("Entering bufferTransactionTypes of BufferService");
    }

    if (arTranType && arTranType instanceof Array) {
      this.arrayTransactionType = arTranType;
      this._isTransactionTypeBufferred = true;

      // Return nothing!
    } else {
      return this.getTransactionTypes();
    }
  }
  public getTransactionTypes() : Observable<HIHFinance.TranType[]> {
    if (environment.DebugLogging) {
      console.log("Entering getTransactionTypes of BufferService");
    }

    if (this._isTransactionTypeBufferred) {
      return Observable.of(this.arrayTransactionType);
    } else {
      let headers = new Headers();
      headers.append('Accept', 'application/json');
      if (this._authService.authSubject.getValue().isAuthorized)
        headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
      let strApi = environment.ApiUrl + "/api/financetrantype";

      return this._http.get(strApi, { headers: headers })
        .map(res => this.internalBufferTranTypeData(res, this));
    }
  }
  public resetTransactionTypes(): void {
    this.arrayTransactionType = [];
    this._isTransactionTypeBufferred = false;
  }
  get isTransactionTypeBufferred(): boolean {
    return this._isTransactionTypeBufferred;
  }
  set isTransactionTypeBufferred(buf: boolean) {
    this._isTransactionTypeBufferred = buf;
  }

  // Finance setting
  public bufferFinanceSettings(arFinSetting?: HIHFinance.Setting[]): Observable<HIHFinance.Setting[]> | void {
    if (environment.DebugLogging) {
      console.log("Entering bufferFinanceSettings of BufferService");
    }

    if (arFinSetting && arFinSetting.length > 0){
      this.arrayFinanceSetting = arFinSetting;
      this._isFinanceSettingBufferred = true;

      // Return nothing!
    } else {
      return this.getFinanceSettings();
    }
  }
  public getFinanceSettings(): Observable<HIHFinance.Setting[]> {
    if (environment.DebugLogging) {
      console.log("Entering getFinanceSettings of BufferService");
    }

    if (this._isFinanceSettingBufferred) {
      return Observable.of(this.arrayFinanceSetting);
    } else {
      let headers = new Headers();
      headers.append('Accept', 'application/json');
      if (this._authService.authSubject.getValue().isAuthorized)
        headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
      let strApi = environment.ApiUrl + "/api/financesetting";

      return this._http.get(strApi, { headers: headers })
        .map(res => this.internalBufferFinanceSettingData(res, this));
    }
  }
  public resetFinanceSettings(): void {
    this.arrayFinanceSetting = [];
    this._isFinanceSettingBufferred = false;
  }
  get isFinanceSettingBufferred() : boolean {
    return this._isFinanceSettingBufferred;
  }
  set isFinanceSettingBufferred(buf: boolean) {
    this._isFinanceSettingBufferred = buf;
  }

  // User
  public bufferUsers(arUser?: HIHUser.UserDetail[]): Observable<HIHUser.UserDetail[]> | void {
    if (environment.DebugLogging) {
      console.log("Entering bufferUsers of BufferService");
    }

    if (arUser && arUser.length > 0){
      this._isUserBufferred = true;
      this.arrayUser = arUser;

      // Return nothing!
    } else {
      return this.getUsers();
    }
  }
  public getUsers(): Observable<HIHUser.UserDetail[]> {
    if (environment.DebugLogging) {
      console.log("Entering getUsers of BufferService");
    }

    if (this._isUserBufferred) {
      return Observable.of(this.arrayUser);
    } else {
      let headers = new Headers();
      headers.append('Accept', 'application/json');
      if (this._authService.authSubject.getValue().isAuthorized)
        headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
      let usrApi = environment.ApiUrl + "/api/userdetail";

      return this._http.get(usrApi, { headers: headers })
        .map(res => this.internalBufferUserData(res, this));
    }
  }
  public resetUser(): void {
    this.arrayUser = [];
    this._isUserBufferred = false;
  }
  get isUserBufferred(): boolean {
    return this._isUserBufferred;
  }
  set isUserBufferred(buf: boolean) {
    this._isUserBufferred = buf;
  }
  // Learn categories
  public bufferLearnCategories(arCtgy?: HIHLearn.LearnCategory[]): Observable<HIHLearn.LearnCategory[]> | void {
    if (environment.DebugLogging) {
      console.log("Entering bufferLearnCategories of BufferService");
    }

    if (arCtgy && arCtgy.length > 0){
      this._isLearnCategoryBufferred = true;
      this.arrayLearnCategory = arCtgy;

      // Return nothing!
    } else {
      return this.getLearnCategories();
    }
  }
  public getLearnCategories(): Observable<HIHLearn.LearnCategory[]> {
    if (environment.DebugLogging) {
      console.log("Entering getLearnCategories of BufferService");
    }

    if (this._isLearnCategoryBufferred) {
      return Observable.of(this.arrayLearnCategory);
    } else {
      let headers = new Headers();
      headers.append('Accept', 'application/json');
      if (this._authService.authSubject.getValue().isAuthorized)
        headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
      let objApi = environment.ApiUrl + "/api/learncategory";

      return this._http.get(objApi, { headers: headers })
        .map(res => this.internalBufferLearnCategoryData(res, this));
    }
  }
  public resetLearnCategories(): void {
    this.arrayLearnCategory = [];
    this._isLearnCategoryBufferred = false;
  }
  get isLearnCategoryBufferred(): boolean {
    return this._isUserBufferred;
  }
  set isLearnCategoryBufferred(buf: boolean) {
    this._isLearnCategoryBufferred = buf;
  }

  /*
  * Private methods
  */
  private internalBufferFrequency(data: any, that: BufferService) {
    if (environment.DebugLogging) {
      console.log("Entering internalBufferFrequency of BufferService");
    }

    that._isUIRepeatFrequencyBufferred = true;

    for(let rf2 of that.arrayUIRepeatFrequency) {
      rf2.DisplayString = data[rf2.DisplayString];
    }

    return that.arrayUIRepeatFrequency;
  }
  private internalBufferCurrencyData(res: Response, that: BufferService) {
    if (environment.DebugLogging) {
      console.log("Entering internalBufferCurrencyData of BufferService");
    }

    that.arrayCurrency = [];
    that.isCurrencyBufferred = true;

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.Currency();
        alm2.onSetData(alm);
        that.arrayCurrency.push(alm2);
      }
      return that.arrayCurrency;
    }

    return body || {};
  }
  private internalBufferUserData(res: Response, that: BufferService) {
    if (environment.DebugLogging) {
      console.log("Entering internalBufferUserData of BufferService");
    }

    that.arrayUser = [];
    that.isUserBufferred = true;

    let body = res.json();
    if (body && body instanceof Array) {      
      for (let alm of body) {
        let alm2 = new HIHUser.UserDetail();
        alm2.onSetData(alm);
        that.arrayUser.push(alm2);
      }
      return that.arrayUser;
    }

    return body || {};
  }

  private internalBufferAccountCategoryData(res: Response, that: BufferService) {
    if (environment.DebugLogging) {
      console.log("Entering internalBufferAccountCategoryData of BufferService");
    }

    that.arrayAccountCategory = [];
    that.isAccountCategoryBufferred = true;
    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.AccountCategory();
        alm2.onSetData(alm);
        that.arrayAccountCategory.push(alm2);
      }
      return that.arrayAccountCategory;
    }

    return body || {};
  }

  private internalBufferDocTypeData(res: Response, that: BufferService) {
    if (environment.DebugLogging) {
      console.log("Entering internalBufferDocTypeData of BufferService");
    }

    that.arrayDocumentType = [];
    that.isDocumentTypeBufferred = true;
    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.DocumentType();
        alm2.onSetData(alm);
        that.arrayDocumentType.push(alm2);
      }
      return that.arrayDocumentType;
    }

    return body || {};
  }

  private internalBufferTranTypeData(res: Response, that: BufferService) {
    if (environment.DebugLogging) {
      console.log("Entering internalBufferTranTypeData of BufferService");
    }

    that.arrayTransactionType = [];
    that.isTransactionTypeBufferred = true;
    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.TranType();
        alm2.onSetData(alm);
        that.arrayTransactionType.push(alm2);
      }
      return that.arrayTransactionType;
    }

    return body || {};
  }

  private internalBufferLearnCategoryData(res: Response, that: BufferService) {
    if (environment.DebugLogging) {
      console.log("Entering internalBufferLearnCategoryData of BufferService");
    }

    that.arrayLearnCategory = [];
    that.isLearnCategoryBufferred = true;
    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {      
      for (let alm of body.contentList) {
        let alm2 = new HIHLearn.LearnCategory();
        alm2.onSetData(alm);
        that.arrayLearnCategory.push(alm2);
      }
      return that.arrayLearnCategory;
    }

    return body || {};
  }
  private internalBufferFinanceSettingData(res: Response, that: BufferService) {
    if (environment.DebugLogging) {
      console.log("Entering internalBufferFinanceSettingData of SettingComponent");
    }

    that.arrayFinanceSetting = [];
    that.isFinanceSettingBufferred = true;
    let body = res.json();
    if (body && body instanceof Array) {
      for (let alm of body) {
        let alm2 = new HIHFinance.Setting();
        alm2.onSetData(alm);
        that.arrayFinanceSetting.push(alm2);
      }
      return that.arrayFinanceSetting;
    }

    return body || {};
  }  
}

