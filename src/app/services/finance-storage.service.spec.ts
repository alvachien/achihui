import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { FinanceStorageService, } from './finance-storage.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import {
  UserAuthInfo, RepeatFrequencyEnum,
  momentDateFormat, Document, DocumentItem,
  financeDocTypeNormal, DocumentWithPlanExgRateForUpdate, ReportTrendExTypeEnum,
  Account, TemplateDocADP, Order, AccountStatusEnum, GeneralFilterItem, GeneralFilterValueType,
  GeneralFilterOperatorEnum, Plan, PlanTypeEnum, ControlCenter,
} from '../model';
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
    const homeService: Partial<HomeDefOdataService> = {
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
        { provide: HomeDefOdataService, useValue: homeService },
      ],
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(FinanceStorageService);
  });

  it('should be created without data', () => {
    expect(service).toBeTruthy();
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

  describe('readDocument', () => {
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
      service.readDocument(1).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === documentAPIURL + '/1';
      });

      // Respond with the mock data
      req.flush(fakeData.finNormalDocumentForCreate.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.readDocument(1).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === documentAPIURL + '/1';
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

  describe('updateNormalDocument', () => {
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
      service.updateNormalDocument(fakeData.finNormalDocumentForCreate).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === documentAPIURL + '/100';
      });

      // Respond with the mock data
      req.flush(fakeData.finNormalDocumentForCreate.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.updateNormalDocument(fakeData.finNormalDocumentForCreate).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === documentAPIURL + '/100';
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
        { 'tranDate': '2019-02-05', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': false, 'tranAmount': 17600.0 },
        { 'tranDate': '2019-02-01', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -279.00 },
        { 'tranDate': '2019-02-02', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -575.35 },
        { 'tranDate': '2019-02-05', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -14590.00 },
        { 'tranDate': '2019-02-09', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -217.53 },
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
        { 'tranDate': '2019-02-05', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': false, 'tranAmount': 17600.0 },
        { 'tranDate': '2019-02-01', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -279.00 },
        { 'tranDate': '2019-02-02', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -575.35 },
        { 'tranDate': '2019-02-05', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -14590.00 },
        { 'tranDate': '2019-02-09', 'tranWeek': null, 'tranMonth': null, 'tranYear': null, 'expense': true, 'tranAmount': -217.53 },
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
        { 'tranDate': null, 'tranWeek': 5, 'tranMonth': null, 'tranYear': 2019, 'expense': true, 'tranAmount': -854.35 },
        { 'tranDate': null, 'tranWeek': 6, 'tranMonth': null, 'tranYear': 2019, 'expense': false, 'tranAmount': 17600.00 },
        { 'tranDate': null, 'tranWeek': 6, 'tranMonth': null, 'tranYear': 2019, 'expense': true, 'tranAmount': -14807.53 },
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
      service.doPostADPTmpDoc({ DocId: 100 } as TemplateDocADP).subscribe(
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
      service.doPostADPTmpDoc({ DocId: 100 } as TemplateDocADP).subscribe(
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
      req.flush([{ 'tranType': 1, 'tranDate': '2019-02-05', 'name': '起始资金', 'expenseFlag': false, 'tranAmount': 8800.00 },
      { 'tranType': 9, 'tranDate': '2019-02-05', 'name': '生活类开支', 'expenseFlag': true, 'tranAmount': -2200.00 },
      { 'tranType': 59, 'tranDate': '2019-02-09', 'name': '培训进修', 'expenseFlag': true, 'tranAmount': -217.53 },
      { 'tranType': 66, 'tranDate': '2019-02-20', 'name': '大家电类', 'expenseFlag': true, 'tranAmount': -1799.00 },
      { 'tranType': 88, 'tranDate': '2019-02-05', 'name': '预付款支出', 'expenseFlag': true, 'tranAmount': -8800.00 }]);
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
      req.flush([{ 'tranType': 1, 'tranDate': '2019-02-05', 'name': '起始资金', 'expenseFlag': false, 'tranAmount': 8800.00 },
      { 'tranType': 9, 'tranDate': '2019-02-05', 'name': '生活类开支', 'expenseFlag': true, 'tranAmount': -2200.00 },
      { 'tranType': 59, 'tranDate': '2019-02-09', 'name': '培训进修', 'expenseFlag': true, 'tranAmount': -217.53 },
      { 'tranType': 66, 'tranDate': '2019-02-20', 'name': '大家电类', 'expenseFlag': true, 'tranAmount': -1799.00 },
      { 'tranType': 88, 'tranDate': '2019-02-05', 'name': '预付款支出', 'expenseFlag': true, 'tranAmount': -8800.00 }]);
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
      req.flush([{
        'accountID': 4, 'accountName': 'cash1', 'accountCategoryID': 1,
        'accountCategoryName': 'Sys.AcntCty.Cash', 'debitBalance': 67973.86, 'creditBalance': 117976.61, 'balance': -50002.75
      },
      {
        'accountID': 5, 'accountName': 'cash2', 'accountCategoryID': 1, 'accountCategoryName': 'Sys.AcntCty.Cash',
        'debitBalance': 605692.00, 'creditBalance': 95509.18, 'balance': 510182.82
      }]);
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
        {
          'controlCenterID': 6, 'controlCenterName': 'cc1',
          'debitBalance': 35223.00, 'creditBalance': 147407.33, 'balance': -112184.33
        },
        {
          'controlCenterID': 7, 'controlCenterName': 'cc2',
          'debitBalance': 0.00, 'creditBalance': 33747.50, 'balance': -33747.50
        },
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
        {
          'orderID': 5, 'orderName': 'order1', 'validFrom': '2015-03-02', 'validTo': '2015-05-29',
          'debitBalance': 0.00, 'creditBalance': 0.00, 'balance': 0.00
        },
        {
          'orderID': 6, 'orderName': 'order2', 'validFrom': '2015-03-02', 'validTo': '2015-04-30',
          'debitBalance': 0.00, 'creditBalance': 1570.00, 'balance': -1570.00
        },
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
      req.flush([{ 'year': 2019, 'month': 1, 'expense': false, 'tranAmount': 26377.11 },
      { 'year': 2019, 'month': 1, 'expense': true, 'tranAmount': -47009.24 },
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
      req.flush([{ 'year': 2019, 'month': 1, 'expense': false, 'tranAmount': 26377.11 },
      { 'year': 2019, 'month': 1, 'expense': true, 'tranAmount': -47009.24 },
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
    let arItem: GeneralFilterItem[] = [];

    beforeEach(() => {
      let item: GeneralFilterItem = new GeneralFilterItem();
      item.fieldName = 'test';
      item.operator = GeneralFilterOperatorEnum.Equal;
      item.valueType = GeneralFilterValueType.string;
      arItem.push(item);
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.searchDocItem(arItem, 100, 10).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl && requrl.params.has('hid');
      });

      // Respond with the mock data
      req.flush({
        'contentList': [
          {
            'docID': 473, 'itemID': 2, 'hid': 0, 'tranDate': '2017-12-02', 'docDesp': '美元兑换', 'accountID': 4,
            'tranType': 37, 'tranTypeName': '转账收入', 'tranType_Exp': false, 'useCurr2': true, 'tranCurr': 'USD',
            'tranAmount': 1000.00, 'tranAmount_Org': 1000.00, 'tranAmount_LC': 6632.00, 'controlCenterID': 0,
            'orderID': 12, 'desp': '美元兑换'
          },
          {
            'docID': 474, 'itemID': 1, 'hid': 0, 'tranDate': '2017-12-04', 'docDesp': '12.4在美国开支', 'accountID': 4,
            'tranType': 46, 'tranTypeName': '早中晚餐', 'tranType_Exp': true, 'useCurr2': false, 'tranCurr': 'USD',
            'tranAmount': -6.55, 'tranAmount_Org': 6.55, 'tranAmount_LC': -43.434, 'controlCenterID': 0, 'orderID': 12,
            'desp': 'Walmart买面包和橙子'
          }], 'totalCount': 17
      });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.searchDocItem(arItem).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === apiurl && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('deleteDocument', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
          && requrl.url === service.documentAPIUrl + '/1'
          && requrl.params.has('hid');
      });

      // Respond with the mock data
      req.flush('', { status: 200, statusText: 'OK' });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
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
          && requrl.url === service.documentAPIUrl + '/1'
          && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllPlans', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllPlans(100, 10).subscribe(
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
          && requrl.params.has('hid')
          && requrl.params.has('top')
          && requrl.params.has('skip');
      });

      // Respond with the mock data
      req.flush([{
        id: 1, hid: 1, planType: 0, accountID: 4,
        startDate: '2019-03-23', targetDate: '2019-04-23', targetBalance: 10.00, tranCurr: 'CNY',
        description: 'Test plan 1', createdBy: 'aaa', createdAt: '2019-03-23'
      }]);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
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
          && requrl.params.has('hid')
          && !requrl.params.has('top')
          && !requrl.params.has('skip');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('readPlan', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === service.planAPIUrl + '/21' && requrl.params.has('hid');
      });

      // Respond with the mock data
      let planData: Plan = new Plan();
      planData.StartDate = moment();
      planData.AccountCategoryID = 1;
      planData.AccountID = 21;
      planData.Description = 'test';
      planData.PlanType = PlanTypeEnum.Account;
      planData.TargetBalance = 20;
      planData.TranCurrency = 'CNY';
      planData.ID = 21;
      req.flush(planData.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.readPlan(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.planAPIUrl + '/21' && requrl.params.has('hid');
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
      service = TestBed.get(FinanceStorageService);
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
      const msg: string = 'server failed';
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

  describe('getDocumentItemByAccount', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === service.docItemAPIUrl
          && requrl.params.has('hid')
          && requrl.params.has('acntid')
          && requrl.params.has('top')
          && requrl.params.has('skip')
          && requrl.params.has('dtbgn')
          && requrl.params.has('dtend');
      });

      // Respond with the mock data
      req.flush({ totalCount: 0, contentList: [] });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.getDocumentItemByAccount(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.docItemAPIUrl
          && requrl.params.has('hid')
          && requrl.params.has('acntid')
          ;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('getDocumentItemByControlCenter', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
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
        return requrl.method === 'GET' && requrl.url === service.docItemAPIUrl
          && requrl.params.has('hid')
          && requrl.params.has('ccid')
          && requrl.params.has('top')
          && requrl.params.has('skip')
          && requrl.params.has('dtbgn')
          && requrl.params.has('dtend');
      });

      // Respond with the mock data
      req.flush({ totalCount: 0, contentList: [] });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.getDocumentItemByControlCenter(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.docItemAPIUrl
          && requrl.params.has('hid')
          && requrl.params.has('ccid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('getDocumentItemByOrder', () => {
    beforeEach(() => {
      service = TestBed.get(FinanceStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data in success case', () => {
      service.getDocumentItemByOrder(21, moment(), moment().add(1, 'y')).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.docItemAPIUrl
          && requrl.params.has('hid')
          && requrl.params.has('ordid')
          && requrl.params.has('dtbgn')
          && requrl.params.has('dtend');
      });

      // Respond with the mock data
      req.flush({ totalCount: 0, contentList: [] });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.getDocumentItemByOrder(21).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.docItemAPIUrl
          && requrl.params.has('hid')
          && requrl.params.has('ordid')
          ;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });
});