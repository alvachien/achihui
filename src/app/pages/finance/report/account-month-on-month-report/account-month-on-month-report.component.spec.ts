import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import {
  createSpyObj,
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,
} from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import {
  UserAuthInfo,
  financePeriodLast3Months,
  FinanceReportByAccountMOM,
  financePeriodLast6Months,
  financePeriodLast12Months,
} from '../../../../model';
import { AccountMonthOnMonthReportComponent } from './account-month-on-month-report.component';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AccountMonthOnMonthReportComponent', () => {
  let component: AccountMonthOnMonthReportComponent;
  let fixture: ComponentFixture<AccountMonthOnMonthReportComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchReportByAccountMoMSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  const homeServiceStub: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();
    homeServiceStub.ChosedHome = fakeData.chosedHome;

    storageService = createSpyObj('FinanceOdataService', [
      'fetchAllAccounts',
      'fetchAllAccountCategories',
      'fetchReportByAccountMoM',
    ]);
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchReportByAccountMoMSpy = storageService.fetchReportByAccountMoM.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [
        NgxEchartsModule.forRoot({ echarts }),

        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountMonthOnMonthReportComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('2. shall work with data', () => {
    let arRptData: FinanceReportByAccountMOM[] = [];

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      arRptData = [];
      let ndata: FinanceReportByAccountMOM = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 100;
      ndata.CreditBalance = 20;
      ndata.Month = 1;
      ndata.AccountId = fakeData.finAccounts[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 120;
      ndata.CreditBalance = 30;
      ndata.Month = 2;
      ndata.AccountId = fakeData.finAccounts[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 110;
      ndata.CreditBalance = 50;
      ndata.Month = 3;
      ndata.AccountId = fakeData.finAccounts[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 150;
      ndata.CreditBalance = 150;
      ndata.Month = 4;
      ndata.AccountId = fakeData.finAccounts[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 250;
      ndata.CreditBalance = 10;
      ndata.Month = 6;
      ndata.AccountId = fakeData.finAccounts[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 250;
      ndata.CreditBalance = 10;
      ndata.Month = 8;
      ndata.AccountId = fakeData.finAccounts[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 250;
      ndata.CreditBalance = 10;
      ndata.Month = 10;
      ndata.AccountId = fakeData.finAccounts[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 250;
      ndata.CreditBalance = 110;
      ndata.Month = 11;
      ndata.AccountId = fakeData.finAccounts[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 250;
      ndata.CreditBalance = 210;
      ndata.Month = 12;
      ndata.AccountId = fakeData.finAccounts[0].Id ?? 0;
      arRptData.push(ndata);
      fetchReportByAccountMoMSpy.and.returnValue(asyncData(arRptData));
    });

    it('should not show data before OnInit', () => {
      expect(component.arUIAccounts.length).toEqual(0);
    });

    it('should show data after OnInit', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.arUIAccounts.length).toBeGreaterThan(0);

      component.selectedAccountID = fakeData.finAccounts[0].Id ?? 0;
      component.selectedPeriod = financePeriodLast3Months;
      component.refreshData();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should show data after period changed', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.arUIAccounts.length).toBeGreaterThan(0);

      component.selectedAccountID = fakeData.finAccounts[0].Id ?? 0;
      component.selectedPeriod = financePeriodLast6Months;
      component.refreshData();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.selectedPeriod = financePeriodLast12Months;
      component.refreshData();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('3. shall popup dialog for exceptions', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      overlayContainer = TestBed.inject(OverlayContainer);
      overlayContainerElement = overlayContainer.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when get all account categories Service fails', async () => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should display error when get all account Service fails', async () => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Service failed'));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should display error when Report by tran type Service fails', async () => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchReportByAccountMoMSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.selectedAccountID = fakeData.finAccounts[0].Id ?? 0;
      component.selectedPeriod = financePeriodLast3Months;
      component.refreshData();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
});
