import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { environment } from '../../environments/environment';
import { LogLevel, UserAuthInfo } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';

@Injectable()
export class HomeChoseGuardService {

  constructor(private authService: AuthService,
    private homedefService: HomeDefDetailService,
    private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;

    if (!environment.LoginRequired) {
      return true;
    }

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: entering can Activate of HomeChoseGuardService');
    }

    if (!this.checkLogin(url)) {
      return false;
    }

    // Has logged in but no home chosen yet.
    if (this.homedefService.ChosedHome === null
      || this.homedefService.ChosedHome === undefined) {
        // Navigate to other page
        this.router.navigate(['/homelist']);
      return false;
    }

    return true;
  }

  checkLogin(url: string): boolean {

    if (this.authService.authSubject.getValue().isAuthorized) {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: entering checkLogin of HomeChoseGuardService with TRUE');
      }
      return true;
    }

    // Navigate to the login page with extras
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: entering checkLogin of HomeChoseGuardService with FALSE, therefore redirecting...');
    }

    this.authService.doLogin();

    return false;
  }
}
