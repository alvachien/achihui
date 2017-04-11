import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { UserAuthInfo } from '../model/userinfo';
import { UserManager } from 'oidc-client';

@Injectable()
export class AuthService {
  public authSubject: BehaviorSubject<UserAuthInfo> = new BehaviorSubject(new UserAuthInfo());
  public authContent: Observable<UserAuthInfo> = this.authSubject.asObservable();
  private mgr: UserManager;

  constructor() {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering AuthService constructor...");
    }

    this.mgr = new UserManager(AuthSettings);
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

    this.mgr.events.addAccessTokenExpiring(function () {
      if (environment.DebugLogging) {
        console.log("token expiring");
      }
    });
    this.mgr.events.addAccessTokenExpired(function () {
      if (environment.DebugLogging) {
        console.log("token expired");
      }
      this.authSubject.value.cleanContent();
      this.authSubject.next(this.authSubject.value);
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

const AuthSettings: any = {

  authority: environment.IDServerUrl,
  client_id: "achihui.js",
  redirect_uri: environment.AppLoginCallbackUrl,
  post_logout_redirect_uri: environment.AppLogoutCallbackUrl,
  response_type: "id_token token",
  scope: "openid profile api.hihapi",

  silent_redirect_uri: environment.AppHost,
  automaticSilentRenew: true,
  //silentRequestTimeout:10000,

  filterProtocolClaims: true,
  loadUserInfo: true
};
