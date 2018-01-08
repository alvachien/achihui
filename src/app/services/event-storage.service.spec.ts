import { TestBed, inject } from '@angular/core/testing';

import { EventStorageService } from './event-storage.service';

describe('EventStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventStorageService]
    });
  });

  it('should be created', inject([EventStorageService], (service: EventStorageService) => {
    expect(service).toBeTruthy();
  }));
});
