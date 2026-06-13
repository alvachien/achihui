import { inject, Injectable } from '@angular/core';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { UserAuthInfo, ModelUtility, ConsoleLogTypeEnum } from '../model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public authSubject: BehaviorSubject<UserAuthInfo> = new BehaviorSubject(new UserAuthInfo());
  public authContent: Observable<UserAuthInfo> = this.authSubject.asObservable();

  private readonly authService = inject(OidcSecurityService);
  private readonly eventService = inject(PublicEventsService);

  constructor() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService constructor...', ConsoleLogTypeEnum.debug);

    this.eventService
      .registerForEvents()
      // .pipe(filter((notification) => notification.type === EventTypes.CheckSessionReceived))
      .subscribe((value) => {
        switch (value.type) {
          case EventTypes.CheckSessionReceived:
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering AuthService: Check session received...',
              ConsoleLogTypeEnum.debug,
            );
            break;
          case EventTypes.ConfigLoaded:
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering AuthService: Config loaded...',
              ConsoleLogTypeEnum.debug,
            );
            break;
          case EventTypes.ConfigLoadingFailed:
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering AuthService: Config loading failed...',
              ConsoleLogTypeEnum.debug,
            );
            break;
          case EventTypes.UserDataChanged:
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering AuthService: User data changed...',
              ConsoleLogTypeEnum.debug,
            );
            break;
          case EventTypes.NewAuthenticationResult:
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering AuthService: New authentication result...',
              ConsoleLogTypeEnum.debug,
            );
            this.checkAuth();
            break;
          case EventTypes.TokenExpired:
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering AuthService: Token expired...',
              ConsoleLogTypeEnum.debug,
            );
            break;
          case EventTypes.IdTokenExpired:
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering AuthService: ID token expired...',
              ConsoleLogTypeEnum.debug,
            );
            break;
          case EventTypes.SilentRenewStarted:
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering AuthService: Silent renew started...',
              ConsoleLogTypeEnum.debug,
            );
            break;
          default:
            break;
        }
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Debug]: Entering AuthService: CheckSessionChanged with value: ${value}`,
          ConsoleLogTypeEnum.debug,
        );
      });

    this.checkAuth();
  }

  public doLogin(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService logon...', ConsoleLogTypeEnum.debug);
    this.authService.authorize();
  }
  public doLogout(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService doLogout...', ConsoleLogTypeEnum.debug);
    this.authService.logoffAndRevokeTokens().subscribe(() => {
      const usrAuthInfo = this.authSubject.value;
      usrAuthInfo.cleanContent();
      this.authSubject.next(usrAuthInfo);
    });
  }

  public checkAuth() {
    this.authService
      .checkAuth()
      .pipe(
        catchError((err) => {
          // If the URL contains a stale OIDC state param (e.g. from a previous
          // interrupted auth flow or a storage clear), checkAuth() throws
          // "could not find matching config for state". In that case, strip
          // the stale params from the URL and retry once on a clean URL.
          const currentUrl = window.location.toString();
          if (currentUrl.includes('state=') || currentUrl.includes('code=')) {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Warn]: Stale OIDC params detected in URL, clearing: ${err?.message}`,
              ConsoleLogTypeEnum.warn,
            );
            // Strip OIDC params from URL and retry on clean URL
            window.history.replaceState(null, '', '/welcome');
            // Retry checkAuth on the clean URL (no state param → normal flow)
            // Use switchMap to return the retry observable
            return this.authService.checkAuth();
          } else {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: checkAuth failed: ${err?.message}`,
              ConsoleLogTypeEnum.error,
            );
            // Still try to get token from storage in case guard passed but checkAuth failed
            return this.authService.getAccessToken().pipe(
              map((accessToken) => ({
                isAuthenticated: !!accessToken,
                userData: null,
                accessToken: accessToken,
                idToken: '',
                configId: '',
              })),
            );
          }
        }),
      )
      .subscribe(({ isAuthenticated, userData, accessToken }) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Debug]: Entering AuthService checkAuth callback with 'IsAuthenticated' = ${isAuthenticated}.`,
          ConsoleLogTypeEnum.debug,
        );
        if (isAuthenticated && accessToken) {
          const usrAuthInfo = this.authSubject.value;
          usrAuthInfo.setContent({
            userId: userData?.sub ?? '',
            userName: userData?.name ?? '',
            accessToken: accessToken,
          });
          this.authSubject.next(usrAuthInfo);
        } else {
          const usrAuthInfo = this.authSubject.value;
          usrAuthInfo.cleanContent();
          this.authSubject.next(usrAuthInfo);
        }
      });
  }
}
