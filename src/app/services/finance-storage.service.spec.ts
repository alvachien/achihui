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
  const accountCategoryAPIURL: any = environment.ApiUrl + '/FinanceAccountCategory';
  const docTypeAPIURL: any = environment.ApiUrl + '/FinanceDocType';
  const tranTypeAPIURL: any = environment.ApiUrl + '/FinanceTranType';
  const assetCategoryAPIURL: any = environment.ApiUrl + '/FinanceAssetCategory';
  const accountAPIURL: any = environment.ApiUrl + '/FinanceAccount';
  const ccAPIURL: any = environment.ApiUrl + '/FinanceControlCenter';
  const orderAPIURL: any = environment.ApiUrl + '/FinanceOrder';
  const documentAPIURL: any = environment.ApiUrl + '/FinanceDocument';
  const adpDocumentAPIURL: any = environment.ApiUrl + '/Financeadpdocument';

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

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(FinanceStorageService);
  });

  it('should be created without data', () => {
    expect(service).toBeTruthy();
  });

  describe('updateNormalDocument', () => {
    beforeEach(() => {
      service = TestBed.inject(FinanceStorageService);

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

  xdescribe('updatePreviousDocWithPlanExgRate', () => {
    const apiurl: string = environment.ApiUrl + '/FinanceDocWithPlanExgRate';
    beforeEach(() => {
      service = TestBed.inject(FinanceStorageService);
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

  xdescribe('fetchReportTrendData', () => {
    const apiurl: string = environment.ApiUrl + '/FinanceReportTrendEx';

    beforeEach(() => {
      service = TestBed.inject(FinanceStorageService);
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
    const apiurl: string = environment.ApiUrl + '/FinanceDocCreatedFrequenciesByUser';

    beforeEach(() => {
      service = TestBed.inject(FinanceStorageService);
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

  xdescribe('getReportTranType', () => {
    const apiurl: string = environment.ApiUrl + '/FinanceReportTranType';

    beforeEach(() => {
      service = TestBed.inject(FinanceStorageService);
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
    const apiurl: string = environment.ApiUrl + '/FinanceReportTrend';

    beforeEach(() => {
      service = TestBed.inject(FinanceStorageService);
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