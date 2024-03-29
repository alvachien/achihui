import { TestBed, inject } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';
import { UserAuthInfo } from '../model';
import { UIStatusService } from './uistatus.service';

describe('AuthGuardService', () => {
  const uiServiceStub: Partial<UIStatusService> = {};

  beforeAll(() => {
    uiServiceStub.fatalError = false;
  });

  beforeEach(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
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
});
