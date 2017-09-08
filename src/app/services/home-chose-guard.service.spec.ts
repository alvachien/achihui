import { TestBed, inject } from '@angular/core/testing';

import { HomeChoseGuardService } from './home-chose-guard.service';

describe('HomeChoseGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HomeChoseGuardService]
    });
  });

  it('should be created', inject([HomeChoseGuardService], (service: HomeChoseGuardService) => {
    expect(service).toBeTruthy();
  }));
});
