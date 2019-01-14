import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { LanguageService } from './language.service';

describe('LanguageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        LanguageService,
      ],
    });
  });

  it('should be created', inject([LanguageService], (service: LanguageService) => {
    expect(service).toBeTruthy();
  }));
});
