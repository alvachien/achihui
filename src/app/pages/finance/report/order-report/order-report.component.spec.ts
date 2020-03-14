import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject, of, } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';

import { FinanceUIModule } from '../../finance-ui.module';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError,
  ElementClass_DialogContent, ElementClass_DialogCloseButton } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, } from '../../../../services';
import { UserAuthInfo, FinanceReportByOrder, Order, } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { OrderReportComponent } from './order-report.component';

describe('OrderReportComponent', () => {
  let component: OrderReportComponent;
  let fixture: ComponentFixture<OrderReportComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllReportsByOrderSpy: any;
  let fetchAllOrdersSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllReportsByOrder',
      'fetchAllOrders'
    ]);
    fetchAllReportsByOrderSpy = storageService.fetchAllReportsByOrder.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FinanceUIModule,
        NgZorroAntdModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        MessageDialogComponent,
        OrderReportComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
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
    fixture = TestBed.createComponent(OrderReportComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    let arRptData: FinanceReportByOrder[] = [];
    beforeEach(() => {
      arRptData = [];
      arRptData.push({
        HomeID: 1,
        OrderId: 1,
        DebitBalance: 30,
        CreditBalance: 20,
        Balance: 10
      } as FinanceReportByOrder);
      arRptData.push({
        HomeID: 1,
        OrderId: 2,
        DebitBalance: 300,
        CreditBalance: 10,
        Balance: 290
      } as FinanceReportByOrder);
      fetchAllReportsByOrderSpy.and.returnValue(asyncData(arRptData));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSet.length).toEqual(0);
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.dataSet.length).toBeGreaterThan(0);
      expect(component.dataSet.length).toEqual(arRptData.length);

      flush();
    }));
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let arRptData: FinanceReportByOrder[] = [];

    beforeEach(() => {
      arRptData = [];
      arRptData.push({
        HomeID: 1,
        OrderId: 1,
        DebitBalance: 30,
        CreditBalance: 20,
        Balance: 10
      } as FinanceReportByOrder);
      arRptData.push({
        HomeID: 1,
        OrderId: 2,
        DebitBalance: 300,
        CreditBalance: 10,
        Balance: 290
      } as FinanceReportByOrder);
      fetchAllReportsByOrderSpy.and.returnValue(asyncData(arRptData));
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

    it('should display error when Report by order Service fails', fakeAsync(() => {
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
