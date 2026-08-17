import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take, timeout } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { ModelUtility, ConsoleLogTypeEnum } from '../../model';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

/**
 * Handles the OIDC sign-in callback. The `redirectUrl` in `app.config.ts`
 * (`${AppHost}/signin-callback`) points here. The `AuthService` constructor
 * already fired `checkAuth()` which processes the code/state in the URL; this
 * component waits for the auth state to settle, then restores the deep link the
 * user originally requested (saved by the route guard) or falls back to /welcome.
 */
@Component({
  selector: 'hih-signin-callback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p class="signin-callback">Completing sign in...</p>',
})
export class SignInCallbackComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyedRef = inject(DestroyRef);
  // Bridge the authSubject signal to an Observable so the RxJS pipeline below
  // (filter/take/timeout) can wait for authorization. toObservable must run in
  // an injection context, hence the field initializer.
  private readonly authContent$ = toObservable(this.authService.authSubject);

  ngOnInit(): void {
    this.authContent$
      .pipe(
        filter((info) => info.isAuthorized),
        take(1),
        timeout(10000),
        takeUntilDestroyed(this.destroyedRef),
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
}
