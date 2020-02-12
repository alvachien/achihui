import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { LogLevel, UserAuthInfo, ModelUtility, ConsoleLogTypeEnum } from '../model';
import { UserManager, Log, MetadataService, User } from 'oidc-client';

const authSettings: any = {
  authority: environment.IDServerUrl,
  client_id: 'achihui.js',
  redirect_uri: environment.AppLoginCallbackUrl,
  post_logout_redirect_uri: environment.AppLogoutCallbackUrl,
  response_type: 'id_token token',
  scope: 'openid profile api.hih',

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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService constructor...',
      ConsoleLogTypeEnum.debug);

    this.mgr = new UserManager(authSettings);

    this.mgr.getUser().then((u: any) => {
      if (u) {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService constructor, get following user:',
          ConsoleLogTypeEnum.debug);
        ModelUtility.writeConsoleLog(u);

        // Set the content
        this.authSubject.value.setContent(u);

        // Broadcast event
        this.userLoadededEvent.emit(u);
      } else {
        this.authSubject.value.cleanContent();
      }

      this.authSubject.next(this.authSubject.value);
    }, (reason: any) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Error]: Entering AuthService constructor, get user failed:',
        ConsoleLogTypeEnum.error);
      ModelUtility.writeConsoleLog(reason, ConsoleLogTypeEnum.error);
    });

    this.mgr.events.addUserUnloaded(() => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService User unloaded handler',
        ConsoleLogTypeEnum.debug);
      this.authSubject.value.cleanContent();

      this.authSubject.next(this.authSubject.value);
    });

    this.mgr.events.addAccessTokenExpiring(() => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Warn]: Entering AuthService, Access token expiring',
          ConsoleLogTypeEnum.warn);
      }
    });

    this.mgr.events.addAccessTokenExpired(() => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Error]: Entering AuthService, Access token expired',
          ConsoleLogTypeEnum.warn);
      }

      this.doLogin();
    });
  }

  public doLogin(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService doLogin...',
      ConsoleLogTypeEnum.debug);

    if (this.mgr) {
      this.mgr.signinRedirect().then(() => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService doLogin, redirecting...',
          ConsoleLogTypeEnum.debug);
      }).catch((er: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService doLogin failed: ${er}`,
          ConsoleLogTypeEnum.error);
      });
    }
  }

  public doLogout(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService doLogout...',
      ConsoleLogTypeEnum.debug);

    if (this.mgr) {
      this.mgr.signoutRedirect().then(() => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService doLogout, redirecting...',
          ConsoleLogTypeEnum.debug);
      }).catch((er: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService doLogout failed: ${er}`,
          ConsoleLogTypeEnum.error);
      });
    }
  }

  clearState(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService clearState...',
      ConsoleLogTypeEnum.debug);

    this.mgr.clearStaleState().then(() => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService clearState success...',
        ConsoleLogTypeEnum.debug);
    }).catch((er: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService doLogout failed: ${er}`,
        ConsoleLogTypeEnum.error);
    });
  }

  getUser(): void {
    this.mgr.getUser().then((user: any) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService getUser success...',
        ConsoleLogTypeEnum.debug);
      ModelUtility.writeConsoleLog(user, ConsoleLogTypeEnum.debug);

      this.userLoadededEvent.emit(user);
    }).catch((err: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService getUser failed: ${err}`,
        ConsoleLogTypeEnum.error);
    });
  }

  removeUser(): void {
    this.mgr.removeUser().then(() => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService removeUser success...',
        ConsoleLogTypeEnum.debug);

      this.userLoadededEvent.emit(undefined);
    }).catch((err: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService removeUser failed: ${err}`,
        ConsoleLogTypeEnum.error);
    });
  }

  startSigninMainWindow(): void {
    this.mgr.signinRedirect({ data: 'some data' }).then(() => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService startSigninMainWindow success...',
        ConsoleLogTypeEnum.debug);
    }).catch((err: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService startSigninMainWindow failed: ${err}`,
        ConsoleLogTypeEnum.error);
    });
  }

  endSigninMainWindow(): void {
    this.mgr.signinRedirectCallback().then((user: any) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService endSigninMainWindow success...',
        ConsoleLogTypeEnum.debug);
    }).catch((err: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService endSigninMainWindow failed: ${err}`,
        ConsoleLogTypeEnum.error);
    });
  }

  startSignoutMainWindow(): void {
    this.mgr.signoutRedirect().then((resp: any) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService startSignoutMainWindow success...',
        ConsoleLogTypeEnum.debug);

      setTimeout(() => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService startSignoutMainWindow, re-test...');
      }, 5000);
    }).catch((err: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService startSignoutMainWindow failed: ${err}`,
        ConsoleLogTypeEnum.error);
    });
  }

  endSignoutMainWindow(): void {
    this.mgr.signoutRedirectCallback().then((resp: any) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService endSignoutMainWindow success...',
        ConsoleLogTypeEnum.debug);
    }).catch((err: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService endSignoutMainWindow failed: ${err}`,
        ConsoleLogTypeEnum.error);
    });
  }
}
