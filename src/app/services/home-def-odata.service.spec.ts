import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { HomeDefOdataService } from './home-def-odata.service';
import { AuthService } from './auth.service';
import { FakeDataHelper } from '../../testing';
import { environment } from '../../environments/environment';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

describe('HomeDefOdataService', () => {
  let fakeData: FakeDataHelper;
  let service: HomeDefOdataService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = signal(fakeData.currentUser);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        HomeDefOdataService,
        { provide: AuthService, useValue: authServiceStub },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
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
      expect(service.HomeDefs.length).toEqual(0);
      service.fetchAllHomeDef().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.HomeDefs.length).toBeGreaterThan(0);
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
        value: [
          {
            Members: [],
            ID: 11,
            Name: 'test',
            Details: 'test.',
            Host: 'aaa',
            BaseCurrency: 'CNY',
            CreatedBy: 'aaa',
            CreatedAt: '2017-10-01',
          },
        ],
        '@odata.count': 1,
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchAllHomeDef().subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.message).toContain(msg);
        },
      });

      // HttpRequest.url EXCLUDES the query string (that lives in req.params) -
      // the old expectation concatenated '?$count=true&$expand=Members' onto the
      // URL (pre-HttpParams era) and could never match, which is why this test
      // was skipped. Assert the params separately instead.
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.apiUrl;
      });
      expect(req.request.params.get('$count')).toEqual('true');
      expect(req.request.params.get('$expand')).toEqual('Members');

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });

    it('should return data for success case (call multiply times)', () => {
      expect(service.HomeDefs.length).toEqual(0);
      service.fetchAllHomeDef().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.HomeDefs.length).toBeGreaterThan(0);
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
        value: [
          {
            Members: [],
            ID: 11,
            Name: 'test',
            Details: 'test.',
            Host: 'aaa',
            BaseCurrency: 'CNY',
            CreatedBy: 'aaa',
            CreatedAt: '2017-10-01',
          },
        ],
        totalCount: 1,
      });

      service.fetchAllHomeDef().subscribe();
      const req2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.apiUrl;
      });
      expect(req2.length).toEqual(0);
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
      expect(service.HomeDefs.length).toEqual(0);
      service.readHomeDef(1).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.HomeDefs.length).toBeGreaterThan(0);
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
          throw new Error('expected to fail');
        },
        (error: any) => {
          expect(error.message).toContain(msg);
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
      expect(service.HomeDefs.length).toEqual(0);
      service.createHomeDef(fakeData.chosedHome).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
          expect(service.HomeDefs.length).toBeGreaterThan(0);
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
          throw new Error('expected to fail');
        },
        (error: any) => {
          expect(error.message).toContain(msg);
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
          throw new Error('expected to fail');
        },
        (error: any) => {
          expect(error.message).toContain(msg);
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
