import { TestBed, inject, fakeAsync, tick, flush } from '@angular/core/testing';
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
    authServiceStub.doLogin = jasmine.createSpy('doLogin');
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

  it('should be created', inject([AuthGuardService], (service: AuthGuardService) => {
    expect(service).toBeTruthy();
  }));

  describe('canActivate', () => {
    it('should return false when fatalError is true', inject(
      [AuthGuardService],
      (service: AuthGuardService) => {
        uiServiceStub['fatalError'] = true;
        const result = service.canActivate({} as any, { url: '/test' } as any);
        expect(result).toBeFalse();
        uiServiceStub['fatalError'] = false;
      }
    ));

    it('should return true when user is authorized', inject(
      [AuthGuardService],
      (service: AuthGuardService) => {
        const authorizedUser = new UserAuthInfo();
        authorizedUser.isAuthorized = true;
        authSubject.next(authorizedUser);
        const result = service.canActivate({} as any, { url: '/test' } as any);
        expect(result).toBeTrue();
      }
    ));

    it('should trigger login when user is not authorized', inject(
      [AuthGuardService],
      (service: AuthGuardService) => {
        const unauthorizedUser = new UserAuthInfo();
        unauthorizedUser.isAuthorized = false;
        authSubject.next(unauthorizedUser);
        const result = service.checkLogin('/test');
        expect(result).toBeFalse();
        expect(authServiceStub.doLogin).toHaveBeenCalled();
      }
    ));
  });
});

type Safe = Record<string, unknown>;
