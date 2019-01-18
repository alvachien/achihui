import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderTestFactory } from '../../testing';
import { HomeMessageComponent } from './home-message.component';
import { HomeDefDetailService, UIStatusService, AuthService } from '../services';
import { UserAuthInfo } from '../model';

describe('HomeMessageComponent', () => {
  let component: HomeMessageComponent;
  let fixture: ComponentFixture<HomeMessageComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(async(() => {
    const homeService: any = jasmine.createSpyObj('HomeDefDetailService', ['fetchHomeMembers', 'fetchAllMembersInChosedHome']);
    homeService.ChosedHome = {
      _id: 1,
      BaseCurrency: 'CNY',
    };
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue([]);
    const fetchAllMembersInChosedHomeSpy: any = homeService.fetchAllMembersInChosedHome.and.returnValue();
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [ HomeMessageComponent ],
      providers: [
        TranslateService,
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: AuthService, useValue: authServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeMessageComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
