import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, inject, flush } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NzProgressModule } from 'ng-zorro-antd/progress';

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
import { UserAuthInfo, FinanceReportEntryByTransactionType } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { TranTypeReportComponent } from './tran-type-report.component';
import { SafeAny } from 'src/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('TranTypeReportComponent', () => {
  let component: TranTypeReportComponent;
  let fixture: ComponentFixture<TranTypeReportComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchReportByTransactionTypeSpy: SafeAny;
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

    storageService = jasmine.createSpyObj('FinanceOdataService', ['fetchReportByTransactionType', 'fetchAllTranTypes']);
    fetchReportByTransactionTypeSpy = storageService.fetchReportByTransactionType.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [MessageDialogComponent, TranTypeReportComponent],
    imports: [FinanceUIModule,
        NzProgressModule,
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

    // TestBed.overrideModule(BrowserDynamicTestingModule, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeReportComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    let arRptData: FinanceReportEntryByTransactionType[] = [];
    beforeEach(() => {
      arRptData = [];
      const rpt1 = new FinanceReportEntryByTransactionType();
      rpt1.HomeID = fakeData.chosedHome.ID;
      rpt1.InAmount = 200;
      rpt1.OutAmount = 100;
      if (fakeData.finTranTypes.length > 0) {
        rpt1.TransactionType = fakeData.finTranTypes[0].Id ?? 0;
        rpt1.TransactionTypeName = fakeData.finTranTypes[0].Name ?? '';
      }
      arRptData.push(rpt1);
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchReportByTransactionTypeSpy.and.returnValue(asyncData(arRptData));
    });

    it('should not show data before OnInit', () => {
      expect(component.reportIncome.length).toEqual(0);
      expect(component.reportExpense.length).toEqual(0);
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.reportIncome.length).toBeGreaterThan(0);

      flush();
    }));
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let arRptData: FinanceReportEntryByTransactionType[] = [];

    beforeEach(() => {
      arRptData = [];
      const rpt1 = new FinanceReportEntryByTransactionType();
      rpt1.HomeID = fakeData.chosedHome.ID;
      rpt1.InAmount = 200;
      rpt1.OutAmount = 100;
      if (fakeData.finTranTypes.length > 0) {
        rpt1.TransactionType = fakeData.finTranTypes[0].Id ?? 0;
        rpt1.TransactionTypeName = fakeData.finTranTypes[0].Name ?? '';
      }
      arRptData.push(rpt1);
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchReportByTransactionTypeSpy.and.returnValue(asyncData(arRptData));
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

    it('should display error when order Service fails', fakeAsync(() => {
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
  });
});
