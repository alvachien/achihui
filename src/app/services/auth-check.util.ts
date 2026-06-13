import { environment } from '../../environments/environment';
import { ModelUtility, ConsoleLogTypeEnum } from '../model';
import { AuthService } from './auth.service';
import { UIStatusService } from './uistatus.service';

/**
 * Shared authentication check for route guards.
 *
 * Returns:
 *  - `true`  when the route may be activated (auth OK or login not required)
 *  - `false` when the caller should abort navigation (fatal error, or login
 *            was triggered and the caller should return `false` / a `UrlTree`)
 */
export function checkAuthentication(uiService: UIStatusService, authService: AuthService): boolean {
  if (uiService.fatalError) {
    return false;
  }

  if (!environment.LoginRequired) {
    return true;
  }

  if (authService.authSubject.getValue().isAuthorized) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: checkAuthentication — authorized', ConsoleLogTypeEnum.debug);
    return true;
  }

  ModelUtility.writeConsoleLog(
    'AC_HIH_UI [Debug]: checkAuthentication — not authorized, triggering login',
    ConsoleLogTypeEnum.debug,
  );
  authService.doLogin();
  return false;
}
