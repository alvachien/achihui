import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { UserAuthInfo } from '../model/userinfo';

@Injectable()
export class AuthService {
  public authSubject: BehaviorSubject<UserAuthInfo> = new BehaviorSubject(new UserAuthInfo());
  public authContent: Observable<UserAuthInfo> = this.authSubject.asObservable();
  private mgr: any;

  constructor() {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering AuthService constructor...");
    }

    let settings = {
      authority: environment.IDServerUrl,
      client_id: "achihui.js",
      redirect_uri: environment.AppLoginCallbackUrl,
      response_type: "id_token token",
      scope: "openid profile api.hihapi",
      post_logout_redirect_uri: environment.AppLogoutCallbackUrl
    };

    this.mgr = new Oidc.UserManager(settings);
    var that = this;
    this.mgr.getUser().then(function (u) {
      if (environment.DebugLogging) {
        console.log("ACHIHUI Log: AuthService constructor, user get successfully as following ");
        console.log(u);
      }

      if (u) {
        that.authSubject.value.setContent(u);
      }
      else {
        that.authSubject.value.cleanContent();
      }

      that.authSubject.next(that.authSubject.value);
    }, function (reason) {
    });

    this.mgr.events.addUserUnloaded((e) => {
      if (environment.DebugLogging) {
        console.log("ACHIHUI Log: User unloaded");
      }
      that.authSubject.value.cleanContent();

      that.authSubject.next(that.authSubject.value);
    });
  }

  public doLogin() {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Start the login...");
    }

    if (this.mgr) {
      this.mgr.signinRedirect().then(function () {
        if (environment.DebugLogging) {
          console.info("redirecting for login...");
        }
      })
        .catch(function (er) {
          if (environment.DebugLogging) {
            console.error("Sign-in error", er);
          }
        });
    }
  }

  public doLogout() {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Start the logout...");
    }

    if (this.mgr) {
      this.mgr.signoutRedirect().then(function () {
        if (environment.DebugLogging) {
          console.info("redirecting for logout...");
        }
      })
        .catch(function (er) {
          if (environment.DebugLogging) {
            console.error("Sign-out error", er);
          }
        });
    }
  }
}
