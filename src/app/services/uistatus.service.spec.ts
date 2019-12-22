import { TestBed, inject } from '@angular/core/testing';
import { TranslocoService } from '@ngneat/transloco';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HttpLoaderTestFactory } from '../../testing';
import { UIStatusService } from './uistatus.service';

describe('UIStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslocoService,
      ],
      providers: [
        UIStatusService,
        TranslocoService,
      ],
    });
  });

  it('should be created', inject([UIStatusService], (service: UIStatusService) => {
    expect(service).toBeTruthy();
  }));
});