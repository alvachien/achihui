import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { LearnStorageService } from './learn-storage.service';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import { environment } from '../../environments/environment';
import { FakeDataHelper } from '../../testing';

describe('LearnStorageService', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let fakeData: FakeDataHelper;
  let service: LearnStorageService;
  const ctgyAPIURL: any = environment.ApiUrl + '/api/learncategory';

  beforeEach(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildLearnCategoriesFromAPI();

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
        LearnStorageService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(LearnStorageService);
  });
  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('1. should be created', () => {
    service = TestBed.get(LearnStorageService);
    expect(service).toBeTruthy();
  });

  /// LearnStorageService method tests begin ///
  describe('fetchAllCategories', () => {
    beforeEach(() => {
      service = TestBed.get(LearnStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected categories (called once)', () => {
      expect(service.Categories.length).toEqual(0, 'should not buffered yet');

      service.fetchAllCategories().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.learnCategoriesFromAPI.length, 'should return expected categories');
          expect(service.Categories.length).toEqual(fakeData.learnCategoriesFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET categories from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === ctgyAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock categories
      req.flush(fakeData.learnCategoriesFromAPI);
    });

    it('should be OK returning no categories', () => {
      expect(service.Categories.length).toEqual(0, 'should not buffered yet');
      service.fetchAllCategories().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(0, 'should have empty categories array');
          expect(service.Categories.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === ctgyAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllCategories().subscribe(
        (curries: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === ctgyAPIURL && requrl.params.has('hid');
       });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected categories (called multiple times)', () => {
      expect(service.Categories.length).toEqual(0, 'should not buffered yet');
      service.fetchAllCategories().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.learnCategoriesFromAPI.length, 'should return expected categories');
          expect(curries.length).toEqual(service.Categories.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === ctgyAPIURL && requrl.params.has('hid');
       });
      expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
      reqs[0].flush(fakeData.learnCategoriesFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllCategories().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === ctgyAPIURL && requrl.params.has('hid');
       });
      expect(reqs2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllCategories().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.learnCategoriesFromAPI.length, 'should return expected categories');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === ctgyAPIURL && requrl.params.has('hid');
       });
      expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('getHistoryReportByUser', () => {
    let apiurl: string = environment.ApiUrl + '/api/LearnReportUserDate';

    beforeEach(() => {
      service = TestBed.get(LearnStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.getHistoryReportByUser().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock categories
      req.flush([
        {displayAs: 'a', learnCount: 3},
        {displayAs: 'b', learnCount: 4},
      ]);
    });

    it('should handle failed data', () => {
      const msg: string = 'server failed';
      service.getHistoryReportByUser().subscribe(
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
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('getHistoryReportByCategory', () => {
    let apiurl: string = environment.ApiUrl + '/api/LearnReportCtgyDate';

    beforeEach(() => {
      service = TestBed.get(LearnStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.getHistoryReportByCategory().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiurl && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock categories
      req.flush([
        {category: 'a', learnCount: 3},
        {category: 'b', learnCount: 4},
      ]);
    });

    it('should handle failed data', () => {
      const msg: string = 'server failed';
      service.getHistoryReportByCategory().subscribe(
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
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });
});
