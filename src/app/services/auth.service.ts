import { Injectable, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, UserAuthInfo } from '../model';
import { UserManager, Log, MetadataService, User } from 'oidc-client';

const authSettings: any = {
  authority: environment.IDServerUrl,
  client_id: 'achihui.js',
  redirect_uri: environment.AppLoginCallbackUrl,
  post_logout_redirect_uri: environment.AppLogoutCallbackUrl,
  response_type: 'id_token token',
  scope: 'openid profile api.hihapi',

  silent_redirect_uri: environment.AppLoginSlientRevewCallbackUrl,
  automaticSilentRenew: true,
  accessTokenExpiringNotificationTime: 4,
  // silentRequestTimeout:10000,

  filterProtocolClaims: true,
  loadUserInfo: true,
};

@Injectable()
export class AuthService {
  private mgr: UserManager;
  private authHeaders: Headers;

  public authSubject: BehaviorSubject<UserAuthInfo> = new BehaviorSubject(new UserAuthInfo());
  public authContent: Observable<UserAuthInfo> = this.authSubject.asObservable();
  public userLoadededEvent: EventEmitter<User> = new EventEmitter<User>();

  constructor() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AuthService constructor...');
    }

    this.mgr = new UserManager(authSettings);

    this.mgr.getUser().then((u: any) => {
      if (u) {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log('AC_HIH_UI [Debug]: AuthService constructor, user get successfully as following: ');
          console.log(u);
        }

        // Set the content
        this.authSubject.value.setContent(u);

        // Broadcast event
        this.userLoadededEvent.emit(u);
      } else {
        this.authSubject.value.cleanContent();
      }

      this.authSubject.next(this.authSubject.value);
    }, (reason: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error('AC_HIH_UI [Error]: AuthService failed to fetch user:');
        console.error(reason);
      }
    });

    this.mgr.events.addUserUnloaded((e: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: User unloaded');
      }
      this.authSubject.value.cleanContent();

      this.authSubject.next(this.authSubject.value);
    });

    this.mgr.events.addAccessTokenExpiring(() => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.warn('AC_HIH_UI [Debug]: token expiring');
      }
    });

    this.mgr.events.addAccessTokenExpired(() => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.error('AC_HIH_UI [Debug]: token expired');
      }

      this.doLogin();
    });
  }

  public doLogin(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Start the login...');
    }

    if (this.mgr) {
      this.mgr.signinRedirect().then(() => {
      // this.mgr.signinSilent().then(function(){
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.info('AC_HIH_UI [Debug]: Redirecting for login...');
        }
      }).catch((er: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error('AC_HIH_UI [Error]: Sign-in error', er);
        }
      });
    }
  }

  public doLogout(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Start the logout...');
    }

    if (this.mgr) {
      this.mgr.signoutRedirect().then(() => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.info('AC_HIH_UI [Debug]: redirecting for logout...');
        }
      }).catch((er: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error('AC_HIH_UI [Error]: Sign-out error', er);
        }
      });
    }
  }

  clearState(): void {
    this.mgr.clearStaleState().then(() => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: clearStateState success');
      }
    }).catch((e: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error('AC_HIH_UI [Debug]: clearStateState error', e.message);
      }
    });
  }

  getUser(): void {
    this.mgr.getUser().then((user: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: got user', user);
      }

      this.userLoadededEvent.emit(user);
    }).catch((err: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(err);
      }
    });
  }

  removeUser(): void {
    this.mgr.removeUser().then(() => {
      this.userLoadededEvent.emit(undefined);
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: user removed');
      }
    }).catch((err: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(err);
      }
    });
  }

  startSigninMainWindow(): void {
    this.mgr.signinRedirect({ data: 'some data' }).then(() => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: signinRedirect done');
      }
    }).catch((err: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(err);
      }
    });
  }

  endSigninMainWindow(): void {
    this.mgr.signinRedirectCallback().then((user: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: signed in', user);
      }
    }).catch((err: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(err);
      }
    });
  }

  startSignoutMainWindow(): void {
    this.mgr.signoutRedirect().then((resp: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: signed out', resp);
      }
      setTimeout(5000, () => {
        console.log('AC_HIH_UI [Debug]: testing to see if fired...');
      });
    }).catch((err) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(err);
      }
    });
  }

  endSignoutMainWindow(): void {
    this.mgr.signoutRedirectCallback().then((resp) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: signed out', resp);
      }
    }).catch((err) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(err);
      }
    });
  }
}
