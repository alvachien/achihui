import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { LibraryStorageService } from './library-storage.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { BookCategory, OrganizationType, PersonRole, UserAuthInfo } from '../model';
import { environment } from '../../environments/environment';
import { FakeDataHelper } from '../../testing';

describe('LibraryStorageService', () => {
  let httpTestingController: HttpTestingController;
  const dataAPIURL: any = environment.ApiUrl + '/Languages';
  let fakeData: FakeDataHelper;
  let service: LibraryStorageService;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
  //   fakeData.buildLibMovieGenresFromAPI();
  //   fakeData.buildLibLocationsFromAPI();
  });

  beforeEach(() => {
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

  it('should be created', () => {
    service = TestBed.inject(LibraryStorageService);
    expect(service).toBeTruthy();
  });

  /// LibraryStorageService method tests begin ///
  describe('fetchAllPersonRoles', () => {
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

    it('should return expected fetchAllPersonRoles (called once)', () => {
      expect(service.PersonRoles.length).withContext('by default is empty').toEqual(0);

      service.fetchAllPersonRoles().subscribe({
        next: data => {
          expect(data.length).withContext('should return expected person roles').toEqual(arRoles.length);
          expect(service.PersonRoles.length).withContext('should have buffered').toEqual(arRoles.length);
        },
        error: err => {
          // Empty
        }
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL && requrl.params.has('hid');
      });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock data
      req.flush({ '@odata.count': arRoles.length, value: arRoles});
    });

    it('should be OK returning no peron roles', () => {
      expect(service.PersonRoles.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllPersonRoles().subscribe({
        next: data => {
          expect(data.length).withContext('should have empty peron roles array').toEqual(0);
          expect(service.PersonRoles.length).withContext('should buffered nothing').toEqual(0);
        },
        error: err => {
          // Empty
        }
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Error 404';
      service.fetchAllPersonRoles().subscribe({
        next: data => {
          fail('expected to fail');
        },
        error: err => {
          expect(err.toString()).toContain(msg);
        }
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL && requrl.params.has('hid');
       });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected peron roles (called multiple times)', () => {
      expect(service.PersonRoles.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllPersonRoles().subscribe({
        next: data => {
          expect(data.length).withContext('should return expected person roles').toEqual(arRoles.length);
          expect(data.length).withContext('should have buffered').toEqual(service.PersonRoles.length);
        },
        error: err => {
          // Do nothing
        }
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL && requrl.params.has('hid');
      });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
      req.flush({ '@odata.count': arRoles.length, value: arRoles });
      httpTestingController.verify();

      // Second call
      service.fetchAllPersonRoles().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL && requrl.params.has('hid');
      });
      expect(reqs2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllPersonRoles().subscribe({
        next: data => {
          expect(data.length).withContext('should return expected person roles').toEqual(arRoles.length);
        },
        error: err => {
          // Do nothing
        }
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.personRoleAPIURL && requrl.params.has('hid');
       });
      expect(reqs3.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  describe('fetchAllOrganizationTypes', () => {
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

    it('should return expected fetchAllOrganizationTypes (called once)', () => {
      expect(service.OrganizationTypes.length).withContext('by default is empty').toEqual(0);

      service.fetchAllOrganizationTypes().subscribe({
        next: data => {
          expect(data.length).withContext('should return expected organization type').toEqual(arData.length);
          expect(service.OrganizationTypes.length).withContext('should have buffered').toEqual(arData.length);
        },
        error: err => {
          // Empty
        }
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL && requrl.params.has('hid');
      });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock data
      req.flush({ '@odata.count': arData.length, value: arData});
    });

    it('should be OK returning no organization types', () => {
      expect(service.OrganizationTypes.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllOrganizationTypes().subscribe({
        next: data => {
          expect(data.length).withContext('should have empty organization type array').toEqual(0);
          expect(service.OrganizationTypes.length).withContext('should buffered nothing').toEqual(0);
        },
        error: err => {
          // Empty
        }
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Error 404';
      service.fetchAllOrganizationTypes().subscribe({
        next: data => {
          fail('expected to fail');
        },
        error: err => {
          expect(err.toString()).toContain(msg);
        }
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL && requrl.params.has('hid');
       });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected organization types (called multiple times)', () => {
      expect(service.OrganizationTypes.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllOrganizationTypes().subscribe({
        next: data => {
          expect(data.length).withContext('should return expected organization types').toEqual(arData.length);
          expect(data.length).withContext('should have buffered').toEqual(service.OrganizationTypes.length);
        },
        error: err => {
          // Do nothing
        }
      });
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL && requrl.params.has('hid');
      });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
      req.flush({ '@odata.count': arData.length, value: arData });
      httpTestingController.verify();

      // Second call
      service.fetchAllOrganizationTypes().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL && requrl.params.has('hid');
       });
      expect(reqs2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllOrganizationTypes().subscribe({
        next: data => {
          expect(data.length).withContext('should return expected organization types').toEqual(arData.length);
        },
        error: err => {
          // Do nothing
        }
      });

      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.orgTypeAPIURL && requrl.params.has('hid');
       });
      expect(reqs3.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

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
      expect(service.BookCategories.length).withContext('should not buffered yet').toEqual(0);

      service.fetchAllBookCategories().subscribe({
        next: ctgies => {
          expect(ctgies.length).withContext('should return expected book categories').toEqual(arBookCtgy.length);
          expect(service.BookCategories.length).withContext('should have buffered').toEqual(arBookCtgy.length);
        },
        error: err => {
          // Empty
        }
      });

      // Service should have made one request to GET bookCategories from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock bookCategories
      req.flush({'@odata.count': arBookCtgy.length, value: arBookCtgy });
    });

    it('should be OK returning no bookCategories', () => {
      expect(service.BookCategories.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllBookCategories().subscribe({
        next: data => {
          expect(data.length).withContext('should have empty bookCategories array').toEqual(0);
          expect(service.BookCategories.length).withContext('should buffered nothing').toEqual(0);
        },
        error: err => {
          // Empty
        }
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Error 404';
      service.fetchAllBookCategories().subscribe({
        next: data => {
          fail('expected to fail');
        },
        error: err => {
          expect(err.toString()).toContain(msg);
        }
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
       });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected bookCategories (called multiple times)', () => {
      expect(service.BookCategories.length).withContext('should not buffered yet').toEqual(0);
      service.fetchAllBookCategories().subscribe({
        next: data => {
          expect(data.length).withContext('should return expected book categories').toEqual(arBookCtgy.length);
          expect(data.length).withContext('should have buffered').toEqual(service.BookCategories.length);
        },
        error: err => {
          // Do nothing
        }
      });
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
       });
      expect(reqs.length).withContext('shall be only 1 calls to real API!').toEqual(1);
      reqs[0].flush({'@odata.count': arBookCtgy.length, value: arBookCtgy });
      httpTestingController.verify();

      // Second call
      service.fetchAllBookCategories().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
      });
      expect(reqs2.length).withContext('shall be 0 calls to real API due to buffer!').toEqual(0);

      // Third call
      service.fetchAllBookCategories().subscribe({
        next: data => {
          expect(data.length).withContext('should return expected book categories').toEqual(arBookCtgy.length);
        },
        error: err => {
          // Do nothing
        }
      });
      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
       });
      expect(reqs3.length).withContext('shall be 0 calls to real API in third call!').toEqual(0);
    });
  });

  // describe('fetchAllMovieGenres', () => {
  //   beforeEach(() => {
  //     service = TestBed.inject(LibraryStorageService);
  //   });
  //   afterEach(() => {
  //     // After every test, assert that there are no more pending requests.
  //     httpTestingController.verify();
  //   });

  //   it('should return expected movie genres (called once)', () => {
  //     expect(service.MovieGenres.length).toEqual(0, 'should not buffered yet');

  //     service.fetchAllMovieGenres().subscribe(
  //       (ctgies: any) => {
  //         expect(ctgies.length).toEqual(fakeData.libMovieGenresFromAPI.length, 'should return expected movie genres');
  //         expect(service.MovieGenres.length).toEqual(fakeData.libMovieGenresFromAPI.length, 'should have buffered');
  //       },
  //       (fail: any) => {
  //         // Empty
  //       },
  //     );

  //     // Service should have made one request to GET data from expected URL
  //     const req: any = httpTestingController.expectOne((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
  //      });
  //     expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

  //     // Respond with the mock bookCategories
  //     req.flush(fakeData.libMovieGenresFullReplyFromAPI);
  //   });

  //   it('should be OK returning empty data', () => {
  //     expect(service.MovieGenres.length).toEqual(0, 'should not buffered yet');
  //     service.fetchAllMovieGenres().subscribe(
  //       (curries: any) => {
  //         expect(curries.length).toEqual(0, 'should have empty data array');
  //         expect(service.MovieGenres.length).toEqual(0, 'should buffered nothing');
  //       },
  //       (fail: any) => {
  //         // Empty
  //       },
  //     );

  //     const req: any = httpTestingController.expectOne((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
  //      });
  //     expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
  //     req.flush({}); // Respond with no data
  //   });

  //   it('should return error in case error appear', () => {
  //     const msg: string = 'Deliberate 404';
  //     service.fetchAllMovieGenres().subscribe(
  //       (curries: any) => {
  //         fail('expected to fail');
  //       },
  //       (error: any) => {
  //         expect(error).toContain(msg);
  //       },
  //     );

  //     const req: any = httpTestingController.expectOne((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
  //      });

  //     // respond with a 404 and the error message in the body
  //     req.flush(msg, { status: 404, statusText: 'Not Found' });
  //   });

  //   it('should return expected data (called multiple times)', () => {
  //     expect(service.MovieGenres.length).toEqual(0, 'should not buffered yet');
  //     service.fetchAllMovieGenres().subscribe(
  //       (curries: any) => {
  //         expect(curries.length).toEqual(fakeData.libMovieGenresFromAPI.length, 'should return expected data');
  //         expect(curries.length).toEqual(service.MovieGenres.length, 'should have buffered');
  //       },
  //       (fail: any) => {
  //         // Do nothing
  //       },
  //     );
  //     const reqs: any = httpTestingController.match((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
  //      });
  //     expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
  //     reqs[0].flush(fakeData.libMovieGenresFullReplyFromAPI);
  //     httpTestingController.verify();

  //     // Second call
  //     service.fetchAllMovieGenres().subscribe();
  //     const reqs2: any = httpTestingController.match((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
  //      });
  //     expect(reqs2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

  //     // Third call
  //     service.fetchAllMovieGenres().subscribe(
  //       (curries: any) => {
  //         expect(curries.length).toEqual(fakeData.libMovieGenresFromAPI.length, 'should return expected data');
  //       },
  //       (fail: any) => {
  //         // Do nothing
  //       },
  //     );
  //     const reqs3: any = httpTestingController.match((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
  //      });
  //     expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
  //   });
  // });

  // describe('fetchAllLocations', () => {
  //   beforeEach(() => {
  //     service = TestBed.inject(LibraryStorageService);
  //   });
  //   afterEach(() => {
  //     // After every test, assert that there are no more pending requests.
  //     httpTestingController.verify();
  //   });

  //   it('should return expected locations (called once)', () => {
  //     expect(service.Locations.length).toEqual(0, 'should not buffered yet');

  //     service.fetchAllLocations().subscribe(
  //       (ctgies: any) => {
  //         expect(ctgies.length).toEqual(fakeData.libLocationsFromAPI.length, 'should return expected data');
  //         expect(service.Locations.length).toEqual(fakeData.libLocationsFromAPI.length, 'should have buffered');
  //       },
  //       (fail: any) => {
  //         // Empty
  //       },
  //     );

  //     // Service should have made one request to GET data from expected URL
  //     const req: any = httpTestingController.expectOne((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
  //      });
  //     expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

  //     // Respond with the mock bookCategories
  //     req.flush(fakeData.libLocationsFullReplyFromAPI);
  //   });

  //   it('should be OK returning empty data', () => {
  //     expect(service.Locations.length).toEqual(0, 'should not buffered yet');
  //     service.fetchAllLocations().subscribe(
  //       (curries: any) => {
  //         expect(curries.length).toEqual(0, 'should have empty data array');
  //         expect(service.Locations.length).toEqual(0, 'should buffered nothing');
  //       },
  //       (fail: any) => {
  //         // Empty
  //       },
  //     );

  //     const req: any = httpTestingController.expectOne((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
  //      });
  //     expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
  //     req.flush({}); // Respond with no data
  //   });

  //   it('should return error in case error appear', () => {
  //     const msg: string = 'Deliberate 404';
  //     service.fetchAllLocations().subscribe(
  //       (curries: any) => {
  //         fail('expected to fail');
  //       },
  //       (error: any) => {
  //         expect(error).toContain(msg);
  //       },
  //     );

  //     const req: any = httpTestingController.expectOne((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
  //      });

  //     // respond with a 404 and the error message in the body
  //     req.flush(msg, { status: 404, statusText: 'Not Found' });
  //   });

  //   it('should return expected data (called multiple times)', () => {
  //     expect(service.Locations.length).toEqual(0, 'should not buffered yet');
  //     service.fetchAllLocations().subscribe(
  //       (curries: any) => {
  //         expect(curries.length).toEqual(fakeData.libLocationsFromAPI.length, 'should return expected data');
  //         expect(curries.length).toEqual(service.Locations.length, 'should have buffered');
  //       },
  //       (fail: any) => {
  //         // Do nothing
  //       },
  //     );
  //     const reqs: any = httpTestingController.match((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
  //      });
  //     expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
  //     reqs[0].flush(fakeData.libLocationsFullReplyFromAPI);
  //     httpTestingController.verify();

  //     // Second call
  //     service.fetchAllLocations().subscribe();
  //     const reqs2: any = httpTestingController.match((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
  //      });
  //     expect(reqs2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

  //     // Third call
  //     service.fetchAllLocations().subscribe(
  //       (curries: any) => {
  //         expect(curries.length).toEqual(fakeData.libLocationsFromAPI.length, 'should return expected data');
  //       },
  //       (fail: any) => {
  //         // Do nothing
  //       },
  //     );
  //     const reqs3: any = httpTestingController.match((requrl: any) => {
  //       return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
  //      });
  //     expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
  //   });
  // });
});