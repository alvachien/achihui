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
import { OverlayContainer } from '@angular/cdk/overlay';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../testing';
import { ThemeStorage } from '../theme-picker';
import { HomeDashboardComponent } from './home-dashboard.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, LearnStorageService } from '../services';
import { HomeKeyFigure } from 'app/model';

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

  describe('2. should work with data', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      let userLearnReport: any[] = [
        {displayAs: 'a', learnCount: 3},
        {displayAs: 'b', learnCount: 4},
      ];
      getHistoryReportByUserSpy.and.returnValue(asyncData(userLearnReport));
      let objFigure: HomeKeyFigure = new HomeKeyFigure();
      objFigure.onSetData({
        totalAsset: 100,
        totalLiability: 90,
        totalAssetUnderMyName: 50,
        totalLiabilityUnderMyName: 40,
        totalUnreadMessage: 1,
        myUnCompletedEvents: 0,
        myCompletedEvents: 2,
      });
      getHomeKeyFigureSpy.and.returnValue(asyncData(objFigure));
      getReportTranTypeSpy.and.returnValue(asyncData([]));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('it shall display the base currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the observables
      fixture.detectChanges();
  
      expect(component.baseCurr).not.toBeFalsy();
    }));
  });
});
