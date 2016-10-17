import { Injectable } from '@angular/core';
import * as HIHFinance from '../model/finance';
import { DebugLogging } from '../app.setting';

@Injectable()
export class BufferService {
    finSettings: Array<HIHFinance.Setting>;
    finAccountCategories: Array<HIHFinance.AccountCategory>;
    finDocTypes: Array<HIHFinance.DocumentType>;
    finTranTypes: Array<HIHFinance.TranType>;
    finCurrencies: Array<HIHFinance.Currency>;
    _isfinSettingLoaded: boolean;
    _isfinAcntCtgyLoaded: boolean;
    _isfinDocTypeLoaded: boolean;
    _isfinTranTypeLoaded: boolean;
    _isfinCurrencyLoaded: boolean;
    
    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of BufferService");
        }
        this._isfinSettingLoaded = false;
        this._isfinAcntCtgyLoaded = false;
        this._isfinDocTypeLoaded = false;
        this._isfinTranTypeLoaded = false;
        this._isfinCurrencyLoaded = false;

        this.finSettings = new Array<HIHFinance.Setting>();
        this.finAccountCategories = new Array<HIHFinance.AccountCategory>();
        this.finDocTypes = new Array<HIHFinance.DocumentType>();
        this.finTranTypes = new Array<HIHFinance.TranType>();
        this.finCurrencies = new Array<HIHFinance.Currency>();
    }

    // Finance setting
    get isFinSettingLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isFinSettingLoaded-get of BufferService");
        }
        return this._isfinSettingLoaded;
    }
    set isFinSettingLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isFinSettingLoaded-set of BufferService");
        }
        this._isfinSettingLoaded = val;
    }
    public setFinSettings(data: Array<HIHFinance.Setting>) {
        if (DebugLogging) {
            console.log("Entering setFinSettings of BufferService");
        }
        this.finSettings = data;
        this._isfinSettingLoaded = true;
    }

    // Finance account category
    get isFinAccountCategoryLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isFinAccountCategoryLoaded-get of BufferService");
        }
        return this._isfinAcntCtgyLoaded;
    }
    set isFinAccountCategoryLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isFinAccountCategoryLoaded-set of BufferService");
        }
        this._isfinAcntCtgyLoaded = val;
    }
    public setFinAccountCategories(data: Array<HIHFinance.AccountCategory>) {
        if (DebugLogging) {
            console.log("Entering setFinAccountCategories of BufferService");
        }
        this.finAccountCategories = data;
        this._isfinAcntCtgyLoaded = true;        
    }

    // Finance currency
    get isFinCurrencyLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isFinCurrencyLoaded-get of BufferService");
        }
        return this._isfinCurrencyLoaded;
    }
    set isFinCurrencyLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isFinCurrencyLoaded-set of BufferService");
        }
        this._isfinCurrencyLoaded = val;
    }
    public setFinCurrencies(data: Array<HIHFinance.Currency>) {
        if (DebugLogging) {
            console.log("Entering setFinCurrencies of BufferService");
        }
        this.finCurrencies = data;
        this._isfinCurrencyLoaded = true;
    }

    // Finance doc type
    get isFinDocTypeLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isFinDocTypeLoaded-get of BufferService");
        }
        return this._isfinDocTypeLoaded;
    }
    set isFinDocTypeLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isFinDocTypeLoaded-set of BufferService");
        }
        this._isfinDocTypeLoaded = val;
    }
    public setFinDocTypes(data: Array<HIHFinance.DocumentType>) {
        if (DebugLogging) {
            console.log("Entering setFinDocTypes of BufferService");
        }
        this.finDocTypes = data;
        this._isfinDocTypeLoaded = true;
    }

    // Finance tran type
    get isFinTranTypeLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isFinTranTypeLoaded-get of BufferService");
        }
        return this._isfinTranTypeLoaded;
    }
    set isFinTranTypeLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isFinTranTypeLoaded-set of BufferService");
        }
        this._isfinTranTypeLoaded = val;
    }
    public setFinTranTypes(data: Array<HIHFinance.TranType>) {
        if (DebugLogging) {
            console.log("Entering setFinAccountCategories of BufferService");
        }
        this.finTranTypes = data;
        this._isfinTranTypeLoaded = true;
    }

}
