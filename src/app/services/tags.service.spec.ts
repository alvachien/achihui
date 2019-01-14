import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { TagsService } from './tags.service';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import { UserAuthInfo } from '../model';

describe('TagsService', () => {
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
        TagsService,
        { provide: AuthService, userValue: authServiceStub },
        { provide: HomeDefDetailService, userValue: homeService },
      ],
    });
  });

  it('should be created', inject([TagsService], (service: TagsService) => {
    expect(service).toBeTruthy();
  }));
});
