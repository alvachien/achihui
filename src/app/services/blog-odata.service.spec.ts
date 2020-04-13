import { TestBed } from '@angular/core/testing';

import { BlogOdataService } from './blog-odata.service';

describe('BlogOdataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BlogOdataService = TestBed.get(BlogOdataService);
    expect(service).toBeTruthy();
  });
});
