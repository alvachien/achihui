import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { LearnStorageService } from './learn-storage.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { environment } from '../../environments/environment';
import { FakeDataHelper } from '../../testing';
import { QuestionBankItem, QuestionBankTypeEnum, LearnObject, LearnHistory } from '../model';

describe('LearnStorageService', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let fakeData: FakeDataHelper;
  let service: LearnStorageService;
  const ctgyAPIURL: any = environment.ApiUrl + '/LearnCategory';

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
        LearnStorageService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('1. should be created', () => {
    service = TestBed.inject(LearnStorageService);
    expect(service).toBeTruthy();
  });

  /// LearnStorageService method tests begin ///

  describe('getHistoryReportByUser', () => {
    const apiurl: string = environment.ApiUrl + '/LearnReportUserDate';

    beforeEach(() => {
      service = TestBed.inject(LearnStorageService);
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
    const apiurl: string = environment.ApiUrl + '/LearnReportCtgyDate';

    beforeEach(() => {
      service = TestBed.inject(LearnStorageService);
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

      service = TestBed.inject(LearnStorageService);
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

      service = TestBed.inject(LearnStorageService);
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

      service = TestBed.inject(LearnStorageService);
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

      service = TestBed.inject(LearnStorageService);
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
      service = TestBed.inject(LearnStorageService);
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

  describe('fetchAllHistories', () => {
    beforeEach(() => {
      service = TestBed.inject(LearnStorageService);
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

      service = TestBed.inject(LearnStorageService);
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

      service = TestBed.inject(LearnStorageService);
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