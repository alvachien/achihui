import { TestBed, inject } from '@angular/core/testing';

import { FinCurrencyService } from './fin-currency.service';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

describe('FinCurrencyService', () => {
  let service: FinCurrencyService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['']);
    TestBed.configureTestingModule({
      providers: [
        FinCurrencyService,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: httpClientSpy, userValue: httpClientSpy },
      ],
    });
  });

  it('should be created', inject([FinCurrencyService], (service2: FinCurrencyService) => {
    expect(service2).toBeTruthy();
  }));
});
