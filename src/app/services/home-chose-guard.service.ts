import { inject, Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from '../../environments/environment';
import { ModelUtility, ConsoleLogTypeEnum } from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { UIStatusService } from './uistatus.service';

@Injectable({
  providedIn: 'root',
})
export class HomeChoseGuardService  {
  private readonly authService = inject(AuthService);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly uiService = inject(UIStatusService);
  private readonly router = inject(Router);
  
  constructor(
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeChoseGuardService constructor',
      ConsoleLogTypeEnum.debug
    );
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;

    if (this.uiService.fatalError) {
      return false;
    }

    if (!environment.LoginRequired) {
      return true;
    }

    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeChoseGuardService canActivate',
      ConsoleLogTypeEnum.debug
    );

    if (!this.checkLogin()) {
      return false;
    }

    // Has logged in but no home chosen yet.
    this.homeService.RedirectURL = url;

    if (!this.homeService.ChosedHome) {
      // Navigate to other page
      this.router.navigate(['/homedef']);
      return false;
    }

    return true;
  }

  checkLogin(): boolean {
    if (this.authService.authSubject.getValue().isAuthorized) {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering HomeChoseGuardService checkLogin: TRUE',
        ConsoleLogTypeEnum.debug
      );

      return true;
    }

    // Navigate to the login page with extras
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeChoseGuardService checkLogin: FALSE, redirecting',
      ConsoleLogTypeEnum.debug
    );

    this.authService.doLogin();

    return false;
  }
}
