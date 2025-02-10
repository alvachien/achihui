import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { TagsService } from './tags.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { FakeDataHelper } from '../../testing';
import { environment } from '../../environments/environment';

describe('TagsService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let fakeData: FakeDataHelper;
  let service: TagsService;
  const tagsAPIURL = environment.ApiUrl + '/Tag';

  beforeEach(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildTagsFromAPI();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);
    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        TagsService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TagsService);
  });
  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('1. should be created', () => {
    expect(service).toBeTruthy();
    expect(httpClient).toBeTruthy();
  });

  /// TagsService method tests begin ///
  describe('2. fetchAllTags', () => {
    beforeEach(() => {
      service = TestBed.inject(TagsService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected tags (called once)', () => {
      service.fetchAllTags(true).subscribe({
        next: (curries) => {
          expect(curries.length).withContext('should return expected tags').toEqual(fakeData.tagsFromAPI.length);
        },
      });

      // Service should have made one request to GET tags from expected URL
      const req = httpTestingController.expectOne((requrl) => {
        return requrl.method === 'GET' && requrl.url === tagsAPIURL && requrl.params.has('hid');
      });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock tags
      req.flush(fakeData.tagsFromAPI);
    });

    it('should be OK returning no tags', () => {
      service.fetchAllTags(true).subscribe({
        next: (curries) => {
          expect(curries.length).withContext('should have empty tags array').toEqual(0);
        },
      });

      const req = httpTestingController.expectOne((requrl) => {
        return requrl.method === 'GET' && requrl.url === tagsAPIURL && requrl.params.has('hid');
      });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      req.flush([]); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllTags(true).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req = httpTestingController.expectOne((requrl) => {
        return requrl.method === 'GET' && requrl.url === tagsAPIURL && requrl.params.has('hid');
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });
});
