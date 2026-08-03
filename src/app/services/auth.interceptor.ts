import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';
import { environment } from '@environments/environment';

// Functional interceptors execute lazily per-request, so injecting AuthService
// here does NOT create the construction-time cycle that affected the old
// class-based interceptor (authInterceptor -> AuthService -> OidcSecurityService
// -> HttpClient -> authInterceptor). The token is read synchronously from the
// BehaviorSubject so requests never block waiting for an async emission.
//
// The token is attached only to API requests (environment.ApiUrl), so OIDC
// authority calls (token/revocation endpoints) and other origins are left alone.
// This closes the hole where service methods that omitted the manual
// Authorization header (e.g. checkDBVersion, fetchAllLanguages) reached the API
// unauthenticated.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.ApiUrl)) {
    const authService = inject(AuthService);
    const token = authService.authSubject.getValue().getAccessToken();
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }
  return next(req);
};
