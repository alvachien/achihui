import { TestBed, inject } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { FakeDataHelper } from '../../testing';
import { LanguageOdataService } from './language-odata.service';
import { environment } from '../../environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LanguageOdataService', () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */

  let httpTestingController: HttpTestingController;
  const dataAPIURL: any = environment.ApiUrl + '/Languages';
  let fakeData: FakeDataHelper;

  beforeEach(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildAppLanguageFromAPI();

    TestBed.configureTestingModule({
    imports: [],
    providers: [LanguageOdataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('1. service should be created', inject([LanguageOdataService], (service: LanguageOdataService) => {
    expect(service).toBeTruthy();
  }));

  describe('2. fetchAllLanguages', () => {
    let service: LanguageOdataService;

    beforeEach(() => {
      service = TestBed.inject(LanguageOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected languages (called once)', () => {
      expect(service.Languages.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllLanguages().subscribe({
        next: (langs: any) => {
          expect(langs.length)
            .withContext('should return expected languages')
            .toEqual(fakeData.appLanguagesFromAPI.length);
          expect(service.Languages.length)
            .withContext('should have buffered')
            .toEqual(fakeData.appLanguagesFromAPI.length);
        },
        error: () => {
          // Empty
        },
      });

      // Service should have made one request to GET languages from expected URL
      const req: any = httpTestingController.expectOne(dataAPIURL);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock languages
      req.flush({
        value: fakeData.appLanguagesFromAPI,
      });
    });

    it('should be OK returning no languages', () => {
      expect(service.Languages.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllLanguages().subscribe({
        next: (langs: any) => {
          expect(langs.length).withContext('should have empty languages array').toEqual(0);
          expect(service.Languages.length).withContext('should buffered nothing').toEqual(0);
        },
        error: () => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne(dataAPIURL);
      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllLanguages().subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne(dataAPIURL);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected languages (called multiple times)', () => {
      expect(service.Languages.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllLanguages().subscribe({
        next: (langs: any) => {
          expect(langs.length)
            .withContext('should return expected languages')
            .toEqual(fakeData.appLanguagesFromAPI.length);
          expect(langs.length).withContext('should have buffered').toEqual(service.Languages.length);
        },
        error: () => {
          // Do nothing
        },
      });

      const requests: any = httpTestingController.match(dataAPIURL);
      expect(requests.length).withContext('shall be only 1 calls to real API!').toEqual(1);
      requests[0].flush({
        value: fakeData.appLanguagesFromAPI,
      });
      httpTestingController.verify();

      // Second call
      expect(service.Languages.length)
        .withContext('buffer should not changed')
        .toEqual(fakeData.appLanguagesFromAPI.length);
      service.fetchAllLanguages().subscribe();
      const requests2: any = httpTestingController.match(dataAPIURL);
      expect(requests2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      expect(service.Languages.length)
        .withContext('buffer should not changed')
        .toEqual(fakeData.appLanguagesFromAPI.length);
      service.fetchAllLanguages().subscribe({
        next: (langs: any) => {
          expect(langs.length)
            .withContext('should return expected languages')
            .toEqual(fakeData.appLanguagesFromAPI.length);
        },
      });

      const requests3: any = httpTestingController.match(dataAPIURL);
      expect(requests3.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });
});
