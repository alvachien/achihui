import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot,
} from '@angular/router';
import { environment } from '../../environments/environment';
import { LogLevel, UserAuthInfo } from '../model';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;

    if (!environment.LoginRequired) {
      return true;
    }

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering can Activate of AuthGuard');
    }

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {

    if (this.authService.authSubject.getValue().isAuthorized) {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug('AC_HIH_UI [Debug]: Entering checkLogin of AuthGuard with TRUE');
      }
      return true;
    }

    // For AC_HIH_UI: we cannot store the attempted URL because the whole page will be reloaded.
    // Store the attempted URL for redirecting
    // this.authService.redirectUrl = url;

    // Navigate to the login page with extras
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering checkLogin of AuthGuard with FALSE, therefore redirecting...');
    }
    this.authService.doLogin();

    return false;
  }
}
