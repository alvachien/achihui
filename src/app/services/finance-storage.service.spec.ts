import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { FinanceStorageService, } from './finance-storage.service';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import { UserAuthInfo, FinanceADPCalAPIInput, FinanceLoanCalAPIInput, RepeatFrequencyEnum,
  FinanceADPCalAPIOutput, FinanceLoanCalAPIOutput, momentDateFormat, Document, DocumentItem,
  financeDocTypeNormal, DocumentWithPlanExgRateForUpdate, ReportTrendExTypeEnum,
  Account, TemplateDocADP, Order, AccountStatusEnum, } from '../model';
import { environment } from '../../environments/environment';
import { FakeDataHelper } from '../../testing';

describe('FinanceStorageService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let fakeData: FakeDataHelper;
  let service: FinanceStorageService;
  const accountCategoryAPIURL: any = environment.ApiUrl + '/api/FinanceAccountCategory';
  const docTypeAPIURL: any = environment.ApiUrl + '/api/FinanceDocType';
  const tranTypeAPIURL: any = environment.ApiUrl + '/api/FinanceTranType';
  const assetCategoryAPIURL: any = environment.ApiUrl + '/api/FinanceAssetCategory';
  const accountAPIURL: any = environment.ApiUrl + '/api/FinanceAccount';
  const ccAPIURL: any = environment.ApiUrl + '/api/FinanceControlCenter';
  const orderAPIURL: any = environment.ApiUrl + '/api/FinanceOrder';
  const documentAPIURL: any = environment.ApiUrl + '/api/FinanceDocument';
  const adpDocumentAPIURL: any = environment.ApiUrl + '/api/financeadpdocument';

  beforeEach(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildFinConfigDataFromAPI();
    fakeData.buildFinAccountsFromAPI();
    fakeData.buildFinControlCenterFromAPI();
    fakeData.buildFinOrderFromAPI();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);
    const homeService: Partial<HomeDefDetailService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        FinanceStorageService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(FinanceStorageService);
  });

  it('1. should be created without data', () => {
    expect(service).toBeTruthy();
  });

  /// FinanceStorageService method tests begin ///
  describe('fetchAllAccountCategories', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock account categories
      req.flush(fakeData.finAccountCategoriesFromAPI);
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
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllAccountCategories().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL && requrl.params.has('hid');
      });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

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
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL && requrl.params.has('hid');
      });
      reqs[0].flush(fakeData.finAccountCategoriesFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllAccountCategories().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL && requrl.params.has('hid');
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
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL && requrl.params.has('hid');
       });
      expect(req3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllAssetCategories', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === assetCategoryAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock asset categories
      req.flush(fakeData.finAssetCategoriesFromAPI);
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
        return requrl.method === 'GET' && requrl.url === assetCategoryAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllAssetCategories().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === assetCategoryAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

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
        return requrl.method === 'GET' && requrl.url === assetCategoryAPIURL && requrl.params.has('hid');
       });
      expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
      reqs[0].flush(fakeData.finAssetCategoriesFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllAssetCategories().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === assetCategoryAPIURL && requrl.params.has('hid');
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
        return requrl.method === 'GET' && requrl.url === assetCategoryAPIURL && requrl.params.has('hid');
       });
      expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllDocTypes', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === docTypeAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock doc types
      req.flush(fakeData.finDocTypesFromAPI);
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
        return requrl.method === 'GET' && requrl.url === docTypeAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllDocTypes().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === docTypeAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

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
        return requrl.method === 'GET' && requrl.url === docTypeAPIURL && requrl.params.has('hid');
       });
      expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
      reqs[0].flush(fakeData.finDocTypesFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllDocTypes().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === docTypeAPIURL && requrl.params.has('hid');
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
        return requrl.method === 'GET' && requrl.url === docTypeAPIURL && requrl.params.has('hid');
       });
      expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllTranTypes', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === tranTypeAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock tran types
      req.flush(fakeData.finTranTypesFromAPI);
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
        return requrl.method === 'GET' && requrl.url === tranTypeAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllTranTypes().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === tranTypeAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

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
        return requrl.method === 'GET' && requrl.url === tranTypeAPIURL && requrl.params.has('hid');
       });
      expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
      reqs[0].flush(fakeData.finTranTypesFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllTranTypes().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === tranTypeAPIURL && requrl.params.has('hid');
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
        return requrl.method === 'GET' && requrl.url === tranTypeAPIURL && requrl.params.has('hid');
       });
      expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllAccounts', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === accountAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock account categories
      req.flush(fakeData.finAccountsFromAPI);
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
        return requrl.method === 'GET' && requrl.url === accountAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllAccounts().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === accountAPIURL && requrl.params.has('hid');
      });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

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
        return requrl.method === 'GET' && requrl.url === accountAPIURL && requrl.params.has('hid');
      });
      reqs[0].flush(fakeData.finAccountsFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllAccounts().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === accountAPIURL && requrl.params.has('hid');
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
        return requrl.method === 'GET' && requrl.url === accountAPIURL && requrl.params.has('hid');
       });
      expect(req3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('createAccount', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
      const msg: string = 'Deliberate 404';
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
      const msg: string = '500: Internal error';
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

  describe('changeAccount', () => {
    let currentAccount: Account;

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);

      fakeData.buildFinAccounts();
      currentAccount = fakeData.finAccounts[0];
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should be OK for change account', () => {
      expect(service.Accounts.length).toEqual(0, 'should not buffered yet');

      service.changeAccount(currentAccount).subscribe(
        (acnt: any) => {
          expect(service.Accounts.length).toEqual(1, 'should has buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === accountAPIURL + '/' + currentAccount.Id.toString();
       });

      req.flush(currentAccount); // Respond with data
    });

    it('should return error for 500 error', () => {
      const msg: string = '500: Internal error';
      service.changeAccount(currentAccount).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === accountAPIURL + '/' + currentAccount.Id.toString();
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: msg });
    });
  });

  describe('updateAccountStatus', () => {
    let currentAccount: Account;

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);

      fakeData.buildFinAccounts();
      currentAccount = fakeData.finAccounts[0];
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should be OK for update account', () => {
      expect(service.Accounts.length).toEqual(0, 'should not buffered yet');

      service.updateAccountStatus(currentAccount.Id, AccountStatusEnum.Closed).subscribe(
        (acnt: any) => {
          expect(service.Accounts.length).toEqual(1, 'should has buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PATCH' && requrl.url === accountAPIURL + '/' + currentAccount.Id.toString();
       });

      req.flush(currentAccount); // Respond with data
    });

    it('should return error for 500 error', () => {
      const msg: string = '500: Internal error';
      service.updateAccountStatus(currentAccount.Id, AccountStatusEnum.Closed).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PATCH' && requrl.url === accountAPIURL + '/' + currentAccount.Id.toString();
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: msg });
    });
  });

  describe('fetchAllControlCenters', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === ccAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock cc
      req.flush(fakeData.finControlCentersFromAPI);
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
        return requrl.method === 'GET' && requrl.url === ccAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllControlCenters().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === ccAPIURL && requrl.params.has('hid');
      });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

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
        return requrl.method === 'GET' && requrl.url === ccAPIURL && requrl.params.has('hid');
      });
      reqs[0].flush(fakeData.finControlCentersFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllControlCenters().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === ccAPIURL && requrl.params.has('hid');
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
        return requrl.method === 'GET' && requrl.url === ccAPIURL && requrl.params.has('hid');
       });
      expect(req3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllOrders', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === orderAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock cc
      req.flush(fakeData.finOrdersFromAPI);
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
        return requrl.method === 'GET' && requrl.url === orderAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllOrders().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === orderAPIURL && requrl.params.has('hid');
      });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

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
        return requrl.method === 'GET' && requrl.url === orderAPIURL && requrl.params.has('hid');
      });
      reqs[0].flush(fakeData.finOrdersFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllOrders().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === orderAPIURL && requrl.params.has('hid');
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
        return requrl.method === 'GET' && requrl.url === orderAPIURL && requrl.params.has('hid');
       });
      expect(req3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('createDocument', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);

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

  describe('createADPDocument', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);

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
      const msg: string = 'server failed';
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

  describe('calcADPTmpDocs', () => {
    const calcADPTmpAPIURL: any = environment.ApiUrl + '/api/FinanceADPCalculator';
    let inputData: FinanceADPCalAPIInput;
    let outputData: any[];

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
      inputData =  {
        TotalAmount: 200,
        StartDate: moment(),
        EndDate: moment().add(1, 'y'),
        RptType: RepeatFrequencyEnum.Month,
        Desp: 'test',
      };
      outputData = [];
      for (let i: number = 0; i < 10; i ++) {
        let rst: any = {
          tranDate: moment().add(i, 'M').format(momentDateFormat),
          tranAmount: 20,
          desp: `test${i}`,
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
      req.flush(outputData);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
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
    const calcLoanTmpAPIURL: any = environment.ApiUrl + '/api/FinanceLoanCalculator';
    let inputData: FinanceLoanCalAPIInput;
    let outputData: any[];

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);

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
      for (let i: number = 0; i < 10; i ++) {
        let od: any = {
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
      req.flush(outputData);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Error occurred';
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

  describe('createAssetBuyinDocument', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceAssetBuyDocument';

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
      const msg: string = 'server failed';
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
    let apiurl: string = environment.ApiUrl + '/api/FinanceAssetSoldDocument';
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
      const msg: string = 'server failed';
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
    let apiurl: string = environment.ApiUrl + '/api/FinanceAssetValueChange';
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
      const msg: string = 'server failed';
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

  describe('readAccount', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === accountAPIURL + '/21' && requrl.params.has('hid');
       });

      // Respond with the mock data
      req.flush(fakeData.finAccountsFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.readAccount(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === accountAPIURL + '/21' && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('readControlCenter', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === ccAPIURL + '/21' && requrl.params.has('hid');
       });

      // Respond with the mock data
      req.flush(fakeData.finControlCentersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.readControlCenter(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === ccAPIURL + '/21' && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('readOrder', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === orderAPIURL + '/21' && requrl.params.has('hid');
       });

      // Respond with the mock data
      req.flush(fakeData.finOrdersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.readOrder(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === orderAPIURL + '/21' && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createOrder', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'POST' && requrl.url === orderAPIURL;
       });

      // Respond with the mock data
      req.flush(fakeData.finOrdersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.createOrder(new Order()).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === orderAPIURL;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('changeOrder', () => {
    let ord: Order;
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'PUT' && requrl.url === orderAPIURL + '/11' && requrl.params.has('hid');
       });

      // Respond with the mock data
      req.flush(fakeData.finOrdersFromAPI[0]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.changeOrder(ord).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === orderAPIURL + '/11' && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createLoanDocument', () => {
    let apiurl: string = environment.ApiUrl + '/api/financeloandocument';
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
      const msg: string = 'server failed';
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
    let apiurl: string = environment.ApiUrl + '/api/FinanceLoanRepayDocument';
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'POST' && requrl.url === apiurl
          && requrl.params.has('hid')
          && requrl.params.has('loanAccountID');
       });

      // Respond with the mock data
      req.flush(100);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.createLoanRepayDoc(new Document(), 22, 1).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl
          && requrl.params.has('hid')
          && requrl.params.has('loanAccountID');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchPreviousDocWithPlanExgRate', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceDocWithPlanExgRate';
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.fetchPreviousDocWithPlanExgRate('USD').subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl
          && requrl.params.has('hid')
          && requrl.params.has('tgtcurr');
       });

      // Respond with the mock data
      req.flush([{
        hid: fakeData.chosedHome.ID,
        docID: 100,
        docType: 1,
        tranDate: '2020-01-01',
        desp: 'test',
        tranCurr: 'USD',
        exgRate: 639,
        exgRate_Plan: true,
      }, {
        hid: fakeData.chosedHome.ID,
        docID: 100,
        docType: 1,
        tranDate: '2021-01-01',
        desp: 'test 2',
        tranCurr: 'USD',
        exgRate: 649,
        exgRate_Plan: true,
      }]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.fetchPreviousDocWithPlanExgRate('USD').subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl
          && requrl.params.has('hid')
          && requrl.params.has('tgtcurr');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('updatePreviousDocWithPlanExgRate', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceDocWithPlanExgRate';
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.updatePreviousDocWithPlanExgRate({} as DocumentWithPlanExgRateForUpdate).subscribe(
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
      req.flush({});
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.updatePreviousDocWithPlanExgRate({} as DocumentWithPlanExgRateForUpdate).subscribe(
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

  describe('getADPTmpDocs', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceADPTmpDoc';

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.getADPTmpDocs(moment(), moment().add(1, 'w')).subscribe(
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
        {'hid': 1, 'docID': 649, 'refDocID': null, 'accountID': 81, 'tranDate': '2019-02-26',
        'tranType': 59, 'tranAmount': 240.00, 'controlCenterID': 13,
        'orderID': null, 'desp': '安安钢琴课-2019上半年 | 8 / 25', 'createdBy': 'aaa', 'createdAt': '2019-01-08',
        'updatedBy': null, 'updatedAt': '0001-01-01'},
        {'hid': 1, 'docID': 582, 'refDocID': null, 'accountID': 79, 'tranDate': '2019-02-23',
        'tranType': 59, 'tranAmount': 117.82, 'controlCenterID': 12,
        'orderID': null, 'desp': '多多2019羽毛球课48节(寒暑假除外) | 8 / 55', 'createdBy': 'aaa', 'createdAt': '2018-12-27',
        'updatedBy': null, 'updatedAt': '0001-01-01'},
        {'hid': 1, 'docID': 493, 'refDocID': null, 'accountID': 66, 'tranDate': '2019-02-23',
        'tranType': 59, 'tranAmount': 217.53, 'controlCenterID': 13,
        'orderID': null, 'desp': '安安吉的堡2018.9-2019.8报名 | 24 / 49', 'createdBy': 'aaa', 'createdAt': '2018-10-07',
        'updatedBy': null, 'updatedAt': '0001-01-01'},
        {'hid': 1, 'docID': 552, 'refDocID': null, 'accountID': 76, 'tranDate': '2019-02-23',
        'tranType': 59, 'tranAmount': 240.00, 'controlCenterID': 12,
        'orderID': null, 'desp': '多多钢琴课 | 17 / 25', 'createdBy': 'aaa', 'createdAt': '2018-11-04', 'updatedBy': null, 'updatedAt': '0001-01-01'},
        {'hid': 1, 'docID': 263, 'refDocID': null, 'accountID': 26, 'tranDate': '2019-02-19',
        'tranType': 59, 'tranAmount': 350.00, 'controlCenterID': 10,
        'orderID': null, 'desp': '买课 | 71/72', 'createdBy': 'aaa', 'createdAt': '2017-10-10', 'updatedBy': null, 'updatedAt': '0001-01-01'},
      ]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.getADPTmpDocs(moment(), moment().add(1, 'w')).subscribe(
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

  describe('getLoanTmpDocs', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceLoanTmpDoc';

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.getLoanTmpDocs(moment(), moment().add(1, 'w')).subscribe(
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
      service.getLoanTmpDocs(moment(), moment().add(1, 'w')).subscribe(
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

  describe('fetchReportTrendData', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceReportTrendEx';

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case - daily', () => {
      service.fetchReportTrendData(ReportTrendExTypeEnum.Daily).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(data.length).toEqual(5);
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
        {'tranDate': '2019-02-05', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': false, 'tranAmount': 17600.0},
        {'tranDate': '2019-02-01', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -279.00},
        {'tranDate': '2019-02-02', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -575.35},
        {'tranDate': '2019-02-05', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -14590.00},
        {'tranDate': '2019-02-09', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -217.53},
      ]);
    });

    it('should return data with all parameters for success case - daily', () => {
      service.fetchReportTrendData(ReportTrendExTypeEnum.Daily, true, moment(), moment().add(1, 'y')).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(data.length).toEqual(5);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl
          && requrl.params.has('hid')
          && requrl.params.has('exctran')
          && requrl.params.has('dtbgn')
          && requrl.params.has('dtend')
          ;
       });

      // Respond with the mock data
      req.flush([
        {'tranDate': '2019-02-05', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': false, 'tranAmount': 17600.0},
        {'tranDate': '2019-02-01', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -279.00},
        {'tranDate': '2019-02-02', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -575.35},
        {'tranDate': '2019-02-05', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -14590.00},
        {'tranDate': '2019-02-09', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -217.53},
      ]);
    });

    it('should return data for success case - weekly', () => {
      service.fetchReportTrendData(ReportTrendExTypeEnum.Weekly).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(data.length).toEqual(3);
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
        {'tranDate': null, 'tranWeek': 5, 'tranMonth': null, 'tranYear': 2019, 'expense': true, 'tranAmount': -854.35},
        {'tranDate': null, 'tranWeek': 6, 'tranMonth': null, 'tranYear': 2019, 'expense': false, 'tranAmount': 17600.00},
        {'tranDate': null, 'tranWeek': 6, 'tranMonth': null, 'tranYear': 2019, 'expense': true, 'tranAmount': -14807.53},
      ]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.fetchReportTrendData(ReportTrendExTypeEnum.Daily).subscribe(
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

  describe('fetchDocPostedFrequencyPerUser', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceDocCreatedFrequenciesByUser';

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.fetchDocPostedFrequencyPerUser().subscribe(
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
      req.flush(`[
        {'userID':'e8d92277-a682-4328-ba92-27b6e9627012', 'year':2019, 'month':null, 'week':'2', 'amountOfDocuments':9},
        {'userID':'e8d92277-a682-4328-ba92-27b6e9627012', 'year':2019, 'month':null, 'week':'3', 'amountOfDocuments':13},
        {'userID':'fd9698cd-e211-4461-a51b-b123d61c8343', 'year':2019, 'month':null, 'week':'3', 'amountOfDocuments':5},
        {'userID':'e8d92277-a682-4328-ba92-27b6e9627012', 'year':2019, 'month':null, 'week':'4', 'amountOfDocuments':1},
        {'userID':'fd9698cd-e211-4461-a51b-b123d61c8343', 'year':2019, 'month':null, 'week':'5', 'amountOfDocuments':4},
        {'userID':'e8d92277-a682-4328-ba92-27b6e9627012', 'year':2019, 'month':null, 'week':'6', 'amountOfDocuments':11},
      ]`);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.fetchDocPostedFrequencyPerUser().subscribe(
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

  describe('doPostADPTmpDoc', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceADPTmpDoc';
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return doc for success case', () => {
      service.doPostADPTmpDoc({DocId: 100} as TemplateDocADP).subscribe(
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
      req.flush({id: 100});
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.doPostADPTmpDoc({DocId: 100} as TemplateDocADP).subscribe(
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

  describe('getReportTranType', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceReportTranType';

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data without parameters for success case', () => {
      service.getReportTranType().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(data.length).toEqual(2);
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
      req.flush([{'tranType': 1, 'tranDate': '2019-02-05', 'name': '起始资金', 'expenseFlag': false, 'tranAmount': 8800.00},
        {'tranType': 9, 'tranDate': '2019-02-05', 'name': '生活类开支', 'expenseFlag': true, 'tranAmount': -2200.00},
        {'tranType': 59, 'tranDate': '2019-02-09', 'name': '培训进修', 'expenseFlag': true, 'tranAmount': -217.53},
        {'tranType': 66, 'tranDate': '2019-02-20', 'name': '大家电类', 'expenseFlag': true, 'tranAmount': -1799.00},
        {'tranType': 88, 'tranDate': '2019-02-05', 'name': '预付款支出', 'expenseFlag': true, 'tranAmount': -8800.00}]);
    });

    it('should return data with parameters for success case', () => {
      service.getReportTranType(moment(), moment().add(1, 'y')).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(data.length).toEqual(2);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl
          && requrl.params.has('hid')
          && requrl.params.has('dtbgn')
          && requrl.params.has('dtend');
       });

      // Respond with the mock data
      req.flush([{'tranType': 1, 'tranDate': '2019-02-05', 'name': '起始资金', 'expenseFlag': false, 'tranAmount': 8800.00},
        {'tranType': 9, 'tranDate': '2019-02-05', 'name': '生活类开支', 'expenseFlag': true, 'tranAmount': -2200.00},
        {'tranType': 59, 'tranDate': '2019-02-09', 'name': '培训进修', 'expenseFlag': true, 'tranAmount': -217.53},
        {'tranType': 66, 'tranDate': '2019-02-20', 'name': '大家电类', 'expenseFlag': true, 'tranAmount': -1799.00},
        {'tranType': 88, 'tranDate': '2019-02-05', 'name': '预付款支出', 'expenseFlag': true, 'tranAmount': -8800.00}]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.getReportTranType().subscribe(
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

  describe('getReportBS', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceReportBS';

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.getReportBS().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(data.length).toEqual(2);
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
      req.flush([{'accountID': 4, 'accountName': 'cash1', 'accountCategoryID': 1,
        'accountCategoryName': 'Sys.AcntCty.Cash', 'debitBalance': 67973.86, 'creditBalance': 117976.61, 'balance': -50002.75},
      {'accountID': 5, 'accountName': 'cash2', 'accountCategoryID': 1, 'accountCategoryName': 'Sys.AcntCty.Cash',
      'debitBalance': 605692.00, 'creditBalance': 95509.18, 'balance': 510182.82}]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.getReportBS().subscribe(
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

  describe('getReportCC', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceReportCC';

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.getReportCC().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(data.length).toEqual(2);
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
        {'controlCenterID': 6, 'controlCenterName': 'cc1',
        'debitBalance': 35223.00, 'creditBalance': 147407.33, 'balance': -112184.33},
        {'controlCenterID': 7, 'controlCenterName': 'cc2',
        'debitBalance': 0.00, 'creditBalance': 33747.50, 'balance': -33747.50},
      ]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.getReportCC().subscribe(
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

  describe('getReportOrder', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceReportOrder';

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.getReportOrder().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(data.length).toEqual(2);
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
        {'orderID': 5, 'orderName': 'order1', 'validFrom': '2015-03-02', 'validTo': '2015-05-29',
        'debitBalance': 0.00, 'creditBalance': 0.00, 'balance': 0.00},
        {'orderID': 6, 'orderName': 'order2', 'validFrom': '2015-03-02', 'validTo': '2015-04-30',
        'debitBalance': 0.00, 'creditBalance': 1570.00, 'balance': -1570.00},
      ]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.getReportOrder().subscribe(
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

  describe('getReportMonthOnMonth', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceReportTrend';

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data without parameter for success case', () => {
      service.getReportMonthOnMonth().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(data.length).toEqual(2);
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
      req.flush([{'year': 2019, 'month': 1, 'expense': false, 'tranAmount': 26377.11},
      {'year': 2019, 'month': 1, 'expense': true, 'tranAmount': -47009.24},
      ]);
    });

    it('should return data with parameters for success case', () => {
      service.getReportMonthOnMonth(true, moment(), moment().add(1, 'y')).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(data.length).toEqual(2);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl
          && requrl.params.has('hid')
          && requrl.params.has('exctran')
          && requrl.params.has('dtbgn')
          && requrl.params.has('dtend');
       });

      // Respond with the mock data
      req.flush([{'year': 2019, 'month': 1, 'expense': false, 'tranAmount': 26377.11},
      {'year': 2019, 'month': 1, 'expense': true, 'tranAmount': -47009.24},
      ]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.getReportMonthOnMonth().subscribe(
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

  describe('searchDocItem', () => {
    let apiurl: string = environment.ApiUrl + '/api/FinanceDocItemSearch';

    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.searchDocItem().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(data.length).toEqual(2);
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
      req.flush([{'accountID': 4, 'accountName': 'cash1', 'accountCategoryID': 1,
        'accountCategoryName': 'Sys.AcntCty.Cash', 'debitBalance': 67973.86, 'creditBalance': 117976.61, 'balance': -50002.75},
      {'accountID': 5, 'accountName': 'cash2', 'accountCategoryID': 1, 'accountCategoryName': 'Sys.AcntCty.Cash',
      'debitBalance': 605692.00, 'creditBalance': 95509.18, 'balance': 510182.82}]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.getReportBS().subscribe(
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
});
