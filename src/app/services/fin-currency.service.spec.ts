import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { asyncData, asyncError } from '../../testing/async-observable-helpers';
import { BehaviorSubject } from 'rxjs';

import { FakeDataHelper } from '../../testing';
import { Currency } from '../model';
import { FinCurrencyService } from './fin-currency.service';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { UserAuthInfo } from '../model';

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
    fakeData.buildCurrencies();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);
    const homeService: any = jasmine.createSpyObj('HomeDefService', ['ChosedHome', 'fetchHomeMembers']);
    const chosedHomeSpy: any = homeService.ChosedHome.and.returnValue(fakeData.chosedHome);
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue(fakeData.chosedHome.Members);

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
        curries => {
          expect(curries.length).toEqual(fakeData.currencies.length, 'should return expected currencies');
          expect(service.Currencies.length).toEqual(fakeData.currencies.length, 'should have buffered');
        },
        fail => {}
      );

      // Service should have made one request to GET currencies from expected URL
      const req = httpTestingController.expectOne(currAPIURL);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock currencies
      req.flush(fakeData.currencies);
    });

    it('should be OK returning no currencies', () => {
      expect(service.Currencies.length).toEqual(0, 'should not buffered yet');
      service.fetchAllCurrencies().subscribe(
        curries => {
          expect(curries.length).toEqual(0, 'should have empty currencies array');
          expect(service.Currencies.length).toEqual(0, 'should buffered nothing');
        },
        fail
      );

      const req = httpTestingController.expectOne(currAPIURL);
      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllCurrencies().subscribe(
        curries => {
          fail('expected to fail');
        },
        error => {
          expect(error).toContain(msg);
        }
      );

      const req = httpTestingController.expectOne(currAPIURL);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected currencies (called multiple times)', () => {
      service.fetchAllCurrencies().subscribe();
      service.fetchAllCurrencies().subscribe();
      service.fetchAllCurrencies().subscribe(
        curries => {
          expect(curries.length).toEqual(fakeData.currencies.length, 'should return expected currencies');
        },
        fail
      );

      const requests = httpTestingController.match(currAPIURL);
      expect(requests.length).toEqual(1, 'shall be only 1 calls to real API!');

      // Respond to each request with different mock hero results
      requests[0].flush(fakeData.currencies);
    });
  });
});
