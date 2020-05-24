import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from '../../environments/environment';
import { LogLevel, UserAuthInfo, ModelUtility, ConsoleLogTypeEnum } from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { UIStatusService } from './uistatus.service';

@Injectable()
export class HomeChoseGuardService {

  constructor(
    private authService: AuthService,
    private homeService: HomeDefOdataService,
    private uiService: UIStatusService,
    private router: Router) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeChoseGuardService canActivate',
      ConsoleLogTypeEnum.debug);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;

    if (this.uiService.fatalError) {
      return false;
    }

    if (!environment.LoginRequired) {
      return true;
    }

    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeChoseGuardService canActivate',
      ConsoleLogTypeEnum.debug);

    if (!this.checkLogin()) {
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

  checkLogin(): boolean {
    if (this.authService.authSubject.getValue().isAuthorized) {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeChoseGuardService checkLogin: TRUE',
        ConsoleLogTypeEnum.debug);

      return true;
    }

    // Navigate to the login page with extras
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeChoseGuardService checkLogin: FALSE, redirecting',
      ConsoleLogTypeEnum.debug);

    this.authService.doLogin();

    return false;
  }
}
