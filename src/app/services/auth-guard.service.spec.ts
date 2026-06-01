import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { vi } from 'vitest';
import { BehaviorSubject } from 'rxjs';

import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';
import { UserAuthInfo } from '../model';
import { UIStatusService } from './uistatus.service';

describe('AuthGuardService', () => {
  const uiServiceStub: Partial<UIStatusService> = {};
  const authServiceStub: Partial<AuthService> = {};
  const authSubject = new BehaviorSubject(new UserAuthInfo());

  beforeAll(() => {
    uiServiceStub.fatalError = false;
    authServiceStub.authSubject = authSubject;
    authServiceStub.doLogin = vi.fn();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
      ],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(AuthGuardService);
    expect(service).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return false when fatalError is true', () => {
      const service = TestBed.inject(AuthGuardService);
      uiServiceStub['fatalError'] = true;
      const result = service.canActivate({} as any, { url: '/test' } as any);
      expect(result).toBe(false);
      uiServiceStub['fatalError'] = false;
    });

    it('should return true when user is authorized', () => {
      const service = TestBed.inject(AuthGuardService);
      const authorizedUser = new UserAuthInfo();
      authorizedUser.isAuthorized = true;
      authSubject.next(authorizedUser);
      const result = service.canActivate({} as any, { url: '/test' } as any);
      expect(result).toBe(true);
    });

    it('should trigger login when user is not authorized', () => {
      const service = TestBed.inject(AuthGuardService);
      const unauthorizedUser = new UserAuthInfo();
      unauthorizedUser.isAuthorized = false;
      authSubject.next(unauthorizedUser);
      const result = service.checkLogin('/test');
      expect(result).toBe(false);
      expect(authServiceStub.doLogin).toHaveBeenCalled();
    });
  });
});

type Safe = Record<string, unknown>;
