import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { LearnStorageService } from './learn-storage.service';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import { environment } from '../../environments/environment';
import { FakeDataHelper } from '../../../../src/testing';
import { QuestionBankItem, QuestionBankTypeEnum, LearnObject, LearnHistory } from '../model';

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
    fakeData.buildLearnCategories();

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

  describe('createQuestionBankItem', () => {
    let item: QuestionBankItem;

    beforeEach(() => {
      item = new QuestionBankItem();
      item.QBType = QuestionBankTypeEnum.EssayQuestion;
      item.Question = 'question 1';
      item.BriefAnswer = 'brief 1';

      service = TestBed.get(LearnStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.createQuestionBankItem(item).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.questionurl;
       });

      // Respond with the mock data
      req.flush(item.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.createQuestionBankItem(item).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.questionurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('updateQuestionBankItem', () => {
    let item: QuestionBankItem;

    beforeEach(() => {
      item = new QuestionBankItem();
      item.ID = 2;
      item.QBType = QuestionBankTypeEnum.EssayQuestion;
      item.Question = 'question 1';
      item.BriefAnswer = 'brief 1';

      service = TestBed.get(LearnStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.updateQuestionBankItem(item).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === service.questionurl + '/2';
       });

      // Respond with the mock data
      req.flush(item.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.updateQuestionBankItem(item).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === service.questionurl + '/2';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('deleteQuestionBankItem', () => {
    let item: QuestionBankItem;

    beforeEach(() => {
      item = new QuestionBankItem();
      item.ID = 2;
      item.QBType = QuestionBankTypeEnum.EssayQuestion;
      item.Question = 'question 1';
      item.BriefAnswer = 'brief 1';

      service = TestBed.get(LearnStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.deleteQuestionBankItem(item).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === service.questionurl + '/2';
       });

      // Respond with the mock data
      req.flush('', { status: 200, statusText: 'OK' });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.deleteQuestionBankItem(item).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === service.questionurl + '/2';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('readQuestionBank', () => {
    let item: QuestionBankItem;

    beforeEach(() => {
      item = new QuestionBankItem();
      item.ID = 2;
      item.QBType = QuestionBankTypeEnum.EssayQuestion;
      item.Question = 'question 1';
      item.BriefAnswer = 'brief 1';

      service = TestBed.get(LearnStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.readQuestionBank(2).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.questionurl + '/2';
       });

      // Respond with the mock data
      req.flush(item.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.readQuestionBank(2).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.questionurl + '/2';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllQuestionBankItem', () => {
    beforeEach(() => {
      service = TestBed.get(LearnStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllQuestionBankItem().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.questionurl
          && requrl.params.has('hid');
       });

      // Respond with the mock data
      let item1: QuestionBankItem;
      item1 = new QuestionBankItem();
      item1.ID = 2;
      item1.QBType = QuestionBankTypeEnum.EssayQuestion;
      item1.Question = 'question 1';
      item1.BriefAnswer = 'brief 1';
      let item2: QuestionBankItem;
      item2 = new QuestionBankItem();
      item2.ID = 3;
      item2.QBType = QuestionBankTypeEnum.EssayQuestion;
      item2.Question = 'question 2';
      item2.BriefAnswer = 'brief 2';

      req.flush({
        totalCount: 2,
        contentList: [item1.writeJSONObject(), item2.writeJSONObject()],
      });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.fetchAllQuestionBankItem().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.questionurl
          && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createObject', () => {
    let item: LearnObject;

    beforeEach(() => {
      item = new LearnObject();
      item.Name = 'object 1';
      item.CategoryId = fakeData.learnCategories[0].Id;
      item.Content = 'test';

      service = TestBed.get(LearnStorageService);
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

      service = TestBed.get(LearnStorageService);
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
        return requrl.method === 'PUT' && requrl.url === service.objecturl + '/2';
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
        return requrl.method === 'PUT' && requrl.url === service.objecturl + '/2';
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

      service = TestBed.get(LearnStorageService);
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
        return requrl.method === 'DELETE' && requrl.url === service.objecturl + '/2';
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
        return requrl.method === 'DELETE' && requrl.url === service.objecturl + '/2';
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

      service = TestBed.get(LearnStorageService);
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
        return requrl.method === 'GET' && requrl.url === service.objecturl + '/2';
       });

      // Respond with the mock data
      req.flush(item.writeJSONObject());
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
        return requrl.method === 'GET' && requrl.url === service.objecturl + '/2';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllObjects', () => {
    beforeEach(() => {
      service = TestBed.get(LearnStorageService);
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
        return requrl.method === 'GET' && requrl.url === service.objecturl
          && requrl.params.has('hid');
       });

      // Respond with the mock data
      let obj1: LearnObject = new LearnObject();
      obj1.Id = 1;
      obj1.Name = 'test1';
      obj1.HID = 1;
      obj1.CategoryId = 1;
      obj1.Content = 'test1';
      req.flush({
        totalCount: 2,
        contentList: [obj1],
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
        return requrl.method === 'GET' && requrl.url === service.objecturl
          && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('fetchAllHistories', () => {
    beforeEach(() => {
      service = TestBed.get(LearnStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.fetchAllHistories().subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.historyurl
          && requrl.params.has('hid');
       });

      // Respond with the mock data
      let hist1: LearnHistory = new LearnHistory();
      hist1.HID = 1;
      hist1.ObjectId = 1;
      hist1.ObjectName = 'test';
      hist1.UserId = 'user1';
      hist1.LearnDate = moment();

      req.flush({
        totalCount: 2,
        contentList: [hist1],
      });
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.fetchAllHistories().subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.historyurl
          && requrl.params.has('hid');
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('createHistory', () => {
    let hist1: LearnHistory;

    beforeEach(() => {
      hist1 = new LearnHistory();
      hist1.HID = 1;
      hist1.ObjectId = 1;
      hist1.ObjectName = 'test';
      hist1.UserId = 'user1';
      hist1.LearnDate = moment();

      service = TestBed.get(LearnStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.createHistory(hist1).subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.historyurl;
       });

      // Respond with the mock data
      req.flush(hist1.writeJSONString());
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.createHistory(hist1).subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.historyurl;
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });

  describe('readHistory', () => {
    let hist1: LearnHistory;

    beforeEach(() => {
      hist1 = new LearnHistory();
      hist1.HID = 1;
      hist1.ObjectId = 1;
      hist1.ObjectName = 'test';
      hist1.UserId = 'user1';
      hist1.LearnDate = moment();

      service = TestBed.get(LearnStorageService);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return data for success case', () => {
      service.readHistory('2').subscribe(
        (data: any) => {
          expect(data).toBeTruthy();
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET cc from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.historyurl + '/2';
       });

      // Respond with the mock data
      req.flush(hist1.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg: string = 'server failed';

      service.readHistory('2').subscribe(
        (data: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.historyurl + '/2';
      });

      // respond with a 500 and the error message in the body
      req.flush(msg, { status: 500, statusText: 'server failed' });
    });
  });
});
