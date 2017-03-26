import { TestBed, inject } from '@angular/core/testing';

import { BuffService } from './buff.service';

describe('BuffService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BuffService]
    });
  });

  it('should ...', inject([BuffService], (service: BuffService) => {
    expect(service).toBeTruthy();
  }));
});
