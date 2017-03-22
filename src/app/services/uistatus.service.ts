import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { AppLanguage } from '../model/common';
import { UIRouteLink } from '../model/uicommon';

@Injectable()
export class UIStatusService {
  // This class served for the UI status
  // Including the Logged in, the navigation lists and so on
  // It works upon the BehaviorObject.

  public arLang: Array<AppLanguage>;
  public curLang: string;
  public subjCurLanguage: BehaviorSubject<string> = new BehaviorSubject(this.curLang);
  public obsCurLanguage = this.subjCurLanguage.asObservable();

  private arAppRouteLink: Array<UIRouteLink> = new Array<UIRouteLink>();
  public subjAppRouteList: BehaviorSubject<Object> = new BehaviorSubject(this.arAppRouteLink);
  public obsAppRouteList = this.subjAppRouteList.asObservable();

  private arLearnRouteLink: Array<UIRouteLink> = new Array<UIRouteLink>();
  public subjLearnRouteList: BehaviorSubject<Object> = new BehaviorSubject(this.arLearnRouteLink);
  public obsLearnRouteList = this.subjLearnRouteList.asObservable();

  private arFinanceRouteLink: Array<UIRouteLink> = new Array<UIRouteLink>();
  public subjFinanceRouteList: BehaviorSubject<Object> = new BehaviorSubject(this.arFinanceRouteLink);
  public obsFinanceRouteList = this.subjFinanceRouteList.asObservable();

  private arLibraryRouteLink: Array<UIRouteLink> = new Array<UIRouteLink>();
  public subjLibraryRouteList: BehaviorSubject<Object> = new BehaviorSubject(this.arLibraryRouteLink);
  public obsLibraryRouteList = this.subjLibraryRouteList.asObservable();

  private arUserRouteLink: Array<UIRouteLink> = new Array<UIRouteLink>();
  public subjUserRouteList: BehaviorSubject<Object> = new BehaviorSubject(this.arUserRouteLink);
  public obsUserRouteList = this.subjUserRouteList.asObservable();

  private isLoggedIn: boolean = false;
  public subjIsLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject(this.isLoggedIn);
  public obsIsLoggedIn = this.subjIsLoggedIn.asObservable();

  private titleLogin: string = "Login";
  public subjTitleLogin: BehaviorSubject<string> = new BehaviorSubject(this.titleLogin);
  public obsTitleLogin = this.subjTitleLogin.asObservable();

  private learnModule: string = "Learn module";
  public subjLearnModule: BehaviorSubject<string> = new BehaviorSubject(this.learnModule);
  public obsLearnModule = this.subjLearnModule.asObservable();

  private learnSubModule: string = "Learn sub module";
  public subjLearnSubModule: BehaviorSubject<string> = new BehaviorSubject(this.learnSubModule);
  public obsLearnSubModule = this.subjLearnSubModule.asObservable();

  private financeModule: string = "Finance module";
  public subjFinanceModule: BehaviorSubject<string> = new BehaviorSubject(this.financeModule);
  public obsFinanceModule = this.subjFinanceModule.asObservable();

  private financeSubModule: string = "Finance sub module";
  public subjFinanceSubModule: BehaviorSubject<string> = new BehaviorSubject(this.financeSubModule);
  public obsFinanceSubModule = this.subjFinanceSubModule.asObservable();

  constructor() {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering constructor of UIStatusService");
    }

    this.arLang = new Array<AppLanguage>();

    let ap:AppLanguage = new AppLanguage();
    ap.IsoName = "en";
    ap.NativeName = "Nav.English";
    this.arLang.push(ap);
    ap = new AppLanguage();
    ap.IsoName = "zh";
    ap.NativeName = "Nav.SimplifiedChinese";
    this.arLang.push(ap);

    this.curLang = "en"; // Default is English
  }

  public setIsLogin(isLogin: boolean): void {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering setIsLogin of UIStatusService with " + isLogin);
    }

    if (this.isLoggedIn !== isLogin) {
      this.isLoggedIn = isLogin;
      if (this.isLoggedIn) {
        // App. routes
        let rl: UIRouteLink = new UIRouteLink();
        rl.title = "Nav.Home";
        rl.route = "/";
        rl.icon = "home";
        this.arAppRouteLink.push(rl);

        // Learning routes
        rl = new UIRouteLink();
        rl.title = "Common.Categories";
        rl.route = "/learn/category";
        rl.icon = "settings_input_composite";
        this.arLearnRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Learning.LearningObjects";
        rl.route = "/learn/object";
        rl.icon = "group_work";
        this.arLearnRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Learning.LearningHistories";
        rl.route = "/learn/history";
        rl.icon = "history";
        this.arLearnRouteLink.push(rl);

        // Finance routes
        rl = new UIRouteLink();
        rl.title = "Common.Setting";
        rl.route = "/finance/setting";
        rl.icon = "settings_applications";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance.Currencies";
        rl.route = "/finance/currency";
        rl.icon = "euro_symbol";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance.AccountCategories";
        rl.route = "/finance/accountcategory";
        rl.icon = "settings_input_component";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance.DocumentTypes";
        rl.route = "/finance/documenttype";
        rl.icon = "view_comfy";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance.TransactionTypes";
        rl.route = "/finance/transactiontype";
        rl.icon = "featured_play_list";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance.ControlCenters";
        rl.route = "/finance/controlcenter";
        rl.icon = "store";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance.Orders";
        rl.route = "/finance/order";
        rl.icon = "tune";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance.Accounts";
        rl.route = "/finance/account";
        rl.icon = "library_books";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance.Documents";
        rl.route = "/finance/document";
        rl.icon = "local_library";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance.Reports";
        rl.route = "/finance/report";
        rl.icon = "pie_chart";
        this.arFinanceRouteLink.push(rl);

        // Library routes
        rl = new UIRouteLink();
        rl.title = "Library.Books";
        rl.route = "/library/book";
        rl.icon = "book";
        this.arLibraryRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Library.Movies";
        rl.route = "/library/movie";
        rl.icon = "movie";
        this.arLibraryRouteLink.push(rl);

        // User detail routes
        rl = new UIRouteLink();
        rl.title = "Nav.UserDetail";
        rl.route = "/userdetail";
        rl.icon = "account_circle";
        this.arUserRouteLink.push(rl);
      } else {
        this.arAppRouteLink.splice(0);
        this.arLearnRouteLink.splice(0);
        this.arFinanceRouteLink.splice(0);
        this.arLibraryRouteLink.splice(0);
        this.arUserRouteLink.splice(0);
      }

      this.subjIsLoggedIn.next(this.isLoggedIn);
      this.subjAppRouteList.next(this.arAppRouteLink);
      this.subjLearnRouteList.next(this.arLearnRouteLink);
      this.subjFinanceRouteList.next(this.arFinanceRouteLink);
      this.subjLibraryRouteList.next(this.arLibraryRouteLink);
      this.subjUserRouteList.next(this.arUserRouteLink);
    }
  }

  public setTitleLogin(titleLogin: string): void {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering setTitleLogin of UIStatusService with " + titleLogin);
    }
    this.titleLogin = titleLogin;
    this.subjTitleLogin.next(this.titleLogin);
  }

  public setLearnModule(learnMod: string): void {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering setLearnModule of UIStatusService with " + learnMod);
    }
    this.learnModule = learnMod;
    this.subjLearnModule.next(this.learnModule);
  }

  public setLearnSubModule(learnSubMod: string): void {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering setLearnSubModule of UIStatusService with " + learnSubMod);
    }
    this.learnSubModule = learnSubMod;
    this.subjLearnSubModule.next(this.learnSubModule);
  }

  public setFinanceModule(financeMod: string): void {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering setFinanceModule of UIStatusService with " + financeMod);
    }
    this.financeModule = financeMod;
    this.subjFinanceModule.next(this.financeModule);
  }

  public setFinanceSubModule(financeSubMod: string): void {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering setFinanceSubModule of UIStatusService with " + financeSubMod);
    }
    this.financeSubModule = financeSubMod;
    this.subjFinanceSubModule.next(this.financeSubModule);
  }

  public setCurrentLanguage(curlang: string): void {
    if (curlang !== this.curLang) {
      // Check whether the new value is valid
      let bValid: boolean = false;
      for(let ap of this.arLang) {
        if (ap.IsoName === curlang) {
          bValid = true;
          break;
        }
      }

      if (bValid) {
        this.curLang = curlang;
        this.subjCurLanguage.next(this.curLang);
      }
    }
  }
}
