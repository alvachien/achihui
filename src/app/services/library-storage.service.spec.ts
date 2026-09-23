import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { LibraryStorageService } from './library-storage.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import {
  Book,
  BookCategory,
  BookReadingStatus,
  Location,
  LocationTypeEnum,
  Organization,
  OrganizationType,
  Person,
  PersonRole,
} from '../model';
import { FakeDataHelper } from '../../testing';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('LibraryStorageService', () => {
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

  let httpTestingController: HttpTestingController;
  let fakeData: FakeDataHelper;
  let service: LibraryStorageService;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
  });

  beforeEach(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = signal(fakeData.currentUser);
    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        LibraryStorageService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    service = TestBed.inject(LibraryStorageService);
    expect(service).toBeTruthy();
  });

  /// LibraryStorageService method tests begin ///

  // fetchAllPersonRoles
  describe('fetchAllPersonRoles', () => {
    let arRoles: PersonRole[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arRoles = [];
      let nitem = new PersonRole();
      nitem.ID = 1;
      nitem.HomeID = 2;
      nitem.Name = 'HID2ID1';
      arRoles.push(nitem);
      nitem = new PersonRole();
      nitem.ID = 2;
      nitem.HomeID = 2;
      nitem.Name = 'HID2ID2';
      arRoles.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected fetchAllPersonRoles (called once)', () => {
      expect(service.PersonRoles.length, 'by default is empty').toEqual(0);

      service.fetchAllPersonRoles().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected person roles').toEqual(arRoles.length);
          expect(service.PersonRoles.length, 'should have buffered').toEqual(arRoles.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL;
      });

      // Respond with the mock data
      req.flush({ '@odata.count': arRoles.length, value: arRoles });
    });

    it('should be OK returning no peron roles', () => {
      expect(service.PersonRoles.length, 'should not buffered yet').toEqual(0);
      service.fetchAllPersonRoles().subscribe({
        next: (data) => {
          expect(data.length, 'should have empty peron roles array').toEqual(0);
          expect(service.PersonRoles.length, 'should buffered nothing').toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL;
      });

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchAllPersonRoles().subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected peron roles (called multiple times)', () => {
      expect(service.PersonRoles.length, 'should not buffered yet').toEqual(0);
      service.fetchAllPersonRoles().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected person roles').toEqual(arRoles.length);
          expect(data.length, 'should have buffered').toEqual(service.PersonRoles.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL;
      });

      req.flush({ '@odata.count': arRoles.length, value: arRoles });
      httpTestingController.verify();

      // Second call
      service.fetchAllPersonRoles().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL;
      });
      expect(reqs2.length, 'shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllPersonRoles().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected person roles').toEqual(arRoles.length);
        },
        error: (err) => {
          // Do nothing
        },
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL;
      });
      expect(reqs3.length, 'shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  // fetchAllOrganizationTypes
  describe('fetchAllOrganizationTypes', () => {
    let arData: OrganizationType[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arData = [];
      let nitem = new OrganizationType();
      nitem.ID = 1;
      nitem.HomeID = 2;
      nitem.Name = 'HID2ID1';
      arData.push(nitem);
      nitem = new OrganizationType();
      nitem.ID = 2;
      nitem.HomeID = 2;
      nitem.Name = 'HID2ID2';
      arData.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected fetchAllOrganizationTypes (called once)', () => {
      expect(service.OrganizationTypes.length, 'by default is empty').toEqual(0);

      service.fetchAllOrganizationTypes().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected organization type').toEqual(arData.length);
          expect(service.OrganizationTypes.length, 'should have buffered').toEqual(arData.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL;
      });

      // Respond with the mock data
      req.flush({ '@odata.count': arData.length, value: arData });
    });

    it('should be OK returning no organization types', () => {
      expect(service.OrganizationTypes.length, 'should not buffered yet').toEqual(0);
      service.fetchAllOrganizationTypes().subscribe({
        next: (data) => {
          expect(data.length, 'should have empty organization type array').toEqual(0);
          expect(service.OrganizationTypes.length, 'should buffered nothing').toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL;
      });

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchAllOrganizationTypes().subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected organization types (called multiple times)', () => {
      expect(service.OrganizationTypes.length, 'should not buffered yet').toEqual(0);
      service.fetchAllOrganizationTypes().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected organization types').toEqual(arData.length);
          expect(data.length, 'should have buffered').toEqual(service.OrganizationTypes.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL;
      });

      req.flush({ '@odata.count': arData.length, value: arData });
      httpTestingController.verify();

      // Second call
      service.fetchAllOrganizationTypes().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL;
      });
      expect(reqs2.length, 'shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllOrganizationTypes().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected organization types').toEqual(arData.length);
        },
        error: (err) => {
          // Do nothing
        },
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL;
      });
      expect(reqs3.length, 'shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  // fetchAllBookCategories
  describe('fetchAllBookCategories', () => {
    let arBookCtgy: BookCategory[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arBookCtgy = [];
      let nctgy = new BookCategory();
      nctgy.ID = 1;
      nctgy.HID = 2;
      nctgy.Name = 'HID2ID1';
      arBookCtgy.push(nctgy);
      nctgy = new BookCategory();
      nctgy.ID = 2;
      nctgy.HID = 2;
      nctgy.Name = 'HID2ID2';
      arBookCtgy.push(nctgy);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected bookCategories (called once)', () => {
      expect(service.BookCategories.length, 'should not buffered yet').toEqual(0);

      service.fetchAllBookCategories().subscribe({
        next: (ctgies) => {
          expect(ctgies.length, 'should return expected book categories').toEqual(arBookCtgy.length);
          expect(service.BookCategories.length, 'should have buffered').toEqual(arBookCtgy.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET bookCategories from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL;
      });

      // Respond with the mock bookCategories
      req.flush({ '@odata.count': arBookCtgy.length, value: arBookCtgy });
    });

    it('should be OK returning no bookCategories', () => {
      expect(service.BookCategories.length, 'should not buffered yet').toEqual(0);
      service.fetchAllBookCategories().subscribe({
        next: (data) => {
          expect(data.length, 'should have empty bookCategories array').toEqual(0);
          expect(service.BookCategories.length, 'should buffered nothing').toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL;
      });

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchAllBookCategories().subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected bookCategories (called multiple times)', () => {
      expect(service.BookCategories.length, 'should not buffered yet').toEqual(0);
      service.fetchAllBookCategories().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected book categories').toEqual(arBookCtgy.length);
          expect(data.length, 'should have buffered').toEqual(service.BookCategories.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL;
      });
      expect(reqs.length, 'shall be only 1 calls to real API!').toEqual(1);
      reqs[0].flush({ '@odata.count': arBookCtgy.length, value: arBookCtgy });
      httpTestingController.verify();

      // Second call
      service.fetchAllBookCategories().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL;
      });
      expect(reqs2.length, 'shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllBookCategories().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected book categories').toEqual(arBookCtgy.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL;
      });
      expect(reqs3.length, 'shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  // fetchAllPersons
  describe('fetchAllPersons', () => {
    let arData: Person[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arData = [];
      let nitem = new Person();
      nitem.ID = 1;
      nitem.HID = 2;
      nitem.NativeName = 'HID2ID1';
      nitem.ChineseName = 'HID2ID1_CN';
      arData.push(nitem);
      nitem = new Person();
      nitem.ID = 2;
      nitem.HID = 2;
      nitem.NativeName = 'HID2ID2';
      nitem.ChineseName = 'HID2ID2_CN';
      arData.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected fetchAllPersons (called once)', () => {
      expect(service.Persons.length, 'by default is empty').toEqual(0);

      service.fetchAllPersons().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected data').toEqual(arData.length);
          expect(service.Persons.length, 'should have buffered').toEqual(arData.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personAPIURL;
      });

      // Respond with the mock data
      req.flush({ '@odata.count': arData.length, value: arData });
    });

    it('should be OK returning no peron roles', () => {
      expect(service.Persons.length, 'should not buffered yet').toEqual(0);
      service.fetchAllPersons().subscribe({
        next: (data) => {
          expect(data.length, 'should have empty data array').toEqual(0);
          expect(service.Persons.length, 'should buffered nothing').toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personAPIURL;
      });

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchAllPersons().subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected perons (called multiple times)', () => {
      expect(service.Persons.length, 'should not buffered yet').toEqual(0);
      service.fetchAllPersons().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected data').toEqual(arData.length);
          expect(data.length, 'should have buffered').toEqual(service.Persons.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personAPIURL;
      });

      req.flush({ '@odata.count': arData.length, value: arData });
      httpTestingController.verify();

      // Second call
      service.fetchAllPersons().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personAPIURL;
      });
      expect(reqs2.length, 'shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllPersons().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected persons').toEqual(arData.length);
        },
        error: (err) => {
          // Do nothing
        },
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personAPIURL;
      });
      expect(reqs3.length, 'shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  // readPerson
  describe('readPerson', () => {
    let objdata: any;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);

      objdata = {
        Id: 2,
        HomeID: 2,
        NativeName: 'User 2',
      };
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.readPerson(2).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(2);
          expect(data.HID).toEqual(2);
          expect(data.NativeName).toEqual('User 2');
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personAPIURL;
      });

      // Respond with the mock data
      req.flush({ value: [objdata] });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.readPerson(2).subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should error when no record matches (stale detail link)', () => {
      service.readPerson(999).subscribe({
        next: () => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain('not found');
          // The thrown "not found" Error must reach the caller verbatim - it must
          // NOT be re-formatted by the HTTP error helper (yields "undefined undefined").
          expect(err.toString()).toEqual('Error: Person 999 not found');
          expect(err.toString()).not.toContain('undefined');
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personAPIURL;
      });

      // Respond with an empty value array - the record does not exist.
      req.flush({ value: [] });
    });
  });

  // createPerson
  describe('createPerson', () => {
    let objdata: Person;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      objdata = new Person();
      objdata.ID = 1;
      objdata.HID = 2;
      objdata.NativeName = 'test1';
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.createPerson(objdata).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(1);
          expect(data.HID).toEqual(2);
          expect(data.NativeName).toEqual('test1');
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.personAPIURL;
      });

      // Respond with the mock data
      req.flush(objdata.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.createPerson(objdata).subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.personAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });

  // updatePerson
  describe('updatePerson', () => {
    let objdata: Person;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      objdata = new Person();
      objdata.ID = 1;
      objdata.HID = 2;
      objdata.NativeName = 'test1';
    });
    afterEach(() => {
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.updatePerson(objdata).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(1);
          expect(data.NativeName).toEqual('test1');
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === `${service.personAPIURL}(1)`;
      });

      req.flush(objdata.writeJSONObject());
    });

    it('should sync the buffered Persons list so cached fetchAllPersons reflects the update', () => {
      // Prime the buffer with a server fetch.
      service.fetchAllPersons().subscribe();
      const getReq: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personAPIURL;
      });
      getReq.flush({ '@odata.count': 1, value: [{ Id: 1, HomeID: 2, NativeName: 'John' }] });

      service.updatePerson(objdata).subscribe();
      const putReq: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === `${service.personAPIURL}(1)`;
      });
      putReq.flush(objdata.writeJSONObject());

      // Cached read must be served from the buffer (no new request) AND show the saved name.
      let cached: Person[] = [];
      service.fetchAllPersons().subscribe((data) => (cached = data));
      const lingering = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personAPIURL;
      });
      expect(lingering.length, 'buffer hit, no refetch').toEqual(0);
      expect(cached.length).toEqual(1);
      expect(cached[0].NativeName).toEqual('test1');
    });
  });

  // deletePerson
  describe('deletePerson', () => {
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.deletePerson(2).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === `${service.personAPIURL}(2)`;
      });

      // Respond with the mock data
      req.flush({});
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.deletePerson(2).subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === `${service.personAPIURL}(2)`;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });

  // fetchAllOrganizations
  describe('fetchAllOrganizations', () => {
    let arData: Organization[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arData = [];
      let nitem = new Organization();
      nitem.ID = 1;
      nitem.HID = 2;
      nitem.NativeName = 'HID2ID1';
      nitem.ChineseName = 'HID2ID1_CN';
      arData.push(nitem);
      nitem = new Organization();
      nitem.ID = 2;
      nitem.HID = 2;
      nitem.NativeName = 'HID2ID2';
      nitem.ChineseName = 'HID2ID2_CN';
      arData.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected fetchAllOrganizations (called once)', () => {
      expect(service.Organizations.length, 'by default is empty').toEqual(0);

      service.fetchAllOrganizations().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected data').toEqual(arData.length);
          expect(service.Organizations.length, 'should have buffered').toEqual(arData.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.organizationAPIURL;
      });

      // Respond with the mock data
      req.flush({ '@odata.count': arData.length, value: arData });
    });

    it('should be OK returning no peron roles', () => {
      expect(service.Organizations.length, 'should not buffered yet').toEqual(0);
      service.fetchAllOrganizations().subscribe({
        next: (data) => {
          expect(data.length, 'should have empty data array').toEqual(0);
          expect(service.Organizations.length, 'should buffered nothing').toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.organizationAPIURL;
      });

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchAllOrganizations().subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.organizationAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected perons (called multiple times)', () => {
      expect(service.Organizations.length, 'should not buffered yet').toEqual(0);
      service.fetchAllOrganizations().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected data').toEqual(arData.length);
          expect(data.length, 'should have buffered').toEqual(service.Organizations.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.organizationAPIURL;
      });

      req.flush({ '@odata.count': arData.length, value: arData });
      httpTestingController.verify();

      // Second call
      service.fetchAllOrganizations().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.organizationAPIURL;
      });
      expect(reqs2.length, 'shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllOrganizations().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected data').toEqual(arData.length);
        },
        error: (err) => {
          // Do nothing
        },
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.organizationAPIURL;
      });
      expect(reqs3.length, 'shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  // readOrganization
  describe('readOrganization', () => {
    let objdata: any;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);

      objdata = {
        Id: 2,
        HomeID: 2,
        NativeName: 'User 2',
      };
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.readOrganization(2).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(2);
          expect(data.HID).toEqual(2);
          expect(data.NativeName).toEqual('User 2');
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.organizationAPIURL;
      });

      // Respond with the mock data
      req.flush({ value: [objdata] });
    });

    it('should error when no record matches (stale detail link)', () => {
      service.readOrganization(999).subscribe({
        next: () => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toEqual('Error: Organization 999 not found');
          expect(err.toString()).not.toContain('undefined');
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.organizationAPIURL;
      });

      // Respond with an empty value array - the record does not exist.
      req.flush({ value: [] });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.readOrganization(2).subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.organizationAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });

  // createOrganization
  describe('createOrganization', () => {
    let objdata: Organization;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      objdata = new Organization();
      objdata.ID = 1;
      objdata.HID = 2;
      objdata.NativeName = 'test1';
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.createOrganization(objdata).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(1);
          expect(data.HID).toEqual(2);
          expect(data.NativeName).toEqual('test1');
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.organizationAPIURL;
      });

      // Respond with the mock data
      req.flush(objdata.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.createOrganization(objdata).subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.organizationAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });

  // updateOrganization
  describe('updateOrganization', () => {
    let objdata: Organization;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      objdata = new Organization();
      objdata.ID = 1;
      objdata.HID = 2;
      objdata.NativeName = 'test-org';
    });
    afterEach(() => {
      httpTestingController.verify();
    });

    it('should sync the buffered Organizations list so cached fetchAllOrganizations reflects the update', () => {
      service.fetchAllOrganizations().subscribe();
      const getReq: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.organizationAPIURL;
      });
      getReq.flush({ '@odata.count': 1, value: [{ Id: 1, HomeID: 2, NativeName: 'Old Org' }] });

      service.updateOrganization(objdata).subscribe();
      const putReq: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === `${service.organizationAPIURL}(1)`;
      });
      putReq.flush(objdata.writeJSONObject());

      let cached: Organization[] = [];
      service.fetchAllOrganizations().subscribe((data) => (cached = data));
      const lingering = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.organizationAPIURL;
      });
      expect(lingering.length, 'buffer hit, no refetch').toEqual(0);
      expect(cached.length).toEqual(1);
      expect(cached[0].NativeName).toEqual('test-org');
    });
  });

  // deleteOrganization
  describe('deleteOrganization', () => {
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.deleteOrganization(2).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === `${service.organizationAPIURL}(2)`;
      });

      // Respond with the mock data
      req.flush({});
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.deleteOrganization(2).subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === `${service.organizationAPIURL}(2)`;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });

  // fetchAllLocations
  describe('fetchAllLocations', () => {
    let arData: Location[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arData = [];
      let nitem = new Location();
      nitem.ID = 1;
      nitem.HID = 2;
      nitem.Name = 'Test1';
      nitem.LocType = LocationTypeEnum.PaperBook;
      arData.push(nitem);
      nitem = new Location();
      nitem.ID = 2;
      nitem.HID = 2;
      nitem.Name = 'Test2';
      nitem.LocType = LocationTypeEnum.EBook;
      arData.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected location (called once)', () => {
      expect(service.Locations.length, 'by default is empty').toEqual(0);

      service.fetchAllLocations().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected data').toEqual(arData.length);
          expect(service.Locations.length, 'should have buffered').toEqual(arData.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL;
      });

      // Respond with the mock data
      req.flush({ '@odata.count': arData.length, value: arData });
    });

    it('should be OK returning no locations', () => {
      expect(service.Locations.length, 'should not buffered yet').toEqual(0);
      service.fetchAllLocations().subscribe({
        next: (data) => {
          expect(data.length, 'should have empty data array').toEqual(0);
          expect(service.Locations.length, 'should buffered nothing').toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL;
      });

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchAllLocations().subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected locations (called multiple times)', () => {
      expect(service.Locations.length, 'should not buffered yet').toEqual(0);
      service.fetchAllLocations().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected data').toEqual(arData.length);
          expect(data.length, 'should have buffered').toEqual(service.Locations.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL;
      });

      req.flush({ '@odata.count': arData.length, value: arData });
      httpTestingController.verify();

      // Second call
      service.fetchAllLocations().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL;
      });
      expect(reqs2.length, 'shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllLocations().subscribe({
        next: (data) => {
          expect(data.length, 'should return expected data').toEqual(arData.length);
        },
        error: (err) => {
          // Do nothing
        },
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL;
      });
      expect(reqs3.length, 'shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  // readOrganization
  describe('readLocation', () => {
    let objdata: any;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);

      objdata = {
        Id: 2,
        HomeID: 2,
        Name: 'User 2',
      };
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.readLocation(2).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(2);
          expect(data.HID).toEqual(2);
          expect(data.Name).toEqual('User 2');
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL;
      });

      // Respond with the mock data
      req.flush({ value: [objdata] });
    });

    it('should error when no record matches (stale detail link)', () => {
      service.readLocation(999).subscribe({
        next: () => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toEqual('Error: Location 999 not found');
          expect(err.toString()).not.toContain('undefined');
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL;
      });

      // Respond with an empty value array - the record does not exist.
      req.flush({ value: [] });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.readLocation(2).subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });

  // updateLocation
  describe('updateLocation', () => {
    let objdata: Location;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      objdata = new Location();
      objdata.ID = 1;
      objdata.HID = 2;
      objdata.Name = 'New Shelf';
      objdata.LocType = LocationTypeEnum.EBook;
    });
    afterEach(() => {
      httpTestingController.verify();
    });

    it('should sync the buffered Locations list so cached fetchAllLocations reflects the update', () => {
      service.fetchAllLocations().subscribe();
      const getReq: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL;
      });
      getReq.flush({ '@odata.count': 1, value: [{ Id: 1, HomeID: 2, Name: 'Old Shelf' }] });

      service.updateLocation(objdata).subscribe();
      const putReq: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'PUT' && requrl.url === `${service.locationAPIURL}(1)`;
      });
      putReq.flush(objdata.writeJSONObject());

      let cached: Location[] = [];
      service.fetchAllLocations().subscribe((data) => (cached = data));
      const lingering = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL;
      });
      expect(lingering.length, 'buffer hit, no refetch').toEqual(0);
      expect(cached.length).toEqual(1);
      expect(cached[0].Name).toEqual('New Shelf');
      expect(cached[0].LocType).toEqual(LocationTypeEnum.EBook);
    });
  });

  describe('fetchBooks', () => {
    let arData: Book[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);

      arData = [];
      let nitem: Book = new Book();
      nitem.ID = 1;
      nitem.HID = 2;
      nitem.NativeName = 'test1';
      arData.push(nitem);
      nitem = new Book();
      nitem.ID = 2;
      nitem.HID = 2;
      nitem.NativeName = 'test2';
      arData.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.fetchBooks(100, 0).subscribe({
        next: (data) => {
          expect(data.contentList.length, 'should return expected data').toEqual(arData.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookAPIURL;
      });

      // Respond with the mock data
      req.flush({ '@odata.count': arData.length, value: arData });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchBooks().subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('composes scope, structured filter fragment and search into $filter', () => {
      service.fetchBooks(10, 0, undefined, 'abc', 'PublishedYear gt 1990').subscribe(() => {
        /* response flushed below, assertions here touch the request */
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookAPIURL;
      });

      // Free-text search is case-insensitive: tolower() wraps BOTH sides of each
      // contains() (SQLite instr() is case-sensitive otherwise).
      expect(req.request.params.get('$filter')).toEqual(
        `HomeID eq ${fakeData.chosedHome.ID} and (PublishedYear gt 1990) and ` +
          `(contains(tolower(NativeName),tolower('abc')) or contains(tolower(ChineseName),tolower('abc')))`,
      );

      req.flush({ '@odata.count': 0, value: [] });
    });

    it('selects the audit fields shown by the list columns and parses them from the wire', () => {
      service.fetchBooks(10, 0).subscribe({
        next: (data) => {
          expect(data.contentList.length).toEqual(1);
          expect(data.contentList[0].CreatedatFormatString).toEqual('2026-09-01');
          expect(data.contentList[0].UpdatedatFormatString).toEqual('2026-09-12');
          expect(data.contentList[0].ISBN).toEqual('978-0-00-000000-0');
          expect(data.contentList[0].PublishedYear).toBe(2001);
          expect(data.contentList[0].PageCount).toBe(300);
          expect(data.contentList[0].CopyCount).toBe(0);
        },
        error: () => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookAPIURL;
      });
      const sel: string | null = req.request.params.get('$select');
      expect(sel).toContain('CreatedAt');
      expect(sel).toContain('UpdatedAt');
      // The bibliographic columns are rendered by the list, so they must be
      // selected too - otherwise every row would show blank despite the value
      // being stored (and despite the filter dialog narrowing on it).
      expect(sel).toContain('ISBN');
      expect(sel).toContain('PublishedYear');
      expect(sel).toContain('PageCount');
      // CopyCount carries a meaningful 0 (a retired book), so a row narrowed on
      // it must be able to show the 0 it matched on.
      expect(sel).toContain('CopyCount');

      req.flush({
        '@odata.count': 1,
        value: [
          {
            Id: 1,
            HomeID: 2,
            NativeName: 'test1',
            ISBN: '978-0-00-000000-0',
            PublishedYear: 2001,
            PageCount: 300,
            CopyCount: 0,
            CreatedAt: '2026-09-01',
            UpdatedAt: '2026-09-12',
          },
        ],
      });
    });
  });

  describe('checkBookDuplicate', () => {
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('emits false without any request for a blank native name', () => {
      let emitted: boolean | null = null;
      service.checkBookDuplicate('   ').subscribe((v) => (emitted = v));
      expect(emitted).toBe(false);
      // No request asserted by afterEach verify() - nothing must be on the wire.
    });

    it('composes exact-match clauses for both names and reports count > 0 as duplicate', () => {
      let emitted: boolean | null = null;
      service.checkBookDuplicate('Cross', 'C&J').subscribe((v) => (emitted = v));

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookAPIURL;
      });
      // OR-list self-grouped: fetchBooks adds its own (...) around the fragment, and
      // the whole thing is ANDed after the home scope - precedence must not leak.
      // tolower() both sides mirrors the API guard's case-folded comparison.
      expect(req.request.params.get('$filter')).toEqual(
        `HomeID eq ${fakeData.chosedHome.ID} and ((tolower(NativeName) eq 'cross' or tolower(ChineseName) eq 'cross' ` +
          `or tolower(NativeName) eq 'c&j' or tolower(ChineseName) eq 'c&j'))`,
      );
      expect(req.request.params.get('$top')).toEqual('1');
      expect(req.request.params.get('search')).toBeNull();

      req.flush({ '@odata.count': 1, value: [] });
      expect(emitted).toBe(true);
    });

    it('escapes single quotes in names (OData doubles them)', () => {
      let emitted: boolean | null = null;
      service.checkBookDuplicate("O'Brien").subscribe((v) => (emitted = v));

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookAPIURL;
      });
      expect(req.request.params.get('$filter')).toEqual(
        `HomeID eq ${fakeData.chosedHome.ID} and ((tolower(NativeName) eq 'o''brien' or tolower(ChineseName) eq 'o''brien'))`,
      );

      req.flush({ '@odata.count': 0, value: [] });
      expect(emitted).toBe(false);
    });

    it('excludes the edited record via Id ne inside the composed filter', () => {
      let emitted: boolean | null = null;
      service.checkBookDuplicate('Cross', undefined, 7).subscribe((v) => (emitted = v));

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookAPIURL;
      });
      // `and Id ne 7` binds INSIDE fetchBooks' wrapper alongside the OR group, never
      // after an ungrouped OR (which would let the excluded row slip through).
      expect(req.request.params.get('$filter')).toEqual(
        `HomeID eq ${fakeData.chosedHome.ID} and ((tolower(NativeName) eq 'cross' or tolower(ChineseName) eq 'cross') and Id ne 7)`,
      );

      req.flush({ '@odata.count': 0, value: [] });
      expect(emitted).toBe(false);
    });
  });

  describe('readBoook', () => {
    let objdata: Book;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);

      objdata = new Book();
      objdata.ID = 1;
      objdata.HID = 2;
      objdata.NativeName = 'test1';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.readBook(2).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(objdata.ID);
          expect(data.HID).toEqual(objdata.HID);
          expect(data.NativeName).toEqual(objdata.NativeName);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookAPIURL;
      });

      // Respond with the mock data
      req.flush({ value: [objdata.writeJSONObject()] });
    });

    it('should error when no record matches (stale detail link)', () => {
      service.readBook(999).subscribe({
        next: () => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toEqual('Error: Book 999 not found');
          expect(err.toString()).not.toContain('undefined');
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookAPIURL;
      });

      // Respond with an empty value array - the record does not exist.
      req.flush({ value: [] });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.readBook(2).subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createBook', () => {
    let objdata: Book;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      objdata = new Book();
      objdata.ID = 1;
      objdata.HID = 2;
      objdata.NativeName = 'test1';
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.createBook(objdata).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(objdata.ID);
          expect(data.HID).toEqual(objdata.HID);
          expect(data.NativeName).toEqual(objdata.NativeName);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.bookAPIURL;
      });

      // Respond with the mock data
      req.flush(objdata.writeJSONObject());
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.createBook(objdata).subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.bookAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteBook', () => {
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected data', () => {
      service.deleteBook(2).subscribe({});

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === `${service.bookAPIURL}(2)`;
      });

      // Respond with the mock data
      req.flush({});
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.deleteBook(2).subscribe({
        next: (data) => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'DELETE' && requrl.url === `${service.bookAPIURL}(2)`;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });

  // Book reading records: list query shape + the lifecycle actions
  describe('book reading records', () => {
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
    });
    afterEach(() => {
      httpTestingController.verify();
    });

    it('selects Status in the list query and parses it from the wire', () => {
      service.fetchBookReadingRecords(10, 0).subscribe((x) => {
        expect(x.totalCount).toEqual(1);
        expect(x.contentList.length).toEqual(1);
        expect(x.contentList[0].Status).toEqual(BookReadingStatus.Reading);
        expect(x.contentList[0].IsReading).toBe(true);
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookReadingRecordAPIURL;
      });
      // The lifecycle column must be part of the projection.
      expect(req.request.params.get('$select')).toContain('Status');

      req.flush({
        '@odata.count': 1,
        value: [
          {
            Id: 1,
            HomeID: fakeData.chosedHome.ID,
            BookId: 7,
            User: 'u',
            FromDate: '2026-09-01',
            ToDate: null,
            Comment: null,
            Status: 'Reading',
          },
        ],
      });
    });

    it('completes a record via the bare CompleteReading action route', () => {
      service.completeBookReadingRecord(3, 55, '2026-09-20').subscribe((x) => {
        expect(x.Status).toEqual(BookReadingStatus.Completed);
        expect(x.ToDate).toBeTruthy();
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === `${service.bookReadingRecordAPIURL}/CompleteReading`;
      });
      expect(req.request.body).toEqual({ HomeID: 3, RecordID: 55, ToDate: '2026-09-20' });

      req.flush({
        Id: 55,
        HomeID: 3,
        BookId: 7,
        User: 'u',
        FromDate: '2026-09-01',
        ToDate: '2026-09-20',
        Status: 'Completed',
      });
    });

    it('aborts a record and omits ToDate when none is given', () => {
      service.abortBookReadingRecord(3, 55).subscribe((x) => {
        expect(x.Status).toEqual(BookReadingStatus.Aborted);
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === `${service.bookReadingRecordAPIURL}/AbortReading`;
      });
      // The key must be absent entirely - an explicit null would fail the
      // server-side string cast for the optional ToDate parameter.
      expect(req.request.body).toEqual({ HomeID: 3, RecordID: 55 });

      req.flush({ Id: 55, HomeID: 3, BookId: 7, User: 'u', FromDate: '2026-09-01', Status: 'Aborted' });
    });

    it('surfaces the server verdict when the transition is refused', () => {
      const msg = 'Only a record in Reading status can be completed';
      service.completeBookReadingRecord(3, 55, '2026-09-20').subscribe({
        next: () => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === `${service.bookReadingRecordAPIURL}/CompleteReading`;
      });
      req.flush(msg, { status: 400, statusText: 'Bad Request' });
    });

    it('surfaces the middleware verdict without the raw JSON envelope', () => {
      // ErrorHandlingMiddleware writes handled 4xx as {"error":"<message>"} -
      // the user-facing modal must show the verdict, not the envelope.
      service.completeBookReadingRecord(3, 55, '2026-09-20').subscribe({
        next: () => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain('Reading period overlaps an existing record');
          expect(err.toString()).not.toContain('{');
          expect(err.toString()).not.toContain('Http failure response');
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === `${service.bookReadingRecordAPIURL}/CompleteReading`;
      });
      req.flush(
        { error: 'Reading period overlaps an existing record of the same reader for this book' },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('inlines reader-matched user ids into the search filter', () => {
      service.fetchBookReadingRecords(10, 0, undefined, 'creator', undefined, [], ['user-1', "o'x"]).subscribe((x) => {
        expect(x.totalCount).toEqual(0);
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookReadingRecordAPIURL;
      });
      const filter: string = req.request.params.get('$filter') ?? '';
      // Quote doubling protects the OData string literals.
      expect(filter).toContain("User in ('user-1','o''x')");
      expect(filter).toContain("contains(tolower(User),tolower('creator'))");

      req.flush({ '@odata.count': 0, value: [] });
    });
  });

  // Library overview aggregate: ONE bound-action POST replaces the old paged
  // $expand walks (the server caps $top at 100 and the ranking math moved to
  // the API - covered by the server-side action tests).
  describe('fetchLibraryOverviewKeyFigure', () => {
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
    });
    afterEach(() => {
      httpTestingController.verify();
    });

    it('should POST the home-scoped action and map the one-element value list', () => {
      service.fetchLibraryOverviewKeyFigure().subscribe((stats) => {
        expect(stats.totalBooks).toEqual(7);
        expect(stats.totalCopies).toEqual(9);
        expect(stats.addedThisMonth).toEqual(2);
        expect(stats.addedLastMonth).toEqual(1);
        expect(stats.completedThisMonth).toEqual(3);
        expect(stats.completedLastMonth).toEqual(0);
        expect(stats.topCategories.length).toEqual(1);
        expect(stats.topCategories[0]).toEqual({ key: '5', name: 'Cat', count: 4 });
        expect(stats.topAuthors, 'absent wire arrays fold to empty lists').toEqual([]);
        expect(stats.topPresses).toEqual([]);
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.bookAPIURL + '/GetLibraryOverviewKeyFigure';
      });
      // The HttpClient testing controller exposes the object body parsed.
      const body: any = req.request.body;
      expect(Object.keys(body)).toEqual(['HomeID']);

      req.flush({
        value: [
          {
            HomeID: 2,
            TotalBooks: 7,
            TotalCopies: 9,
            AddedThisMonth: 2,
            AddedLastMonth: 1,
            CompletedThisMonth: 3,
            CompletedLastMonth: 0,
            TopCategories: [{ Key: 5, Name: 'Cat', Count: 4 }],
          },
        ],
      });
    });

    it('should return error in case error appear', () => {
      const msg = 'Error 404';
      service.fetchLibraryOverviewKeyFigure().subscribe({
        next: () => {
          throw new Error('expected to fail');
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'POST' && requrl.url === service.bookAPIURL + '/GetLibraryOverviewKeyFigure';
      });
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });
  });
});
