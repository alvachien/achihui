import { TestBed, inject } from '@angular/core/testing';

import { LearnStorageService } from './learn-storage.service';

describe('LearnStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LearnStorageService],
    });
  });

  it('should be created', inject([LearnStorageService], (service: LearnStorageService) => {
    expect(service).toBeTruthy();
  }));
});
