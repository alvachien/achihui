import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { UserAuthInfo } from '../model';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let authService: Safe;

  beforeEach(() => {
    const authSubject = new BehaviorSubject(new UserAuthInfo());
    authService = { authSubject };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should pass request without auth header when no token', () => {
    const apiUrl = `${environment.ApiUrl}/test`;
    httpClient.get(apiUrl).subscribe();

    const req = httpTestingController.expectOne(apiUrl);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should attach Bearer token when token is available', () => {
    const authorizedUser = new UserAuthInfo();
    authorizedUser.setContent({ userId: '1', userName: 'test', accessToken: 'test-token-123' });

    (authService['authSubject'] as BehaviorSubject<UserAuthInfo>).next(authorizedUser);

    const apiUrl = `${environment.ApiUrl}/test`;
    httpClient.get(apiUrl).subscribe();

    const req = httpTestingController.expectOne(apiUrl);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    req.flush({});
  });
});

type Safe = Record<string, unknown>;
