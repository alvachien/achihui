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
import { HomeKeyFigure, UINameValuePair, TranTypeLevelEnum, } from 'app/model';

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
      // Learn report
      let userLearnReport: any[] = [
        {displayAs: 'a', learnCount: 3},
        {displayAs: 'b', learnCount: 4},
      ];
      getHistoryReportByUserSpy.and.returnValue(asyncData(userLearnReport));
      // Key figures
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
      // Finance report by tran. type
      let mapIn: Map<number, UINameValuePair<number>> = new Map<number, UINameValuePair<number>>();
      let mapOut: Map<number, UINameValuePair<number>> = new Map<number, UINameValuePair<number>>();
      mapIn.set(1, { name: '起始资金', value: 8800});
      mapIn.set(33, { name: '红包收入', value: 8800});
      mapOut.set(9, {name: '生活类开支', value: 2200});
      mapOut.set(22, {name: '停车费', value: 80});
      mapOut.set(27, {name: '固定电话/宽带', value: 199});
      mapOut.set(32, {name: '红包支出', value: 7000});
      mapOut.set(46, {name: '早中晚餐', value: 700});
      mapOut.set(48, {name: '孝敬家长', value: 2000});
      mapOut.set(59, {name: '培训进修', value: 1382.88});
      mapOut.set(66, {name: '大家电类', value: 1799});
      mapOut.set(88, {name: '预付款支出', value: 8800});
      getReportTranTypeSpy.and.returnValue(asyncData([mapIn, mapOut]));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('it shall load the data successfully', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the observables
      fixture.detectChanges();

      expect(component.baseCurr).toEqual(fakeData.chosedHome.BaseCurrency);

      expect(component.mapFinTTIn).not.toBeFalsy();
      expect(component.mapFinTTOut).not.toBeFalsy();

      // Navigation to event list
      component.onNvgToEventList();
      fixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/event/general']);

      // Navigation to message
      component.onNvgToMsgList();
      fixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/homemsg']);
    }));

    it('it shall refelect the tran type level', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the observables
      fixture.detectChanges();

      expect(component.mapFinTTIn).not.toBeFalsy();
      expect(component.mapFinTTOut).not.toBeFalsy();

      component.selectedTranTypeLevel = TranTypeLevelEnum.FirstLevel;
      component.onFinanceTranTypeChartRedraw();

      expect(component.mapFinTTIn).not.toBeFalsy();
      expect(component.mapFinTTOut).not.toBeFalsy();
    }));

    it('it shall refelect exclude transfer', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the observables
      fixture.detectChanges();

      expect(component.mapFinTTIn).not.toBeFalsy();
      expect(component.mapFinTTOut).not.toBeFalsy();

      component.onFinanceExcludeTransfer();

      expect(component.mapFinTTIn).not.toBeFalsy();
      expect(component.mapFinTTOut).not.toBeFalsy();
    }));
  });
});
