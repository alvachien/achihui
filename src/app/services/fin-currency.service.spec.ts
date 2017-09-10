import { TestBed, inject } from '@angular/core/testing';

import { FinCurrencyService } from './fin-currency.service';

describe('FinCurrencyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FinCurrencyService],
    });
  });

  it('should be created', inject([FinCurrencyService], (service: FinCurrencyService) => {
    expect(service).toBeTruthy();
  }));
});
