import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ModelUtility, ConsoleLogTypeEnum } from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { UIStatusService } from './uistatus.service';
import { checkAuthentication } from './auth-check.util';

@Injectable({
  providedIn: 'root',
})
export class HomeChoseGuardService {
  private readonly authService = inject(AuthService);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly uiService = inject(UIStatusService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeChoseGuardService canActivate',
      ConsoleLogTypeEnum.debug,
    );

    if (!checkAuthentication(this.uiService, this.authService)) {
      return false;
    }

    // Has logged in but no home chosen yet.
    // Save the attempted URL so we can redirect after home selection.
    this.homeService.RedirectURL = state.url;

    if (!this.homeService.ChosedHome) {
      // Return a UrlTree instead of calling router.navigate() —
      // calling navigate() inside a guard creates a competing navigation
      // that corrupts the router state (the getBaseHref race condition).
      return this.router.parseUrl('/homedef');
    }

    return true;
  }
}
