import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { ThemeStorage } from '../theme-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderTestFactory, RouterLinkDirectiveStub, FakeDataHelper } from '../../testing';
import { TagsListComponent } from './tags-list.component';
import { AuthService, HomeDefDetailService, TagsService, UIStatusService } from '../services';
import { UserAuthInfo } from '../model';

describe('TagsListComponent', () => {
  let component: TagsListComponent;
  let fixture: ComponentFixture<TagsListComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);
    const homeService: any = jasmine.createSpyObj('HomeDefDetailService', ['fetchHomeMembers']);
    homeService.ChosedHome = fakeData.chosedHome;
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue(fakeData.chosedHome.Members);

    const tagService: any = jasmine.createSpyObj('TagsService', ['fetchAllTags']);
    const fetchAllTagsSpy: any = tagService.fetchAllTags.and.returnValue(of([]));
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const themeStorageStub: Partial<ThemeStorage> = {};
    themeStorageStub.getStoredTheme = () => { return undefined; };
    themeStorageStub.onThemeUpdate = new EventEmitter<any>();

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        RouterLinkDirectiveStub,
        TagsListComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: TagsService, useValue: tagService },
        { provide: Router, useValue: routerSpy },
        { provide: ThemeStorage, useValue: themeStorageStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsListComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  it('1. should be created with empty data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
