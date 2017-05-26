import { TestBed, async, inject } from '@angular/core/testing';

import { LoginGuardGuard } from './login-guard.guard';

describe('LoginGuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginGuardGuard]
    });
  });

  it('should ...', inject([LoginGuardGuard], (guard: LoginGuardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
