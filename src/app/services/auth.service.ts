import { Injectable, EventEmitter } from '@angular/core';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { BehaviorSubject, Observable } from 'rxjs';

import { LogLevel, UserAuthInfo, ModelUtility, ConsoleLogTypeEnum } from '../model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private _isAuthenticated = false;
  // private _currentUserId = '';
  // private _currentUserName = '';
  // private _accessToken = '';  

  public authSubject: BehaviorSubject<UserAuthInfo> = new BehaviorSubject(new UserAuthInfo());
  public authContent: Observable<UserAuthInfo> = this.authSubject.asObservable();

  // get isAuthenticated(): boolean {
  //   return this._isAuthenticated;
  // }
  // get currentUserId(): string {
  //   return this._currentUserId;
  // }
  // get currentUserName(): string {
  //   return this._currentUserName;
  // }

  // get accessToken(): string {
  //   return this._accessToken;
  // }

  constructor(private authService: OidcSecurityService,
    private eventService: PublicEventsService,) { 
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService constructor...',
      ConsoleLogTypeEnum.debug);

    this.eventService
      .registerForEvents()
      // .pipe(filter((notification) => notification.type === EventTypes.CheckSessionReceived))
      .subscribe((value) => {
        switch(value.type) {
          case EventTypes.CheckSessionReceived:
            ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService: Check session received...', ConsoleLogTypeEnum.debug);
            break;
          case EventTypes.ConfigLoaded:
            ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService: Config loaded...', ConsoleLogTypeEnum.debug);
            break;
          case EventTypes.ConfigLoadingFailed:
            ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService: Config loading failed...', ConsoleLogTypeEnum.debug);
            break;            
          case EventTypes.UserDataChanged:
            ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService: User data changed...', ConsoleLogTypeEnum.debug);
            break;
          case EventTypes.NewAuthenticationResult:
            ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService: New authentication result...', ConsoleLogTypeEnum.debug);
            break;
          case EventTypes.TokenExpired:
            ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService: Token expired...', ConsoleLogTypeEnum.debug);
            break;
          case EventTypes.IdTokenExpired:
            ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService: ID token expired...', ConsoleLogTypeEnum.debug);
            break;
          case EventTypes.SilentRenewStarted:
            ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService: Silent renew started...', ConsoleLogTypeEnum.debug);
            break;
          default:
            break;
        } 
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AuthService: CheckSessionChanged with value: ${value}`, ConsoleLogTypeEnum.debug);
    });
    
    this.authService.checkAuth().subscribe(({ isAuthenticated, userData, accessToken, idToken }) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AuthService checkAuth callback with 'IsAuthenticated' = ${isAuthenticated}.`, ConsoleLogTypeEnum.debug);
      if (isAuthenticated) {
        this.authSubject.value.setContent({
          userId: userData.sub,
          userName: userData.name,
          accessToken: accessToken,
        });
      } else {
        this.authSubject.value.cleanContent();
      }
    });
  }

  public doLogin(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService logon...',
      ConsoleLogTypeEnum.debug);
    this.authService.authorize();
  }
  public doLogout(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService doLogout...',
      ConsoleLogTypeEnum.debug);
    this.authService.logoffAndRevokeTokens().subscribe(() => {
      this.authSubject.value.cleanContent();
    });
  }
  
  // constructor() {
  //   this.mgr = new UserManager(authSettings);
  //   this.mgr.getUser().then((u: any) => {
  //     if (u) {
  //       ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService constructor, get following user:',
  //         ConsoleLogTypeEnum.debug);
  //       ModelUtility.writeConsoleLog(u);

  //       // Set the content
  //       this.authSubject.value.setContent(u);

  //       // Broadcast event
  //       this.userLoadededEvent.emit(u);
  //     } else {
  //       this.authSubject.value.cleanContent();
  //     }

  //     this.authSubject.next(this.authSubject.value);
  //   }, (reason: any) => {
  //     ModelUtility.writeConsoleLog('AC_HIH_UI [Error]: Entering AuthService constructor, get user failed:',
  //       ConsoleLogTypeEnum.error);
  //     ModelUtility.writeConsoleLog(reason, ConsoleLogTypeEnum.error);
  //   });

  //   this.mgr.events.addUserUnloaded(() => {
  //     ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService User unloaded handler',
  //       ConsoleLogTypeEnum.debug);
  //     this.authSubject.value.cleanContent();

  //     this.authSubject.next(this.authSubject.value);
  //   });

  //   this.mgr.events.addAccessTokenExpiring(() => {
  //     if (environment.LoggingLevel >= LogLevel.Debug) {
  //       ModelUtility.writeConsoleLog('AC_HIH_UI [Warn]: Entering AuthService, Access token expiring',
  //         ConsoleLogTypeEnum.warn);
  //     }
  //   });

  //   this.mgr.events.addAccessTokenExpired(() => {
  //     if (environment.LoggingLevel >= LogLevel.Debug) {
  //       ModelUtility.writeConsoleLog('AC_HIH_UI [Error]: Entering AuthService, Access token expired',
  //         ConsoleLogTypeEnum.warn);
  //     }

  //     this.doLogin();
  //   });
  // }

  // clearState(): void {
  //   ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService clearState...',
  //     ConsoleLogTypeEnum.debug);

  //   this.mgr.clearStaleState().then(() => {
  //     ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService clearState success...',
  //       ConsoleLogTypeEnum.debug);
  //   }).catch((er: any) => {
  //     ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService doLogout failed: ${er}`,
  //       ConsoleLogTypeEnum.error);
  //   });
  // }

  // getUser(): void {
  //   this.mgr.getUser().then((user: any) => {
  //     ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService getUser success...',
  //       ConsoleLogTypeEnum.debug);
  //     ModelUtility.writeConsoleLog(user, ConsoleLogTypeEnum.debug);

  //     this.userLoadededEvent.emit(user);
  //   }).catch((err: any) => {
  //     ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService getUser failed: ${err}`,
  //       ConsoleLogTypeEnum.error);
  //   });
  // }

  // removeUser(): void {
  //   this.mgr.removeUser().then(() => {
  //     ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService removeUser success...',
  //       ConsoleLogTypeEnum.debug);

  //     this.userLoadededEvent.emit(undefined);
  //   }).catch((err: any) => {
  //     ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService removeUser failed: ${err}`,
  //       ConsoleLogTypeEnum.error);
  //   });
  // }

  // startSigninMainWindow(): void {
  //   this.mgr.signinRedirect({ data: 'some data' }).then(() => {
  //     ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService startSigninMainWindow success...',
  //       ConsoleLogTypeEnum.debug);
  //   }).catch((err: any) => {
  //     ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService startSigninMainWindow failed: ${err}`,
  //       ConsoleLogTypeEnum.error);
  //   });
  // }

  // endSigninMainWindow(): void {
  //   this.mgr.signinRedirectCallback().then((user: any) => {
  //     ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService endSigninMainWindow success...',
  //       ConsoleLogTypeEnum.debug);
  //   }).catch((err: any) => {
  //     ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService endSigninMainWindow failed: ${err}`,
  //       ConsoleLogTypeEnum.error);
  //   });
  // }

  // startSignoutMainWindow(): void {
  //   this.mgr.signoutRedirect().then((resp: any) => {
  //     ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService startSignoutMainWindow success...',
  //       ConsoleLogTypeEnum.debug);

  //     setTimeout(() => {
  //       ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService startSignoutMainWindow, re-test...');
  //     }, 5000);
  //   }).catch((err: any) => {
  //     ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService startSignoutMainWindow failed: ${err}`,
  //       ConsoleLogTypeEnum.error);
  //   });
  // }

  // endSignoutMainWindow(): void {
  //   this.mgr.signoutRedirectCallback().then((resp: any) => {
  //     ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService endSignoutMainWindow success...',
  //       ConsoleLogTypeEnum.debug);
  //   }).catch((err: any) => {
  //       ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AuthService endSignoutMainWindow failed: ${err}`,
  //       ConsoleLogTypeEnum.error);
  //   });
  // }
}
