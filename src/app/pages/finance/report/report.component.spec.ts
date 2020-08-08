import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject, of, } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import { FinanceUIModule } from '../finance-ui.module';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError,
  ElementClass_DialogContent, ElementClass_DialogCloseButton } from '../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService, } from '../../../services';
import { UserAuthInfo, FinanceReportByAccount, FinanceReportByControlCenter, FinanceReportByOrder, } from '../../../model';
import { MessageDialogComponent } from '../../message-dialog';
import { ReportComponent } from './report.component';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllReportsByAccountSpy: any;
  let fetchAllReportsByControlCenterSpy: any;
  let fetchAllReportsByOrderSpy: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllOrdersSpy: any;
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

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllReportsByAccount',
      'fetchAllReportsByControlCenter',
      'fetchAllReportsByOrder',
      'fetchAllAccountCategories',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
    ]);
    fetchAllReportsByAccountSpy = storageService.fetchAllReportsByAccount.and.returnValue(of([]));
    fetchAllReportsByControlCenterSpy = storageService.fetchAllReportsByControlCenter.and.returnValue(of([]));
    fetchAllReportsByOrderSpy = storageService.fetchAllReportsByOrder.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    homeServiceStub.ChosedHome = fakeData.chosedHome;
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgxEchartsModule.forRoot({ echarts }),
        FinanceUIModule,
        NgZorroAntdModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        MessageDialogComponent,
        ReportComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
      ]
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          MessageDialogComponent,
        ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('2. shall work with data', () => {
    let arRptAccount: FinanceReportByAccount[] = [];
    let arRptControlCenter: FinanceReportByControlCenter[] = [];
    let arRptOrder: FinanceReportByOrder[] = [];
    beforeEach(() => {
      arRptAccount = [];
      arRptAccount.push({
        HomeID: fakeData.chosedHome.ID,
        AccountId: fakeData.finAccounts[0].Id,
        DebitBalance: 30,
        CreditBalance: 20,
        Balance: 10
      } as FinanceReportByAccount);
      if (fakeData.finAccounts.length > 1) {
        arRptAccount.push({
          HomeID: fakeData.chosedHome.ID,
          AccountId: fakeData.finAccounts[1].Id,
          DebitBalance: 300,
          CreditBalance: 10,
          Balance: 290
        } as FinanceReportByAccount);
      }
      fetchAllReportsByAccountSpy.and.returnValue(asyncData(arRptAccount));

      arRptControlCenter = [];
      arRptControlCenter.push({
        HomeID: fakeData.chosedHome.ID,
        ControlCenterId: fakeData.finControlCenters[0].Id,
        DebitBalance: 30,
        CreditBalance: 20,
        Balance: 10
      } as FinanceReportByControlCenter);
      if (fakeData.finControlCenters.length > 1) {
        arRptControlCenter.push({
          HomeID: fakeData.chosedHome.ID,
          ControlCenterId: fakeData.finControlCenters[1].Id,
          DebitBalance: 300,
          CreditBalance: 10,
          Balance: 290
        } as FinanceReportByControlCenter);
      }
      fetchAllReportsByControlCenterSpy.and.returnValue(asyncData(arRptControlCenter));

      arRptOrder = [];
      arRptOrder.push({
        HomeID: fakeData.chosedHome.ID,
        OrderId: fakeData.finOrders[0].Id,
        DebitBalance: 30,
        CreditBalance: 20,
        Balance: 10
      } as FinanceReportByOrder);
      if (fakeData.finOrders.length > 1) {
        arRptOrder.push({
          HomeID: fakeData.chosedHome.ID,
          OrderId: fakeData.finOrders[1].Id,
          DebitBalance: 300,
          CreditBalance: 10,
          Balance: 290
        } as FinanceReportByOrder);
      }
      fetchAllReportsByOrderSpy.and.returnValue(asyncData(arRptOrder));

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
    let arRptAccount: FinanceReportByAccount[] = [];
    let arRptControlCenter: FinanceReportByControlCenter[] = [];
    let arRptOrder: FinanceReportByOrder[] = [];

    beforeEach(() => {
      arRptAccount = [];
      arRptControlCenter = [];
      arRptOrder = [];

      fetchAllReportsByAccountSpy.and.returnValue(asyncData(arRptAccount));
      fetchAllReportsByControlCenterSpy.and.returnValue(asyncData(arRptControlCenter));
      fetchAllReportsByOrderSpy.and.returnValue(asyncData(arRptOrder));

      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Report by account Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllReportsByAccountSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when Report by control center Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when Report by account Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllReportsByOrderSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when account Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when account category Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when control center Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when order Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
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
