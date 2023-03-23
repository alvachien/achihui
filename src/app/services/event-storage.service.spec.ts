import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { EventStorageService } from './event-storage.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { EventHabit, EventHabitDetail, BaseListModel, GeneralEvent } from '../model';
import { FakeDataHelper } from '../../testing';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

describe('EventStorageService', () => {
  let httpTestingController: HttpTestingController;
  let fakeData: FakeDataHelper;
  let service: EventStorageService;

  beforeEach(waitForAsync(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);
    const homeService: any = jasmine.createSpyObj('HomeDefOdataService', ['fetchHomeMembers']);
    homeService.ChosedHome = fakeData.chosedHome;
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue(fakeData.chosedHome.Members);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EventStorageService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(EventStorageService);
  }));

  it('1. should be created without data', () => {
    expect(service).toBeTruthy();
  });

  /// EventStorageService method tests begin ///
  describe('fetchGeneralEvents', () => {
    beforeEach(() => {
      service = TestBed.inject(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchGeneralEvents(100, 0).subscribe({
        next: (data: BaseListModel<GeneralEvent>) => {
          expect(data.totalCount).toEqual(10);
          expect(data.contentList.length).toEqual(1);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.generalEventUrl;
      });

      // Respond with the mock data
      req.flush({
        '@odata.count': 10,
        value: [
          {
            Id: 10,
            HomeID: 1,
            Name: 'Logon to elder mailbox | 1 / 29',
            StartDate: '2018-07-13',
            EndDate: '2018-07-13',
          },
        ],
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchGeneralEvents(100, 0).subscribe({
        next: (data: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.generalEventUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createGeneralEvent', () => {
    beforeEach(() => {
      service = TestBed.inject(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('shall work with data', () => {
      const objtbc: GeneralEvent = new GeneralEvent();
      objtbc.ID = 11;
      service.createGeneralEvent(objtbc).subscribe({
        next: (val) => {
          expect(service.GeneralEventsInBuffer.has(objtbc.ID ?? 0)).toBeTrue();
        },
        error: (err) => {
          fail('Shall not reach here');
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.generalEventUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush({
        Id: 11,
        HomeID: 1,
        Name: 'Logon to elder mailbox | 1 / 29',
        StartDate: '2018-07-13',
        EndDate: '2018-07-13',
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      const objtbc: GeneralEvent = new GeneralEvent();
      objtbc.ID = 11;
      service.createGeneralEvent(objtbc).subscribe({
        next: (data: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.generalEventUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('readGeneralEvent', () => {
    beforeEach(() => {
      service = TestBed.inject(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    // it("shall work with data", () => {});

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.readGeneralEvent(2).subscribe({
        next: (data: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.generalEventUrl + '/2';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('deleteGeneralEvent', () => {
    beforeEach(() => {
      service = TestBed.inject(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    // it("shall work with data", () => {});

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.deleteGeneralEvent(2).subscribe({
        next: (data: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === service.generalEventUrl + '/2';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchRecurEvents', () => {
    beforeEach(() => {
      service = TestBed.inject(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchRecurEvents(100, 0).subscribe({
        next: (data: any) => {
          expect(data.totalCount).toEqual(0);
        },
        error: (fail: any) => {
          // Empty
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.recurEventUrl;
      });

      // Respond with the mock data
      req.flush({ '@odata.count': 0, value: [] });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchRecurEvents(100, 0).subscribe({
        next: (data: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.recurEventUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('deleteRecurEvent', () => {
    beforeEach(() => {
      service = TestBed.inject(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    // it("shall work with data", () => {});

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.deleteRecurEvent(2).subscribe({
        next: (data: any) => {
          fail('expected to fail');
        },
        error: (err: any) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === service.recurEventUrl + '/2';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllHabitEvents', () => {
    beforeEach(() => {
      service = TestBed.inject(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllHabitEvents(100, 0).subscribe({
        next: (data) => {
          expect(data.totalCount).toEqual(0);
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.eventHabitUrl;
      });

      // Respond with the mock data
      req.flush({ totalCount: 0, contentList: [] });
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.fetchAllHabitEvents(100, 0).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.eventHabitUrl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('readHabitEvent', () => {
    beforeEach(() => {
      service = TestBed.inject(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.readHabitEvent(1).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.eventHabitUrl + '/1' && requrl.params.has('hid');
      });

      // Respond with the mock data
      req.flush({});
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.readHabitEvent(1).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.eventHabitUrl + '/1' && requrl.params.has('hid');
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
      service = TestBed.inject(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.generateHabitEvent(hevnt).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === 'POST' &&
          requrl.url === service.eventHabitUrl + '?geneMode=true' &&
          requrl.params.has('hid')
        );
      });

      // Respond with the mock data
      const arDetail: EventHabitDetail[] = [];
      for (let idx = 0; idx < 3; idx++) {
        const detail: EventHabitDetail = new EventHabitDetail();
        detail.StartDate = moment().add(idx + 1, 'M');
        detail.EndDate = moment().add(idx + 2, 'M');
        detail.Name = 'test';
        arDetail.push(detail);
      }
      req.flush(arDetail);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.generateHabitEvent(hevnt).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === 'POST' &&
          requrl.url === service.eventHabitUrl + '?geneMode=true' &&
          requrl.params.has('hid')
        );
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
      service = TestBed.inject(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.createHabitEvent(hevnt).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.eventHabitUrl && requrl.params.has('hid');
      });

      // Respond with the mock data
      req.flush(hevnt);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.createHabitEvent(hevnt).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.eventHabitUrl && requrl.params.has('hid');
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
      service = TestBed.inject(EventStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.updateHabitEvent(hevnt).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
      });

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === service.eventHabitUrl + '/11' && requrl.params.has('hid');
      });

      // Respond with the mock data
      req.flush(hevnt);
    });

    it('should return error in case error appear', () => {
      const msg = 'server failed';
      service.updateHabitEvent(hevnt).subscribe({
        next: () => {
          fail('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === service.eventHabitUrl + '/11' && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });
});
