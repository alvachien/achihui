import { TestBed, inject, async, fakeAsync, } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { EventStorageService } from './event-storage.service';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import { UserAuthInfo } from '../model';
import { FakeDataHelper, asyncData, asyncError, } from '../../testing';
import { environment } from '../../environments/environment';

describe('EventStorageService', () => {
  let httpTestingController: HttpTestingController;
  let fakeData: FakeDataHelper;
  let service: EventStorageService;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);
    const homeService: any = jasmine.createSpyObj('HomeDefDetailService', ['fetchHomeMembers']);
    homeService.ChosedHome = fakeData.chosedHome;
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue(fakeData.chosedHome.Members);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        EventStorageService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    });

    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(EventStorageService);
  }));

  it('1. should be created without data', () => {
    expect(service).toBeTruthy();
  });

  /// EventStorageService method tests begin ///
  describe('readHabitEvent', () => {
    let apiurl: string = environment.ApiUrl + '/api/eventhabit/';

    beforeEach(() => {
      service = TestBed.get(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.readHabitEvent(1).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === apiurl + '1'
          && requrl.params.has('hid');
       });

      // Respond with the mock data
      req.flush({});
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.readHabitEvent(1).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === apiurl + '1'
          && requrl.params.has('hid');
       });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });
});
