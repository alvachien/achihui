import { TestBed, inject } from '@angular/core/testing';

import { UIStatusService } from './uistatus.service';

describe('UIStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UIStatusService],
    });
  });

  it('should be created', inject([UIStatusService], (service: UIStatusService) => {
    expect(service).toBeTruthy();
  }));
});
