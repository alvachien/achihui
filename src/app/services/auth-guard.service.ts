import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from '../../environments/environment';

import { LogLevel, UserAuthInfo, ModelUtility, ConsoleLogTypeEnum } from '../model';
import { AuthService } from './auth.service';
import { UIStatusService } from './uistatus.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private uiService: UIStatusService, private authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering AuthGuardService constructor',
        ConsoleLogTypeEnum.debug
      );
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;

    // Fatal error
    if (this.uiService.fatalError) {
      return false;
    }

    if (!environment.LoginRequired) {
      return true;
    }

    if (environment.LoggingLevel >= LogLevel.Debug) {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthGuard canActivate', ConsoleLogTypeEnum.debug);
    }

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    if (this.authService.authSubject.getValue().isAuthorized) {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering AuthGuard checkLogin with TRUE',
          ConsoleLogTypeEnum.debug
        );
      }
      return true;
    }

    // For AC_HIH_UI: we cannot store the attempted URL because the whole page will be reloaded.
    // Store the attempted URL for redirecting
    // this.authService.redirectUrl = url;

    // Navigate to the login page with extras
    if (environment.LoggingLevel >= LogLevel.Debug) {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering AuthGuard checkLogin with FALSE, therefore redirecting...',
        ConsoleLogTypeEnum.debug
      );
    }
    this.authService.doLogin();

    return false;
  }
}
