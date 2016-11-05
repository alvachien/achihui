﻿import { Injectable } from '@angular/core';
import * as HIHBase from '../model/common';
import * as HIHFinance from '../model/finance';
import * as HIHUser from '../model/user';
import * as HIHLearn from '../model/learn';
import { DebugLogging } from '../app.setting';

@Injectable()
export class BufferService {
    // Common part
    cmnModules: Array<HIHBase.Module>;
    cmnTags: Array<HIHBase.Tag>;
    cmnTagLinkages: Array<HIHBase.TagLinkage>;
    cmnLanguages: Array<HIHBase.AppLanguage>;
    _iscmnModuleLoaded: boolean;
    _iscmnTagLoaded: boolean;
    _iscmnTagLinkageLoaded: boolean;
    _iscmnLanguageLoaded: boolean;

    // User part
    usrDetail: HIHUser.UserDetail;
    usrHistories: Array<HIHUser.UserHistory>;
    _isusrDetailLoaded: boolean;
    _isusrHistoryLoaded: boolean;

    // Finance part
    finSettings: Array<HIHFinance.Setting>;
    finAccountCategories: Array<HIHFinance.AccountCategory>;
    finDocTypes: Array<HIHFinance.DocumentType>;
    finTranTypes: Array<HIHFinance.TranType>;
    finCurrencies: Array<HIHFinance.Currency>;
    finAccounts: Array<HIHFinance.Account>;
    finControllingCenters: Array<HIHFinance.ControllingCenter>;
    finOrders: Array<HIHFinance.Order>;
    _isfinSettingLoaded: boolean;
    _isfinAcntCtgyLoaded: boolean;
    _isfinDocTypeLoaded: boolean;
    _isfinTranTypeLoaded: boolean;
    _isfinCurrencyLoaded: boolean;
    _isfinAccountLoaded: boolean;
    _isfinControllingCenterLoaded: boolean;
    _isfinOrderLoaded: boolean;
    _isfinExRateLoaded: boolean;
    _isfinDocumentLoaded: boolean;

    // Learn part
    lrnCategories: Array<HIHLearn.LearnCategory>;
    lrnObjects: Array<HIHLearn.LearnObject>;
    lrnHistories: Array<HIHLearn.LearnHistory>;
    lrnAwards: Array<HIHLearn.LearnAward>;
    lrnEnWords: Array<HIHLearn.EnWord>;    
    lrnEnSentences: Array<HIHLearn.EnSentence>;
    lrnEnPOS: Array<HIHLearn.ENPOS>;
    _islrnCategoryLoaded: boolean;
    _islrnObjectLoaded: boolean;
    _islrnHistoryLoaded: boolean;
    _islrnAwardLoaded: boolean;
    _islrnEnWordLoaded: boolean;
    _islrnEnSentenceLoaded: boolean;
    _islrnEnPOSLoaded: boolean;
    
    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of BufferService");
        }

        this._iscmnModuleLoaded = false;
        this._iscmnTagLoaded = false;
        this._iscmnTagLinkageLoaded = false;
        this._iscmnLanguageLoaded = false;
        this._isusrDetailLoaded = false;
        this._isusrHistoryLoaded = false;
        this._isfinSettingLoaded = false;
        this._isfinAcntCtgyLoaded = false;
        this._isfinDocTypeLoaded = false;
        this._isfinTranTypeLoaded = false;
        this._isfinCurrencyLoaded = false;
        this._isfinAccountLoaded = false;
        this._isfinControllingCenterLoaded = false;
        this._isfinOrderLoaded = false;
        this._islrnAwardLoaded = false;
        this._islrnCategoryLoaded = false;
        this._islrnHistoryLoaded = false;
        this._islrnObjectLoaded = false;
        this._islrnEnWordLoaded = false;
        this._islrnEnSentenceLoaded = false;
        this._islrnEnPOSLoaded = false;

        this.cmnModules = new Array<HIHBase.Module>();
        this.cmnTags = new Array<HIHBase.Tag>();
        this.cmnTagLinkages = new Array<HIHBase.TagLinkage>();
        this.cmnLanguages = new Array<HIHBase.AppLanguage>();
        this.usrDetail = new HIHUser.UserDetail();
        this.usrHistories = new Array<HIHUser.UserHistory>();
        this.finSettings = new Array<HIHFinance.Setting>();
        this.finAccountCategories = new Array<HIHFinance.AccountCategory>();
        this.finDocTypes = new Array<HIHFinance.DocumentType>();
        this.finTranTypes = new Array<HIHFinance.TranType>();
        this.finCurrencies = new Array<HIHFinance.Currency>();
        this.finAccounts = new Array<HIHFinance.Account>();
        this.finControllingCenters = new Array<HIHFinance.ControllingCenter>();
        this.finOrders = new Array<HIHFinance.Order>();
        this.lrnAwards = new Array<HIHLearn.LearnAward>();
        this.lrnCategories = new Array<HIHLearn.LearnCategory>();
        this.lrnHistories = new Array<HIHLearn.LearnHistory>();
        this.lrnObjects = new Array<HIHLearn.LearnObject>();
        this.lrnEnPOS = new Array<HIHLearn.ENPOS>();
        this.lrnEnWords = new Array<HIHLearn.EnWord>();
        this.lrnEnSentences = new Array<HIHLearn.EnSentence>();
    }

    // Common module
    get isCommonModuleLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isCommonModuleLoaded-get of BufferService");
        }
        return this._iscmnModuleLoaded;
    }
    set isCommonModuleLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isCommonModuleLoaded-set of BufferService");
        }
        this._iscmnModuleLoaded = val;
    }
    public setCommonModules(data: Array<HIHBase.Module>) {
        if (DebugLogging) {
            console.log("Entering setCommonModules of BufferService");
        }
        this.cmnModules = data;
        this._iscmnModuleLoaded = true;
    }

    // Common tag
    get isCommonTagLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isCommonTagLoaded-get of BufferService");
        }
        return this._iscmnTagLoaded;
    }
    set isCommonTagLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isCommonTagLoaded-set of BufferService");
        }
        this._iscmnTagLoaded = val;
    }
    public setCommonTags(data: Array<HIHBase.Tag>) {
        if (DebugLogging) {
            console.log("Entering setCommonTags of BufferService");
        }
        this.cmnTags = data;
        this._iscmnTagLoaded = true;
    }

    // Common tag linkage
    get isCommonTagLinkageLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isCommonTagLinkageLoaded-get of BufferService");
        }
        return this._iscmnTagLinkageLoaded;
    }
    set isCommonTagLinkageLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isCommonTagLinkageLoaded-set of BufferService");
        }
        this._iscmnTagLinkageLoaded = val;
    }
    public setCommonTagLinkages(data: Array<HIHBase.TagLinkage>) {
        if (DebugLogging) {
            console.log("Entering setCommonTagLinkages of BufferService");
        }
        this.cmnTagLinkages = data;
        this._iscmnTagLinkageLoaded = true;
    }

    // Common langauge
    get isCommonLanguageLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isCommonLanguageLoaded-get of BufferService");
        }
        return this._iscmnLanguageLoaded;
    }
    set isCommonLanguageLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isCommonLanguageLoaded-set of BufferService");
        }
        this._iscmnLanguageLoaded = val;
    }
    public setCommonLanguages(data: Array<HIHBase.AppLanguage>) {
        if (DebugLogging) {
            console.log("Entering setCommonLanguages of BufferService");
        }
        this.cmnLanguages = data;
        this._iscmnLanguageLoaded = true;
    }

    // User detail
    get isUserDetailLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isUserDetailLoaded-get of BufferService");
        }
        return this._isusrDetailLoaded;
    }
    set isUserDetailLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isUserDetailLoaded-set of BufferService");
        }
        this._isusrDetailLoaded = val;
    }
    public setUserDetail(data: HIHUser.UserDetail) {
        if (DebugLogging) {
            console.log("Entering setUserDetail of BufferService");
        }
        this.usrDetail = data;
        this._isusrDetailLoaded = true;
    }

    // User history
    get isUserHistoriesLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isUserHistoriesLoaded-get of BufferService");
        }
        return this._isusrHistoryLoaded;
    }
    set isUserHistoriesLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isUserHistoriesLoaded-set of BufferService");
        }
        this._isusrHistoryLoaded = val;
    }
    public setUserHistories(data: Array<HIHUser.UserHistory>) {
        if (DebugLogging) {
            console.log("Entering setUserHistories of BufferService");
        }
        this.usrHistories = data;
        this._isusrHistoryLoaded = true;
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

    // Finance account
    get isFinAccountLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isFinAccountLoaded-get of BufferService");
        }
        return this._isfinAccountLoaded;
    }
    set isFinAccountLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isFinAccountLoaded-set of BufferService");
        }
        this._isfinAccountLoaded = val;
    }
    public setFinAccounts(data: Array<HIHFinance.Account>) {
        if (DebugLogging) {
            console.log("Entering setFinAccounts of BufferService");
        }
        this.finAccounts = data;
        this._isfinAccountLoaded = true;
    }

    // Finance controlling center
    get isFinControllingCenterLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isFinControllingCenterLoaded-get of BufferService");
        }
        return this._isfinControllingCenterLoaded;
    }
    set isFinControllingCenterLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isFinControllingCenterLoaded-set of BufferService");
        }
        this._isfinControllingCenterLoaded = val;
    }
    public setFinControllingCenters(data: Array<HIHFinance.ControllingCenter>) {
        if (DebugLogging) {
            console.log("Entering setFinControllingCenters of BufferService");
        }
        this.finControllingCenters = data;
        this._isfinControllingCenterLoaded = true;
    }

    // Finance order
    get isFinOrderLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isFinOrderLoaded-get of BufferService");
        }
        return this._isfinOrderLoaded;
    }
    set isFinOrderLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isFinOrderLoaded-set of BufferService");
        }
        this._isfinOrderLoaded = val;
    }
    public setFinOrders(data: Array<HIHFinance.Order>) {
        if (DebugLogging) {
            console.log("Entering setFinOrders of BufferService");
        }
        this.finOrders = data;
        this._isfinOrderLoaded = true;
    }

    // Learn category
    get isLearnCategoryLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isLearnCategoryLoaded-get of BufferService");
        }
        return this._islrnCategoryLoaded;
    }
    set isLearnCategoryLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isLearnCategoryLoaded-set of BufferService");
        }
        this._islrnCategoryLoaded = val;
    }
    public setLearnCategories(data: Array<HIHLearn.LearnCategory>) {
        if (DebugLogging) {
            console.log("Entering setLearnCategories of BufferService");
        }
        this.lrnCategories = data;
        this._islrnCategoryLoaded = true;
    }

    // Learn object
    get isLearnObjectLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isLearnObjectLoaded-get of BufferService");
        }
        return this._islrnObjectLoaded;
    }
    set isLearnObjectLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isLearnObjectLoaded-set of BufferService");
        }
        this._islrnObjectLoaded = val;
    }
    public setLearnObjects(data: Array<HIHLearn.LearnObject>) {
        if (DebugLogging) {
            console.log("Entering setLearnObjects of BufferService");
        }
        this.lrnObjects = data;
        this._islrnObjectLoaded = true;
    }

    // Learn history
    get isLearnHistoryLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isLearnHistoryLoaded-get of BufferService");
        }
        return this._islrnHistoryLoaded;
    }
    set isLearnHistoryLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isLearnHistoryLoaded-set of BufferService");
        }
        this._islrnHistoryLoaded = val;
    }
    public setLearnHistories(data: Array<HIHLearn.LearnHistory>) {
        if (DebugLogging) {
            console.log("Entering setLearnHistories of BufferService");
        }
        this.lrnHistories = data;
        this._islrnHistoryLoaded = true;
    }

    // Learn award
    get isLearnAwardLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isLearnAwardLoaded-get of BufferService");
        }
        return this._islrnAwardLoaded;
    }
    set isLearnAwardLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isLearnAwardLoaded-set of BufferService");
        }
        this._islrnAwardLoaded = val;
    }
    public setLearnAwards(data: Array<HIHLearn.LearnAward>) {
        if (DebugLogging) {
            console.log("Entering setLearnAwards of BufferService");
        }
        this.lrnAwards = data;
        this._islrnAwardLoaded = true;
    }

    // Learn En POS
    get isLearnEnPOSLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isLearnEnPOSLoaded-get of BufferService");
        }
        return this._islrnEnPOSLoaded;
    }
    set isLearnEnPOSLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isLearnEnPOSLoaded-set of BufferService");
        }
        this._islrnEnPOSLoaded = val;
    }
    public setLearnEnPOS(data: Array<HIHLearn.ENPOS>) {
        if (DebugLogging) {
            console.log("Entering setLearnEnPOS of BufferService");
        }
        this.lrnEnPOS = data;
        this._islrnEnPOSLoaded = true;
    }

    // Learn En Word
    get isLearnEnWordLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isLearnEnWordLoaded-get of BufferService");
        }
        return this._islrnEnWordLoaded;
    }
    set isLearnEnWordLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isLearnEnWordLoaded-set of BufferService");
        }
        this._islrnEnWordLoaded = val;
    }
    public setLearnEnWord(data: Array<HIHLearn.EnWord>) {
        if (DebugLogging) {
            console.log("Entering setLearnEnWord of BufferService");
        }
        this.lrnEnWords = data;
        this._islrnEnWordLoaded = true;
    }

    // Learn En Sentence
    get isLearnEnSentenceLoaded(): boolean {
        if (DebugLogging) {
            console.log("Entering isLearnEnSentenceLoaded-get of BufferService");
        }
        return this._islrnEnSentenceLoaded;
    }
    set isLearnEnSentenceLoaded(val: boolean) {
        if (DebugLogging) {
            console.log("Entering isLearnEnSentenceLoaded-set of BufferService");
        }
        this._islrnEnSentenceLoaded = val;
    }
    public setLearnEnSentence(data: Array<HIHLearn.EnSentence>) {
        if (DebugLogging) {
            console.log("Entering setLearnEnSentence of BufferService");
        }
        this.lrnEnSentences = data;
        this._islrnEnSentenceLoaded = true;
    }
}
