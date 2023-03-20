import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { BehaviorSubject } from "rxjs";

import { LibraryStorageService } from "./library-storage.service";
import { AuthService } from "./auth.service";
import { HomeDefOdataService } from "./home-def-odata.service";
import {
  Book,
  BookCategory,
  Location,
  LocationTypeEnum,
  Organization,
  OrganizationType,
  Person,
  PersonRole,
} from "../model";
import { FakeDataHelper } from "../../testing";

describe("LibraryStorageService", () => {
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
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);
    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LibraryStorageService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it("should be created", () => {
    service = TestBed.inject(LibraryStorageService);
    expect(service).toBeTruthy();
  });

  /// LibraryStorageService method tests begin ///

  // fetchAllPersonRoles
  describe("fetchAllPersonRoles", () => {
    let arRoles: PersonRole[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arRoles = [];
      let nitem = new PersonRole();
      nitem.ID = 1;
      nitem.HomeID = 2;
      nitem.Name = "HID2ID1";
      arRoles.push(nitem);
      nitem = new PersonRole();
      nitem.ID = 2;
      nitem.HomeID = 2;
      nitem.Name = "HID2ID2";
      arRoles.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected fetchAllPersonRoles (called once)", () => {
      expect(service.PersonRoles.length)
        .withContext("by default is empty")
        .toEqual(0);

      service.fetchAllPersonRoles().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected person roles")
            .toEqual(arRoles.length);
          expect(service.PersonRoles.length)
            .withContext("should have buffered")
            .toEqual(arRoles.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.personRoleAPIURL
        );
      });

      // Respond with the mock data
      req.flush({ "@odata.count": arRoles.length, value: arRoles });
    });

    it("should be OK returning no peron roles", () => {
      expect(service.PersonRoles.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllPersonRoles().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should have empty peron roles array")
            .toEqual(0);
          expect(service.PersonRoles.length)
            .withContext("should buffered nothing")
            .toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.personRoleAPIURL
        );
      });

      req.flush({}); // Respond with no data
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.fetchAllPersonRoles().subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.personRoleAPIURL
        );
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });

    it("should return expected peron roles (called multiple times)", () => {
      expect(service.PersonRoles.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllPersonRoles().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected person roles")
            .toEqual(arRoles.length);
          expect(data.length)
            .withContext("should have buffered")
            .toEqual(service.PersonRoles.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.personRoleAPIURL
        );
      });

      req.flush({ "@odata.count": arRoles.length, value: arRoles });
      httpTestingController.verify();

      // Second call
      service.fetchAllPersonRoles().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.personRoleAPIURL
        );
      });
      expect(reqs2.length)
        .withContext("shall be 0 calls to real API due to buffer!")
        .toEqual(0);

      // Third call
      service.fetchAllPersonRoles().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected person roles")
            .toEqual(arRoles.length);
        },
        error: (err) => {
          // Do nothing
        },
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.personRoleAPIURL
        );
      });
      expect(reqs3.length)
        .withContext("shall be 0 calls to real API in third call!")
        .toEqual(0);
    });
  });

  // fetchAllOrganizationTypes
  describe("fetchAllOrganizationTypes", () => {
    let arData: OrganizationType[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arData = [];
      let nitem = new OrganizationType();
      nitem.ID = 1;
      nitem.HomeID = 2;
      nitem.Name = "HID2ID1";
      arData.push(nitem);
      nitem = new OrganizationType();
      nitem.ID = 2;
      nitem.HomeID = 2;
      nitem.Name = "HID2ID2";
      arData.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected fetchAllOrganizationTypes (called once)", () => {
      expect(service.OrganizationTypes.length)
        .withContext("by default is empty")
        .toEqual(0);

      service.fetchAllOrganizationTypes().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected organization type")
            .toEqual(arData.length);
          expect(service.OrganizationTypes.length)
            .withContext("should have buffered")
            .toEqual(arData.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.orgTypeAPIURL;
      });

      // Respond with the mock data
      req.flush({ "@odata.count": arData.length, value: arData });
    });

    it("should be OK returning no organization types", () => {
      expect(service.OrganizationTypes.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllOrganizationTypes().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should have empty organization type array")
            .toEqual(0);
          expect(service.OrganizationTypes.length)
            .withContext("should buffered nothing")
            .toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.orgTypeAPIURL;
      });

      req.flush({}); // Respond with no data
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.fetchAllOrganizationTypes().subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.orgTypeAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });

    it("should return expected organization types (called multiple times)", () => {
      expect(service.OrganizationTypes.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllOrganizationTypes().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected organization types")
            .toEqual(arData.length);
          expect(data.length)
            .withContext("should have buffered")
            .toEqual(service.OrganizationTypes.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.orgTypeAPIURL;
      });

      req.flush({ "@odata.count": arData.length, value: arData });
      httpTestingController.verify();

      // Second call
      service.fetchAllOrganizationTypes().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.orgTypeAPIURL;
      });
      expect(reqs2.length)
        .withContext("shall be 0 calls to real API due to buffer!")
        .toEqual(0);

      // Third call
      service.fetchAllOrganizationTypes().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected organization types")
            .toEqual(arData.length);
        },
        error: (err) => {
          // Do nothing
        },
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.orgTypeAPIURL;
      });
      expect(reqs3.length)
        .withContext("shall be 0 calls to real API in third call!")
        .toEqual(0);
    });
  });

  // fetchAllBookCategories
  describe("fetchAllBookCategories", () => {
    let arBookCtgy: BookCategory[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arBookCtgy = [];
      let nctgy = new BookCategory();
      nctgy.ID = 1;
      nctgy.HID = 2;
      nctgy.Name = "HID2ID1";
      arBookCtgy.push(nctgy);
      nctgy = new BookCategory();
      nctgy.ID = 2;
      nctgy.HID = 2;
      nctgy.Name = "HID2ID2";
      arBookCtgy.push(nctgy);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected bookCategories (called once)", () => {
      expect(service.BookCategories.length)
        .withContext("should not buffered yet")
        .toEqual(0);

      service.fetchAllBookCategories().subscribe({
        next: (ctgies) => {
          expect(ctgies.length)
            .withContext("should return expected book categories")
            .toEqual(arBookCtgy.length);
          expect(service.BookCategories.length)
            .withContext("should have buffered")
            .toEqual(arBookCtgy.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET bookCategories from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.bookCategoryAPIURL
        );
      });

      // Respond with the mock bookCategories
      req.flush({ "@odata.count": arBookCtgy.length, value: arBookCtgy });
    });

    it("should be OK returning no bookCategories", () => {
      expect(service.BookCategories.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllBookCategories().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should have empty bookCategories array")
            .toEqual(0);
          expect(service.BookCategories.length)
            .withContext("should buffered nothing")
            .toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.bookCategoryAPIURL
        );
      });

      req.flush({}); // Respond with no data
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.fetchAllBookCategories().subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.bookCategoryAPIURL
        );
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });

    it("should return expected bookCategories (called multiple times)", () => {
      expect(service.BookCategories.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllBookCategories().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected book categories")
            .toEqual(arBookCtgy.length);
          expect(data.length)
            .withContext("should have buffered")
            .toEqual(service.BookCategories.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const reqs: any = httpTestingController.match((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.bookCategoryAPIURL
        );
      });
      expect(reqs.length)
        .withContext("shall be only 1 calls to real API!")
        .toEqual(1);
      reqs[0].flush({ "@odata.count": arBookCtgy.length, value: arBookCtgy });
      httpTestingController.verify();

      // Second call
      service.fetchAllBookCategories().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.bookCategoryAPIURL
        );
      });
      expect(reqs2.length)
        .withContext("shall be 0 calls to real API due to buffer!")
        .toEqual(0);

      // Third call
      service.fetchAllBookCategories().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected book categories")
            .toEqual(arBookCtgy.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const reqs3: any = httpTestingController.match((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.bookCategoryAPIURL
        );
      });
      expect(reqs3.length)
        .withContext("shall be 0 calls to real API in third call!")
        .toEqual(0);
    });
  });

  // fetchAllPersons
  describe("fetchAllPersons", () => {
    let arData: Person[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arData = [];
      let nitem = new Person();
      nitem.ID = 1;
      nitem.HID = 2;
      nitem.NativeName = "HID2ID1";
      nitem.ChineseName = "HID2ID1_CN";
      arData.push(nitem);
      nitem = new Person();
      nitem.ID = 2;
      nitem.HID = 2;
      nitem.NativeName = "HID2ID2";
      nitem.ChineseName = "HID2ID2_CN";
      arData.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected fetchAllPersons (called once)", () => {
      expect(service.Persons.length)
        .withContext("by default is empty")
        .toEqual(0);

      service.fetchAllPersons().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected data")
            .toEqual(arData.length);
          expect(service.Persons.length)
            .withContext("should have buffered")
            .toEqual(arData.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.personAPIURL;
      });

      // Respond with the mock data
      req.flush({ "@odata.count": arData.length, value: arData });
    });

    it("should be OK returning no peron roles", () => {
      expect(service.Persons.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllPersons().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should have empty data array")
            .toEqual(0);
          expect(service.Persons.length)
            .withContext("should buffered nothing")
            .toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.personAPIURL;
      });

      req.flush({}); // Respond with no data
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.fetchAllPersons().subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.personAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });

    it("should return expected perons (called multiple times)", () => {
      expect(service.Persons.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllPersons().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected data")
            .toEqual(arData.length);
          expect(data.length)
            .withContext("should have buffered")
            .toEqual(service.Persons.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.personAPIURL;
      });

      req.flush({ "@odata.count": arData.length, value: arData });
      httpTestingController.verify();

      // Second call
      service.fetchAllPersons().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.personAPIURL;
      });
      expect(reqs2.length)
        .withContext("shall be 0 calls to real API due to buffer!")
        .toEqual(0);

      // Third call
      service.fetchAllPersons().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected persons")
            .toEqual(arData.length);
        },
        error: (err) => {
          // Do nothing
        },
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.personAPIURL;
      });
      expect(reqs3.length)
        .withContext("shall be 0 calls to real API in third call!")
        .toEqual(0);
    });
  });

  // readPerson
  describe("readPerson", () => {
    let objdata: any;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);

      objdata = {
        Id: 2,
        HomeID: 2,
        NativeName: "User 2",
      };
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected data", () => {
      service.readPerson(2).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(2);
          expect(data.HID).toEqual(2);
          expect(data.NativeName).toEqual("User 2");
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.personAPIURL;
      });

      // Respond with the mock data
      req.flush({ value: [objdata] });
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.readPerson(2).subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.personAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });
  });

  // createPerson
  describe("createPerson", () => {
    let objdata: Person;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      objdata = new Person();
      objdata.ID = 1;
      objdata.HID = 2;
      objdata.NativeName = "test1";
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected data", () => {
      service.createPerson(objdata).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(1);
          expect(data.HID).toEqual(2);
          expect(data.NativeName).toEqual("test1");
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "POST" && requrl.url === service.personAPIURL;
      });

      // Respond with the mock data
      req.flush(objdata.writeJSONObject());
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.createPerson(objdata).subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "POST" && requrl.url === service.personAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });
  });

  // deletePerson
  describe("deletePerson", () => {
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected data", () => {
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
        return (
          requrl.method === "DELETE" &&
          requrl.url === `${service.personAPIURL}/2`
        );
      });

      // Respond with the mock data
      req.flush({});
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.deletePerson(2).subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "DELETE" &&
          requrl.url === `${service.personAPIURL}/2`
        );
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });
  });

  // fetchAllOrganizations
  describe("fetchAllOrganizations", () => {
    let arData: Organization[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arData = [];
      let nitem = new Organization();
      nitem.ID = 1;
      nitem.HID = 2;
      nitem.NativeName = "HID2ID1";
      nitem.ChineseName = "HID2ID1_CN";
      arData.push(nitem);
      nitem = new Organization();
      nitem.ID = 2;
      nitem.HID = 2;
      nitem.NativeName = "HID2ID2";
      nitem.ChineseName = "HID2ID2_CN";
      arData.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected fetchAllOrganizations (called once)", () => {
      expect(service.Organizations.length)
        .withContext("by default is empty")
        .toEqual(0);

      service.fetchAllOrganizations().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected data")
            .toEqual(arData.length);
          expect(service.Organizations.length)
            .withContext("should have buffered")
            .toEqual(arData.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.organizationAPIURL
        );
      });

      // Respond with the mock data
      req.flush({ "@odata.count": arData.length, value: arData });
    });

    it("should be OK returning no peron roles", () => {
      expect(service.Organizations.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllOrganizations().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should have empty data array")
            .toEqual(0);
          expect(service.Organizations.length)
            .withContext("should buffered nothing")
            .toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.organizationAPIURL
        );
      });

      req.flush({}); // Respond with no data
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.fetchAllOrganizations().subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.organizationAPIURL
        );
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });

    it("should return expected perons (called multiple times)", () => {
      expect(service.Organizations.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllOrganizations().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected data")
            .toEqual(arData.length);
          expect(data.length)
            .withContext("should have buffered")
            .toEqual(service.Organizations.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.organizationAPIURL
        );
      });

      req.flush({ "@odata.count": arData.length, value: arData });
      httpTestingController.verify();

      // Second call
      service.fetchAllOrganizations().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.organizationAPIURL
        );
      });
      expect(reqs2.length)
        .withContext("shall be 0 calls to real API due to buffer!")
        .toEqual(0);

      // Third call
      service.fetchAllOrganizations().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected data")
            .toEqual(arData.length);
        },
        error: (err) => {
          // Do nothing
        },
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.organizationAPIURL
        );
      });
      expect(reqs3.length)
        .withContext("shall be 0 calls to real API in third call!")
        .toEqual(0);
    });
  });

  // readOrganization
  describe("readOrganization", () => {
    let objdata: any;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);

      objdata = {
        Id: 2,
        HomeID: 2,
        NativeName: "User 2",
      };
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected data", () => {
      service.readOrganization(2).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(2);
          expect(data.HID).toEqual(2);
          expect(data.NativeName).toEqual("User 2");
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.organizationAPIURL
        );
      });

      // Respond with the mock data
      req.flush({ value: [objdata] });
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.readOrganization(2).subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "GET" && requrl.url === service.organizationAPIURL
        );
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });
  });

  // createOrganization
  describe("createOrganization", () => {
    let objdata: Organization;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      objdata = new Organization();
      objdata.ID = 1;
      objdata.HID = 2;
      objdata.NativeName = "test1";
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected data", () => {
      service.createOrganization(objdata).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(1);
          expect(data.HID).toEqual(2);
          expect(data.NativeName).toEqual("test1");
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "POST" && requrl.url === service.organizationAPIURL
        );
      });

      // Respond with the mock data
      req.flush(objdata.writeJSONObject());
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.createOrganization(objdata).subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "POST" && requrl.url === service.organizationAPIURL
        );
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });
  });

  // deleteOrganization
  describe("deleteOrganization", () => {
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected data", () => {
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
        return (
          requrl.method === "DELETE" &&
          requrl.url === `${service.organizationAPIURL}/2`
        );
      });

      // Respond with the mock data
      req.flush({});
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.deleteOrganization(2).subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "DELETE" &&
          requrl.url === `${service.organizationAPIURL}/2`
        );
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });
  });

  // fetchAllLocations
  describe("fetchAllLocations", () => {
    let arData: Location[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      arData = [];
      let nitem = new Location();
      nitem.ID = 1;
      nitem.HID = 2;
      nitem.Name = "Test1";
      nitem.LocType = LocationTypeEnum.PaperBook;
      arData.push(nitem);
      nitem = new Location();
      nitem.ID = 2;
      nitem.HID = 2;
      nitem.Name = "Test2";
      nitem.LocType = LocationTypeEnum.EBook;
      arData.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected location (called once)", () => {
      expect(service.Locations.length)
        .withContext("by default is empty")
        .toEqual(0);

      service.fetchAllLocations().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected data")
            .toEqual(arData.length);
          expect(service.Locations.length)
            .withContext("should have buffered")
            .toEqual(arData.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.locationAPIURL;
      });

      // Respond with the mock data
      req.flush({ "@odata.count": arData.length, value: arData });
    });

    it("should be OK returning no locations", () => {
      expect(service.Locations.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllLocations().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should have empty data array")
            .toEqual(0);
          expect(service.Locations.length)
            .withContext("should buffered nothing")
            .toEqual(0);
        },
        error: (err) => {
          // Empty
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.locationAPIURL;
      });

      req.flush({}); // Respond with no data
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.fetchAllLocations().subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.locationAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });

    it("should return expected locations (called multiple times)", () => {
      expect(service.Locations.length)
        .withContext("should not buffered yet")
        .toEqual(0);
      service.fetchAllLocations().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected data")
            .toEqual(arData.length);
          expect(data.length)
            .withContext("should have buffered")
            .toEqual(service.Locations.length);
        },
        error: (err) => {
          // Do nothing
        },
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.locationAPIURL;
      });

      req.flush({ "@odata.count": arData.length, value: arData });
      httpTestingController.verify();

      // Second call
      service.fetchAllLocations().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.locationAPIURL;
      });
      expect(reqs2.length)
        .withContext("shall be 0 calls to real API due to buffer!")
        .toEqual(0);

      // Third call
      service.fetchAllLocations().subscribe({
        next: (data) => {
          expect(data.length)
            .withContext("should return expected data")
            .toEqual(arData.length);
        },
        error: (err) => {
          // Do nothing
        },
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.locationAPIURL;
      });
      expect(reqs3.length)
        .withContext("shall be 0 calls to real API in third call!")
        .toEqual(0);
    });
  });

  // readOrganization
  describe("readLocation", () => {
    let objdata: any;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);

      objdata = {
        Id: 2,
        HomeID: 2,
        Name: "User 2",
      };
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected data", () => {
      service.readLocation(2).subscribe({
        next: (data) => {
          expect(data.ID).toEqual(2);
          expect(data.HID).toEqual(2);
          expect(data.Name).toEqual("User 2");
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.locationAPIURL;
      });

      // Respond with the mock data
      req.flush({ value: [objdata] });
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.readLocation(2).subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.locationAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });
  });

  describe("fetchBooks", () => {
    let arData: Book[] = [];
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);

      arData = [];
      let nitem: Book = new Book();
      nitem.ID = 1;
      nitem.HID = 2;
      nitem.NativeName = "test1";
      arData.push(nitem);
      nitem = new Book();
      nitem.ID = 2;
      nitem.HID = 2;
      nitem.NativeName = "test2";
      arData.push(nitem);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected data", () => {
      service.fetchBooks(100, 0).subscribe({
        next: (data) => {
          expect(data.contentList.length)
            .withContext("should return expected data")
            .toEqual(arData.length);
        },
        error: (err) => {
          // Empty
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.bookAPIURL;
      });

      // Respond with the mock data
      req.flush({ "@odata.count": arData.length, value: arData });
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.fetchBooks().subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.bookAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });
  });

  describe("readBoook", () => {
    let objdata: Book;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);

      objdata = new Book();
      objdata.ID = 1;
      objdata.HID = 2;
      objdata.NativeName = "test1";
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected data", () => {
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
        return requrl.method === "GET" && requrl.url === service.bookAPIURL;
      });

      // Respond with the mock data
      req.flush({ value: [objdata.writeJSONObject()] });
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.readBook(2).subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "GET" && requrl.url === service.bookAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });
  });

  describe("createBook", () => {
    let objdata: Book;
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
      objdata = new Book();
      objdata.ID = 1;
      objdata.HID = 2;
      objdata.NativeName = "test1";
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected data", () => {
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
        return requrl.method === "POST" && requrl.url === service.bookAPIURL;
      });

      // Respond with the mock data
      req.flush(objdata.writeJSONObject());
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.createBook(objdata).subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === "POST" && requrl.url === service.bookAPIURL;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });
  });

  describe("deleteBook", () => {
    beforeEach(() => {
      service = TestBed.inject(LibraryStorageService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it("should return expected data", () => {
      service.deleteBook(2).subscribe({});

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "DELETE" && requrl.url === `${service.bookAPIURL}/2`
        );
      });

      // Respond with the mock data
      req.flush({});
    });

    it("should return error in case error appear", () => {
      const msg = "Error 404";
      service.deleteBook(2).subscribe({
        next: (data) => {
          fail("expected to fail");
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return (
          requrl.method === "DELETE" && requrl.url === `${service.bookAPIURL}/2`
        );
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: "Not Found" });
    });
  });
});
