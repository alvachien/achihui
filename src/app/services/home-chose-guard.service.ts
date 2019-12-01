import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from '../../environments/environment';
import { LogLevel, UserAuthInfo } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import { HomeDefOdataService } from './home-def-odata.service';

@Injectable()
export class HomeChoseGuardService {

  constructor(private authService: AuthService,
    private homeService: HomeDefOdataService,
    private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;

    if (!environment.LoginRequired) {
      return true;
    }

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering can Activate of HomeChoseGuardService');
    }

    if (!this.checkLogin(url)) {
      return false;
    }

    // Has logged in but no home chosen yet.
    this.homeService.RedirectURL = url;

    if (this.homeService.ChosedHome === undefined) {
        // Navigate to other page
        this.router.navigate(['/homedef']);
        return false;
    }

    return true;
  }

  checkLogin(url: string): boolean {

    if (this.authService.authSubject.getValue().isAuthorized) {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug('AC_HIH_UI [Debug]: Entering checkLogin of HomeChoseGuardService with TRUE');
      }
      return true;
    }

    // Navigate to the login page with extras
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering checkLogin of HomeChoseGuardService with FALSE, therefore redirecting...');
    }

    this.authService.doLogin();

    return false;
  }
}
