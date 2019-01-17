import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { HomeDefDetailService } from './home-def-detail.service';
import { AuthService } from './auth.service';
import { UserAuthInfo } from '../model';

describe('HomeDefDetailService', () => {
  beforeEach(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        HomeDefDetailService,
        { provide: AuthService, useValue: authServiceStub },
      ],
    });
  });

  it('should be created', inject([HomeDefDetailService], (service: HomeDefDetailService) => {
    expect(service).toBeTruthy();
  }));
});
