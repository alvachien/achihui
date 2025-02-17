import { ComponentFixture, TestBed, fakeAsync, tick, inject, flush, discardPeriodicTasks } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NgxEchartsModule } from 'ngx-echarts';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
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
  FinanceReportEntryByTransactionTypeMoM,
  financePeriodLast3Months,
  financePeriodLast6Months,
  financePeriodLast12Months,
} from '../../../../model';
import { TranTypeMonthOnMonthReportComponent } from './tran-type-month-on-month-report.component';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('TranTypeMonthOnMonthReportComponent', () => {
  let component: TranTypeMonthOnMonthReportComponent;
  let fixture: ComponentFixture<TranTypeMonthOnMonthReportComponent>;

  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchReportByTransactionTypeMoMSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  const homeServiceStub: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();
    homeServiceStub.ChosedHome = fakeData.chosedHome;

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchReportByTransactionTypeMoM',
      'fetchAllTranTypes',
    ]);
    fetchReportByTransactionTypeMoMSpy = storageService.fetchReportByTransactionTypeMoM.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [TranTypeMonthOnMonthReportComponent],
    imports: [NgxEchartsModule.forRoot({ echarts }),
        FinanceUIModule,
        NzCascaderModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule()],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeMonthOnMonthReportComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    let arRptData: FinanceReportEntryByTransactionTypeMoM[] = [];

    beforeEach(() => {
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      arRptData = [];
      let ndata: FinanceReportEntryByTransactionTypeMoM = new FinanceReportEntryByTransactionTypeMoM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.InAmount = 100;
      ndata.OutAmount = 20;
      ndata.Month = 1;
      ndata.TransactionType = fakeData.finTranTypes[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportEntryByTransactionTypeMoM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.InAmount = 120;
      ndata.OutAmount = 30;
      ndata.Month = 2;
      ndata.TransactionType = fakeData.finTranTypes[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportEntryByTransactionTypeMoM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.InAmount = 110;
      ndata.OutAmount = 50;
      ndata.Month = 3;
      ndata.TransactionType = fakeData.finTranTypes[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportEntryByTransactionTypeMoM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.InAmount = 150;
      ndata.OutAmount = 150;
      ndata.Month = 4;
      ndata.TransactionType = fakeData.finTranTypes[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportEntryByTransactionTypeMoM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.InAmount = 250;
      ndata.OutAmount = 10;
      ndata.Month = 6;
      ndata.TransactionType = fakeData.finTranTypes[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportEntryByTransactionTypeMoM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.InAmount = 250;
      ndata.OutAmount = 10;
      ndata.Month = 8;
      ndata.TransactionType = fakeData.finTranTypes[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportEntryByTransactionTypeMoM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.InAmount = 250;
      ndata.OutAmount = 10;
      ndata.Month = 10;
      ndata.TransactionType = fakeData.finTranTypes[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportEntryByTransactionTypeMoM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.InAmount = 250;
      ndata.OutAmount = 110;
      ndata.Month = 11;
      ndata.TransactionType = fakeData.finTranTypes[0].Id ?? 0;
      arRptData.push(ndata);
      ndata = new FinanceReportEntryByTransactionTypeMoM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.InAmount = 250;
      ndata.OutAmount = 210;
      ndata.Month = 12;
      ndata.TransactionType = fakeData.finTranTypes[0].Id ?? 0;
      arRptData.push(ndata);
      fetchReportByTransactionTypeMoMSpy.and.returnValue(asyncData(arRptData));
    });

    it('should not show data before OnInit', () => {
      expect(component.arTranType.length).toEqual(0);
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.arTranType.length).toBeGreaterThan(0);

      component.selectedTranTypes = [fakeData.finTranTypes[0].Id ?? 0];
      component.selectedPeriod = financePeriodLast3Months;
      component.refreshData();
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

      expect(component.arTranType.length).toBeGreaterThan(0);

      component.selectedTranTypes = [fakeData.finTranTypes[0].Id ?? 0];
      component.selectedPeriod = financePeriodLast6Months;
      component.refreshData();
      tick();
      fixture.detectChanges();

      component.selectedPeriod = financePeriodLast12Months;
      component.refreshData();
      tick();
      fixture.detectChanges();

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

    it('should display error when get all tran type Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Service failed'));

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

    it('should display error when Report by tran type Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchReportByTransactionTypeMoMSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.selectedTranTypes = [fakeData.finTranTypes[0].Id ?? 0];
      component.selectedPeriod = financePeriodLast3Months;
      component.refreshData();
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
