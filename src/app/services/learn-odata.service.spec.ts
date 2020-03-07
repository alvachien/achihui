import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { LearnOdataService } from './learn-odata.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { environment } from '../../environments/environment';
import { FakeDataHelper } from '../../testing';
import { QuestionBankItem, QuestionBankTypeEnum, LearnObject, LearnHistory } from '../model';

describe('LearnOdataService', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let fakeData: FakeDataHelper;
  let service: LearnOdataService;

  beforeEach(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildLearnCategoriesFromAPI();
    fakeData.buildLearnCategories();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);
    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        LearnOdataService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
      ],
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });
  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('1. should be created', () => {
    service = TestBed.get(LearnOdataService);
    expect(service).toBeTruthy();
  });

  /// LearnOdataService method tests begin ///
  describe('fetchAllCategories', () => {
    beforeEach(() => {
      service = TestBed.get(LearnOdataService);
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
        return requrl.method === 'GET' && requrl.url === service.categoryurl;
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock categories
      req.flush({
        value: fakeData.learnCategoriesFromAPI
      });
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
        return requrl.method === 'GET' && requrl.url === service.categoryurl;
       });
      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.fetchAllCategories().subscribe(
        (curries: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.categoryurl;
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
        return requrl.method === 'GET' && requrl.url === service.categoryurl;
       });
      expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
      reqs[0].flush({
        value: fakeData.learnCategoriesFromAPI
      });
      httpTestingController.verify();

      // Second call
      service.fetchAllCategories().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.categoryurl;
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
        return requrl.method === 'GET' && requrl.url === service.categoryurl;
       });
      expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('createObject', () => {
    let item: LearnObject;

    beforeEach(() => {
      item = new LearnObject();
      item.Name = 'object 1';
      item.CategoryId = fakeData.learnCategories[0].Id;
      item.Content = 'test';

      service = TestBed.get(LearnOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.createObject(item).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.objecturl;
       });

      // Respond with the mock data
      req.flush(item.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.createObject(item).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.objecturl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('updateObject', () => {
    let item: LearnObject;

    beforeEach(() => {
      item = new LearnObject();
      item.Id = 2;
      item.Name = 'object 1';
      item.CategoryId = fakeData.learnCategories[0].Id;
      item.Content = 'test';

      service = TestBed.get(LearnOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.updateObject(item).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === service.objecturl + '(2)';
       });

      // Respond with the mock data
      req.flush(item.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.updateObject(item).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === service.objecturl + '(2)';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('deleteObject', () => {
    let item: LearnObject;

    beforeEach(() => {
      item = new LearnObject();
      item.Id = 2;
      item.Name = 'object 1';
      item.CategoryId = fakeData.learnCategories[0].Id;
      item.Content = 'test';

      service = TestBed.get(LearnOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.deleteObject(2).subscribe(
        (data: any) => {
          // expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === service.objecturl + '(2)';
       });

      // Respond with the mock data
      req.flush('', { status: 200, statusText: 'OK' });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.deleteObject(2).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === service.objecturl + '(2)';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('readObject', () => {
    let item: LearnObject;

    beforeEach(() => {
      item = new LearnObject();
      item.Id = 2;
      item.Name = 'object 1';
      item.CategoryId = fakeData.learnCategories[0].Id;
      item.Content = 'test';

      service = TestBed.get(LearnOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.readObject(2).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.objecturl;
       });

      // Respond with the mock data
      req.flush({
        value: [item.writeJSONObject()],
      });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.readObject(2).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.objecturl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllObjects', () => {
    beforeEach(() => {
      service = TestBed.get(LearnOdataService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllObjects().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.objecturl;
       });

      // Respond with the mock data
      let obj1: LearnObject = new LearnObject();
      obj1.Id = 1;
      obj1.Name = 'test1';
      obj1.HID = 1;
      obj1.CategoryId = 1;
      obj1.Content = 'test1';
      req.flush({
        '@odata.count': 2,
        value: [obj1],
      });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.fetchAllObjects().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.objecturl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });
});
