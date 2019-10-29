import { TestBed } from '@angular/core/testing';

import { HomeDefOdataService } from './home-def-odata.service';

describe('HomeDefOdataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HomeDefOdataService = TestBed.get(HomeDefOdataService);
    expect(service).toBeTruthy();
  });
});
