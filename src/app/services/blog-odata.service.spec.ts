import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { BlogOdataService } from './blog-odata.service';
import { AuthService, HomeDefOdataService } from '.';
import { FakeDataHelper } from '../../testing';
import { environment } from '../../environments/environment';

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
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        BlogOdataService,
        { provide: AuthService, useValue: authServiceStub },
      ],
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
    const apiUrl: string = environment.ApiUrl + '/api/BlogCollections';

    beforeEach(() => {
      service = TestBed.inject(BlogOdataService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected currencies (called once)', () => {
      expect(service.Collections.length).toEqual(0, 'should not buffered yet');

      service.fetchAllCollections().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.blogCollectionAPI.length, 'should return expected currencies');
          expect(service.Collections.length).toEqual(fakeData.blogCollectionAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET currencies from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === apiUrl
          && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

      // Respond with the mock currencies
      req.flush({
        '@odata.count': fakeData.blogCollectionAPI.length,
        value: fakeData.blogCollectionAPI
      });
    });

    it('should be OK returning no currencies', () => {
      expect(service.Collections.length).toEqual(0, 'should not buffered yet');
      service.fetchAllCollections().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(0, 'should have empty currencies array');
          expect(service.Collections.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === apiUrl
          && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

      req.flush({
        '@odata.count': 0,
        value: []
      }); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllCollections().subscribe(
        (curries: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === apiUrl
          && requrl.params.has('$count');
      });
      expect(req.request.params.get('$count')).toEqual('true');

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected currencies (called multiple times)', () => {
      expect(service.Collections.length).toEqual(0, 'should not buffered yet');
      service.fetchAllCollections().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.blogCollectionAPI.length, 'should return expected currencies');
          expect(curries.length).toEqual(service.Collections.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );

      let requests: any = httpTestingController.match(callurl => {
        return callurl.url === apiUrl
          && callurl.method === 'GET';
      });
      expect(requests.length).toEqual(1, 'shall be only 1 calls to real API!');
      requests[0].flush({
        '@odata.count': fakeData.blogCollectionAPI.length,
        value: fakeData.blogCollectionAPI,
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllCollections().subscribe();
      requests = httpTestingController.match(callurl => {
        return callurl.url === apiUrl
          && callurl.method === 'GET';
      });
      expect(requests.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllCollections().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.blogCollectionAPI.length, 'should return expected currencies');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      requests = httpTestingController.match(apiUrl);
      expect(requests.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });
});
