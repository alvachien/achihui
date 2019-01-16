import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { asyncData, asyncError } from '../../testing/async-observable-helpers';
import { BehaviorSubject } from 'rxjs';

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

  beforeEach(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const homeService: any = jasmine.createSpyObj('HomeDefService', ['ChosedHome', 'fetchHomeMembers']);
    const chosedHomeSpy: any = homeService.ChosedHome.and.returnValue( {
      _id: 1,
      BaseCurrency: 'CNY',
    });
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue([]);

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // /// FinCurrencyService method tests begin ///
  // describe('#fetchAllCurrencies', () => {
  //   let expectedCurrencies: Currency[];

  //   beforeEach(() => {
  //     service = TestBed.get(FinCurrencyService);
  //     expectedCurrencies = [
  //       { Currency: 'CUR1', Name: 'CUR1', Symbol: '$1', DisplayName: 'Curr 1' },
  //       { Currency: 'CUR2', Name: 'CUR2', Symbol: '$2', DisplayName: 'Curr 2' },
  //     ] as Currency[];
  //   });

  //   it('should return expected currencies (called once)', () => {
  //     service.fetchAllCurrencies().subscribe(
  //       curries => expect(curries).toEqual(expectedCurrencies, 'should return expected currencies'),
  //       fail
  //     );

  //     // HeroService should have made one request to GET heroes from expected URL
  //     const req = httpTestingController.expectOne(currAPIURL);
  //     expect(req.request.method).toEqual('GET');

  //     // Respond with the mock heroes
  //     req.flush(expectedCurrencies);
  //   });

  //   it('should be OK returning no currencies', () => {
  //     service.fetchAllCurrencies().subscribe(
  //       curries => expect(curries.length).toEqual(0, 'should have empty currencies array'),
  //       fail
  //     );

  //     const req = httpTestingController.expectOne(currAPIURL);
  //     req.flush([]); // Respond with no heroes
  //   });

  //   it('should turn 404 into a user-friendly error', () => {
  //     const msg = 'Deliberate 404';
  //     service.fetchAllCurrencies().subscribe(
  //       curries => fail('expected to fail'),
  //       error => expect(error.message).toContain(msg)
  //     );

  //     const req = httpTestingController.expectOne(currAPIURL);

  //     // respond with a 404 and the error message in the body
  //     req.flush(msg, { status: 404, statusText: 'Not Found' });
  //   });

  //   it('should return expected currencies (called multiple times)', () => {
  //     service.fetchAllCurrencies().subscribe();
  //     service.fetchAllCurrencies().subscribe();
  //     service.fetchAllCurrencies().subscribe(
  //       curries => expect(curries).toEqual(expectedCurrencies, 'should return expected currencies'),
  //       fail
  //     );

  //     const requests = httpTestingController.match(currAPIURL);
  //     expect(requests.length).toEqual(3, 'calls to fetchAllCurrencies()');

  //     // Respond to each request with different mock hero results
  //     requests[0].flush([]);
  //     requests[1].flush([{ id: 1, name: 'bob' }]);
  //     requests[2].flush(expectedCurrencies);
  //   });
  // });
});
