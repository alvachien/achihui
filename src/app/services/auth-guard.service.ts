import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ModelUtility, ConsoleLogTypeEnum } from '../model';
import { AuthService } from './auth.service';
import { UIStatusService } from './uistatus.service';
import { checkAuthentication } from './auth-check.util';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  private readonly authService = inject(AuthService);
  private readonly uiService = inject(UIStatusService);

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthGuard canActivate', ConsoleLogTypeEnum.debug);
    // Capture the attempted URL so it can be restored after OIDC login.
    if (!this.authService.authSubject.getValue().isAuthorized) {
      this.authService.redirectUrl = state.url;
    }
    return checkAuthentication(this.uiService, this.authService);
  }
}
