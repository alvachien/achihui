import { TestBed, inject } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslocoService } from '@ngneat/transloco';
import { RouterTestingModule } from '@angular/router/testing';

import { getTranslocoModule } from '../../testing';
import { UIStatusService } from './uistatus.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UIStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule, getTranslocoModule()],
    providers: [UIStatusService, TranslocoService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
  });

  it('should be created', inject([UIStatusService], (service: UIStatusService) => {
    expect(service).toBeTruthy();
  }));

  it('properties', inject([UIStatusService], (service: UIStatusService) => {
    expect(service).toBeTruthy();

    service.latestError = 'error';
    expect(service.latestError).toBeTruthy();

    service.SelectedLoanTmp = null;
    expect(service.SelectedLoanTmp).toBeNull();

    service.CurrentLanguage = 'zh';
    expect(service.CurrentLanguage).toBeTruthy();
  }));
});
