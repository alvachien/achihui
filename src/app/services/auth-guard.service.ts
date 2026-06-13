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

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthGuard canActivate', ConsoleLogTypeEnum.debug);
    return checkAuthentication(this.uiService, this.authService);
  }
}
