import { TestBed, inject, async } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { EventStorageService } from './event-storage.service';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import { UserAuthInfo } from '../model';

describe('EventStorageService', () => {
  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const homeService: any = jasmine.createSpyObj('HomeDefDetailService', ['fetchHomeMembers']);
    homeService.ChosedHome = {
      _id: 1,
      BaseCurrency: 'CNY',
    };
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue([]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        EventStorageService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    });
  }));

  it('should be created', inject([EventStorageService], (service: EventStorageService) => {
    expect(service).toBeTruthy();
  }));
});
