import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take, timeout } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { ModelUtility, ConsoleLogTypeEnum } from '../../model';

/**
 * Handles the OIDC sign-in callback. The `redirectUrl` in `app.config.ts`
 * (`${AppHost}/signin-callback`) points here. The `AuthService` constructor
 * already fired `checkAuth()` which processes the code/state in the URL; this
 * component waits for the auth state to settle, then restores the deep link the
 * user originally requested (saved by the route guard) or falls back to /welcome.
 */
@Component({
  selector: 'hih-signin-callback',
  template: '<p class="signin-callback">Completing sign in...</p>',
})
export class SignInCallbackComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.authService.authSubject
      .pipe(
        filter((info) => info.isAuthorized),
        take(1),
        timeout(10000),
      )
      .subscribe({
        next: () => {
          const target = this.authService.redirectUrl || '/welcome';
          this.authService.redirectUrl = null;
          this.router.navigateByUrl(target);
        },
        error: (err) => {
          // checkAuth did not authenticate within the window; fall back to welcome
          // (the user can retry login from there).
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Warn]: SignInCallback: auth did not complete in time: ${err}`,
            ConsoleLogTypeEnum.warn,
          );
          this.authService.redirectUrl = null;
          this.router.navigateByUrl('/welcome');
        },
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
