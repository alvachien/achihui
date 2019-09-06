import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { FakeDataHelper } from '../../../../src/testing';
import { FinCurrencyService } from './fin-currency.service';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

describe('FinCurrencyService', () => {
  let service: FinCurrencyService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  const currAPIURL: any = environment.ApiUrl + '/api/FinanceCurrency';
  let fakeData: FakeDataHelper;

  beforeEach(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrenciesFromAPI();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        FinCurrencyService,
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    // Inject the http, test controller, and service-under-test
    // as they will be referenced by each test.
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(FinCurrencyService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('1. service should be created', () => {
    expect(service).toBeTruthy();
  });

  /// FinCurrencyService method tests begin ///
  describe('2. fetchAllCurrencies', () => {
    beforeEach(() => {
      service = TestBed.get(FinCurrencyService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected currencies (called once)', () => {
      expect(service.Currencies.length).toEqual(0, 'should not buffered yet');

      service.fetchAllCurrencies().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.currenciesFromAPI.length, 'should return expected currencies');
          expect(service.Currencies.length).toEqual(fakeData.currenciesFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET currencies from expected URL
      const req: any = httpTestingController.expectOne(currAPIURL);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock currencies
      req.flush(fakeData.currenciesFromAPI);
    });

    it('should be OK returning no currencies', () => {
      expect(service.Currencies.length).toEqual(0, 'should not buffered yet');
      service.fetchAllCurrencies().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(0, 'should have empty currencies array');
          expect(service.Currencies.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne(currAPIURL);
      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllCurrencies().subscribe(
        (curries: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne(currAPIURL);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected currencies (called multiple times)', () => {
      expect(service.Currencies.length).toEqual(0, 'should not buffered yet');
      service.fetchAllCurrencies().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.currenciesFromAPI.length, 'should return expected currencies');
          expect(curries.length).toEqual(service.Currencies.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const requests: any = httpTestingController.match(currAPIURL);
      expect(requests.length).toEqual(1, 'shall be only 1 calls to real API!');
      requests[0].flush(fakeData.currenciesFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllCurrencies().subscribe();
      const requests2: any = httpTestingController.match(currAPIURL);
      expect(requests2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllCurrencies().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.currenciesFromAPI.length, 'should return expected currencies');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const requests3: any = httpTestingController.match(currAPIURL);
      expect(requests3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });
});
