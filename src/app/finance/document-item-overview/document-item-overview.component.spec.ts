import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { EventEmitter } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { DocumentItemOverviewComponent } from './document-item-overview.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { ThemeStorage } from 'app/theme-picker';

describe('DocumentItemOverviewComponent', () => {
  let component: DocumentItemOverviewComponent;
  let fixture: ComponentFixture<DocumentItemOverviewComponent>;
  // let fetchAllAccountCategoriesSpy: any;
  // let fetchAllAssetCategoriesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  // let fetchAllOrdersSpy: any;
  // let fetchAllControlCentersSpy: any;
  let fetchDocPostedFrequencyPerUserSpy: any;
  let fetchReportTrendDataSpy: any;
  let getADPTmpDocsSpy: any;
  let getLoanTmpDocsSpy: any;
  let fetchAllCurrenciesSpy: any;
  let fakeData: FakeDataHelper;
  let routerSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const homeService: any = jasmine.createSpyObj('HomeDefDetailService', ['fetchHomeMembers']);
    homeService.ChosedHome = fakeData.chosedHome;
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      // 'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      // 'fetchAllControlCenters',
      // 'fetchAllOrders',
      // 'fetchAllAssetCategories',
      'fetchDocPostedFrequencyPerUser',
      'fetchReportTrendData',
      'getADPTmpDocs',
      'getLoanTmpDocs',
    ]);
    // fetchAllAccountCategoriesSpy = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    // fetchAllAssetCategoriesSpy = stroageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = stroageService.fetchAllAccounts.and.returnValue(of([]));
    // fetchAllOrdersSpy = stroageService.fetchAllOrders.and.returnValue(of([]));
    // fetchAllControlCentersSpy = stroageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchDocPostedFrequencyPerUserSpy = stroageService.fetchDocPostedFrequencyPerUser.and.returnValue(of([]));
    fetchReportTrendDataSpy = stroageService.fetchReportTrendData.and.returnValue(of([]));
    getADPTmpDocsSpy = stroageService.getADPTmpDocs.and.returnValue(of([]));
    getLoanTmpDocsSpy = stroageService.getLoanTmpDocs.and.returnValue(of([]));
    const themeStorageStub: Partial<ThemeStorage> = {};
    themeStorageStub.getStoredTheme = () => { return undefined; };
    themeStorageStub.onThemeUpdate = new EventEmitter<any>();
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));

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
      declarations: [
        DocumentItemOverviewComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: Router, useValue: routerSpy },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: ThemeStorage, useValue: themeStorageStub },
        { provide: FinCurrencyService, useValue: currService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemOverviewComponent);
    component = fixture.componentInstance;
  });

  it('1. should be created without data', () => {
    expect(component).toBeTruthy();
  });

  describe('2. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      // fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));

      // Accounts
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display error when doc type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Doc type service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Doc type service failed',
        'Expected snack bar to show the error message: Doc type service failed');
      flush();
    }));

    it('2. should display error when tran type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Tran type service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Tran type service failed',
        'Expected snack bar to show the error message: Tran type service failed');
      flush();
    }));

    it('3. should display error when accont service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Account service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Account service failed',
        'Expected snack bar to show the error message: Account service failed');
      flush();
    }));

    it('4. should display error when getADPTmpDocs service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      getADPTmpDocsSpy.and.returnValue(asyncError<string>('getADPTmpDocs service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // For tmp docs
      fixture.detectChanges();
      
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('getADPTmpDocs service failed',
        'Expected snack bar to show the error message: getADPTmpDocs service failed');
      flush();
    }));

    it('5. should display error when getLoanTmpDocs service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      getLoanTmpDocsSpy.and.returnValue(asyncError<string>('getLoanTmpDocs service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // For tmp docs
      fixture.detectChanges();

      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('getLoanTmpDocs service failed',
        'Expected snack bar to show the error message: getLoanTmpDocs service failed');
      flush();
    }));
  });
});
