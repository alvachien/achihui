import { TestBed, inject } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';
import { UserAuthInfo } from '../model';

describe('AuthGuardService', () => {
  beforeEach(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        AuthService,
      ],
    });
  });

  it('should be created', inject([AuthGuardService], (service: AuthGuardService) => {
    expect(service).toBeTruthy();
  }));
});
