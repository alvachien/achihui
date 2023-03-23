import { ComponentFixture, discardPeriodicTasks, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import { FinanceUIModule } from '../../finance-ui.module';
import {
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
  FinanceReportEntryMoM,
  financePeriodLast6Months,
  financePeriodLast12Months,
} from '../../../../model';
import { StatementOfIncomeExpenseMonthOnMonthComponent } from './statement-of-income-expense-month-on-month.component';
import { SafeAny } from 'src/common';

describe('StatementOfIncomeExpenseMonthOnMonthComponent', () => {
  let component: StatementOfIncomeExpenseMonthOnMonthComponent;
  let fixture: ComponentFixture<StatementOfIncomeExpenseMonthOnMonthComponent>;

  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchStatementOfIncomeAndExposeMoMSpy: SafeAny;
  let fetchDailyStatementOfIncomeAndExpenseSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  const homeServiceStub: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    homeServiceStub.ChosedHome = fakeData.chosedHome;

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchStatementOfIncomeAndExposeMoM',
      'fetchDailyStatementOfIncomeAndExpense',
    ]);
    fetchStatementOfIncomeAndExposeMoMSpy = storageService.fetchStatementOfIncomeAndExposeMoM.and.returnValue(of([]));
    fetchDailyStatementOfIncomeAndExpenseSpy = storageService.fetchDailyStatementOfIncomeAndExpense.and.returnValue(
      of([])
    );
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgxEchartsModule.forRoot({ echarts }),
        FinanceUIModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [StatementOfIncomeExpenseMonthOnMonthComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        NzModalService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementOfIncomeExpenseMonthOnMonthComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    let arRptData: FinanceReportEntryMoM[] = [];
    beforeEach(() => {
      arRptData = [];
      arRptData.push({
        HomeID: fakeData.chosedHome.ID,
        InAmount: 30,
        OutAmount: 20,
        Month: 1,
      } as FinanceReportEntryMoM);
      arRptData.push({
        HomeID: fakeData.chosedHome.ID,
        InAmount: 300,
        OutAmount: 10,
        Month: 2,
      } as FinanceReportEntryMoM);
      arRptData.push({
        HomeID: fakeData.chosedHome.ID,
        InAmount: 300,
        OutAmount: 10,
        Month: 3,
      } as FinanceReportEntryMoM);
      arRptData.push({
        HomeID: fakeData.chosedHome.ID,
        InAmount: 300,
        OutAmount: 10,
        Month: 4,
      } as FinanceReportEntryMoM);
      arRptData.push({
        HomeID: fakeData.chosedHome.ID,
        InAmount: 300,
        OutAmount: 10,
        Month: 6,
      } as FinanceReportEntryMoM);
      arRptData.push({
        HomeID: fakeData.chosedHome.ID,
        InAmount: 300,
        OutAmount: 10,
        Month: 7,
      } as FinanceReportEntryMoM);
      arRptData.push({
        HomeID: fakeData.chosedHome.ID,
        InAmount: 300,
        OutAmount: 10,
        Month: 8,
      } as FinanceReportEntryMoM);
      arRptData.push({
        HomeID: fakeData.chosedHome.ID,
        InAmount: 300,
        OutAmount: 10,
        Month: 9,
      } as FinanceReportEntryMoM);
      arRptData.push({
        HomeID: fakeData.chosedHome.ID,
        InAmount: 300,
        OutAmount: 10,
        Month: 11,
      } as FinanceReportEntryMoM);
      arRptData.push({
        HomeID: fakeData.chosedHome.ID,
        InAmount: 300,
        OutAmount: 10,
        Month: 12,
      } as FinanceReportEntryMoM);
      fetchStatementOfIncomeAndExposeMoMSpy.and.returnValue(asyncData(arRptData));
      fetchDailyStatementOfIncomeAndExpenseSpy.and.returnValue(asyncData([]));
    });

    it('should not show data before OnInit', () => {
      expect(component.reportData.length).toEqual(0);
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.reportData.length).toBeGreaterThan(0);

      component.onChartClick({ name: '2022.02' });
      tick();
      fixture.detectChanges();

      discardPeriodicTasks();
      flush();
    }));

    it('should show data after period changed', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.reportData.length).toBeGreaterThan(0);

      component.selectedPeriod = financePeriodLast6Months;
      component.onChanges(null);
      tick();
      fixture.detectChanges();
      expect(component.reportData.length).toBeGreaterThan(0);

      component.selectedPeriod = financePeriodLast12Months;
      component.onChanges(null);
      tick();
      fixture.detectChanges();
      expect(component.reportData.length).toBeGreaterThan(0);

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('3. shall popup dialog for exceptions', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Report by account Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchStatementOfIncomeAndExposeMoMSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));
  });
});
