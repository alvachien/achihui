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

  private arRouteLink: Array<UIRouteLink> = new Array<UIRouteLink>();
  public subjRouteList: BehaviorSubject<Object> = new BehaviorSubject(this.arRouteLink);
  public obsRouteList = this.subjRouteList.asObservable();

  private isLoggedIn: boolean = false;
  public subjIsLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject(this.isLoggedIn);
  public obsIsLoggedIn = this.subjIsLoggedIn.asObservable();

  private titleLogin: string = "Login";
  public subjTitleLogin: BehaviorSubject<string> = new BehaviorSubject(this.titleLogin);
  public obsTitleLogin = this.subjTitleLogin.asObservable();

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
        this.arRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Learn category";
        rl.route = "/learn/category";
        rl.icon = "settings_input_composite";
        this.arRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Learn Object";
        rl.route = "/learn/object";
        rl.icon = "group_work";
        this.arRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Learn History";
        rl.route = "/learn/history";
        rl.icon = "history";
        this.arRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance Account";
        rl.route = "/finance/account";
        rl.icon = "library_books";
        this.arRouteLink.push(rl);

        rl = new UIRouteLink();
        rl.title = "Finance Document";
        rl.route = "/finance/document";
        rl.icon = "local_library";
        this.arRouteLink.push(rl);
      } else {
        this.arRouteLink.splice(0);
      }
      this.subjIsLoggedIn.next(this.isLoggedIn);
      this.subjRouteList.next(this.arRouteLink);
    }
  }

  public setTitleLogin(titleLogin: string): void {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering setTitleLogin of UIStatusService with " + titleLogin);
    }
    this.titleLogin = titleLogin;
    this.subjTitleLogin.next(this.titleLogin);
  }
}
