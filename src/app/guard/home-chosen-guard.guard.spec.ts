import { TestBed, async, inject } from '@angular/core/testing';

import { HomeChosenGuardGuard } from './home-chosen-guard.guard';

describe('HomeChosenGuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HomeChosenGuardGuard]
    });
  });

  it('should ...', inject([HomeChosenGuardGuard], (guard: HomeChosenGuardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
