import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject, } from '@angular/core/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../testing';
import { ThemeStorage } from '../theme-picker';
import { HomeDashboardComponent } from './home-dashboard.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, LearnStorageService } from '../services';

describe('HomeDashboardComponent', () => {
  let component: HomeDashboardComponent;
  let fixture: ComponentFixture<HomeDashboardComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let routerSpy: any;
  let getHomeKeyFigureSpy: any;
  let getHistoryReportByUserSpy: any;
  let fetchAllTranTypesSpy: any;
  let getReportTranTypeSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();

    const homeService: any = jasmine.createSpyObj('HomeDefDetailService', ['fetchHomeMembers', 'getHomeKeyFigure']);
    homeService.ChosedHome = fakeData.chosedHome;
    getHomeKeyFigureSpy = homeService.getHomeKeyFigure.and.returnValue(of({}));
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue([]);
    const lrnStroageService: any = jasmine.createSpyObj('LearnStorageService', [
      'getHistoryReportByUser',
    ]);
    getHistoryReportByUserSpy = lrnStroageService.getHistoryReportByUser.and.returnValue(of([]));
    const fnStroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'getReportTranType',
      'fetchAllTranTypes',
    ]);
    getReportTranTypeSpy = fnStroageService.getReportTranType.and.returnValue(of([]));
    fetchAllTranTypesSpy = fnStroageService.fetchAllTranTypes.and.returnValue(of([]));
    const themeStorageStub: Partial<ThemeStorage> = {};
    themeStorageStub.getStoredTheme = () => { return undefined; };
    themeStorageStub.onThemeUpdate = new EventEmitter<any>();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [ HomeDashboardComponent ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: LearnStorageService, useValue: lrnStroageService },
        { provide: FinanceStorageService, useValue: fnStroageService },
        { provide: ThemeStorage, useValue: themeStorageStub },
        { provide: Router, useValue: routerSpy },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDashboardComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  it('1. should be created without data', () => {
    expect(component).toBeTruthy();
  });
});
