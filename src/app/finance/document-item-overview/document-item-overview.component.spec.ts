import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
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
  DocumentCreatedFrequenciesByUser, ReportTrendExTypeEnum, ReportTrendExData, Document,
} from '../../model';

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
  let doPostADPTmpDocSpy: any;
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
    const homeService: Partial<HomeDefDetailService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchDocPostedFrequencyPerUser',
      'fetchReportTrendData',
      'getADPTmpDocs',
      'getLoanTmpDocs',
      'doPostADPTmpDoc',
    ]);
    fetchAllDocTypesSpy = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = stroageService.fetchAllAccounts.and.returnValue(of([]));
    fetchDocPostedFrequencyPerUserSpy = stroageService.fetchDocPostedFrequencyPerUser.and.returnValue(of([]));
    fetchReportTrendDataSpy = stroageService.fetchReportTrendData.and.returnValue(of([]));
    getADPTmpDocsSpy = stroageService.getADPTmpDocs.and.returnValue(of([]));
    getLoanTmpDocsSpy = stroageService.getLoanTmpDocs.and.returnValue(of([]));
    doPostADPTmpDocSpy = stroageService.doPostADPTmpDoc.and.returnValue(of({}));
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
  });

  describe('3. grid and menu should work', () => {
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
      fetchReportTrendDataSpy.and.callFake((trendtype: ReportTrendExTypeEnum, exctran?: boolean,
        dtbgn?: moment.Moment, dtend?: moment.Moment) => {
        let ardata: ReportTrendExData[] = [];
        if (trendtype === ReportTrendExTypeEnum.Daily) {
          let rst: ReportTrendExData = new ReportTrendExData();
          rst.onSetData({ 'tranDate': '2019-02-05', 'expense': false, 'tranAmount': 17600.0 });
          ardata.push(rst);
          rst = new ReportTrendExData();
          rst.onSetData({ 'tranDate': '2019-02-01', 'expense': true, 'tranAmount': -279.00 });
          ardata.push(rst);
          rst = new ReportTrendExData();
          rst.onSetData({ 'tranDate': '2019-02-02', 'expense': true, 'tranAmount': -575.35 });
          ardata.push(rst);
          rst = new ReportTrendExData();
          rst.onSetData({ 'tranDate': '2019-02-05', 'expense': true, 'tranAmount': -14590.00 });
          ardata.push(rst);
          rst = new ReportTrendExData();
          rst.onSetData({ 'tranDate': '2019-02-09', 'expense': true, 'tranAmount': -217.53 });
          ardata.push(rst);
        } else if (trendtype === ReportTrendExTypeEnum.Weekly) {
          let rst: ReportTrendExData = new ReportTrendExData();
          rst.onSetData({ 'tranWeek': 5, 'tranYear': 2019, 'expense': true, 'tranAmount': -854.35 });
          ardata.push(rst);
          rst = new ReportTrendExData();
          rst.onSetData({ 'tranWeek': 6, 'tranYear': 2019, 'expense': false, 'tranAmount': 17600.00 });
          ardata.push(rst);
          rst = new ReportTrendExData();
          rst.onSetData({ 'tranWeek': 6, 'tranYear': 2019, 'expense': true, 'tranAmount': -14807.53 });
          ardata.push(rst);
        }

        return asyncData(ardata);
      });

      // doPostADPTmpDocSpy
      let ndoc: Document = new Document();
      ndoc.Id = 100;
      doPostADPTmpDocSpy.and.returnValue(asyncData(ndoc));
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
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(getADPTmpDocsSpy).toHaveBeenCalled();
      expect(getLoanTmpDocsSpy).toHaveBeenCalled();
      expect(fetchDocPostedFrequencyPerUserSpy).toHaveBeenCalled();

      tick(); // For charts
      fixture.detectChanges();
      expect(fetchDocPostedFrequencyPerUserSpy).toHaveBeenCalled();
      expect(fetchReportTrendDataSpy).toHaveBeenCalled();

      expect(component.dataSourceTmpDoc.data.length).toBeGreaterThan(0);

      flush();
    }));

    it('2. menu shall work', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // For charts
      fixture.detectChanges();

      // Menus
      component.onCreateNormalDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createnormal']);

      component.onCreateTransferDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createtransfer']);

      component.onCreateADPDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createadp']);

      component.onCreateADRDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createadr']);

      component.onCreateExgDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createexg']);

      component.onCreateAssetBuyInDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createassetbuy']);

      component.onCreateAssetSoldOutDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createassetsold']);

      component.onCreateBorrowFromDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createbrwfrm']);

      component.onCreateLendToDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createlendto']);

      component.onCreateRepayDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createrepayex']);

      component.onCreateAssetValChgDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createassetvalchg']);

      component.onOpenPlanList();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/plan']);

      component.onCreatePlan();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/plan/create']);

      flush();
    }));

    it('3. onPostTmpDocument shall work for Loan temp doc', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // For charts
      fixture.detectChanges();

      let loanacntext: AccountExtraLoan = fakeData.finAccounts.find((vl: Account) => { return vl.Id === 22; })
        .ExtraInfo as AccountExtraLoan;
      component.onPostTmpDocument(loanacntext.loanTmpDocs[0]);

      expect(doPostADPTmpDocSpy).not.toHaveBeenCalled();
      // Shall do the navigation
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createrepayex']);
    }));

    it('4. onPostTmpDocument shall work for ADP temp doc - no click on snackbar', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // For charts
      fixture.detectChanges();

      let adpacntext: AccountExtraAdvancePayment = fakeData.finAccounts.find((vl: Account) => { return vl.Id === 24; })
        .ExtraInfo as AccountExtraAdvancePayment;
      component.onPostTmpDocument(adpacntext.dpTmpDocs[0]);

      expect(doPostADPTmpDocSpy).toHaveBeenCalled();
      tick(); // Makt the data return
      fixture.detectChanges();

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();

      // Let it dismiss automatically
      tick(2000);
      fixture.detectChanges();

      expect(getADPTmpDocsSpy).toHaveBeenCalledTimes(2);
      expect(getLoanTmpDocsSpy).toHaveBeenCalledTimes(2);

      tick();
      fixture.detectChanges();
      flush();
    }));

    it('5. onPostTmpDocument shall work for ADP temp doc - click open in snackbar', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // For charts
      fixture.detectChanges();

      let adpacntext: AccountExtraAdvancePayment = fakeData.finAccounts.find((vl: Account) => { return vl.Id === 24; })
        .ExtraInfo as AccountExtraAdvancePayment;
      component.onPostTmpDocument(adpacntext.dpTmpDocs[0]);

      expect(doPostADPTmpDocSpy).toHaveBeenCalled();
      tick(); // Makt the data return
      fixture.detectChanges();

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();

      // Then, click the open button
      let actionButton: any = overlayContainerElement.querySelector('button.mat-button') as HTMLButtonElement;
      actionButton.click();
      fixture.detectChanges();

      expect(getADPTmpDocsSpy).toHaveBeenCalledTimes(1);
      expect(getLoanTmpDocsSpy).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/display/100']);

      tick();
      // flush();
    }));

    it('6. onPostTmpDocument shall handle exception for ADP temp doc fail case', fakeAsync(() => {
      doPostADPTmpDocSpy.and.returnValue(asyncError('server failed with 500'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // For charts
      fixture.detectChanges();

      let adpacntext: AccountExtraAdvancePayment = fakeData.finAccounts.find((vl: Account) => { return vl.Id === 24; })
        .ExtraInfo as AccountExtraAdvancePayment;
      component.onPostTmpDocument(adpacntext.dpTmpDocs[0]);

      expect(doPostADPTmpDocSpy).toHaveBeenCalled();
      tick(); // Makt the exception
      fixture.detectChanges();

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('server failed with 500',
        'Expected snack bar to show the error message: server failed with 500');

      tick();
      // flush();
    }));

    // it('2. shall handle the fetchDocPostedFrequencyPerUser fails case', fakeAsync(() => {
    //   fetchDocPostedFrequencyPerUserSpy.and.returnValue(asyncError('server 500 failed'));

    //   fixture.detectChanges(); // ngOnInit
    //   tick(); // Complete the Observables in ngAfterViewInit
    //   fixture.detectChanges();

    //   expect(getADPTmpDocsSpy).toHaveBeenCalled();
    //   expect(getLoanTmpDocsSpy).toHaveBeenCalled();
    //   expect(fetchDocPostedFrequencyPerUserSpy).toHaveBeenCalled();

    //   tick(); // For charts
    //   fixture.detectChanges();
    //   expect(fetchDocPostedFrequencyPerUserSpy).toHaveBeenCalled();
    //   expect(fetchReportTrendDataSpy).toHaveBeenCalled();

    //   let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
    //   expect(messageElement.textContent).toContain('server 500 failed',
    //     'Expected snack bar to show the error message: server 500 failed');

    //   flush();
    // }));
  });
});
