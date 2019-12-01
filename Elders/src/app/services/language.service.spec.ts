import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { FakeDataHelper } from '../../../../src/testing';
import { LanguageService } from './language.service';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

describe('LanguageService', () => {
  let httpTestingController: HttpTestingController;
  const curAPIURL: any = environment.ApiUrl + '/api/Language';
  let fakeData: FakeDataHelper;

  beforeEach(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildAppLanguageFromAPI();

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        LanguageService,
      ],
    });

    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('1. service should be created', inject([LanguageService], (service: LanguageService) => {
    expect(service).toBeTruthy();
  }));

  describe('2. fetchAllLanguages', () => {
    let service: LanguageService;

    beforeEach(() => {
      service = TestBed.get(LanguageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected languages (called once)', () => {
      expect(service.Languages.length).toEqual(0, 'should not buffered yet');
      service.fetchAllLanguages().subscribe(
        (langs: any) => {
          expect(langs.length).toEqual(fakeData.appLanguagesFromAPI.length, 'should return expected languages');
          expect(service.Languages.length).toEqual(fakeData.appLanguagesFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET languages from expected URL
      const req: any = httpTestingController.expectOne(curAPIURL);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock languages
      req.flush(fakeData.appLanguagesFromAPI);
    });

    it('should be OK returning no languages', () => {
      expect(service.Languages.length).toEqual(0, 'should not buffered yet');
      service.fetchAllLanguages().subscribe(
        (langs: any) => {
          expect(langs.length).toEqual(0, 'should have empty languages array');
          expect(service.Languages.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne(curAPIURL);
      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllLanguages().subscribe(
        (langs: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne(curAPIURL);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected languages (called multiple times)', () => {
      expect(service.Languages.length).toEqual(0, 'should not buffered yet');
      service.fetchAllLanguages().subscribe(
        (langs: any) => {
          expect(langs.length).toEqual(fakeData.appLanguagesFromAPI.length, 'should return expected languages');
          expect(langs.length).toEqual(service.Languages.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const requests: any = httpTestingController.match(curAPIURL);
      expect(requests.length).toEqual(1, 'shall be only 1 calls to real API!');
      requests[0].flush(fakeData.appLanguagesFromAPI);
      httpTestingController.verify();

      // Second call
      expect(service.Languages.length).toEqual(fakeData.appLanguagesFromAPI.length, 'buffer should not changed');
      service.fetchAllLanguages().subscribe();
      const requests2: any = httpTestingController.match(curAPIURL);
      expect(requests2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      expect(service.Languages.length).toEqual(fakeData.appLanguagesFromAPI.length, 'buffer should not changed');
      service.fetchAllLanguages().subscribe(
        (langs: any) => {
          expect(langs.length).toEqual(fakeData.appLanguagesFromAPI.length, 'should return expected languages');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const requests3: any = httpTestingController.match(curAPIURL);
      expect(requests3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });
});
