import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { HomeDefOdataService } from './home-def-odata.service';
import { AuthService } from './auth.service';
import { UserAuthInfo } from '../model';
import { FakeDataHelper } from '../../testing';
import { environment } from '../../environments/environment';

describe('HomeDefOdataService', () => {
  let fakeData: FakeDataHelper;
  let service: HomeDefOdataService;
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
        HomeDefOdataService,
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('1. should be created', () => {
    service = TestBed.inject(HomeDefOdataService);
    expect(service).toBeTruthy();
  });

  /// HomeDefOdataService method tests begin ///
  describe('fetchAllHomeDef', () => {
    beforeEach(() => {
      service = TestBed.inject(HomeDefOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case (call once)', () => {
      expect(service.HomeDefs.length).toEqual(0, 'should not buffer it yet');
      service.fetchAllHomeDef().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.HomeDefs.length).toBeGreaterThan(0, 'should have been buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.apiUrl;
       });

      // Respond with the mock data
      req.flush({
        value: [{
          Members: [],
          ID: 11, Name: 'test', Details: 'test.', Host: 'aaa', BaseCurrency: 'CNY',
          CreatedBy: 'aaa', CreatedAt: '2017-10-01',
        }],
        '@odata.count': 1,
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchAllHomeDef().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.apiUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });

    it('should return data for success case (call multiply times)', () => {
      expect(service.HomeDefs.length).toEqual(0, 'should not buffer it yet');
      service.fetchAllHomeDef().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.HomeDefs.length).toBeGreaterThan(0, 'should have been buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.apiUrl;
       });

      // Respond with the mock data
      req.flush({
        value: [{
          Members: [],
          ID: 11, Name: 'test', Details: 'test.', Host: 'aaa', BaseCurrency: 'CNY',
          CreatedBy: 'aaa',
          CreatedAt: '2017-10-01',
        }],
        'totalCount': 1,
      });

      service.fetchAllHomeDef().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.apiUrl;
       });
      expect(req2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');
    });
  });

  describe('readHomeDef', () => {
    beforeEach(() => {
      service = TestBed.inject(HomeDefOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case (call once)', () => {
      expect(service.HomeDefs.length).toEqual(0, 'should not buffer it yet');
      service.readHomeDef(1).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.HomeDefs.length).toBeGreaterThan(0, 'should have been buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.apiUrl;
       });

      // Respond with the mock data
      req.flush(fakeData.chosedHome.generateJSONData());
    });
    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.readHomeDef(1).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.apiUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createHomeDef', () => {
    beforeEach(() => {
      service = TestBed.inject(HomeDefOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      expect(service.HomeDefs.length).toEqual(0, 'should not buffer it yet');
      service.createHomeDef(fakeData.chosedHome).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.HomeDefs.length).toBeGreaterThan(0, 'should have been buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.apiUrl;
       });

      // Respond with the mock data
      req.flush(fakeData.chosedHome.generateJSONData(true));
    });
    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createHomeDef(fakeData.chosedHome).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.apiUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('getHomeKeyFigure', () => {
    const apiurl: string = environment.ApiUrl + '/HomeKeyFigure';
    beforeEach(() => {
      service = TestBed.inject(HomeDefOdataService);
      service.ChosedHome = fakeData.chosedHome;
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.getHomeKeyFigure().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl + '?hid=' + fakeData.chosedHome.ID.toString();
      });

      // Respond with the mock data
      req.flush(`{
        'totalAsset':10000000000.99,
        'totalLiability':-1.98,
        'totalAssetUnderMyName':12121212.02,
        'totalLiabilityUnderMyName':-111.69,
        'totalUnreadMessage':0,
        'myUnCompletedEvents':70,
        'myCompletedEvents':10
      }`);
    });
    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.getHomeKeyFigure().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl + '?hid=' + fakeData.chosedHome.ID.toString();
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });
});
