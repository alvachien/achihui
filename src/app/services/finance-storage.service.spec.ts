import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { FinanceStorageService, AuthService, HomeDefDetailService } from './';

describe('FinanceStorageService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;  

  beforeEach(() => {
    // const spy = jasmine.createSpyObj('AuthService', ['authSubject']);
    const authServiceStub: Partial<AuthService> = {};
    const homeServiceStub: Partial<HomeDefDetailService> = {};

    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        FinanceStorageService,
        { providers: AuthService, useValue: authServiceStub },
        { providers: HomeDefDetailService, useValue: homeServiceStub }
      ],
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([FinanceStorageService], (service: FinanceStorageService) => {
    expect(service).toBeTruthy();
  }));
});
