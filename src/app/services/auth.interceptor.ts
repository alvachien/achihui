import { HttpInterceptorFn } from '@angular/common/http';

// This interceptor is intentionally a pass-through.
// Individual services (e.g. HomeDefOdataService) already manually attach
// the Authorization header to their requests.
// We do NOT inject AuthService here to avoid circular dependency:
//   authInterceptor → AuthService → OidcSecurityService → HttpClient → authInterceptor

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
