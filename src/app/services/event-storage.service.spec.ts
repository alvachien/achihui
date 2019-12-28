import { TestBed, inject, async, fakeAsync, } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { EventStorageService } from './event-storage.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { HomeDefOdataService } from './home-def-odata.service';
import { UserAuthInfo, EventHabit, EventHabitDetail, } from '../model';
import { FakeDataHelper, asyncData, asyncError, } from '../../testing';

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
    const homeService: any = jasmine.createSpyObj('HomeDefOdataService', ['fetchHomeMembers']);
    homeService.ChosedHome = fakeData.chosedHome;
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue(fakeData.chosedHome.Members);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        EventStorageService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
      ],
    });

    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(EventStorageService);
  }));

  it('1. should be created without data', () => {
    expect(service).toBeTruthy();
  });

  /// EventStorageService method tests begin ///
  describe('fetchAllGeneralEvents', () => {
    beforeEach(() => {
      service = TestBed.get(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllGeneralEvents(100, 0, true, moment(), moment().add(1, 'y')).subscribe(
        (data: any) => {
          expect(data.totalCount).toEqual(0);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.generalEventUrl
          && requrl.params.has('hid')
          && requrl.params.has('top')
          && requrl.params.has('skip')
          && requrl.params.has('skipfinished')
          && requrl.params.has('dtbgn')
          && requrl.params.has('dtend');
       });

      // Respond with the mock data
      req.flush({totalCount: 0, contentList: []});
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.fetchAllGeneralEvents(100, 0).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.generalEventUrl
          && requrl.params.has('hid')
          && requrl.params.has('top')
          && requrl.params.has('skip')
          && !requrl.params.has('skipfinished')
          && !requrl.params.has('dtbgn')
          && !requrl.params.has('dtend');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllRecurEvents', () => {
    beforeEach(() => {
      service = TestBed.get(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllRecurEvents(100, 0).subscribe(
        (data: any) => {
          expect(data.totalCount).toEqual(0);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.recurEventUrl
          && requrl.params.has('hid')
          && requrl.params.has('top')
          && requrl.params.has('skip');
       });

      // Respond with the mock data
      req.flush({totalCount: 0, contentList: []});
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.fetchAllRecurEvents(100, 0).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.recurEventUrl
          && requrl.params.has('hid')
          && requrl.params.has('top')
          && requrl.params.has('skip');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllHabitEvents', () => {
    beforeEach(() => {
      service = TestBed.get(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllHabitEvents(100, 0).subscribe(
        (data: any) => {
          expect(data.totalCount).toEqual(0);
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.eventHabitUrl;
       });

      // Respond with the mock data
      req.flush({totalCount: 0, contentList: []});
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.fetchAllHabitEvents(100, 0).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === service.eventHabitUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('readHabitEvent', () => {
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
          && requrl.url === service.eventHabitUrl + '/1'
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
          && requrl.url === service.eventHabitUrl + '/1'
          && requrl.params.has('hid');
       });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('generateHabitEvent', () => {
    let hevnt: EventHabit;

    beforeEach(() => {
      hevnt = new EventHabit();
      hevnt.Name = 'test';
      hevnt.StartDate = moment();
      hevnt.EndDate = moment().add(1, 'y');
      hevnt.content = 'test';
      service = TestBed.get(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.generateHabitEvent(hevnt).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST'
          && requrl.url === service.eventHabitUrl + '?geneMode=true'
          && requrl.params.has('hid');
       });

      // Respond with the mock data
      let arDetail: EventHabitDetail[] = [];
      for (let idx: number = 0; idx < 3; idx ++) {
        let detail: EventHabitDetail = new EventHabitDetail();
        detail.StartDate = moment().add(idx + 1, 'M');
        detail.EndDate = moment().add(idx + 2, 'M');
        detail.Name = 'test';
        arDetail.push(detail);
      }
      req.flush(arDetail);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.generateHabitEvent(hevnt).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST'
          && requrl.url === service.eventHabitUrl + '?geneMode=true'
          && requrl.params.has('hid');
       });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createHabitEvent', () => {
    let hevnt: EventHabit;

    beforeEach(() => {
      hevnt = new EventHabit();
      hevnt.Name = 'test';
      hevnt.StartDate = moment();
      hevnt.EndDate = moment().add(1, 'y');
      hevnt.content = 'test';
      service = TestBed.get(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.createHabitEvent(hevnt).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST'
          && requrl.url === service.eventHabitUrl
          && requrl.params.has('hid');
       });

      // Respond with the mock data
      req.flush(hevnt);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.createHabitEvent(hevnt).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST'
          && requrl.url === service.eventHabitUrl
          && requrl.params.has('hid');
       });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('updateHabitEvent', () => {
    let hevnt: EventHabit;

    beforeEach(() => {
      hevnt = new EventHabit();
      hevnt.Name = 'test';
      hevnt.StartDate = moment();
      hevnt.EndDate = moment().add(1, 'y');
      hevnt.content = 'test';
      hevnt.ID = 11;
      service = TestBed.get(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.updateHabitEvent(hevnt).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT'
          && requrl.url === service.eventHabitUrl + '/11'
          && requrl.params.has('hid');
       });

      // Respond with the mock data
      req.flush(hevnt);
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';
      service.updateHabitEvent(hevnt).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT'
          && requrl.url === service.eventHabitUrl + '/11'
          && requrl.params.has('hid');
       });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });
});