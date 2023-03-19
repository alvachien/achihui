import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  inject,
  flush,
  discardPeriodicTasks,
} from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Router } from "@angular/router";
import { NzModalService } from "ng-zorro-antd/modal";
import { BehaviorSubject, of } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { OverlayContainer } from "@angular/cdk/overlay";
import { NgxEchartsModule } from "ngx-echarts";
import * as echarts from "echarts";

import { FinanceUIModule } from "../../finance-ui.module";
import {
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,
} from "../../../../../testing";
import {
  AuthService,
  UIStatusService,
  FinanceOdataService,
  HomeDefOdataService,
} from "../../../../services";
import {
  UserAuthInfo,
  FinanceReportByOrder,
  Order,
  FinanceReportEntryByTransactionType,
  financePeriodLast3Months,
  FinanceReportByAccountMOM,
  financePeriodLast6Months,
  financePeriodLast12Months,
} from "../../../../model";
import { MessageDialogComponent } from "../../../message-dialog";
import { AccountMonthOnMonthReportComponent } from "./account-month-on-month-report.component";

describe("AccountMonthOnMonthReportComponent", () => {
  let component: AccountMonthOnMonthReportComponent;
  let fixture: ComponentFixture<AccountMonthOnMonthReportComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllAccountsSpy: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchReportByAccountMoMSpy: any;
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

    storageService = jasmine.createSpyObj("FinanceOdataService", [
      "fetchAllAccounts",
      "fetchAllAccountCategories",
      "fetchReportByAccountMoM",
    ]);
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(
      of([])
    );
    fetchAllAccountCategoriesSpy =
      storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchReportByAccountMoMSpy =
      storageService.fetchReportByAccountMoM.and.returnValue(of([]));
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
      declarations: [AccountMonthOnMonthReportComponent],
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
    fixture = TestBed.createComponent(AccountMonthOnMonthReportComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  describe("2. shall work with data", () => {
    let arRptData: FinanceReportByAccountMOM[] = [];

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(
        asyncData(fakeData.finAccountCategories)
      );
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      arRptData = [];
      let ndata: FinanceReportByAccountMOM = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 100;
      ndata.CreditBalance = 20;
      ndata.Month = 1;
      ndata.AccountId = fakeData.finAccounts[0].Id!;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 120;
      ndata.CreditBalance = 30;
      ndata.Month = 2;
      ndata.AccountId = fakeData.finAccounts[0].Id!;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 110;
      ndata.CreditBalance = 50;
      ndata.Month = 3;
      ndata.AccountId = fakeData.finAccounts[0].Id!;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 150;
      ndata.CreditBalance = 150;
      ndata.Month = 4;
      ndata.AccountId = fakeData.finAccounts[0].Id!;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 250;
      ndata.CreditBalance = 10;
      ndata.Month = 6;
      ndata.AccountId = fakeData.finAccounts[0].Id!;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 250;
      ndata.CreditBalance = 10;
      ndata.Month = 8;
      ndata.AccountId = fakeData.finAccounts[0].Id!;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 250;
      ndata.CreditBalance = 10;
      ndata.Month = 10;
      ndata.AccountId = fakeData.finAccounts[0].Id!;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 250;
      ndata.CreditBalance = 110;
      ndata.Month = 11;
      ndata.AccountId = fakeData.finAccounts[0].Id!;
      arRptData.push(ndata);
      ndata = new FinanceReportByAccountMOM();
      ndata.HomeID = fakeData.chosedHome.ID;
      ndata.DebitBalance = 250;
      ndata.CreditBalance = 210;
      ndata.Month = 12;
      ndata.AccountId = fakeData.finAccounts[0].Id!;
      arRptData.push(ndata);
      fetchReportByAccountMoMSpy.and.returnValue(asyncData(arRptData));
    });

    it("should not show data before OnInit", () => {
      expect(component.arUIAccounts.length).toEqual(0);
    });

    it("should show data after OnInit", fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.arUIAccounts.length).toBeGreaterThan(0);

      component.selectedAccountID = fakeData.finAccounts[0].Id!;
      component.selectedPeriod = financePeriodLast3Months;
      component.refreshData();
      tick();
      fixture.detectChanges();

      discardPeriodicTasks();
      flush();
    }));

    it("should show data after period changed", fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.arUIAccounts.length).toBeGreaterThan(0);

      component.selectedAccountID = fakeData.finAccounts[0].Id!;
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

  describe("3. shall popup dialog for exceptions", () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it("should display error when get all account categories Service fails", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(
        asyncError<string>("Service failed")
      );
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(ElementClass_DialogContent)
          .length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ElementClass_DialogCloseButton
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(ElementClass_DialogContent)
          .length
      ).toBe(0);

      flush();
    }));

    it("should display error when get all account Service fails", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>("Service failed"));
      fetchAllAccountCategoriesSpy.and.returnValue(
        asyncData(fakeData.finAccountCategories)
      );

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(ElementClass_DialogContent)
          .length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ElementClass_DialogCloseButton
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(ElementClass_DialogContent)
          .length
      ).toBe(0);

      flush();
    }));

    it("should display error when Report by tran type Service fails", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(
        asyncData(fakeData.finAccountCategories)
      );
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchReportByAccountMoMSpy.and.returnValue(
        asyncError<string>("Service failed")
      );

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.selectedAccountID = fakeData.finAccounts[0].Id!;
      component.selectedPeriod = financePeriodLast3Months;
      component.refreshData();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(ElementClass_DialogContent)
          .length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ElementClass_DialogCloseButton
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(ElementClass_DialogContent)
          .length
      ).toBe(0);

      flush();
    }));
  });
});
