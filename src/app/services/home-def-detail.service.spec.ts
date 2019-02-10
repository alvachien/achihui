import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { HomeDefDetailService } from './home-def-detail.service';
import { AuthService } from './auth.service';
import { UserAuthInfo } from '../model';
import { FakeDataHelper } from '../../testing';
import { environment } from '../../environments/environment';

describe('HomeDefDetailService', () => {
  let fakeData: FakeDataHelper;
  let service: HomeDefDetailService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        HomeDefDetailService,
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('1. should be created', () => {
    service = TestBed.get(HomeDefDetailService);
    expect(service).toBeTruthy();
  });

  /// HomeDefDetailService method tests begin ///
  describe('fetchAllHomeDef', () => {
    let apiurl: string = environment.ApiUrl + '/api/homedef';

    beforeEach(() => {
      service = TestBed.get(HomeDefDetailService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllHomeDef().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl;
       });

      // Respond with the mock data
      req.flush({
        "contentList":[{
          "members":[],
          "id":11,"name":"test","details":"test.","host":"aaa","baseCurrency":"CNY","creatorDisplayAs":"aaa","createdBy":"aaa","createdAt":"2017-10-01","updatedBy":null,"updatedAt":"0001-01-01",
        }],
        "totalCount":1,
      });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.fetchAllHomeDef().subscribe(
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

  describe('fetchAllMembersInChosedHome', () => {
    let apiurl: string = environment.ApiUrl + '/api/homemember';

    beforeEach(() => {
      service = TestBed.get(HomeDefDetailService);

      service.ChosedHome = fakeData.chosedHome;
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllMembersInChosedHome().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl;
       });

      // Respond with the mock data
      req.flush({
        "contentList":[
          {"homeID":11,"user":"aa","displayAs":"aa","relation":0,"createdBy":"aa","createdAt":"2017-10-01","updatedBy":null,"updatedAt":"0001-01-01"},
          {"homeID":11,"user":"bb","displayAs":"bb","relation":1,"createdBy":"aa","createdAt":"2017-10-01","updatedBy":null,"updatedAt":"0001-01-01"},
        ],
        "totalCount":2,
      });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.fetchAllMembersInChosedHome().subscribe(
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

  // HomeKeyFigure
  // {"totalAsset":10000000000.99,"totalLiability":-1.98,"totalAssetUnderMyName":12121212.02,"totalLiabilityUnderMyName":-111.69,"totalUnreadMessage":0,"myUnCompletedEvents":70,"myCompletedEvents":10}  
});
