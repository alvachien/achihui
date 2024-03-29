import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import {
  Document,
  DocumentItem,
  financeDocTypeNormal,
  RepeatFrequencyEnum,
  momentDateFormat,
  RepeatedDatesAPIInput,
  RepeatedDatesAPIOutput,
  RepeatedDatesWithAmountAPIInput,
  RepeatedDatesWithAmountAPIOutput,
  RepeatDatesWithAmountAndInterestAPIOutput,
  RepeatDatesWithAmountAndInterestAPIInput,
  ControlCenter,
  Order,
  Account,
  Plan,
  PlanTypeEnum,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  TemplateDocADP,
} from '../model';
import { FinanceOdataService } from './finance-odata.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { FakeDataHelper } from '../../testing';
import { environment } from '../../environments/environment';
import { SafeAny } from 'src/common';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
describe('FinanceOdataService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let fakeData: FakeDataHelper;
  let service: FinanceOdataService;
  const currAPIURL: any = environment.ApiUrl + `/Currencies`;
  const accountCategoryAPIURL: any = environment.ApiUrl + `/FinanceAccountCategories`;
  const docTypeAPIURL: any = environment.ApiUrl + `/FinanceDocumentTypes`;
  const tranTypeAPIURL: any = environment.ApiUrl + `/FinanceTransactionTypes`;
  const assetCategoryAPIURL: any = environment.ApiUrl + `/FinanceAssetCategories`;
  const accountAPIURL: any = environment.ApiUrl + `/FinanceAccounts`;
  const ccAPIURL: any = environment.ApiUrl + `/FinanceControlCenters`;
  const documentAPIURL: any = environment.ApiUrl + `/FinanceDocuments`;
  const adpDocumentAPIURL: any = documentAPIURL + `/PostDPDocument`;
  const reportAPIUrl: string = environment.ApiUrl + '/FinanceReports';
  const reportByTranTypeURL: string = reportAPIUrl + '/GetReportByTranType';
  const reportByAccountURL: any = reportAPIUrl + `/GetReportByAccount`;
  const reportByCCURL: any = reportAPIUrl + `/GetReportByControlCenter`;
  const reportByOrderURL: any = reportAPIUrl + `/GetReportByOrder`;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrenciesFromAPI();
    fakeData.buildFinConfigDataFromAPI();
    fakeData.buildFinAccountsFromAPI();
    fakeData.buildFinControlCenterFromAPI();
    fakeData.buildFinOrderFromAPI();
  });

  beforeEach(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);
    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FinanceOdataService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(FinanceOdataService);
  });

  it('should be created without data', () => {
    expect(service).toBeTruthy();
  });

  /// FinanceOdataService method tests begin ///
  describe('fetchAllCurrencies', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected currencies (called once)', () => {
      expect(service.Currencies.length).withContext('should not buffered yet').toEqual(0);

      service.fetchAllCurrencies().subscribe({
        next: (curries: any) => {
          expect(curries.length)
            .withContext('should return expected currencies')
            .toEqual(fakeData.currenciesFromAPI.length);
          expect(service.Currencies.length)
            .withContext('should have buffered')
            .toEqual(fakeData.currenciesFromAPI.length);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      // Service should have made one request to GET currencies from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === currAPIURL && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

      // Respond with the mock currencies
      req.flush({
        '@odata.count': fakeData.currenciesFromAPI.length,
        value: fakeData.currenciesFromAPI,
      });
    });

    it('should be OK returning no currencies', () => {
      expect(service.Currencies.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllCurrencies().subscribe({
        next: (curries: any) => {
          expect(curries.length).withContext('should have empty currencies array').toEqual(0);
          expect(service.Currencies.length).withContext('should buffered nothing').toEqual(0);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === currAPIURL && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

      req.flush({
        '@odata.count': 0,
        value: [],
      }); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchAllCurrencies().subscribe({
        next: (curries: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === currAPIURL && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected currencies (called multiple times)', () => {
      expect(service.Currencies.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllCurrencies().subscribe({
        next: (curries: any) => {
          expect(curries.length)
            .withContext('should return expected currencies')
            .toEqual(fakeData.currenciesFromAPI.length);
          expect(curries.length).withContext('should have buffered').toEqual(service.Currencies.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });

      let requests: any = httpTestingController.match((callurl) => {
        return callurl.url === currAPIURL && callurl.method === 'GET';
      });
      expect(requests.length).withContext('shall be only 1 calls to real API!').toEqual(1);
      requests[0].flush({
        '@odata.count': fakeData.currenciesFromAPI.length,
        value: fakeData.currenciesFromAPI,
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllCurrencies().subscribe();
      requests = httpTestingController.match((callurl) => {
        return callurl.url === currAPIURL && callurl.method === 'GET';
      });
      expect(requests.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllCurrencies().subscribe({
        next: (curries: any) => {
          expect(curries.length)
            .withContext('should return expected currencies')
            .toEqual(fakeData.currenciesFromAPI.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });

      requests = httpTestingController.match(currAPIURL);
      expect(requests.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  describe('fetchAllAccountCategories', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected account categories (called once)', () => {
      expect(service.AccountCategories.length).withContext('should not buffered yet').toEqual(0);

      service.fetchAllAccountCategories().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected account categories')
            .toEqual(fakeData.finAccountCategoriesFromAPI.length);
          expect(service.AccountCategories.length)
            .withContext('should have buffered')
            .toEqual(fakeData.finAccountCategoriesFromAPI.length);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      // Service should have made one request to GET account categories from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === accountCategoryAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,AssetFlag,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // Respond with the mock account categories
      req.flush({
        value: fakeData.finAccountCategoriesFromAPI,
      });
    });

    it('should be OK returning no account categories', () => {
      expect(service.AccountCategories.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllAccountCategories().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should have empty account categories array').toEqual(0);
          expect(service.AccountCategories.length).withContext('should buffered nothing').toEqual(0);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === accountCategoryAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,AssetFlag,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchAllAccountCategories().subscribe({
        next: (data: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === accountCategoryAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,AssetFlag,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected account categories (called multiple times)', () => {
      expect(service.AccountCategories.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllAccountCategories().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected account categories')
            .toEqual(fakeData.finAccountCategoriesFromAPI.length);
          expect(data.length).withContext('should have buffered').toEqual(service.AccountCategories.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });

      const reqs: any = httpTestingController.match((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL;
      });
      reqs[0].flush({
        value: fakeData.finAccountCategoriesFromAPI,
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllAccountCategories().subscribe();
      const req2: any = httpTestingController.match((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL;
      });
      expect(req2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllAccountCategories().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected account categories')
            .toEqual(fakeData.finAccountCategoriesFromAPI.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });
      const req3: any = httpTestingController.match((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL;
      });
      expect(req3.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  describe('fetchAllAssetCategories', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected asset categories (called once)', () => {
      expect(service.AssetCategories.length).withContext('should not buffered yet').toEqual(0);

      service.fetchAllAssetCategories().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected asset categories')
            .toEqual(fakeData.finAssetCategoriesFromAPI.length);
          expect(service.AssetCategories.length)
            .withContext('should have buffered')
            .toEqual(fakeData.finAssetCategoriesFromAPI.length);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      // Service should have made one request to GET asset categories from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === assetCategoryAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Desp');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // Respond with the mock asset categories
      req.flush({
        value: fakeData.finAssetCategoriesFromAPI,
      });
    });

    it('should be OK returning no asset categories', () => {
      expect(service.AssetCategories.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllAssetCategories().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should have empty asset categories array').toEqual(0);
          expect(service.AssetCategories.length).withContext('should buffered nothing').toEqual(0);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === assetCategoryAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Desp');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchAllAssetCategories().subscribe({
        next: (data: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === assetCategoryAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Desp');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected asset categories (called multiple times)', () => {
      expect(service.AssetCategories.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllAssetCategories().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected asset categories')
            .toEqual(fakeData.finAssetCategoriesFromAPI.length);
          expect(data.length).withContext('should have buffered').toEqual(service.AssetCategories.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });
      const reqs: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === assetCategoryAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(reqs.length).withContext('shall be only 1 calls to real API!').toEqual(1);
      reqs[0].flush({
        value: fakeData.finAssetCategoriesFromAPI,
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllAssetCategories().subscribe();
      const reqs2: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === assetCategoryAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(reqs2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllAssetCategories().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected asset categories')
            .toEqual(fakeData.finAssetCategoriesFromAPI.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });
      const reqs3: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === assetCategoryAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(reqs3.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  describe('fetchAllDocTypes', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected doc types (called once)', () => {
      expect(service.DocumentTypes.length).withContext('should not buffered yet').toEqual(0);

      service.fetchAllDocTypes().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected doc types')
            .toEqual(fakeData.finDocTypesFromAPI.length);
          expect(service.DocumentTypes.length)
            .withContext('should have buffered')
            .toEqual(fakeData.finDocTypesFromAPI.length);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      // Service should have made one request to GET doc types from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === docTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // Respond with the mock doc types
      req.flush({
        value: fakeData.finDocTypesFromAPI,
      });
    });

    it('should be OK returning no doc types', () => {
      expect(service.DocumentTypes.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllDocTypes().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should have empty doc types array').toEqual(0);
          expect(service.DocumentTypes.length).withContext('should buffered nothing').toEqual(0);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === docTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllDocTypes().subscribe({
        next: (data: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === docTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected doc types (called multiple times)', () => {
      expect(service.DocumentTypes.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllDocTypes().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected doc types')
            .toEqual(fakeData.finDocTypesFromAPI.length);
          expect(data.length).withContext('should have buffered').toEqual(service.DocumentTypes.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });
      const reqs: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === docTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(reqs.length).withContext('shall be only 1 calls to real API!').toEqual(1);
      reqs[0].flush({
        value: fakeData.finDocTypesFromAPI,
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllDocTypes().subscribe();
      const reqs2: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === docTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(reqs2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllDocTypes().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected doc types')
            .toEqual(fakeData.finDocTypesFromAPI.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });
      const reqs3: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === docTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(reqs3.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  describe('fetchAllTranTypes', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected tran types (called once)', () => {
      expect(service.TranTypes.length).withContext('should not buffered yet').toEqual(0);

      service.fetchAllTranTypes().subscribe(
        (data: any) => {
          expect(data.length)
            .withContext('should return expected tran types')
            .toEqual(fakeData.finTranTypesFromAPI.length);
          expect(service.TranTypes.length)
            .withContext('should have buffered')
            .toEqual(fakeData.finTranTypesFromAPI.length);
        },
        (fail: any) => {
          // Empty
        }
      );

      // Service should have made one request to GET tran types from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === tranTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Expense,ParID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // Respond with the mock tran types
      req.flush({
        value: fakeData.finTranTypesFromAPI,
      });
    });

    it('should be OK returning no tran types', () => {
      expect(service.TranTypes.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllTranTypes().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should have empty tran types array').toEqual(0);
          expect(service.TranTypes.length).withContext('should buffered nothing').toEqual(0);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === tranTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Expense,ParID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchAllTranTypes().subscribe({
        next: (data: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === tranTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,Expense,ParID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID} or HomeID eq null`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected tran types (called multiple times)', () => {
      expect(service.TranTypes.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllTranTypes().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected tran types')
            .toEqual(fakeData.finTranTypesFromAPI.length);
          expect(data.length).withContext('should have buffered').toEqual(service.TranTypes.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });
      const reqs: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === tranTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(reqs.length).withContext('shall be only 1 calls to real API!').toEqual(1);
      reqs[0].flush({
        value: fakeData.finTranTypesFromAPI,
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllTranTypes().subscribe();
      const reqs2: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === tranTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(reqs2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllTranTypes().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should return expected tran').toEqual(fakeData.finTranTypesFromAPI.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });
      const reqs3: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === tranTypeAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(reqs3.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  describe('fetchAllAccounts', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected account (called once)', () => {
      expect(service.Accounts.length).withContext('should not buffered yet').toEqual(0);

      service.fetchAllAccounts().subscribe({
        next: (data) => {
          expect(data.length).withContext('should return expected account').toEqual(fakeData.finAccountsFromAPI.length);
          expect(service.Accounts.length)
            .withContext('should have buffered')
            .toEqual(fakeData.finAccountsFromAPI.length);
        },
      });

      // Service should have made one request to GET account from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === accountAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,CategoryID,Status,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      // Respond with the mock account categories
      req.flush({
        value: fakeData.finAccountsFromAPI,
      });
    });

    it('should be OK returning no accounts', () => {
      expect(service.Accounts.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllAccounts().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should have empty account array').toEqual(0);
          expect(service.Accounts.length).withContext('should buffered nothing').toEqual(0);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === accountAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,CategoryID,Status,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllAccounts().subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: SafeAny) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === accountAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,CategoryID,Status,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected account (called multiple times)', () => {
      expect(service.Accounts.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllAccounts().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should return expected account').toEqual(fakeData.finAccountsFromAPI.length);
          expect(data.length).withContext('should have buffered').toEqual(service.Accounts.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });

      const reqs: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === accountAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      reqs[0].flush({
        value: fakeData.finAccountsFromAPI,
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllAccounts().subscribe();
      const req2: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === accountAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllAccounts().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected accounts')
            .toEqual(fakeData.finAccountsFromAPI.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });
      const req3: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === accountAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req3.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  describe('readAccount', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return Account in success case', () => {
      expect(service.Accounts.length).toEqual(0);
      service.readAccount(21).subscribe({
        next: (data: any) => {
          expect(data).toBeTruthy();
          // Should be buffered
          expect(service.Accounts.length).toEqual(1);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === service.accountAPIUrl && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({ value: [fakeData.finAccountsFromAPI[0]] });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.readAccount(21).subscribe({
        next: (data) => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === service.accountAPIUrl && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createAccount', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should be OK for create normal cash accounts', () => {
      expect(service.Accounts.length).withContext('should not buffered yet').toEqual(0);

      service.createAccount(fakeData.getFinCashAccountForCreation()).subscribe({
        next: (acnt: SafeAny) => {
          expect(service.Accounts.length).withContext('should has buffered nothing').toEqual(1);
        },
        error: (fail: SafeAny) => {
          // Empty
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === accountAPIURL;
      });

      req.flush(fakeData.getFinCashAccountForCreation()); // Respond with data
    });

    it('should be OK for create normal creditcard accounts', () => {
      expect(service.Accounts.length).withContext('should not buffered yet').toEqual(0);

      service.createAccount(fakeData.getFinCreditcardAccountForCreation()).subscribe({
        next: (acnt: SafeAny) => {
          expect(service.Accounts.length).withContext('should has buffered nothing').toEqual(1);
        },
        error: (fail: SafeAny) => {
          // Empty
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === accountAPIURL;
      });

      req.flush(fakeData.getFinCreditcardAccountForCreation()); // Respond with data
    });

    it('should return error for 404 error', () => {
      const msg = 'Deliberate 404';
      service.createAccount(fakeData.getFinCashAccountForCreation()).subscribe({
        next: (data: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
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
        }
      );

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === accountAPIURL;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: msg });
    });
  });

  describe('changeAccount', () => {
    let currentAccount: Account;

    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);

      fakeData.buildFinAccounts();
      currentAccount = fakeData.finAccounts[0];
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should be OK for change account', () => {
      // expect(service.Accounts.length).toEqual(0, 'should not buffered yet');

      service.changeAccount(currentAccount).subscribe(
        (acnt: any) => {
          // expect(service.Accounts.length).toEqual(1, 'should has buffered nothing');
        },
        (fail: any) => {
          // Empty
        }
      );

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'PUT' && requrl.url === accountAPIURL + '(' + (currentAccount.Id ?? 0).toString() + ')'
        );
      });

      req.flush(currentAccount); // Respond with data
    });

    it('should return error for 500 error', () => {
      const msg = '500: Internal error';
      service.changeAccount(currentAccount).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'PUT' && requrl.url === accountAPIURL + '(' + (currentAccount.Id ?? 0).toString() + ')'
        );
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: msg });
    });
  });

  describe('fetchAllControlCenters', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected control centers (called once)', () => {
      expect(service.ControlCenters.length).withContext('should not buffered yet').toEqual(0);

      service.fetchAllControlCenters().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected control center')
            .toEqual(fakeData.finControlCentersFromAPI.length);
          expect(service.ControlCenters.length)
            .withContext('should have buffered')
            .toEqual(fakeData.finControlCentersFromAPI.length);
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === ccAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,ParentID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      // Respond with the mock cc
      req.flush({
        value: fakeData.finControlCentersFromAPI,
      });
    });

    it('should be OK returning no control centers', () => {
      expect(service.ControlCenters.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllControlCenters().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should have empty cc array').toEqual(0);
          expect(service.ControlCenters.length).withContext('should buffered nothing').toEqual(0);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === ccAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,ParentID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllControlCenters().subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: SafeAny) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === ccAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$select')).toEqual('ID,HomeID,Name,ParentID,Comment');
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected control centers (called multiple times)', () => {
      expect(service.ControlCenters.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllControlCenters().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected cc')
            .toEqual(fakeData.finControlCentersFromAPI.length);
          expect(data.length).withContext('should have buffered').toEqual(service.ControlCenters.length);
        },
      });

      const reqs: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === ccAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      reqs[0].flush({
        value: fakeData.finControlCentersFromAPI,
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllControlCenters().subscribe();
      const req2: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === ccAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllControlCenters().subscribe({
        next: (data: any) => {
          expect(data.length)
            .withContext('should return expected ccs')
            .toEqual(fakeData.finControlCentersFromAPI.length);
        },
      });

      const req3: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === ccAPIURL &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });
      expect(req3.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  describe('readControlCenter', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return control center in success case', () => {
      expect(service.ControlCenters.length).toEqual(0);
      service.readControlCenter(21).subscribe({
        next: (data: any) => {
          expect(data).toBeTruthy();
          expect(service.ControlCenters.length).toBeGreaterThan(0);
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === service.controlCenterAPIUrl && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({ value: [fakeData.finControlCentersFromAPI[0]] });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.readControlCenter(21).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: SafeAny) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === service.controlCenterAPIUrl && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createControlCenter', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should create a control center in success case', () => {
      expect(service.ControlCenters.length).toEqual(0);
      service.createControlCenter(new ControlCenter()).subscribe({
        next: (data: any) => {
          expect(data).toBeTruthy();
          expect(service.ControlCenters.length).toEqual(1);
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === service.controlCenterAPIUrl;
      });

      // Respond with the mock data
      req.flush(fakeData.finControlCentersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createControlCenter(new ControlCenter()).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === service.controlCenterAPIUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('changeControlCenter', () => {
    let cc: ControlCenter;
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
      cc = new ControlCenter();
      cc.Id = 11;
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return control center in success case', () => {
      expect(service.ControlCenters.length).toEqual(0);
      service.changeControlCenter(cc).subscribe({
        next: (data: SafeAny) => {
          expect(data).toBeTruthy();
          expect(service.ControlCenters.length).toEqual(1);
        },
      });

      // Service should have made one request to PUT from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PUT' && requrl.url === service.controlCenterAPIUrl + '(11)';
      });

      // Respond with the mock data
      req.flush(fakeData.finControlCentersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.changeControlCenter(cc).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: SafeAny) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PUT' && requrl.url === service.controlCenterAPIUrl + '(11)';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('changeControlCenterByPatch', () => {
    let cc: ControlCenter;
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
      cc = new ControlCenter();
      cc.Id = 11;
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return control center in success case', () => {
      expect(service.ControlCenters.length).toEqual(0);
      service
        .changeControlCenterByPatch(11, {
          Comment: 'Test',
        })
        .subscribe({
          next: (data: SafeAny) => {
            expect(data).toBeTruthy();
            expect(service.ControlCenters.length).toEqual(1);
          },
        });

      // Service should have made one request to PUT from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PATCH' && requrl.url === service.controlCenterAPIUrl + '/11';
      });

      // Respond with the mock data
      req.flush(fakeData.finControlCentersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service
        .changeControlCenterByPatch(11, {
          Comment: 'Test',
        })
        .subscribe({
          next: () => {
            fail('expected to fail');
          },
          error: (err: any) => {
            expect(err.toString()).toContain(msg);
          },
        });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PATCH' && requrl.url === service.controlCenterAPIUrl + '/11';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllOrders', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected orders (called once)', () => {
      expect(service.Orders.length).withContext('should not buffered yet').toEqual(0);

      service.fetchAllOrders().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should return expected orders').toEqual(fakeData.finOrdersFromAPI.length);
          expect(service.Orders.length).withContext('should have buffered').toEqual(fakeData.finOrdersFromAPI.length);
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.orderAPIUrl &&
          requrl.params.has('$expand') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);
      expect(req.request.params.get('$expand')).toEqual(`SRule`);

      // Respond with the mock cc
      req.flush({
        value: fakeData.finOrdersFromAPI,
      });
    });

    it('should be OK returning no order', () => {
      expect(service.Orders.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllOrders().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should have empty order array').toEqual(0);
          expect(service.Orders.length).withContext('should buffered nothing').toEqual(0);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.orderAPIUrl &&
          requrl.params.has('$expand') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);
      expect(req.request.params.get('$expand')).toEqual(`SRule`);

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllOrders().subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.orderAPIUrl &&
          requrl.params.has('$expand') &&
          requrl.params.has('$filter')
        );
      });
      expect(req.request.params.get('$filter')).toEqual(`HomeID eq ${fakeData.chosedHome.ID}`);
      expect(req.request.params.get('$expand')).toEqual(`SRule`);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected control centers (called multiple times)', () => {
      expect(service.Orders.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllOrders().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should return expected cc').toEqual(fakeData.finOrdersFromAPI.length);
          expect(data.length).withContext('should have buffered').toEqual(service.Orders.length);
        },
      });

      const reqs: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.orderAPIUrl &&
          requrl.params.has('$expand') &&
          requrl.params.has('$filter')
        );
      });
      reqs[0].flush({
        value: fakeData.finOrdersFromAPI,
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllOrders().subscribe();
      const req2: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.orderAPIUrl &&
          requrl.params.has('$expand') &&
          requrl.params.has('$filter')
        );
      });
      expect(req2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllOrders().subscribe({
        next: (data: any) => {
          expect(data.length).withContext('should return expected ccs').toEqual(fakeData.finOrdersFromAPI.length);
        },
      });

      const req3: any = httpTestingController.match((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.orderAPIUrl &&
          requrl.params.has('$expand') &&
          requrl.params.has('$filter')
        );
      });
      expect(req3.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  describe('readOrder', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return order in success case', () => {
      expect(service.Orders.length).toEqual(0);
      service.readOrder(21).subscribe({
        next: (data: any) => {
          expect(data).toBeTruthy();
          expect(service.Orders.length).toEqual(1);
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === service.orderAPIUrl && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({ value: [fakeData.finOrdersFromAPI[0]] });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.readOrder(21).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === service.orderAPIUrl && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createOrder', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should create an order in success case', () => {
      expect(service.Orders.length).toEqual(0);
      service.createOrder(new Order()).subscribe({
        next: (data: any) => {
          expect(data).toBeTruthy();
          expect(service.Orders.length).toEqual(1);
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === service.orderAPIUrl;
      });

      // Respond with the mock data
      req.flush(fakeData.finOrdersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createOrder(new Order()).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === service.orderAPIUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('changeOrder', () => {
    let ord: Order;
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
      ord = new Order();
      ord.Id = 11;
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return order in success case', () => {
      expect(service.Orders.length).toEqual(0);
      service.changeOrder(ord).subscribe({
        next: (data: SafeAny) => {
          expect(data).toBeTruthy();
          expect(service.Orders.length).toEqual(1);
        },
      });

      // Service should have made one request to PUT from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PUT' && requrl.url === service.orderAPIUrl + '/11';
      });

      // Respond with the mock data
      req.flush(fakeData.finOrdersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.changeOrder(ord).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: SafeAny) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PUT' && requrl.url === service.orderAPIUrl + '/11';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('changeOrderByPatch', () => {
    let ord: Order;
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
      ord = new Order();
      ord.Id = 11;
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return order in success case', () => {
      expect(service.Orders.length).toEqual(0);
      service
        .changeOrderByPatch(11, {
          Comment: 'Tezt',
        })
        .subscribe({
          next: (data: SafeAny) => {
            expect(data).toBeTruthy();
            expect(service.Orders.length).toEqual(1);
          },
        });

      // Service should have made one request to PUT from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PATCH' && requrl.url === service.orderAPIUrl + '/11';
      });

      // Respond with the mock data
      req.flush(fakeData.finOrdersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service
        .changeOrderByPatch(11, {
          Comment: 'Tezt',
        })
        .subscribe({
          next: () => {
            fail('expected to fail');
          },
          error: (err: SafeAny) => {
            expect(err.toString()).toContain(msg);
          },
        });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PATCH' && requrl.url === service.orderAPIUrl + '/11';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllPlans', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllPlans().subscribe({
        next: (data: Plan[]) => {
          expect(data.length).toEqual(1);
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === service.planAPIUrl && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          {
            id: 1,
            hid: 1,
            planType: 0,
            accountID: 4,
            startDate: '2019-03-23',
            targetDate: '2019-04-23',
            targetBalance: 10.0,
            tranCurr: 'CNY',
            description: 'Test plan 1',
            createdBy: 'aaa',
            createdAt: '2019-03-23',
          },
        ],
      });
    });

    it('should fetch data only once (call multiple times)', () => {
      service.fetchAllPlans().subscribe({
        next: (data: Plan[]) => {
          expect(data.length).toEqual(1);
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === service.planAPIUrl && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          {
            id: 1,
            hid: 1,
            planType: 0,
            accountID: 4,
            startDate: '2019-03-23',
            targetDate: '2019-04-23',
            targetBalance: 10.0,
            tranCurr: 'CNY',
            description: 'Test plan 1',
            createdBy: 'aaa',
            createdAt: '2019-03-23',
          },
        ],
      });

      httpTestingController.verify();

      // Second call
      service.fetchAllPlans().subscribe();
      const req2: any = httpTestingController.match((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === service.planAPIUrl && requrl.params.has('$filter');
      });
      expect(req2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchAllPlans().subscribe({
        next: (data: SafeAny) => {
          fail('expected to fail');
        },
        error: (err: SafeAny) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === service.planAPIUrl && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('readPlan', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return plan in success case', () => {
      service.readPlan(21).subscribe({
        next: (data: SafeAny) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
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
      service.readPlan(21).subscribe({
        next: (data: SafeAny) => {
          fail('expected to fail');
        },
        error: (err: SafeAny) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
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
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should create a plan in success case', () => {
      service.createPlan(planData).subscribe({
        next: (data: SafeAny) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === service.planAPIUrl;
      });

      // Respond with the mock data
      req.flush(planData.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createPlan(planData).subscribe({
        next: (data: SafeAny) => {
          fail('expected to fail');
        },
        error: (err: SafeAny) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === service.planAPIUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createDocument', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);

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
        }
      );

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
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
        }
      );

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === documentAPIURL;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('massCreateNormalDocument', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);

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

    it('should work for normal doc', () => {
      service.massCreateNormalDocument([fakeData.finNormalDocumentForCreate]).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        }
      );

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === documentAPIURL;
      });

      // Respond with the mock data
      req.flush({
        PostedDocuments: [
          {
            Id: 1,
          },
        ],
        FailedDocuments: [],
      });
    });
  });

  describe('createDocumentFromDPTemplate', () => {
    const apiurl: string = environment.ApiUrl + '/FinanceTmpDPDocuments/PostDocument';
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
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
        }
      );

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush({ id: 100 });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createDocumentFromDPTemplate({ DocId: 100 } as TemplateDocADP).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        }
      );

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('deleteDocument', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
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
        }
      );

      // Service should have made one request to DELETE from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'DELETE' && requrl.url === service.documentAPIUrl + '(1)';
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
        }
      );

      // Service should have made one request to DELETE from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'DELETE' && requrl.url === service.documentAPIUrl + '(1)';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllDocuments', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      const filterDocItem = [];
      filterDocItem.push({
        fieldName: 'TranDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: moment().format(momentDateFormat),
        highValue: moment().add(1, 'M').format(momentDateFormat),
        valueType: GeneralFilterValueType.number,
      });

      service.fetchAllDocuments(filterDocItem, 100, 10).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        }
      );

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.documentAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter') &&
          //          && requrl.params.has('$orderby')
          requrl.params.has('$top') &&
          requrl.params.has('$skip') &&
          requrl.params.has('$count') &&
          requrl.params.has('$expand')
        );
      });

      // Respond with the mock data
      req.flush({
        value: [
          {
            Items: [],
            ID: 94,
            HomeID: 1,
            DocType: 1,
            TranDate: '2019-04-12',
            TranCurr: 'CNY',
            Desp: 'Test New ADP Doc | 5 / 12',
            ExgRate: 0.0,
            ExgRate_Plan: false,
            TranCurr2: null,
            ExgRate2: 0.0,
            ExgRate_Plan2: false,
            TranAmount: -166.67,
            CreatedBy: 'a6319719-2f73-426d-9548-8dbcc25fe7a4',
            CreatedAt: '2019-01-03',
            UpdatedBy: null,
            UpdatedAt: '0001-01-01',
          },
        ],
        '@odata.count': 15,
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      const filterDocItem = [];
      filterDocItem.push({
        fieldName: 'TranDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: moment().format(momentDateFormat),
        highValue: moment().add(1, 'M').format(momentDateFormat),
        valueType: GeneralFilterValueType.number,
      });
      service.fetchAllDocuments(filterDocItem, 10, 0).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        }
      );

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.documentAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter') &&
          //          && requrl.params.has('$orderby')
          requrl.params.has('$top') &&
          requrl.params.has('$skip') &&
          requrl.params.has('$count') &&
          requrl.params.has('$expand')
        );
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllDPTmpDocs', () => {
    const apiurl: string = environment.ApiUrl + '/FinanceTmpDPDocuments';

    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service
        .fetchAllDPTmpDocs({
          TransactionDateBegin: moment(),
          TransactionDateEnd: moment().add(1, 'w'),
        })
        .subscribe({
          next: (data) => {
            expect(data).toBeTruthy();
          },
        });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush([
        {
          hid: 1,
          docID: 649,
          refDocID: null,
          accountID: 81,
          tranDate: '2019-02-26',
          tranType: 59,
          tranAmount: 240.0,
          controlCenterID: 13,
          orderID: null,
          desp: '安安钢琴课-2019上半年 | 8 / 25',
          createdBy: 'aaa',
          createdAt: '2019-01-08',
          updatedBy: null,
          updatedAt: '0001-01-01',
        },
        {
          hid: 1,
          docID: 582,
          refDocID: null,
          accountID: 79,
          tranDate: '2019-02-23',
          tranType: 59,
          tranAmount: 117.82,
          controlCenterID: 12,
          orderID: null,
          desp: '多多2019羽毛球课48节(寒暑假除外) | 8 / 55',
          createdBy: 'aaa',
          createdAt: '2018-12-27',
          updatedBy: null,
          updatedAt: '0001-01-01',
        },
        {
          hid: 1,
          docID: 493,
          refDocID: null,
          accountID: 66,
          tranDate: '2019-02-23',
          tranType: 59,
          tranAmount: 217.53,
          controlCenterID: 13,
          orderID: null,
          desp: '安安吉的堡2018.9-2019.8报名 | 24 / 49',
          createdBy: 'aaa',
          createdAt: '2018-10-07',
          updatedBy: null,
          updatedAt: '0001-01-01',
        },
        {
          hid: 1,
          docID: 552,
          refDocID: null,
          accountID: 76,
          tranDate: '2019-02-23',
          tranType: 59,
          tranAmount: 240.0,
          controlCenterID: 12,
          orderID: null,
          desp: '多多钢琴课 | 17 / 25',
          createdBy: 'aaa',
          createdAt: '2018-11-04',
          updatedBy: null,
          updatedAt: '0001-01-01',
        },
        {
          hid: 1,
          docID: 263,
          refDocID: null,
          accountID: 26,
          tranDate: '2019-02-19',
          tranType: 59,
          tranAmount: 350.0,
          controlCenterID: 10,
          orderID: null,
          desp: '买课 | 71/72',
          createdBy: 'aaa',
          createdAt: '2017-10-10',
          updatedBy: null,
          updatedAt: '0001-01-01',
        },
      ]);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service
        .fetchAllDPTmpDocs({
          TransactionDateBegin: moment(),
          TransactionDateEnd: moment().add(1, 'w'),
        })
        .subscribe({
          next: () => {
            fail('expected to fail');
          },
          error: (err) => {
            expect(err).toContain(msg);
          },
        });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllLoanTmpDocs', () => {
    const apiurl: string = environment.ApiUrl + '/FinanceTmpLoanDocuments';

    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service
        .fetchAllLoanTmpDocs({
          TransactionDateBegin: moment(),
          TransactionDateEnd: moment().add(1, 'w'),
        })
        .subscribe({
          next: (data) => {
            expect(data).toBeTruthy();
          },
        });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush(`[{'hid':1, 'docID':397, 'refDocID':null, 'accountID':58, 'tranDate':'2019-02-22', 'tranAmount':3653.63, 'interestAmount':9782.60,
        'controlCenterID':8, 'orderID':null, 'desp':'201807 | 6 / 360', 'createdBy':'aaa',
        'createdAt':'2018-09-07', 'updatedBy':null, 'updatedAt':'0001-01-01'}]`);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service
        .fetchAllLoanTmpDocs({
          TransactionDateBegin: moment(),
          TransactionDateEnd: moment().add(1, 'w'),
        })
        .subscribe({
          next: () => {
            fail('expected to fail');
          },
          error: (err) => {
            expect(err).toContain(msg);
          },
        });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createADPDocument', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);

      fakeData.buildFinADPDocumentForCreate();
      fakeData.buildFinAccountExtraAdvancePayment();
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for normal doc', () => {
      service
        .createADPDocument(fakeData.finADPDocumentForCreate, fakeData.finAccountExtraAdvancePayment, true)
        .subscribe({
          next: (data) => {
            expect(data).toBeTruthy();
          },
        });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === adpDocumentAPIURL;
      });

      // Respond with the mock data
      req.flush(fakeData.finADPDocumentForCreate.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service
        .createADPDocument(fakeData.finADPDocumentForCreate, fakeData.finAccountExtraAdvancePayment, true)
        .subscribe({
          next: () => {
            fail('expected to fail');
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === adpDocumentAPIURL;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createAssetBuyinDocument', () => {
    let apiurl: string;

    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
      apiurl = service.documentAPIUrl + '/PostAssetBuyDocument';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for normal doc', () => {
      service.createAssetBuyinDocument(fakeData.buildFinAssetBuyInDocumentForCreate()).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush({
        Id: 100,
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createAssetBuyinDocument(fakeData.buildFinAssetBuyInDocumentForCreate()).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createAssetSoldoutDocument', () => {
    let apiurl: string;
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
      apiurl = service.documentAPIUrl + '/PostAssetSellDocument';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for normal doc', () => {
      service.createAssetSoldoutDocument(fakeData.buildFinAssetSoldoutDocumentForCreate()).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush(100);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createAssetSoldoutDocument(fakeData.buildFinAssetSoldoutDocumentForCreate()).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createAssetValChgDocument', () => {
    let apiurl: string;
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
      apiurl = service.documentAPIUrl + '/PostAssetValueChangeDocument';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for normal doc', () => {
      service.createAssetValChgDocument(fakeData.buildFinAssetValueChangeDocumentForCreate()).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush(100);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createAssetValChgDocument(fakeData.buildFinAssetValueChangeDocumentForCreate()).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createLoanDocument', () => {
    let apiurl: string;
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
      apiurl = service.documentAPIUrl + '/PostLoanDocument';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.createLoanDocument(new Document(), new Account()).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush(100);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createLoanDocument(new Document(), new Account()).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createLoanRepayDoc', () => {
    let apiurl: string;
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
      apiurl = environment.ApiUrl + '/FinanceTmpLoanDocuments/PostRepayDocument';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.createLoanRepayDoc(new Document(), 1).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush({
        ID: 100,
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createLoanRepayDoc(new Document(), 1).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  xdescribe('fetchReportByAccount', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchReportByAccount().subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByAccountURL && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          {
            HomeID: 1,
            AccountID: 1,
            DebitBalance: 3,
            CreditBalance: 1,
            Balance: 2,
          },
        ],
        '@odata.count': 1,
      });
    });

    it('shall fetch data only once when call multiple times', () => {
      service.fetchReportByAccount().subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByAccountURL && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          {
            HomeID: 1,
            AccountID: 1,
            DebitBalance: 3,
            CreditBalance: 1,
            Balance: 2,
          },
        ],
        '@odata.count': 1,
      });

      httpTestingController.verify();
      service.fetchReportByAccount().subscribe();
      const req2: any = httpTestingController.match((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByAccountURL && requrl.params.has('$filter');
      });
      expect(req2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchReportByAccount().subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByAccountURL && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  xdescribe('fetchReportByControlCenter', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchReportByControlCenter().subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByCCURL && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          {
            HomeID: 1,
            ControlCenterID: 1,
            DebitBalance: 3,
            CreditBalance: 1,
            Balance: 2,
          },
        ],
        '@odata.count': 1,
      });
    });

    it('should fetch data only onece when call multiple times', () => {
      service.fetchReportByControlCenter().subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByCCURL && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          {
            HomeID: 1,
            ControlCenterID: 1,
            DebitBalance: 3,
            CreditBalance: 1,
            Balance: 2,
          },
        ],
        '@odata.count': 1,
      });

      httpTestingController.verify();
      service.fetchReportByControlCenter().subscribe();
      const req2: any = httpTestingController.match((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByCCURL && requrl.params.has('$filter');
      });
      expect(req2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchReportByControlCenter().subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByCCURL && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  xdescribe('fetchReportByOrder', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchReportByOrder().subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByOrderURL && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          {
            HomeID: 1,
            OrderID: 1,
            DebitBalance: 3,
            CreditBalance: 1,
            Balance: 2,
          },
        ],
        '@odata.count': 1,
      });
    });

    it('should call only once when call multiple times', () => {
      service.fetchReportByOrder().subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByOrderURL && requrl.params.has('$filter');
      });

      // Respond with the mock data
      req.flush({
        value: [
          {
            HomeID: 1,
            OrderID: 1,
            DebitBalance: 3,
            CreditBalance: 1,
            Balance: 2,
          },
        ],
        '@odata.count': 1,
      });

      httpTestingController.verify();
      service.fetchReportByOrder().subscribe();
      const req2: any = httpTestingController.match((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByOrderURL && requrl.params.has('$filter');
      });
      expect(req2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchReportByOrder().subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === reportByOrderURL && requrl.params.has('$filter');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('calcADPTmpDocs', () => {
    const calcADPTmpAPIURL: any = environment.ApiUrl + '/GetRepeatedDatesWithAmount';
    let inputData: RepeatedDatesWithAmountAPIInput;
    let outputData: RepeatedDatesWithAmountAPIOutput[];

    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
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
      service.calcADPTmpDocs(inputData).subscribe({
        next: (data) => {
          expect(data.length).withContext('should return expected numbers').toEqual(outputData.length);
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === calcADPTmpAPIURL;
      });

      // Respond with the mock data
      req.flush({ value: outputData });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.calcADPTmpDocs(inputData).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === calcADPTmpAPIURL;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('calcLoanTmpDocs', () => {
    const calcLoanTmpAPIURL: any = environment.ApiUrl + '/GetRepeatedDatesWithAmountAndInterest';
    let inputData: RepeatDatesWithAmountAndInterestAPIInput;
    let outputData: RepeatDatesWithAmountAndInterestAPIOutput[];

    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);

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
      service.calcLoanTmpDocs(inputData).subscribe({
        next: (data) => {
          expect(data.length).withContext('should return expected data').toEqual(outputData.length);
        },
      });

      // Service should have made one request to POST
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === calcLoanTmpAPIURL;
      });

      // Respond with the mock data
      req.flush({ value: outputData });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error occurred';
      service.calcLoanTmpDocs(inputData).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === calcLoanTmpAPIURL;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'Error occurred' });
    });
  });

  describe('getDocumentItemByAccount', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data in success case', () => {
      service.getDocumentItemByAccount(21, 100, 100, moment(), moment().add(1, 'y')).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter') &&
          requrl.params.has('$top') &&
          requrl.params.has('$skip')
        );
      });

      // Respond with the mock data
      req.flush({ totalCount: 0, contentList: [] });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.getDocumentItemByAccount(21).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('getDocumentItemByControlCenter', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data in success case', () => {
      service.getDocumentItemByControlCenter(21, 100, 100, moment(), moment().add(1, 'y')).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$filter') &&
          requrl.params.has('$select') &&
          requrl.params.has('$top') &&
          requrl.params.has('$skip')
        );
      });

      // Respond with the mock data
      req.flush({ totalCount: 0, contentList: [] });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.getDocumentItemByControlCenter(21).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('getDocumentItemByOrder', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data in success case', () => {
      service.getDocumentItemByOrder(21, 100, 0, moment(), moment().add(1, 'y')).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });

      // Respond with the mock data
      req.flush({ totalCount: 0, contentList: [] });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.getDocumentItemByOrder(21).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
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
        '@odata.context':
          'http://localhost:25688/$metadata#FinanceDocumentItemViews(DocumentID,ItemID,TransactionDate,AccountID,TransactionType,Currency,OriginAmount,Amount,ControlCenterID,OrderID,ItemDesp)',
        '@odata.count': 2,
        value: [
          {
            DocumentID: 668,
            ItemID: 1,
            TransactionDate: '2018-03-27',
            AccountID: 8,
            TransactionType: 3,
            Currency: 'CNY',
            OriginAmount: 30.0,
            Amount: 30.0,
            ControlCenterID: 9,
            OrderID: null,
            ItemDesp: '3\u6708\u4efd\u5de5\u8d44',
          },
          {
            DocumentID: 688,
            ItemID: 2,
            TransactionDate: '2018-04-26',
            AccountID: 8,
            TransactionType: 3,
            Currency: 'CNY',
            OriginAmount: 254.22,
            Amount: 254.22,
            ControlCenterID: 9,
            OrderID: null,
            ItemDesp: 'Alva 04\u5de5\u8d44',
          },
        ],
      };
    });

    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);
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

      service.searchDocItem(arFilters, 100, 10).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
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

      service.searchDocItem(arFilters, 100, 10).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
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

      service.searchDocItem(arFilters, 100, 10).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
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

      service.searchDocItem(arFilters, 100, 10).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
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

      service.searchDocItem(arFilters, 100, 10).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
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

      service.searchDocItem(arFilters, 100, 10).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
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

      service.searchDocItem(arFilters, 100, 10).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });

      // Respond with the mock data
      req.flush(objrst);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.searchDocItem(arFilters).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return (
          requrl.method === 'GET' &&
          requrl.url === service.docItemViewAPIUrl &&
          requrl.params.has('$select') &&
          requrl.params.has('$filter')
        );
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('getRepeatedDates', () => {
    const apiurl: any = environment.ApiUrl + '/GetRepeatedDates';
    let inputData: RepeatedDatesAPIInput;
    let outputData: RepeatedDatesAPIOutput[];

    beforeEach(() => {
      service = TestBed.inject(FinanceOdataService);

      inputData = {
        StartDate: moment(),
        EndDate: moment().add(1, 'y'),
        RepeatType: RepeatFrequencyEnum.Month,
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
      service.getRepeatedDates(inputData).subscribe({
        next: (val) => {
          expect(val.length).withContext('should return expected data').toEqual(outputData.length);
        },
      });

      // Service should have made one request to POST
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush({
        value: outputData,
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error occurred';
      service.getRepeatedDates(inputData).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'Error occurred' });
    });
  });

  describe('fetchOverviewKeyfigure', () => {
    const apiurl: any = `${reportAPIUrl}/GetFinanceOverviewKeyFigure`;

    afterEach(() => {
      httpTestingController.verify();
    });

    it('shall fetch out result', () => {
      service.fetchOverviewKeyfigure().subscribe({
        next: (val) => {
          expect(val).toBeTruthy();
          expect(val.HomeID).toEqual(1);
        },
        error: (err) => {
          expect(err).toBeFalsy();
        },
      });

      // Service should have made one request to POST
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush({
        value: [
          {
            HomeID: 1,
            Currency: 'CNY',
            CurrentMonthIncome: 0,
            CurrentMonthOutgo: 0,
          },
        ],
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error occurred';
      service.fetchOverviewKeyfigure().subscribe({
        next: () => {
          fail('Shall not occur');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'POST' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: msg });
    });
  });

  describe('changeDocumentDateViaPatch', () => {
    const apiurl = `${documentAPIURL}/22`;
    afterEach(() => {
      httpTestingController.verify();
    });

    it('shall work properly', () => {
      service.changeDocumentDateViaPatch(22, moment()).subscribe({
        next: () => {
          // TBD.
        },
        error: (err) => {
          expect(err).toBeFalsy();
        },
      });

      // Service should have made one request to POST
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PATCH' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush({
        HomeID: 1,
        ID: 22,
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error occurred';
      service.changeDocumentDateViaPatch(22, moment()).subscribe({
        next: () => {
          fail('Shall not occur');
        },
        error: (err) => {
          expect(err).toContain(msg);
        },
      });
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PATCH' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'Error occurred' });
    });
  });

  describe('changeDocumentDespViaPatch', () => {
    const apiurl = `${documentAPIURL}/22`;
    afterEach(() => {
      httpTestingController.verify();
    });

    it('shall work properly', () => {
      service.changeDocumentDespViaPatch(22, '22').subscribe({
        next: (val) => {
          // TBD.
        },
        error: (err) => {
          expect(err).toBeFalsy();
        },
      });

      // Service should have made one request to POST
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PATCH' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush({
        HomeID: 1,
        ID: 22,
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error occurred';
      service.changeDocumentDespViaPatch(22, '22').subscribe({
        next: () => {
          fail('Shall not occur');
        },
        error: (err) => {
          expect(err).toContain(msg);
        },
      });
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PATCH' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'Error occurred' });
    });
  });

  describe('changeAccountByPatch', () => {
    const apiurl = `${accountAPIURL}/22`;
    afterEach(() => {
      httpTestingController.verify();
    });

    it('shall work properly', () => {
      service.changeAccountByPatch(22, { Name: '22' }).subscribe({
        next: () => {
          // TBD
        },
        error: (err) => {
          expect(err).toBeFalsy();
        },
      });

      // Service should have made one request to POST
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PATCH' && requrl.url === apiurl;
      });

      // Respond with the mock data
      req.flush({
        HomeID: 1,
        ID: 22,
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error occurred';
      service.changeAccountByPatch(22, { Name: '22' }).subscribe({
        next: (val) => {
          fail('Shall not occur');
        },
        error: (err) => {
          expect(err).toContain(msg);
        },
      });
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'PATCH' && requrl.url === apiurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'Error occurred' });
    });
  });
});
