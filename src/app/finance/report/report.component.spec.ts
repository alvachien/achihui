import { async, ComponentFixture, TestBed, tick, flush, fakeAsync, inject, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MatTabGroup,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError, } from '../../../testing';
import { ReportComponent } from './report.component';
import { ThemeStorage } from '../../theme-picker';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { BalanceSheetReport, ControlCenterReport, OrderReport, AccountCategory, MonthOnMonthReport, } from 'app/model';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllOrdersSpy: any;
  let getReportBSSpy: any;
  let getReportCCSpy: any;
  let getReportOrderSpy: any;
  let getReportMonthOnMonthSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    const themeStorageStub: Partial<ThemeStorage> = {};
    themeStorageStub.getStoredTheme = () => { return undefined; };
    themeStorageStub.onThemeUpdate = new EventEmitter<any>();
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'getReportBS',
      'getReportCC',
      'getReportOrder',
      'getReportMonthOnMonth',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    getReportBSSpy = storageService.getReportBS.and.returnValue(of([]));
    getReportCCSpy = storageService.getReportCC.and.returnValue(of([]));
    getReportOrderSpy = storageService.getReportOrder.and.returnValue(of([]));
    getReportMonthOnMonthSpy = storageService.getReportMonthOnMonth.and.returnValue(of([]));

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
        ReportComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: ThemeStorage, useValue: themeStorageStub },
        { provide: FinanceStorageService, useValue: storageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
  });

  it('1. should be created without data', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall display the data correctly', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));

      // Accounts
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      // CC
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      // Order
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));

      // Report data
      let rptBS: BalanceSheetReport[] = [];
      for (let i: number = 0; i < 2; i ++) {
        let brpt: BalanceSheetReport = new BalanceSheetReport();
        brpt.AccountId = fakeData.finAccounts[i].Id;
        brpt.AccountName = fakeData.finAccounts[i].Name;
        brpt.AccountCategoryId = fakeData.finAccounts[i].CategoryId;
        brpt.AccountCategoryName = fakeData.finAccountCategories.find((val: AccountCategory) => {
          return val.ID === fakeData.finAccounts[i].CategoryId;
        }).Name;
        brpt.DebitBalance = +(Math.random() * 10000).toFixed(2);
        brpt.CreditBalance = +(Math.random() * 8000).toFixed(2);
        brpt.Balance = brpt.DebitBalance - brpt.CreditBalance;
        rptBS.push(brpt);
      }
      getReportBSSpy.and.returnValue(asyncData(rptBS));

      let rptCC: ControlCenterReport[] = [];
      for (let i: number = 0; i < 2; i ++) {
        let crpt: ControlCenterReport = new ControlCenterReport();
        crpt.ControlCenterId = fakeData.finControlCenters[i].Id;
        crpt.ControlCenterName = fakeData.finControlCenters[i].Name;
        crpt.DebitBalance = +(Math.random() * 10000).toFixed(2);
        crpt.CreditBalance = +(Math.random() * 8000).toFixed(2);
        crpt.Balance = crpt.DebitBalance - crpt.CreditBalance;
        rptCC.push(crpt);
      }
      getReportCCSpy.and.returnValue(asyncData(rptCC));

      let rptOrd: OrderReport[] = [];
      for (let i: number = 0; i < 2; i ++) {
        let orpt: OrderReport = new OrderReport();
        orpt.OrderId = fakeData.finOrders[i].Id;
        orpt.OrderName = fakeData.finOrders[i].Name;
        orpt.DebitBalance = +(Math.random() * 10000).toFixed(2);
        orpt.CreditBalance = +(Math.random() * 8000).toFixed(2);
        orpt.Balance = orpt.DebitBalance - orpt.CreditBalance;
        rptOrd.push(orpt);
      }
      getReportOrderSpy.and.returnValue(asyncData(rptOrd));

      let rptMOM: MonthOnMonthReport[] = [];
      for (let i: number = 0; i < 2; i ++) {
        let orpt: MonthOnMonthReport = new MonthOnMonthReport();
        orpt.year = 2019;
        orpt.month = i + 1;
        orpt.expense = i === 1;
        orpt.tranAmount = +(Math.random() * 10000).toFixed(2);
        rptMOM.push(orpt);
      }
      getReportMonthOnMonthSpy.and.returnValue(asyncData(rptMOM));
    });

    it('shall load the data', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the observables in ngOnInit
      fixture.detectChanges();

      let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
      // By default is 0
      expect(tabComponent.selectedIndex).toEqual(0);

      flush();
    }));

    it('shall load the data for overview tab', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the observables in ngOnInit
      fixture.detectChanges();

      let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
      // Tab: Overview
      tabComponent.selectedIndex = 1;
      // tick();
      fixture.detectChanges();
      expect(tabComponent.selectedIndex).toEqual(1);

      flush();
    }));

    it('shall load the data for bs tab', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the observables in ngOnInit
      fixture.detectChanges();

      let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
      // Tab: BS
      tabComponent.selectedIndex = 2;
      // tick();
      fixture.detectChanges();
      expect(component.dataSourceBS.data.length).toEqual(2);

      flush();
    }));

    it('shall load the data for cc tab', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the observables in ngOnInit
      fixture.detectChanges();

      let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
      // Tab: CC
      tabComponent.selectedIndex = 3;
      // tick();
      fixture.detectChanges();
      expect(component.dataSourceCC.data.length).toEqual(2);

      flush();
    }));

    it('shall load the data for order tab', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the observables in ngOnInit
      fixture.detectChanges();

      let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;

      // Tab: Order
      tabComponent.selectedIndex = 4;
      // tick();
      fixture.detectChanges();
      expect(component.dataSourceOrder.data.length).toEqual(2);

      flush();
    }));
  });
});
