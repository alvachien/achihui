import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  inject,
  flush,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { NzProgressModule } from 'ng-zorro-antd/progress';

import { FinanceUIModule } from '../finance-ui.module';
import {
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,
} from '../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../services';
import {
  UserAuthInfo,
  FinanceReportByAccount,
  FinanceReportByControlCenter,
  FinanceReportByOrder,
} from '../../../model';
import { MessageDialogComponent } from '../../message-dialog';
import { ReportComponent } from './report.component';
import { SafeAny } from 'src/common';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  // let fetchAllReportsByAccountSpy: any;
  // let fetchAllReportsByControlCenterSpy: any;
  // let fetchAllReportsByOrderSpy: any;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let fetchReportByTransactionTypeSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeServiceStub: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      // 'fetchAllReportsByAccount',
      // 'fetchAllReportsByControlCenter',
      // 'fetchAllReportsByOrder',
      'fetchReportByTransactionType',
      'fetchAllAccountCategories',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
    ]);
    // fetchAllReportsByAccountSpy = storageService.fetchAllReportsByAccount.and.returnValue(of([]));
    // fetchAllReportsByControlCenterSpy = storageService.fetchAllReportsByControlCenter.and.returnValue(of([]));
    // fetchAllReportsByOrderSpy = storageService.fetchAllReportsByOrder.and.returnValue(of([]));
    fetchReportByTransactionTypeSpy = storageService.fetchReportByTransactionType.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    homeServiceStub = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgxEchartsModule.forRoot({ echarts }),
        FinanceUIModule,
        NzProgressModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [MessageDialogComponent, ReportComponent],
      providers: [
        NzModalService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
      ],
    }).compileComponents();

    // TestBed.overrideModule(BrowserDynamicTestingModule, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xdescribe('2. shall work with data', () => {
    const arRptAccount: FinanceReportByAccount[] = [];
    const arRptControlCenter: FinanceReportByControlCenter[] = [];
    const arRptOrder: FinanceReportByOrder[] = [];
    beforeEach(() => {
      // arRptAccount = [];
      // arRptAccount.push({
      //   HomeID: fakeData.chosedHome.ID,
      //   AccountId: fakeData.finAccounts[0].Id,
      //   DebitBalance: 30,
      //   CreditBalance: 20,
      //   Balance: 10
      // } as FinanceReportByAccount);
      // if (fakeData.finAccounts.length > 1) {
      //   arRptAccount.push({
      //     HomeID: fakeData.chosedHome.ID,
      //     AccountId: fakeData.finAccounts[1].Id,
      //     DebitBalance: 300,
      //     CreditBalance: 10,
      //     Balance: 290
      //   } as FinanceReportByAccount);
      // }
      // fetchAllReportsByAccountSpy.and.returnValue(asyncData(arRptAccount));

      // arRptControlCenter = [];
      // arRptControlCenter.push({
      //   HomeID: fakeData.chosedHome.ID,
      //   ControlCenterId: fakeData.finControlCenters[0].Id,
      //   DebitBalance: 30,
      //   CreditBalance: 20,
      //   Balance: 10
      // } as FinanceReportByControlCenter);
      // if (fakeData.finControlCenters.length > 1) {
      //   arRptControlCenter.push({
      //     HomeID: fakeData.chosedHome.ID,
      //     ControlCenterId: fakeData.finControlCenters[1].Id,
      //     DebitBalance: 300,
      //     CreditBalance: 10,
      //     Balance: 290
      //   } as FinanceReportByControlCenter);
      // }
      // fetchAllReportsByControlCenterSpy.and.returnValue(asyncData(arRptControlCenter));

      // arRptOrder = [];
      // arRptOrder.push({
      //   HomeID: fakeData.chosedHome.ID,
      //   OrderId: fakeData.finOrders[0].Id,
      //   DebitBalance: 30,
      //   CreditBalance: 20,
      //   Balance: 10
      // } as FinanceReportByOrder);
      // if (fakeData.finOrders.length > 1) {
      //   arRptOrder.push({
      //     HomeID: fakeData.chosedHome.ID,
      //     OrderId: fakeData.finOrders[1].Id,
      //     DebitBalance: 300,
      //     CreditBalance: 10,
      //     Balance: 290
      //   } as FinanceReportByOrder);
      // }
      // fetchAllReportsByOrderSpy.and.returnValue(asyncData(arRptOrder));

      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataReportByAccount.length).toEqual(0);
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.dataReportByAccount.length).toBeGreaterThan(0);
      expect(component.dataReportByAccount.length).toEqual(arRptAccount.length);
      expect(component.dataReportByControlCenter.length).toEqual(arRptControlCenter.length);
      expect(component.dataReportByOrder.length).toEqual(arRptOrder.length);

      flush();
    }));
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchReportByTransactionTypeSpy.and.returnValue([]);
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Report by tran type Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchReportByTransactionTypeSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
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

      discardPeriodicTasks();
      flush();
    }));
  });

  it('drilldown to account', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onDrillDownToAccount();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/report/account']);
  });

  it('drilldown to accountmom', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onDrillDownToAccountMoM();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/report/accountmom']);
  });

  it('drilldown to tran type mom', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onDrillDownToTranTypeMoM();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'report', 'trantypemom']);
  });

  it('drilldown to control center', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onDrillDownToControlCenter();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/report/controlcenter']);
  });

  it('drilldown to control center MOM', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onDrillDownToControlCenterMoM();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/report/controlcentermom']);
  });

  it('drilldown to order', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onDrillDownToOrder();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/report/order']);
  });

  it('drilldown to tran type', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onDrillDownToTranType();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'report', 'trantype']);
  });

  it('drilldown to cash', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onDrillDownToCash();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'report', 'cash']);
  });

  it('drilldown to cash MOM', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onDrillDownToCashMoM();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'report', 'cashmom']);
  });

  it('drilldown to income statement', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onDrillDownToStatementOfIncomeExpenseMoM();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'report', 'statementofincexpmom']);
  });
});
