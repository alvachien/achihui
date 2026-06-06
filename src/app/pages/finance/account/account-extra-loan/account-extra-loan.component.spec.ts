import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ViewChild, Component } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import { addMonths, addYears } from 'date-fns';

import { AccountExtraLoanComponent } from './account-extra-loan.component';
import {createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError} from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import {
  UserAuthInfo,
  UIAccountForSelection,
  BuildupAccountForSelection,
  AccountExtraLoan,
  RepaymentMethodEnum,
  TemplateDocLoan,
} from '../../../../model';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';

describe('AccountExtraLoanComponent', () => {
  let testcomponent: AccountExtraLoanTestFormComponent;
  let fixture: ComponentFixture<AccountExtraLoanTestFormComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let homeService: Partial<HomeDefOdataService>;
  let calcLoanTmpDocsSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let arUIAccounts: UIAccountForSelection[];

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    storageService = createSpyObj('FinanceOdataService', ['calcLoanTmpDocs']);
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    arUIAccounts = BuildupAccountForSelection(fakeData.finAccounts, fakeData.finAccountCategories);
  });

  beforeEach(async () => {
    calcLoanTmpDocsSpy = storageService.calcLoanTmpDocs.and.returnValue(of([]));
    TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [FormsModule,
        
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        RouterTestingModule,
        getTranslocoModule(),
        NzFormModule,
        NzSelectModule,
        NzInputModule,
        NzInputNumberModule,
        NzDatePickerModule,
        NzCheckboxModule,
        NzButtonModule,
        NzAlertModule,
        NzTableModule,
        NzModalModule],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtraLoanTestFormComponent);
    testcomponent = fixture.componentInstance;
    testcomponent.tranAmount = 100;
    testcomponent.controlCenterID = fakeData.finControlCenters[0].Id;
    testcomponent.arUIAccount = arUIAccounts;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(testcomponent).toBeTruthy();
  });

  it('shall work with data 1: init status', async () => {
    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.formGroup.dirty).toBe(false);
    expect(testcomponent.formGroup.valid).toBe(false);

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it.skip('shall work with data 2: input start date', async () => {
    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    const loan1: AccountExtraLoan = new AccountExtraLoan();
    const startdt = addMonths(new Date(), 1);
    loan1.startDate = startdt;
    testcomponent.formGroup.get('extraControl')?.setValue(loan1);
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBe(false);

    const loanval2 = testcomponent.formGroup.get('extraControl')?.value as AccountExtraLoan;
    expect(loanval2.startDate).toBeTruthy();
    expect(loanval2.startDate?.getTime()).toEqual(startdt.getTime());
    expect(testcomponent.extraComponent?.listTmpDocs.length).toEqual(0);

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it.skip('shall work with data 3: input start date, total months', async () => {
    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    const loan1: AccountExtraLoan = new AccountExtraLoan();
    const startdt = addMonths(new Date(), 1);
    loan1.startDate = startdt;
    loan1.TotalMonths = 24;
    testcomponent.formGroup.get('extraControl')?.setValue(loan1);
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBe(false);

    const loanval2 = testcomponent.formGroup.get('extraControl')?.value as AccountExtraLoan;
    expect(loanval2.startDate).toBeTruthy();
    expect(loanval2.startDate?.getTime()).toEqual(startdt.getTime());
    expect(testcomponent.extraComponent?.listTmpDocs.length).toEqual(0);

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it.skip('shall work with data 4: input start date, total months and repay method', async () => {
    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    const loan1: AccountExtraLoan = new AccountExtraLoan();
    const startdt = addMonths(new Date(), 1);
    loan1.startDate = startdt;
    loan1.TotalMonths = 24;
    loan1.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
    testcomponent.formGroup.get('extraControl')?.setValue(loan1);
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBe(false);

    const loanval2 = testcomponent.formGroup.get('extraControl')?.value as AccountExtraLoan;
    expect(loanval2.startDate).toBeTruthy();
    expect(loanval2.startDate?.getTime()).toEqual(startdt.getTime());
    expect(testcomponent.extraComponent?.listTmpDocs.length).toEqual(0);

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it.skip('shall work with data 5: interest free case', async () => {
    const tmpdocs: TemplateDocLoan[] = [];
    for (let i = 0; i < 12; i++) {
      const tmpdoc: TemplateDocLoan = new TemplateDocLoan();
      tmpdoc.DocId = i + 1;
      tmpdoc.TranAmount = 8333.34;
      tmpdoc.Desp = `test${i + 1}`;
      tmpdoc.TranType = 28;
      tmpdoc.TranDate = addMonths(new Date(), i + 1);
      tmpdoc.ControlCenterId = 1;
      tmpdoc.AccountId = 22;
      tmpdocs.push(tmpdoc);
    }
    calcLoanTmpDocsSpy.and.returnValue(asyncData(tmpdocs));

    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    const loan1: AccountExtraLoan = new AccountExtraLoan();
    loan1.startDate = addMonths(new Date(), 1);
    loan1.endDate = addYears(new Date(), 2);
    loan1.TotalMonths = 24;
    loan1.RepayMethod = RepaymentMethodEnum.DueRepayment;
    loan1.InterestFree = true;
    loan1.RepayDayInMonth = 15;
    loan1.Comment = 'test';
    expect(loan1.isAccountValid).toBeTruthy();

    testcomponent.formGroup.get('extraControl')?.setValue(loan1);
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBe(false);

    expect(testcomponent.extraComponent?.canGenerateTmpDocs).toBeTruthy();

    testcomponent.extraComponent?.onGenerateTmpDocs();
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeTruthy();
    expect(testcomponent.formGroup.valid).toBeTruthy();

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it.skip('shall work with data 6: interest case', async () => {
    const tmpdocs: TemplateDocLoan[] = [];
    for (let i = 0; i < 12; i++) {
      const tmpdoc: TemplateDocLoan = new TemplateDocLoan();
      tmpdoc.DocId = i + 1;
      tmpdoc.TranAmount = 8333.34;
      tmpdoc.InterestAmount = 362.5;
      tmpdoc.Desp = `test${i + 1}`;
      tmpdoc.TranType = 28;
      tmpdoc.TranDate = addMonths(new Date(), i + 1);
      tmpdoc.ControlCenterId = 1;
      tmpdoc.AccountId = 22;
      tmpdocs.push(tmpdoc);
    }
    calcLoanTmpDocsSpy.and.returnValue(asyncData(tmpdocs));

    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    const loan1: AccountExtraLoan = new AccountExtraLoan();
    loan1.startDate = addMonths(new Date(), 1);
    loan1.endDate = addYears(new Date(), 2);
    loan1.TotalMonths = 24;
    loan1.RepayMethod = RepaymentMethodEnum.EqualPrincipalAndInterset;
    loan1.InterestFree = false;
    loan1.RepayDayInMonth = 15;
    loan1.Comment = 'test';
    expect(loan1.isAccountValid).toBeTruthy();

    testcomponent.formGroup.get('extraControl')?.setValue(loan1);
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBe(false);

    expect(testcomponent.extraComponent?.canGenerateTmpDocs).toBeTruthy();

    testcomponent.extraComponent?.onGenerateTmpDocs();
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeTruthy();
    expect(testcomponent.formGroup.valid).toBeTruthy();

    await new Promise<void>(r => setTimeout(r, 0));
  });

  describe('calcLoanTmpDocs return exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      calcLoanTmpDocsSpy = storageService.calcLoanTmpDocs.and.returnValue(asyncError<string>('Service failed'));
    });

    beforeEach(() => {
    const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
  });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it.skip('shall display error dialog', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      const loan1: AccountExtraLoan = new AccountExtraLoan();
      loan1.startDate = addMonths(new Date(), 1);
      loan1.endDate = addYears(new Date(), 2);
      loan1.TotalMonths = 24;
      loan1.RepayMethod = RepaymentMethodEnum.EqualPrincipalAndInterset;
      loan1.InterestFree = false;
      loan1.RepayDayInMonth = 15;
      expect(loan1.isAccountValid).toBeTruthy();

      testcomponent.formGroup.get('extraControl')?.setValue(loan1);
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
      expect(testcomponent.formGroup.valid).toBe(false);

      expect(testcomponent.extraComponent?.canGenerateTmpDocs).toBeTruthy();

      testcomponent.extraComponent?.onGenerateTmpDocs();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });
  });

  it('shall work with disabled mode', async () => {
    fixture.detectChanges();
    expect(testcomponent.extraComponent?.isFieldChangable).toBeTruthy();

    testcomponent.formGroup.disable();
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.extraComponent?.isFieldChangable).toBeFalsy();
  });

  it('shall work with reference doc.', async () => {
    const routerstub = TestBed.inject(Router);
    vi.spyOn(routerstub, 'navigate');

    testcomponent.extraComponent?.onRefDocClick(123);
    expect(routerstub.navigate).toHaveBeenCalledTimes(1);
    expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/display/123']);
  });
});

@Component({
    template: `
    <form [formGroup]="formGroup">
      <hih-finance-account-extra-loan
        formControlName="extraControl"
        [tranAmount]="tranAmount"
        [controlCenterID]="controlCenterID"
        [orderID]="orderID"
        [arUIAccount]="arUIAccount"
      >
      </hih-finance-account-extra-loan>
    </form>
  `,
    imports: [
      FormsModule,
      ReactiveFormsModule,
      AccountExtraLoanComponent,
    ]
})
export class AccountExtraLoanTestFormComponent {
  public formGroup: UntypedFormGroup;
  public tranAmount = 0;
  public controlCenterID?: number;
  public orderID?: number;
  public arUIAccount: UIAccountForSelection[] = [];

  @ViewChild(AccountExtraLoanComponent, { static: true }) extraComponent: AccountExtraLoanComponent | undefined;

  constructor() {
    this.formGroup = new UntypedFormGroup({
      extraControl: new UntypedFormControl(),
    });
  }
}
