import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import { FinanceStorageService, } from './finance-storage.service';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import { UserAuthInfo } from '../model';

describe('FinanceStorageService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const homeService: any = jasmine.createSpyObj('HomeDefService', ['ChosedHome', 'fetchHomeMembers']);
    const chosedHomeSpy: any = homeService.ChosedHome.and.returnValue( {
      _id: 1,
      BaseCurrency: 'CNY',
    });
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue([]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        FinanceStorageService,
        { provide: AuthService, userValue: authServiceStub },
        { provide: HomeDefDetailService, userValue: homeService },
      ],
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([FinanceStorageService], (service: FinanceStorageService) => {
    expect(service).toBeTruthy();
  }));
});
