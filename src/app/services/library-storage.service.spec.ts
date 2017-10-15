import { TestBed, inject } from '@angular/core/testing';

import { LibraryStorageService } from './library-storage.service';

describe('LibraryStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LibraryStorageService]
    });
  });

  it('should be created', inject([LibraryStorageService], (service: LibraryStorageService) => {
    expect(service).toBeTruthy();
  }));
});
