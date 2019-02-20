import { async, ComponentFixture, TestBed, fakeAsync, inject, tick, flush, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
  } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { HttpLoaderTestFactory, RouterLinkDirectiveStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { AccountExtLoanExComponent } from './account-ext-loan-ex.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { UIMode, RepaymentMethodEnum, TemplateDocLoan, Account, AccountExtraLoan, } from '../../model';

describe('AccountExtLoanExComponent', () => {
  let component: AccountExtLoanExComponent;
  let fixture: ComponentFixture<AccountExtLoanExComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllAccountsSpy: any;
  let calcLoanTmpDocsSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllAccounts',
      'calcLoanTmpDocs',
    ]);
    fetchAllAccountCategoriesSpy = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = stroageService.fetchAllAccounts.and.returnValue(of([]));
    calcLoanTmpDocsSpy = stroageService.calcLoanTmpDocs.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;

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
        UIAccountStatusFilterPipe,
        UIAccountCtgyFilterPipe,
        UIAccountCtgyFilterExPipe,
        UIOrderValidFilterPipe,
        RouterLinkDirectiveStub,
        AccountExtLoanExComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtLoanExComponent);
    component = fixture.componentInstance;
  });

  it('1. should be created without data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('2. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));

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

    it('1. should display error when accont category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Account category service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Account category service failed',
        'Expected snack bar to show the error message: Account category service failed');
      flush();
    }));
    it('2. should display error when accont service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Account service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Account service failed',
        'Expected snack bar to show the error message: Account service failed');
      flush();
    }));
  });

  describe('3. Enable Mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));

      // Accounts
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));

      component.tranAmount = 100;
      component.controlCenterID = fakeData.finControlCenters[0].Id;
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. default values', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.dataSource.data.length).toEqual(0);
      expect(component.extObject).toBeTruthy();
      expect(component.extObject.startDate).toBeTruthy();
    }));

    it('2. cannot generate template docs if missing repay method', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Repayment method
      // component.extObject.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
      component.extObject.annualRate = 0.04;
      fixture.detectChanges();
      expect(component.canGenerateTmpDocs).toBeFalsy();
    }));

    it('3. cannot generate template docs if missing annual rate in non-interest free', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Repayment method
      let loanAcnt: AccountExtraLoan = new AccountExtraLoan();
      loanAcnt.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
      // loanAcnt.annualRate = 0.04;
      loanAcnt.InterestFree = false;
      component.writeValue(loanAcnt);
      component.onChange();
      fixture.detectChanges();
      expect(component.canGenerateTmpDocs).toBeFalsy();
    }));

    it('4. should generate template docs in valid case', fakeAsync(() => {
      let tmpdocs: TemplateDocLoan[] = [];
      for (let i: number = 0; i < 12; i++) {
        let tmpdoc: TemplateDocLoan = new TemplateDocLoan();
        tmpdoc.DocId = i + 1;
        tmpdoc.TranAmount = 8333.34;
        tmpdoc.InterestAmount = 362.50;
        tmpdoc.Desp = `test${i + 1}`;
        tmpdoc.TranType = 28;
        tmpdoc.TranDate = moment().add(i + 1, 'M');
        tmpdoc.ControlCenterId = 1;
        tmpdoc.AccountId = 22;
        tmpdocs.push(tmpdoc);
      }
      calcLoanTmpDocsSpy.and.returnValue(asyncData(tmpdocs));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Repayment method
      let loanAcnt: AccountExtraLoan = new AccountExtraLoan();
      loanAcnt.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
      loanAcnt.annualRate = 0.04;
      loanAcnt.InterestFree = false;
      loanAcnt.TotalMonths = 36;
      component.writeValue(loanAcnt);
      component.onChange();
      fixture.detectChanges();
      expect(component.canGenerateTmpDocs).toBeTruthy();

      component.onGenerateTmpDocs();
      expect(calcLoanTmpDocsSpy).toHaveBeenCalled();

      tick(); // Let's flush the data
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(12);
    }));

    it('5. should popup dialog in case template docs failed in generation', fakeAsync(() => {
      calcLoanTmpDocsSpy.and.returnValue(asyncError('Server 500 Error'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Repayment method
      let loanAcnt: AccountExtraLoan = new AccountExtraLoan();
      loanAcnt.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
      loanAcnt.annualRate = 0.04;
      loanAcnt.InterestFree = false;
      loanAcnt.TotalMonths = 36;
      component.writeValue(loanAcnt);
      component.onChange();
      fixture.detectChanges();
      expect(component.canGenerateTmpDocs).toBeTruthy();

      component.onGenerateTmpDocs();
      expect(calcLoanTmpDocsSpy).toHaveBeenCalled();

      tick(); // Let's flush the data
      fixture.detectChanges();

      // Expect there is a pop-up dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(component.dataSource.data.length).toEqual(0);
    }));
  });

  describe('4. disable mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));

      // Accounts
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));

      component.tranAmount = 100;
      component.controlCenterID = fakeData.finControlCenters[0].Id;
      component.writeValue(fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      }).ExtraInfo as AccountExtraLoan);
      component.setDisabledState(true);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. default values', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeFalsy();
      expect(component.dataSource.data.length).toBeGreaterThan(0);
      expect(component.extObject).toBeTruthy();
      expect(component.extObject.startDate).toBeTruthy();
      expect(component.canGenerateTmpDocs).toBeFalsy();
    }));
  });
});
