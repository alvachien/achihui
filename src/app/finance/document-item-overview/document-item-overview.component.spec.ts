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
import { TemplateDocADP, Account, AccountExtraAdvancePayment, AccountExtraLoan,
  DocumentCreatedFrequenciesByUser, } from '../../model';

describe('DocumentItemOverviewComponent', () => {
  let component: DocumentItemOverviewComponent;
  let fixture: ComponentFixture<DocumentItemOverviewComponent>;
  let fetchAllDocTypesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
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
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchDocPostedFrequencyPerUser',
      'fetchReportTrendData',
      'getADPTmpDocs',
      'getLoanTmpDocs',
    ]);
    fetchAllDocTypesSpy = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = stroageService.fetchAllAccounts.and.returnValue(of([]));
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

      expect(getADPTmpDocsSpy).not.toHaveBeenCalled();
      expect(getLoanTmpDocsSpy).not.toHaveBeenCalled();

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

      expect(getADPTmpDocsSpy).not.toHaveBeenCalled();
      expect(getLoanTmpDocsSpy).not.toHaveBeenCalled();
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

      expect(getADPTmpDocsSpy).not.toHaveBeenCalled();
      expect(getLoanTmpDocsSpy).not.toHaveBeenCalled();
      flush();
    }));

    // it('4. should display error when getADPTmpDocs service fails', fakeAsync(() => {
    //   // tell spy to return an async error observable
    //   getADPTmpDocsSpy.and.returnValue(asyncError<string>('getADPTmpDocs service failed'));

    //   fixture.detectChanges(); // ngOnInit
    //   tick(); // Complete the Observables in ngAfterViewInit
    //   fixture.detectChanges();
    //   tick(); // For tmp docs
    //   fixture.detectChanges();
    //   tick(); // For user doc amount;

    //   let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
    //   expect(messageElement.textContent).toContain('getADPTmpDocs service failed',
    //     'Expected snack bar to show the error message: getADPTmpDocs service failed');

    //   expect(getADPTmpDocsSpy).toHaveBeenCalled();
    //   expect(getLoanTmpDocsSpy).toHaveBeenCalled();

    //   flush();
    // }));

    // it('5. should display error when getLoanTmpDocs service fails', fakeAsync(() => {
    //   // tell spy to return an async error observable
    //   getLoanTmpDocsSpy.and.returnValue(asyncError<string>('getLoanTmpDocs service failed'));

    //   fixture.detectChanges(); // ngOnInit
    //   tick(); // Complete the Observables in ngAfterViewInit
    //   fixture.detectChanges();
    //   tick(); // For tmp docs
    //   fixture.detectChanges();

    //   let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
    //   expect(messageElement.textContent).toContain('getLoanTmpDocs service failed',
    //     'Expected snack bar to show the error message: getLoanTmpDocs service failed');

    //   expect(getADPTmpDocsSpy).toHaveBeenCalled();
    //   expect(getLoanTmpDocsSpy).toHaveBeenCalled();
    //   flush();
    // }));
  });

  describe('3. grid should work', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));

      // ADP tmp.
      let adpacntext: AccountExtraAdvancePayment = fakeData.finAccounts.find((vl: Account) => { return vl.Id === 24; })
        .ExtraInfo as AccountExtraAdvancePayment;
      getADPTmpDocsSpy.and.returnValue(asyncData(adpacntext.dpTmpDocs));

      // Loan tmp.
      let loanacntext: AccountExtraLoan = fakeData.finAccounts.find((vl: Account) => { return vl.Id === 22; })
        .ExtraInfo as AccountExtraLoan;
      getLoanTmpDocsSpy.and.returnValue(asyncData(loanacntext.loanTmpDocs));

      // User doc amount
      let arUserData: DocumentCreatedFrequenciesByUser[] = [];
      for (let i: number = 0; i < 3; i++) {
        let docUser: DocumentCreatedFrequenciesByUser = new DocumentCreatedFrequenciesByUser();
        docUser.userID = 'aaa';
        docUser.year = moment().year();
        // docUser.month = moment().month();
        docUser.amountOfDocuments = 2 * i + 1;
        arUserData.push(docUser);

        docUser = new DocumentCreatedFrequenciesByUser();
        docUser.userID = 'bbb';
        docUser.year = moment().year();
        // docUser.month = moment().month();
        docUser.amountOfDocuments = 3 * i + 1;
        arUserData.push(docUser);
      }
      fetchDocPostedFrequencyPerUserSpy.and.returnValue(asyncData(arUserData));

      // Trend data
      fetchReportTrendDataSpy.and.callFake(() => {

      });
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. grid Todo shall work fine', fakeAsync(() => {
      // tell spy to return an async error observable
      getADPTmpDocsSpy.and.returnValue(asyncError<string>('getADPTmpDocs service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngAfterViewInit
      fixture.detectChanges();

      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('getADPTmpDocs service failed',
        'Expected snack bar to show the error message: getADPTmpDocs service failed');

      expect(getADPTmpDocsSpy).toHaveBeenCalled();
      expect(getLoanTmpDocsSpy).toHaveBeenCalled();
      expect(fetchDocPostedFrequencyPerUserSpy).toHaveBeenCalled();

      flush();
    }));

  });
});
