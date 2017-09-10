import { TestBed, inject } from '@angular/core/testing';

import { FinanceStorageService } from './finance-storage.service';

describe('FinanceStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FinanceStorageService],
    });
  });

  it('should be created', inject([FinanceStorageService], (service: FinanceStorageService) => {
    expect(service).toBeTruthy();
  }));
});
