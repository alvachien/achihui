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
      // expect(service.Accounts.length).toEqual(0, 'should not buffered yet');

      service.changeAccount(currentAccount).subscribe(
        (acnt: any) => {
          // expect(service.Accounts.length).toEqual(1, 'should has buffered nothing');
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
      // expect(service.Accounts.length).toEqual(0, 'should not buffered yet');

      service.updateAccountStatus(currentAccount.Id, AccountStatusEnum.Closed).subscribe(
        (acnt: any) => {
          // expect(service.Accounts.length).toEqual(1, 'should has buffered nothing');
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

  xdescribe('fetchPreviousDocWithPlanExgRate', () => {
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

  xdescribe('updatePreviousDocWithPlanExgRate', () => {
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

  xdescribe('getADPTmpDocs', () => {
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

  xdescribe('getLoanTmpDocs', () => {
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

  xdescribe('fetchReportTrendData', () => {
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

  xdescribe('fetchDocPostedFrequencyPerUser', () => {
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

  xdescribe('doPostADPTmpDoc', () => {
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

  xdescribe('getReportTranType', () => {
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

  xdescribe('getReportMonthOnMonth', () => {
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
});