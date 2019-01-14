import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EventStorageService } from './event-storage.service';

describe('EventStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        EventStorageService,
      ],
    });
  });

  it('should be created', inject([EventStorageService], (service: EventStorageService) => {
    expect(service).toBeTruthy();
  }));
});
