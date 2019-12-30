import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { Document, DocumentItem, financeDocTypeNormal, } from '../model';
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
  const orderAPIURL: any = environment.ApiUrl + `/api/FinanceOrders`;
  const documentAPIURL: any = environment.ApiUrl + `/api/FinanceDocuments`;

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
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name');
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
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name');
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
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name');
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
          && requrl.url === orderAPIURL
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
          && requrl.url === orderAPIURL
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
          && requrl.url === orderAPIURL
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
          && requrl.url === orderAPIURL
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
          && requrl.url === orderAPIURL
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
          && requrl.url === orderAPIURL
          && requrl.params.has('$expand')
          && requrl.params.has('$filter');
      });
      expect(req3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('createDocument', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceOdataService);

      let doc: Document = new Document();
      doc.Id = 100;
      doc.DocType = financeDocTypeNormal;
      doc.Desp = 'Test';
      doc.TranCurr = fakeData.chosedHome.BaseCurrency;
      doc.TranDate = moment();
      let ditem: DocumentItem = new DocumentItem();
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
      const msg: string = 'server failed';
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
            Items: [], 'ID': 94, 'HomeID': 1, 'DocType': 1, 'TranDate': '2019-04-12', 'TranCurr': 'CNY',
            'Desp': 'Test New ADP Doc | 5 / 12', 'ExgRate': 0.0, 'ExgRate_Plan': false, 'TranCurr2': null, 'ExgRate2': 0.0, 'ExgRate_Plan2': false,
            'TranAmount': -166.67, 'CreatedBy': 'a6319719-2f73-426d-9548-8dbcc25fe7a4',
            'CreatedAt': '2019-01-03', 'UpdatedBy': null, 'UpdatedAt': '0001-01-01'
          }],
        '@odata.count': 15
      });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
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
});
