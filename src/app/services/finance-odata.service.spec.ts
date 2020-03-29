import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { Document, DocumentItem, financeDocTypeNormal, RepeatFrequencyEnum, momentDateFormat,
  RepeatedDatesAPIInput, RepeatedDatesAPIOutput, RepeatedDatesWithAmountAPIInput, RepeatedDatesWithAmountAPIOutput,
  RepeatDatesWithAmountAndInterestAPIOutput, RepeatDatesWithAmountAndInterestAPIInput, ControlCenter,
  Order, Account, Plan, PlanTypeEnum, GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType, TemplateDocADP,
} from '../model';
import { FinanceOdataService, } from './finance-odata.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { FakeDataHelper } from '../../testing';
import { environment } from '../../environments/environment';

describe('FinanceOdataService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let fakeData: FakeDataHelper;
  let service: FinanceOdataService;
  const currAPIURL: any = environment.ApiUrl + `/api/Currencies`;
  const accountCategoryAPIURL: any =  environment.ApiUrl + `/api/FinanceAccountCategories`;
  const docTypeAPIURL: any = environment.ApiUrl + `/api/FinanceDocumentTypes`;
  const tranTypeAPIURL: any = environment.ApiUrl + `/api/FinanceTransactionTypes`;
  const assetCategoryAPIURL: any = environment.ApiUrl + `/api/FinanceAssetCategories`;
  const accountAPIURL: any = environment.ApiUrl + `/api/FinanceAccounts`;
  const ccAPIURL: any = environment.ApiUrl + `/api/FinanceControlCenters`;
  const documentAPIURL: any = environment.ApiUrl + `/api/FinanceDocuments`;
  const adpDocumentAPIURL: any = documentAPIURL + `/PostDPDocument`;
  const reportByAccountURL: any = environment.ApiUrl + `/api/FinanceReportByAccounts`;
  const reportByCCURL: any = environment.ApiUrl + `/api/FinanceReportByControlCenters`;
  const reportByOrderURL: any = environment.ApiUrl + `/api/FinanceReportByOrders`;

  beforeEach(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrenciesFromAPI();
    fakeData.buildFinConfigDataFromAPI();
    fakeData.buildFinAccountsFromAPI();
    fakeData.buildFinControlCenterFromAPI();
    fakeData.buildFinOrderFromAPI();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);
    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        FinanceOdataService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
      ],
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(FinanceOdataService);
  });

  it('should be created without data', () => {
    expect(service).toBeTruthy();
  });

  /// FinanceOdataService method tests begin ///
  describe('fetchAllCurrencies', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
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
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === currAPIURL
          && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

      // Respond with the mock currencies
      req.flush({
        '@odata.count': fakeData.currenciesFromAPI.length,
        value: fakeData.currenciesFromAPI
      });
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

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === currAPIURL
          && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

      req.flush({
        '@odata.count': 0,
        value: []
      }); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllCurrencies().subscribe(
        (curries: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === currAPIURL
          && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

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

      let requests: any = httpTestingController.match(callurl => {
        return callurl.url === currAPIURL
          && callurl.method === 'GET';
      });
      expect(requests.length).toEqual(1, 'shall be only 1 calls to real API!');
      requests[0].flush({
        '@odata.count': fakeData.currenciesFromAPI.length,
        value: fakeData.currenciesFromAPI,
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllCurrencies().subscribe();
      requests = httpTestingController.match(callurl => {
        return callurl.url === currAPIURL
          && callurl.method === 'GET';
      });
      expect(requests.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllCurrencies().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.currenciesFromAPI.length, 'should return expected currencies');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      requests = httpTestingController.match(currAPIURL);
      expect(requests.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllAccountCategories', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected account categories (called once)', () => {
      expect(service.AccountCategories.length).toEqual(0, 'should not buffered yet');

      service.fetchAllAccountCategories().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finAccountCategoriesFromAPI.length, 'should return expected account categories');
          expect(service.AccountCategories.length).toEqual(fakeData.finAccountCategoriesFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET account categories from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === accountCategoryAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,AssetFlag,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // Respond with the mock account categories
      req.flush({
        value: fakeData.finAccountCategoriesFromAPI
      });
    });

    it('should be OK returning no account categories', () => {
      expect(service.AccountCategories.length).toEqual(0, 'should not buffered yet');
      service.fetchAllAccountCategories().subscribe(
        (data: any) => {
          expect(data.length).toEqual(0, 'should have empty account categories array');
          expect(service.AccountCategories.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === accountCategoryAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,AssetFlag,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllAccountCategories().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === accountCategoryAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,AssetFlag,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected account categories (called multiple times)', () => {
      expect(service.AccountCategories.length).toEqual(0, 'should not buffered yet');
      service.fetchAllAccountCategories().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finAccountCategoriesFromAPI.length, 'should return expected account categories');
          expect(data.length).toEqual(service.AccountCategories.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );

      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL;
      });
      reqs[0].flush({
        value: fakeData.finAccountCategoriesFromAPI
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllAccountCategories().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL;
      });
      expect(req2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllAccountCategories().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finAccountCategoriesFromAPI.length, 'should return expected account categories');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const req3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL;
      });
      expect(req3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllAssetCategories', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected asset categories (called once)', () => {
      expect(service.AssetCategories.length).toEqual(0, 'should not buffered yet');

      service.fetchAllAssetCategories().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finAssetCategoriesFromAPI.length, 'should return expected asset categories');
          expect(service.AssetCategories.length).toEqual(fakeData.finAssetCategoriesFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET asset categories from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === assetCategoryAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Desp');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // Respond with the mock asset categories
      req.flush({
        value: fakeData.finAssetCategoriesFromAPI
      });
    });

    it('should be OK returning no asset categories', () => {
      expect(service.AssetCategories.length).toEqual(0, 'should not buffered yet');
      service.fetchAllAssetCategories().subscribe(
        (data: any) => {
          expect(data.length).toEqual(0, 'should have empty asset categories array');
          expect(service.AssetCategories.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === assetCategoryAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Desp');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllAssetCategories().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === assetCategoryAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Desp');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected asset categories (called multiple times)', () => {
      expect(service.AssetCategories.length).toEqual(0, 'should not buffered yet');
      service.fetchAllAssetCategories().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finAssetCategoriesFromAPI.length, 'should return expected asset categories');
          expect(data.length).toEqual(service.AssetCategories.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === assetCategoryAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
      reqs[0].flush({
        value: fakeData.finAssetCategoriesFromAPI
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllAssetCategories().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === assetCategoryAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(reqs2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllAssetCategories().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finAssetCategoriesFromAPI.length, 'should return expected asset categories');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === assetCategoryAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllDocTypes', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected doc types (called once)', () => {
      expect(service.DocumentTypes.length).toEqual(0, 'should not buffered yet');

      service.fetchAllDocTypes().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finDocTypesFromAPI.length, 'should return expected doc types');
          expect(service.DocumentTypes.length).toEqual(fakeData.finDocTypesFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET doc types from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === docTypeAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // Respond with the mock doc types
      req.flush({
        value: fakeData.finDocTypesFromAPI
      });
    });

    it('should be OK returning no doc types', () => {
      expect(service.DocumentTypes.length).toEqual(0, 'should not buffered yet');
      service.fetchAllDocTypes().subscribe(
        (data: any) => {
          expect(data.length).toEqual(0, 'should have empty doc types array');
          expect(service.DocumentTypes.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
        && requrl.url === docTypeAPIURL
        && requrl.params.has('$select')
        && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllDocTypes().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
        && requrl.url === docTypeAPIURL
        && requrl.params.has('$select')
        && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected doc types (called multiple times)', () => {
      expect(service.DocumentTypes.length).toEqual(0, 'should not buffered yet');
      service.fetchAllDocTypes().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finDocTypesFromAPI.length, 'should return expected doc types');
          expect(data.length).toEqual(service.DocumentTypes.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === docTypeAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
      reqs[0].flush({
        value: fakeData.finDocTypesFromAPI
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllDocTypes().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === docTypeAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(reqs2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllDocTypes().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finDocTypesFromAPI.length, 'should return expected doc types');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === docTypeAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllTranTypes', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected tran types (called once)', () => {
      expect(service.TranTypes.length).toEqual(0, 'should not buffered yet');

      service.fetchAllTranTypes().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finTranTypesFromAPI.length, 'should return expected tran types');
          expect(service.TranTypes.length).toEqual(fakeData.finTranTypesFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET tran types from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === tranTypeAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Expense,ParID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // Respond with the mock tran types
      req.flush({
        value: fakeData.finTranTypesFromAPI
      });
    });

    it('should be OK returning no tran types', () => {
      expect(service.TranTypes.length).toEqual(0, 'should not buffered yet');
      service.fetchAllTranTypes().subscribe(
        (data: any) => {
          expect(data.length).toEqual(0, 'should have empty tran types array');
          expect(service.TranTypes.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === tranTypeAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Expense,ParID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllTranTypes().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === tranTypeAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Expense,ParID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected tran types (called multiple times)', () => {
      expect(service.TranTypes.length).toEqual(0, 'should not buffered yet');
      service.fetchAllTranTypes().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finTranTypesFromAPI.length, 'should return expected tran types');
          expect(data.length).toEqual(service.TranTypes.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === tranTypeAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
      reqs[0].flush({
        value: fakeData.finTranTypesFromAPI
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllTranTypes().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === tranTypeAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(reqs2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllTranTypes().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finTranTypesFromAPI.length, 'should return expected tran');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === tranTypeAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllAccounts', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected account (called once)', () => {
      expect(service.Accounts.length).toEqual(0, 'should not buffered yet');

      service.fetchAllAccounts().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finAccountsFromAPI.length, 'should return expected account');
          expect(service.Accounts.length).toEqual(fakeData.finAccountsFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET account from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === accountAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,CategoryID,Status,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      // Respond with the mock account categories
      req.flush({
        value: fakeData.finAccountsFromAPI
      });
    });

    it('should be OK returning no accounts', () => {
      expect(service.Accounts.length).toEqual(0, 'should not buffered yet');
      service.fetchAllAccounts().subscribe(
        (data: any) => {
          expect(data.length).toEqual(0, 'should have empty account array');
          expect(service.Accounts.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
        && requrl.url === accountAPIURL
        && requrl.params.has('$select')
        && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,CategoryID,Status,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllAccounts().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === accountAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,CategoryID,Status,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected account (called multiple times)', () => {
      expect(service.Accounts.length).toEqual(0, 'should not buffered yet');
      service.fetchAllAccounts().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finAccountsFromAPI.length, 'should return expected account');
          expect(data.length).toEqual(service.Accounts.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === accountAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      reqs[0].flush({
        value: fakeData.finAccountsFromAPI
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllAccounts().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === accountAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllAccounts().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finAccountsFromAPI.length, 'should return expected accounts');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const req3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === accountAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('readAccount', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return Account in success case', () => {
      expect(service.Accounts.length).toEqual(0);
      service.readAccount(21).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          // Should be buffered
          expect(service.Accounts.length).toEqual(1);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.accountAPIUrl && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({value: [fakeData.finAccountsFromAPI[0]]});
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.readAccount(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.accountAPIUrl && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createAccount', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should be OK for create normal cash accounts', () => {
      expect(service.Accounts.length).toEqual(0, 'should not buffered yet');

      service.createAccount(fakeData.getFinCashAccountForCreation()).subscribe(
        (acnt: any) => {
          expect(service.Accounts.length).toEqual(1, 'should has buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === accountAPIURL;
      });

      req.flush(fakeData.getFinCashAccountForCreation()); // Respond with data
    });

    it('should be OK for create normal creditcard accounts', () => {
      expect(service.Accounts.length).toEqual(0, 'should not buffered yet');

      service.createAccount(fakeData.getFinCreditcardAccountForCreation()).subscribe(
        (acnt: any) => {
          expect(service.Accounts.length).toEqual(1, 'should has buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === accountAPIURL;
      });

      req.flush(fakeData.getFinCreditcardAccountForCreation()); // Respond with data
    });

    it('should return error for 404 error', () => {
      const msg = 'Deliberate 404';
      service.createAccount(fakeData.getFinCashAccountForCreation()).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === accountAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: msg });
    });

    it('should return error for 500 error', () => {
      const msg = '500: Internal error';
      service.createAccount(fakeData.getFinCashAccountForCreation()).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === accountAPIURL;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: msg });
    });
  });

  describe('fetchAllControlCenters', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected control centers (called once)', () => {
      expect(service.ControlCenters.length).toEqual(0, 'should not buffered yet');

      service.fetchAllControlCenters().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finControlCentersFromAPI.length, 'should return expected control center');
          expect(service.ControlCenters.length).toEqual(fakeData.finControlCentersFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === ccAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,ParentID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      // Respond with the mock cc
      req.flush({
        value: fakeData.finControlCentersFromAPI
      });
    });

    it('should be OK returning no control centers', () => {
      expect(service.ControlCenters.length).toEqual(0, 'should not buffered yet');
      service.fetchAllControlCenters().subscribe(
        (data: any) => {
          expect(data.length).toEqual(0, 'should have empty cc array');
          expect(service.ControlCenters.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === ccAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,ParentID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllControlCenters().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === ccAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,ParentID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected control centers (called multiple times)', () => {
      expect(service.ControlCenters.length).toEqual(0, 'should not buffered yet');
      service.fetchAllControlCenters().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finControlCentersFromAPI.length, 'should return expected cc');
          expect(data.length).toEqual(service.ControlCenters.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === ccAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      reqs[0].flush({
        value: fakeData.finControlCentersFromAPI
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllControlCenters().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === ccAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllControlCenters().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finControlCentersFromAPI.length, 'should return expected ccs');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const req3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === ccAPIURL
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });
      expect(req3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('readControlCenter', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return control center in success case', () => {
      expect(service.ControlCenters.length).toEqual(0);
      service.readControlCenter(21).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.ControlCenters.length).toBeGreaterThan(0);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.controlCenterAPIUrl && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({value: [fakeData.finControlCentersFromAPI[0]]});
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.readControlCenter(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.controlCenterAPIUrl && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createControlCenter', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should create a control center in success case', () => {
      expect(service.ControlCenters.length).toEqual(0);
      service.createControlCenter(new ControlCenter()).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.ControlCenters.length).toEqual(1);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.controlCenterAPIUrl;
      });

      // Respond with the mock data
      req.flush(fakeData.finControlCentersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createControlCenter(new ControlCenter()).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.controlCenterAPIUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('changeControlCenter', () => {
    let cc: ControlCenter;
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
      cc = new ControlCenter();
      cc.Id = 11;
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return order in success case', () => {
      expect(service.ControlCenters.length).toEqual(0);
      service.changeControlCenter(cc).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.ControlCenters.length).toEqual(1);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to PUT from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === service.controlCenterAPIUrl + '(11)';
      });

      // Respond with the mock data
      req.flush(fakeData.finOrdersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.changeControlCenter(cc).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === service.controlCenterAPIUrl + '(11)';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllOrders', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected orders (called once)', () => {
      expect(service.Orders.length).toEqual(0, 'should not buffered yet');

      service.fetchAllOrders().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finOrdersFromAPI.length, 'should return expected orders');
          expect(service.Orders.length).toEqual(fakeData.finOrdersFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.orderAPIUrl
          && requrl.params.has('$expand')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);
      expect(req.request.params.get('$expand')).toEqual(`SRule`);

      // Respond with the mock cc
      req.flush({
        value: fakeData.finOrdersFromAPI
      });
    });

    it('should be OK returning no order', () => {
      expect(service.Orders.length).toEqual(0, 'should not buffered yet');
      service.fetchAllOrders().subscribe(
        (data: any) => {
          expect(data.length).toEqual(0, 'should have empty order array');
          expect(service.Orders.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.orderAPIUrl
          && requrl.params.has('$expand')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);
      expect(req.request.params.get('$expand')).toEqual(`SRule`);

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllOrders().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.orderAPIUrl
          && requrl.params.has('$expand')
          && requrl.params.has('$filter');
      });
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);
      expect(req.request.params.get('$expand')).toEqual(`SRule`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected control centers (called multiple times)', () => {
      expect(service.Orders.length).toEqual(0, 'should not buffered yet');
      service.fetchAllOrders().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finOrdersFromAPI.length, 'should return expected cc');
          expect(data.length).toEqual(service.Orders.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.orderAPIUrl
          && requrl.params.has('$expand')
          && requrl.params.has('$filter');
      });
      reqs[0].flush({
        value: fakeData.finOrdersFromAPI
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllOrders().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.orderAPIUrl
          && requrl.params.has('$expand')
          && requrl.params.has('$filter');
      });
      expect(req2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllOrders().subscribe(
        (data: any) => {
          expect(data.length).toEqual(fakeData.finOrdersFromAPI.length, 'should return expected ccs');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const req3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.orderAPIUrl
          && requrl.params.has('$expand')
          && requrl.params.has('$filter');
      });
      expect(req3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('readOrder', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return order in success case', () => {
      expect(service.Orders.length).toEqual(0);
      service.readOrder(21).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.Orders.length).toEqual(1);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orderAPIUrl && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({value: [fakeData.finOrdersFromAPI[0]]});
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.readOrder(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orderAPIUrl && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createOrder', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should create an order in success case', () => {
      expect(service.Orders.length).toEqual(0);
      service.createOrder(new Order()).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.Orders.length).toEqual(1);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.orderAPIUrl;
      });

      // Respond with the mock data
      req.flush(fakeData.finOrdersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createOrder(new Order()).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.orderAPIUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('changeOrder', () => {
    let ord: Order;
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
      ord = new Order();
      ord.Id = 11;
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return order in success case', () => {
      expect(service.Orders.length).toEqual(0);
      service.changeOrder(ord).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.Orders.length).toEqual(1);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to PUT from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === service.orderAPIUrl + '/11' && requrl.params.has('hid');
      });

      // Respond with the mock data
      req.flush(fakeData.finOrdersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.changeOrder(ord).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === service.orderAPIUrl + '/11' && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllPlans', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllPlans().subscribe(
        (data: Plan[]) => {
          expect(data.length).toEqual(1);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.planAPIUrl
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [{
          id: 1, hid: 1, planType: 0, accountID: 4,
          startDate: '2019-03-23', targetDate: '2019-04-23', targetBalance: 10.00, tranCurr: 'CNY',
          description: 'Test plan 1', createdBy: 'aaa', createdAt: '2019-03-23'
        }]
      });
    });

    it('should fetch data only once (call multiple times)', () => {
      service.fetchAllPlans().subscribe(
        (data: Plan[]) => {
          expect(data.length).toEqual(1);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.planAPIUrl
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [{
          id: 1, hid: 1, planType: 0, accountID: 4,
          startDate: '2019-03-23', targetDate: '2019-04-23', targetBalance: 10.00, tranCurr: 'CNY',
          description: 'Test plan 1', createdBy: 'aaa', createdAt: '2019-03-23'
        }]
      });

      httpTestingController.verify();

      // Second call
      service.fetchAllPlans().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.planAPIUrl
          && requrl.params.has('$filter');
      });
      expect(req2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchAllPlans().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.planAPIUrl
          && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('readPlan', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return plan in success case', () => {
      service.readPlan(21).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.planAPIUrl;
      });

      // Respond with the mock data
      const planData: Plan = new Plan();
      planData.StartDate = moment();
      planData.AccountCategoryID = 1;
      planData.AccountID = 21;
      planData.Description = 'test';
      planData.PlanType = PlanTypeEnum.Account;
      planData.TargetBalance = 20;
      planData.TranCurrency = 'CNY';
      planData.ID = 21;
      req.flush({
        value: [planData.writeJSONObject()],
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.readPlan(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.planAPIUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createPlan', () => {
    let planData: Plan;
    beforeEach(() => {
      planData = new Plan();
      planData.StartDate = moment();
      planData.AccountCategoryID = 1;
      planData.AccountID = 21;
      planData.Description = 'test';
      planData.PlanType = PlanTypeEnum.Account;
      planData.TargetBalance = 20;
      planData.TranCurrency = 'CNY';
      planData.ID = 21;
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should create a plan in success case', () => {
      service.createPlan(planData).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.planAPIUrl;
      });

      // Respond with the mock data
      req.flush(planData.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createPlan(planData).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.planAPIUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createDocument', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);

      const doc: Document = new Document();
      doc.Id = 100;
      doc.DocType = financeDocTypeNormal;
      doc.Desp = 'Test';
      doc.TranCurr = fakeData.chosedHome.BaseCurrency;
      doc.TranDate = moment();
      const ditem: DocumentItem = new DocumentItem();
      ditem.ItemId = 1;
      ditem.AccountId = 11;
      ditem.ControlCenterId = 1;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      ditem.TranAmount = 20;
      doc.Items = [ditem];
      fakeData.setFinNormalDocumentForCreate(doc);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for normal doc', () => {
      service.createDocument(fakeData.finNormalDocumentForCreate).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === documentAPIURL;
      });

      // Respond with the mock data
      req.flush(fakeData.finNormalDocumentForCreate.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createDocument(fakeData.finNormalDocumentForCreate).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === documentAPIURL;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createDocumentFromDPTemplate', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceTmpDPDocuments';
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.createDocumentFromDPTemplate({ DocId: 100 } as TemplateDocADP).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl
          && requrl.params.has('hid') && requrl.params.has('docid');
      });

      // Respond with the mock data
      req.flush({ id: 100 });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.createDocumentFromDPTemplate({ DocId: 100 } as TemplateDocADP).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl
          && requrl.params.has('hid') && requrl.params.has('docid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('deleteDocument', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.deleteDocument(1).subscribe(
        (data: any) => {
          // expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to DELETE from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE'
          && requrl.url === service.documentAPIUrl + '(1)';
      });

      // Respond with the mock data
      req.flush('', { status: 200, statusText: 'OK' });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.deleteDocument(1).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      // Service should have made one request to DELETE from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE'
          && requrl.url === service.documentAPIUrl + '(1)';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllDocuments', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllDocuments(moment(), moment().add(1, 'M'), 100, 10).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.documentAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter')
          && requrl.params.has('$orderby')
          && requrl.params.has('$top')
          && requrl.params.has('$skip')
          && requrl.params.has('$count')
          && requrl.params.has('$expand');
      });

      // Respond with the mock data
      req.flush({
        value: [
          {
            Items: [], ID: 94, HomeID: 1, DocType: 1, TranDate: '2019-04-12', TranCurr: 'CNY',
            Desp: 'Test New ADP Doc | 5 / 12', ExgRate: 0.0, ExgRate_Plan: false, TranCurr2: null,
            ExgRate2: 0.0, ExgRate_Plan2: false,
            TranAmount: -166.67, CreatedBy: 'a6319719-2f73-426d-9548-8dbcc25fe7a4',
            CreatedAt: '2019-01-03', UpdatedBy: null, UpdatedAt: '0001-01-01'
          }],
        '@odata.count': 15
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchAllDocuments(moment(), moment().add(1, 'M'), 10, 0).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.documentAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter')
          && requrl.params.has('$orderby')
          && requrl.params.has('$top')
          && requrl.params.has('$skip')
          && requrl.params.has('$count')
          && requrl.params.has('$expand');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });
  
  describe('fetchAllDPTmpDocs', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceTmpDPDocuments';

    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.fetchAllDPTmpDocs(moment(), moment().add(1, 'w')).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl && requrl.params.has('hid');
      });

      // Respond with the mock data
      req.flush([
        {
          'hid': 1, 'docID': 649, 'refDocID': null, 'accountID': 81, 'tranDate': '2019-02-26',
          'tranType': 59, 'tranAmount': 240.00, 'controlCenterID': 13,
          'orderID': null, 'desp': '安安钢琴课-2019上半年 | 8 / 25', 'createdBy': 'aaa', 'createdAt': '2019-01-08',
          'updatedBy': null, 'updatedAt': '0001-01-01'
        },
        {
          'hid': 1, 'docID': 582, 'refDocID': null, 'accountID': 79, 'tranDate': '2019-02-23',
          'tranType': 59, 'tranAmount': 117.82, 'controlCenterID': 12,
          'orderID': null, 'desp': '多多2019羽毛球课48节(寒暑假除外) | 8 / 55', 'createdBy': 'aaa', 'createdAt': '2018-12-27',
          'updatedBy': null, 'updatedAt': '0001-01-01'
        },
        {
          'hid': 1, 'docID': 493, 'refDocID': null, 'accountID': 66, 'tranDate': '2019-02-23',
          'tranType': 59, 'tranAmount': 217.53, 'controlCenterID': 13,
          'orderID': null, 'desp': '安安吉的堡2018.9-2019.8报名 | 24 / 49', 'createdBy': 'aaa', 'createdAt': '2018-10-07',
          'updatedBy': null, 'updatedAt': '0001-01-01'
        },
        {
          'hid': 1, 'docID': 552, 'refDocID': null, 'accountID': 76, 'tranDate': '2019-02-23',
          'tranType': 59, 'tranAmount': 240.00, 'controlCenterID': 12,
          'orderID': null, 'desp': '多多钢琴课 | 17 / 25', 'createdBy': 'aaa', 'createdAt': '2018-11-04', 'updatedBy': null, 'updatedAt': '0001-01-01'
        },
        {
          'hid': 1, 'docID': 263, 'refDocID': null, 'accountID': 26, 'tranDate': '2019-02-19',
          'tranType': 59, 'tranAmount': 350.00, 'controlCenterID': 10,
          'orderID': null, 'desp': '买课 | 71/72', 'createdBy': 'aaa', 'createdAt': '2017-10-10', 'updatedBy': null, 'updatedAt': '0001-01-01'
        },
      ]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.fetchAllDPTmpDocs(moment(), moment().add(1, 'w')).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllLoanTmpDocs', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceTmpLoanDocuments';

    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.fetchAllLoanTmpDocs(moment(), moment().add(1, 'w')).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl && requrl.params.has('hid');
      });

      // Respond with the mock data
      req.flush(`[{'hid':1, 'docID':397, 'refDocID':null, 'accountID':58, 'tranDate':'2019-02-22', 'tranAmount':3653.63, 'interestAmount':9782.60,
        'controlCenterID':8, 'orderID':null, 'desp':'201807昌邑路房产商业贷款 | 6 / 360', 'createdBy':'aaa',
        'createdAt':'2018-09-07', 'updatedBy':null, 'updatedAt':'0001-01-01'}]`);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.fetchAllLoanTmpDocs(moment(), moment().add(1, 'w')).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createADPDocument', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);

      fakeData.buildFinADPDocumentForCreate();
      fakeData.buildFinAccountExtraAdvancePayment();
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for normal doc', () => {
      service.createADPDocument(fakeData.finADPDocumentForCreate, fakeData.finAccountExtraAdvancePayment, true).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === adpDocumentAPIURL;
      });

      // Respond with the mock data
      req.flush(fakeData.finADPDocumentForCreate.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createADPDocument(fakeData.finADPDocumentForCreate, fakeData.finAccountExtraAdvancePayment, true).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === adpDocumentAPIURL;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createAssetBuyinDocument', () => {
    let apiurl: string;

    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
      apiurl = service.documentAPIUrl + '/PostAssetBuyDocument';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for normal doc', () => {
      service.createAssetBuyinDocument(fakeData.buildFinAssetBuyInDocumentForCreate()).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush(100);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createAssetBuyinDocument(fakeData.buildFinAssetBuyInDocumentForCreate()).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createAssetSoldoutDocument', () => {
    let apiurl: string;
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
      apiurl = service.documentAPIUrl + '/PostAssetSellDocument';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for normal doc', () => {
      service.createAssetSoldoutDocument(fakeData.buildFinAssetSoldoutDocumentForCreate()).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush(100);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createAssetSoldoutDocument(fakeData.buildFinAssetSoldoutDocumentForCreate()).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createAssetValChgDocument', () => {
    let apiurl: string;
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
      apiurl = service.documentAPIUrl + '/PostAssetValueChangeDocument';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for normal doc', () => {
      service.createAssetValChgDocument(fakeData.buildFinAssetValueChangeDocumentForCreate()).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush(100);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createAssetValChgDocument(fakeData.buildFinAssetValueChangeDocumentForCreate()).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createLoanDocument', () => {
    let apiurl: string;
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
      apiurl = service.documentAPIUrl + '/PostLoanDocument';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.createLoanDocument(new Document(), new Account()).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush(100);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createLoanDocument(new Document(), new Account()).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createLoanRepayDoc', () => {
    let apiurl: string;
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
      apiurl = service.documentAPIUrl + '/PostLoanRepayDocument';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.createLoanRepayDoc(new Document(), 22, 1).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush(100);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createLoanRepayDoc(new Document(), 22, 1).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllReportsByAccount', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllReportsByAccount().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByAccountURL
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          { HomeID: 1, AccountID: 1, DebitBalance: 3, CreditBalance: 1, Balance: 2 }
        ],
        '@odata.count': 1
      });
    });

    it('shall fetch data only once when call multiple times', () => {
      service.fetchAllReportsByAccount().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByAccountURL
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          { HomeID: 1, AccountID: 1, DebitBalance: 3, CreditBalance: 1, Balance: 2 }
        ],
        '@odata.count': 1
      });

      httpTestingController.verify();
      service.fetchAllReportsByAccount().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByAccountURL
          && requrl.params.has('$filter');
      });
      expect(req2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchAllReportsByAccount().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByAccountURL
          && requrl.params.has('$filter');
    });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllReportsByControlCenter', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllReportsByControlCenter().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByCCURL
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          { HomeID: 1, ControlCenterID: 1, DebitBalance: 3, CreditBalance: 1, Balance: 2 }
        ],
        '@odata.count': 1
      });
    });

    it('should fetch data only onece when call multiple times', () => {
      service.fetchAllReportsByControlCenter().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByCCURL
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          { HomeID: 1, ControlCenterID: 1, DebitBalance: 3, CreditBalance: 1, Balance: 2 }
        ],
        '@odata.count': 1
      });

      httpTestingController.verify();
      service.fetchAllReportsByControlCenter().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByCCURL
          && requrl.params.has('$filter');
      });
      expect(req2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchAllReportsByControlCenter().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByCCURL
          && requrl.params.has('$filter');
    });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllReportsByOrder', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllReportsByOrder().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByOrderURL
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          { HomeID: 1, OrderID: 1, DebitBalance: 3, CreditBalance: 1, Balance: 2 }
        ],
        '@odata.count': 1
      });
    });

    it('should call only once when call multiple times', () => {
      service.fetchAllReportsByOrder().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByOrderURL
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          { HomeID: 1, OrderID: 1, DebitBalance: 3, CreditBalance: 1, Balance: 2 }
        ],
        '@odata.count': 1
      });

      httpTestingController.verify();
      service.fetchAllReportsByOrder().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByOrderURL
          && requrl.params.has('$filter');
      });
      expect(req2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchAllReportsByOrder().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === reportByOrderURL
          && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('calcADPTmpDocs', () => {
    const calcADPTmpAPIURL: any = environment.ApiUrl + '/api/GetRepeatedDatesWithAmount';
    let inputData: RepeatedDatesWithAmountAPIInput;
    let outputData: RepeatedDatesWithAmountAPIOutput[];

    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
      inputData = {
        TotalAmount: 200,
        StartDate: moment(),
        EndDate: moment().add(1, 'y'),
        RepeatType: RepeatFrequencyEnum.Month,
        Desp: 'test',
      };
      outputData = [];
      for (let i = 0; i < 10; i++) {
        const rst: RepeatedDatesWithAmountAPIOutput = {
          TranDate: moment().add(i, 'M'),
          TranAmount: 20,
          Desp: `test${i}`,
        };
        outputData.push(rst);
      }
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected ADP temp docs', () => {
      service.calcADPTmpDocs(inputData).subscribe(
        (data: any) => {
          expect(data.length).toEqual(outputData.length, 'should return expected numbers');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === calcADPTmpAPIURL;
      });

      // Respond with the mock data
      req.flush({value: outputData});
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.calcADPTmpDocs(inputData).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === calcADPTmpAPIURL;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('calcLoanTmpDocs', () => {
    const calcLoanTmpAPIURL: any = environment.ApiUrl + '/api/GetRepeatedDatesWithAmountAndInterest';
    let inputData: RepeatDatesWithAmountAndInterestAPIInput;
    let outputData: RepeatDatesWithAmountAndInterestAPIOutput[];

    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);

      inputData = {
        TotalAmount: 10000,
        TotalMonths: 12,
        InterestRate: 0,
        StartDate: moment(),
        EndDate: moment().add(1, 'y'),
        InterestFreeLoan: true,
        RepaymentMethod: 1,
        FirstRepayDate: moment(),
        RepayDayInMonth: 1,
      };
      outputData = [];
      for (let i = 0; i < 10; i++) {
        const od: any = {
          tranDate: moment().add(i, 'M'),
          tranAmount: 100,
          interestAmount: 0,
        };
        outputData.push(od);
      }
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected result', () => {
      service.calcLoanTmpDocs(inputData).subscribe(
        (data: any) => {
          expect(data.length).toEqual(outputData.length, 'should return expected data');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to POST
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === calcLoanTmpAPIURL;
      });

      // Respond with the mock data
      req.flush({value: outputData});
    });

    it('should return error in case error appear', () => {
      const msg = 'Error occurred';
      service.calcLoanTmpDocs(inputData).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === calcLoanTmpAPIURL;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'Error occurred' });
    });
  });

  describe('getDocumentItemByAccount', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data in success case', () => {
      service.getDocumentItemByAccount(21, 100, 100, moment(), moment().add(1, 'y')).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter')
          && requrl.params.has('$top')
          && requrl.params.has('$skip');
      });

      // Respond with the mock data
      req.flush({ totalCount: 0, contentList: [] });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.getDocumentItemByAccount(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter')
          ;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('getDocumentItemByControlCenter', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data in success case', () => {
      service.getDocumentItemByControlCenter(21, 100, 100, moment(), moment().add(1, 'y')).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$filter')
          && requrl.params.has('$select')
          && requrl.params.has('$top')
          && requrl.params.has('$skip');
      });

      // Respond with the mock data
      req.flush({ totalCount: 0, contentList: [] });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.getDocumentItemByControlCenter(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('getDocumentItemByOrder', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data in success case', () => {
      service.getDocumentItemByOrder(21, 100, 0, moment(), moment().add(1, 'y')).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({ totalCount: 0, contentList: [] });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.getDocumentItemByOrder(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter')
          ;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('searchDocItem', () => {
    const arFilters: GeneralFilterItem[] = [];
    let objrst: any = {};

    beforeAll(() => {
      objrst = {
        '@odata.context': 'http://localhost:25688/api/$metadata#FinanceDocumentItemViews(DocumentID,ItemID,TransactionDate,AccountID,TransactionType,Currency,OriginAmount,Amount,ControlCenterID,OrderID,ItemDesp)',
        '@odata.count': 2,
        value: [{
          DocumentID: 668, ItemID: 1, TransactionDate: '2018-03-27', AccountID: 8, TransactionType: 3, Currency: 'CNY',
          OriginAmount: 30.00, Amount: 30.00, ControlCenterID: 9, OrderID: null, ItemDesp: '3\u6708\u4efd\u5de5\u8d44'
        }, {
          DocumentID: 688, ItemID: 2, TransactionDate: '2018-04-26', AccountID: 8, TransactionType: 3, Currency: 'CNY',
          OriginAmount: 254.22, Amount: 254.22, ControlCenterID: 9, OrderID: null, ItemDesp: 'Alva 04\u5de5\u8d44'
        }],
      };
    });

    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for Equal case', () => {
      const item: GeneralFilterItem = new GeneralFilterItem();
      item.fieldName = 'TransactionDate';
      item.operator = GeneralFilterOperatorEnum.Equal;
      item.valueType = GeneralFilterValueType.date;
      item.lowValue = '2020-02-03';
      arFilters.push(item);

      service.searchDocItem(arFilters, 100, 10).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush(objrst);
    });

    it('should return data for Between case', () => {
      const item: GeneralFilterItem = new GeneralFilterItem();
      item.fieldName = 'TransactionDate';
      item.operator = GeneralFilterOperatorEnum.Between;
      item.valueType = GeneralFilterValueType.date;
      item.lowValue = '2020-02-03';
      item.highValue = '2020-12-31';
      arFilters.push(item);

      service.searchDocItem(arFilters, 100, 10).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush(objrst);
    });

    it('should return data for Between case', () => {
      const item: GeneralFilterItem = new GeneralFilterItem();
      item.fieldName = 'TransactionDate';
      item.operator = GeneralFilterOperatorEnum.Between;
      item.valueType = GeneralFilterValueType.date;
      item.lowValue = '2020-02-03';
      item.highValue = '2020-12-31';
      arFilters.push(item);

      service.searchDocItem(arFilters, 100, 10).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush(objrst);
    });

    it('should return data for greater than case', () => {
      const item: GeneralFilterItem = new GeneralFilterItem();
      item.fieldName = 'TransactionDate';
      item.operator = GeneralFilterOperatorEnum.LargerThan;
      item.valueType = GeneralFilterValueType.date;
      item.lowValue = '2020-02-03';
      arFilters.push(item);

      service.searchDocItem(arFilters, 100, 10).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush(objrst);
    });

    it('should return data for greater or equal case', () => {
      const item: GeneralFilterItem = new GeneralFilterItem();
      item.fieldName = 'TransactionDate';
      item.operator = GeneralFilterOperatorEnum.LargerEqual;
      item.valueType = GeneralFilterValueType.date;
      item.lowValue = '2020-02-03';
      arFilters.push(item);

      service.searchDocItem(arFilters, 100, 10).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush(objrst);
    });

    it('should return data for less or equal case', () => {
      const item: GeneralFilterItem = new GeneralFilterItem();
      item.fieldName = 'TransactionDate';
      item.operator = GeneralFilterOperatorEnum.LessEqual;
      item.valueType = GeneralFilterValueType.date;
      item.lowValue = '2020-02-03';
      arFilters.push(item);

      service.searchDocItem(arFilters, 100, 10).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush(objrst);
    });

    it('should return data for less case', () => {
      const item: GeneralFilterItem = new GeneralFilterItem();
      item.fieldName = 'TransactionDate';
      item.operator = GeneralFilterOperatorEnum.LessThan;
      item.valueType = GeneralFilterValueType.date;
      item.lowValue = '2020-02-03';
      arFilters.push(item);

      service.searchDocItem(arFilters, 100, 10).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush(objrst);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.searchDocItem(arFilters).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.docItemViewAPIUrl
          && requrl.params.has('$select')
          && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('getRepeatedDates', () => {
    const apiurl: any = environment.ApiUrl + '/api/GetRepeatedDates';
    let inputData: RepeatedDatesAPIInput;
    let outputData: RepeatedDatesAPIOutput[];

    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);

      inputData = {
        StartDate: moment(),
        EndDate: moment().add(1, 'y'),
        RepeatType: RepeatFrequencyEnum.Month
      };
      outputData = [];
      for (let i = 0; i < 10; i++) {
        const od: any = {
          StartDate: moment().add(i, 'M'),
          EndDate: moment().add(i + 1, 'M'),
        };
        outputData.push(od);
      }
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected result', () => {
      service.getRepeatedDates(inputData).subscribe(
        (data: any) => {
          expect(data.length).toEqual(outputData.length, 'should return expected data');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to POST
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush(outputData);
    });

    it('should return error in case error appear', () => {
      const msg = 'Error occurred';
      service.getRepeatedDates(inputData).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'Error occurred' });
    });
  });
});
