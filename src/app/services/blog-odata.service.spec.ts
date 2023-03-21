import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { BlogOdataService } from './blog-odata.service';
import { AuthService } from '.';
import { FakeDataHelper } from '../../testing';
import { environment } from '../../environments/environment';
import { BlogUserSetting } from '../model';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

describe('BlogOdataService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let service: BlogOdataService;
  let fakeData: FakeDataHelper;

  beforeEach(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildBlogCollectionAPI();
    fakeData.buildBlogPostAPI();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BlogOdataService, { provide: AuthService, useValue: authServiceStub }],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(BlogOdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /// BlogOdataService method tests begin ///
  describe('fetchAllCollections', () => {
    const apiUrl: string = environment.ApiUrl + '/BlogCollections';

    beforeEach(() => {
      service = TestBed.inject(BlogOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected currencies (called once)', () => {
      expect(service.Collections.length).withContext('should not buffered yet').toEqual(0);

      service.fetchAllCollections().subscribe({
        next: (curries: any) => {
          expect(curries.length)
            .withContext('should return expected currencies')
            .toEqual(fakeData.blogCollectionAPI.length);
          expect(service.Collections.length)
            .withContext('should have buffered')
            .toEqual(fakeData.blogCollectionAPI.length);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      // Service should have made one request to GET currencies from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiUrl && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

      // Respond with the mock currencies
      req.flush({
        '@odata.count': fakeData.blogCollectionAPI.length,
        value: fakeData.blogCollectionAPI,
      });
    });

    it('should be OK returning no currencies', () => {
      expect(service.Collections.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllCollections().subscribe({
        next: (curries: any) => {
          expect(curries.length).withContext('should have empty currencies array').toEqual(0);
          expect(service.Collections.length).withContext('should buffered nothing').toEqual(0);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiUrl && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

      req.flush({
        '@odata.count': 0,
        value: [],
      }); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchAllCollections().subscribe({
        next: (curries: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiUrl && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected currencies (called multiple times)', () => {
      expect(service.Collections.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllCollections().subscribe({
        next: (curries: any) => {
          expect(curries.length)
            .withContext('should return expected currencies')
            .toEqual(fakeData.blogCollectionAPI.length);
          expect(curries.length).withContext('should have buffered').toEqual(service.Collections.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });

      let requests: any = httpTestingController.match((callurl) => {
        return callurl.url === apiUrl && callurl.method === 'GET';
      });
      expect(requests.length).withContext('shall be only 1 calls to real API!').toEqual(1);
      requests[0].flush({
        '@odata.count': fakeData.blogCollectionAPI.length,
        value: fakeData.blogCollectionAPI,
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllCollections().subscribe();
      requests = httpTestingController.match((callurl) => {
        return callurl.url === apiUrl && callurl.method === 'GET';
      });
      expect(requests.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllCollections().subscribe({
        next: (curries: any) => {
          expect(curries.length)
            .withContext('should return expected currencies')
            .toEqual(fakeData.blogCollectionAPI.length);
        },
        error: (fail: any) => {
          // Do nothing
        },
      });
      requests = httpTestingController.match(apiUrl);
      expect(requests.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  describe('readUserSetting', () => {
    const apiUrl: string = environment.ApiUrl + `/BlogUserSettings`;
    beforeEach(() => {
      service = TestBed.inject(BlogOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should be OK returning data', () => {
      expect(service.Collections.length).withContext('should not buffered yet').toEqual(0);
      service.readUserSetting().subscribe({
        next: (data: BlogUserSetting | null) => {
          expect(data).toBeTruthy();
          expect(data?.owner).toEqual('Test');
          expect(data?.title).toEqual('Test');
          expect(data?.footer).toEqual('test');
        },
        error: (fail: any) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiUrl && requrl.params.has('$filter');
      });

      req.flush({
        value: [
          {
            Owner: 'Test',
            Name: 'Test',
            Comment: 'test',
          },
        ],
      }); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.readUserSetting().subscribe({
        next: (curries: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === apiUrl && requrl.params.has('$filter');
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });
});
