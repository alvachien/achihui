import { TestBed, inject } from '@angular/core/testing';

import { HomeDefDetailService } from './home-def-detail.service';

describe('HomeDefDetailService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HomeDefDetailService],
    });
  });

  it('should be created', inject([HomeDefDetailService], (service: HomeDefDetailService) => {
    expect(service).toBeTruthy();
  }));
});
