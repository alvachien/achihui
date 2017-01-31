import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { UIRouteLink } from '../model/uicommon';

@Injectable()
export class UIStatusService {
  // This class served for the UI status
  // Including the Logged in, the navigation lists and so on
  // It works upon the BehaviorObject.

  private arLearnRouteLink: Array<UIRouteLink> = new Array<UIRouteLink>();
  public subjLearnRouteList: BehaviorSubject<Object> = new BehaviorSubject(this.arLearnRouteLink);
  public obsLearnRouteList = this.subjLearnRouteList.asObservable();

  private arFinanceRouteLink: Array<UIRouteLink> = new Array<UIRouteLink>();
  public subjFinanceRouteList: BehaviorSubject<Object> = new BehaviorSubject(this.arFinanceRouteLink);
  public obsFinanceRouteList = this.subjFinanceRouteList.asObservable();

  private arLibraryRouteLink: Array<UIRouteLink> = new Array<UIRouteLink>();
  public subjLibraryRouteList: BehaviorSubject<Object> = new BehaviorSubject(this.arLibraryRouteLink);
  public obsLibraryRouteList = this.subjFinanceRouteList.asObservable();

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
  }

  public setIsLogin(isLogin: boolean): void {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering setIsLogin of UIStatusService with " + isLogin);
    }
    if (this.isLoggedIn !== isLogin) {
      this.isLoggedIn = isLogin;
      if (this.isLoggedIn) {
        let rl: UIRouteLink = new UIRouteLink();
        rl.title = "Home";
        rl.route = "/";
        rl.icon = "home";
        this.arLearnRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Learn category";
        rl.route = "/learn/category";
        rl.icon = "settings_input_composite";
        this.arLearnRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Learn Object";
        rl.route = "/learn/object";
        rl.icon = "group_work";
        this.arLearnRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Learn History";
        rl.route = "/learn/history";
        rl.icon = "history";
        this.arLearnRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Currency";
        rl.route = "/finance/currency";
        rl.icon = "euro_symbol";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Account Category";
        rl.route = "/finance/accountcategory";
        rl.icon = "settings_input_component";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Document Type";
        rl.route = "/finance/documenttype";
        rl.icon = "view_comfy";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Transaction Type";
        rl.route = "/finance/transactiontype";
        rl.icon = "featured_play_list";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Control Center";
        rl.route = "/finance/controlcenter";
        rl.icon = "store";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Order";
        rl.route = "/finance/order";
        rl.icon = "tune";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance Accounts";
        rl.route = "/finance/account";
        rl.icon = "library_books";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance Documents";
        rl.route = "/finance/document";
        rl.icon = "local_library";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance Reports";
        rl.route = "/finance/report";
        rl.icon = "pie_chart";
        this.arFinanceRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Library Books";
        rl.route = "/library/book";
        rl.icon = "book";
        this.arLibraryRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Library Movies";
        rl.route = "/library/movie";
        rl.icon = "movie";
        this.arLibraryRouteLink.push(rl);
      } else {
        this.arLearnRouteLink.splice(0);
        this.arFinanceRouteLink.splice(0);
        this.arLibraryRouteLink.splice(0);
      }

      this.subjIsLoggedIn.next(this.isLoggedIn);
      this.subjLearnRouteList.next(this.arLearnRouteLink);
      this.subjFinanceRouteList.next(this.arFinanceRouteLink);
      this.subjLibraryRouteList.next(this.arLibraryRouteLink);
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
}
