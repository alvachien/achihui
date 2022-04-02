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
});