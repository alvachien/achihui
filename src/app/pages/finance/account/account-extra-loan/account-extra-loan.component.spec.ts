import { waitForAsync, ComponentFixture, TestBed, inject, fakeAsync, tick, flush } from '@angular/core/testing';
import { ViewChild, Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NZ_I18N, en_US, } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import * as moment from 'moment';

import { FinanceUIModule } from '../../finance-ui.module';
import { AccountExtraLoanComponent } from './account-extra-loan.component';
import { getTranslocoModule, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService, } from '../../../../services';
import { UserAuthInfo, UIAccountForSelection, BuildupAccountForSelection, AccountExtraLoan, RepaymentMethodEnum, TemplateDocLoan } from '../../../../model';

describe('AccountExtraLoanComponent', () => {
  let testcomponent: AccountExtraLoanTestFormComponent;
  let fixture: ComponentFixture<AccountExtraLoanTestFormComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let homeService: Partial<HomeDefOdataService>;
  let calcLoanTmpDocsSpy: any;
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

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'calcLoanTmpDocs',
    ]);
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    arUIAccounts = BuildupAccountForSelection(fakeData.finAccounts, fakeData.finAccountCategories);
  });

  beforeEach(waitForAsync(() => {
    calcLoanTmpDocsSpy = storageService.calcLoanTmpDocs.and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        AccountExtraLoanComponent,
        AccountExtraLoanTestFormComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
      ]
    })
    .compileComponents();
  }));

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

  it('shall work with data 1: init status', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.dirty).toBeFalse();
    expect(testcomponent.formGroup.valid).toBeFalse();

    flush();
  }));

  it('shall work with data 2: input start date', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const loan1: AccountExtraLoan = new AccountExtraLoan();
    const startdt = moment().add(1, 'M');
    loan1.startDate = startdt;
    testcomponent.formGroup.get('extraControl')?.setValue(loan1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBeFalse();

    const loanval2 = testcomponent.formGroup.get('extraControl')?.value as AccountExtraLoan;
    expect(loanval2.startDate).toBeTruthy();
    expect(loanval2.startDate?.isSame(startdt)).toBeTruthy();
    expect(testcomponent.extraComponent?.listTmpDocs.length).toEqual(0);

    flush();
  }));

  it('shall work with data 3: input start date, total months', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const loan1: AccountExtraLoan = new AccountExtraLoan();
    const startdt = moment().add(1, 'M');
    loan1.startDate = startdt;
    loan1.TotalMonths = 24;
    testcomponent.formGroup.get('extraControl')?.setValue(loan1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBeFalse();

    const loanval2 = testcomponent.formGroup.get('extraControl')?.value as AccountExtraLoan;
    expect(loanval2.startDate).toBeTruthy();
    expect(loanval2.startDate?.isSame(startdt)).toBeTruthy();
    expect(testcomponent.extraComponent?.listTmpDocs.length).toEqual(0);

    flush();
  }));

  it('shall work with data 4: input start date, total months and repay method', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const loan1: AccountExtraLoan = new AccountExtraLoan();
    const startdt = moment().add(1, 'M');
    loan1.startDate = startdt;
    loan1.TotalMonths = 24;
    loan1.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
    testcomponent.formGroup.get('extraControl')?.setValue(loan1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBeFalse();

    const loanval2 = testcomponent.formGroup.get('extraControl')?.value as AccountExtraLoan;
    expect(loanval2.startDate).toBeTruthy();
    expect(loanval2.startDate?.isSame(startdt)).toBeTruthy();
    expect(testcomponent.extraComponent?.listTmpDocs.length).toEqual(0);

    flush();
  }));

  xit('shall work with data 5: interest free case', fakeAsync(() => {
    const tmpdocs: TemplateDocLoan[] = [];
    for (let i = 0; i < 12; i++) {
      const tmpdoc: TemplateDocLoan = new TemplateDocLoan();
      tmpdoc.DocId = i + 1;
      tmpdoc.TranAmount = 8333.34;
      tmpdoc.Desp = `test${i + 1}`;
      tmpdoc.TranType = 28;
      tmpdoc.TranDate = moment().add(i + 1, 'M');
      tmpdoc.ControlCenterId = 1;
      tmpdoc.AccountId = 22;
      tmpdocs.push(tmpdoc);
    }
    calcLoanTmpDocsSpy.and.returnValue(asyncData(tmpdocs));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const loan1: AccountExtraLoan = new AccountExtraLoan();
    loan1.startDate = moment().add(1, 'M');
    loan1.endDate = moment().add(2, 'years');
    loan1.TotalMonths = 24;
    loan1.RepayMethod = RepaymentMethodEnum.DueRepayment;
    loan1.InterestFree = true;
    loan1.RepayDayInMonth = 15;
    loan1.Comment = 'test';
    expect(loan1.isAccountValid).toBeTruthy();

    testcomponent.formGroup.get('extraControl')?.setValue(loan1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBeFalse();

    expect(testcomponent.extraComponent?.canGenerateTmpDocs).toBeTruthy();

    testcomponent.extraComponent?.onGenerateTmpDocs();
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeTruthy();
    expect(testcomponent.formGroup.valid).toBeTruthy();

    flush();
  }));

  xit('shall work with data 6: interest case', fakeAsync(() => {
    const tmpdocs: TemplateDocLoan[] = [];
    for (let i = 0; i < 12; i++) {
      const tmpdoc: TemplateDocLoan = new TemplateDocLoan();
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
    tick();
    fixture.detectChanges();

    const loan1: AccountExtraLoan = new AccountExtraLoan();
    loan1.startDate = moment().add(1, 'M');
    loan1.endDate = moment().add(2, 'years');
    loan1.TotalMonths = 24;
    loan1.RepayMethod = RepaymentMethodEnum.EqualPrincipalAndInterset;
    loan1.InterestFree = false;
    loan1.RepayDayInMonth = 15;
    loan1.Comment = 'test';
    expect(loan1.isAccountValid).toBeTruthy();

    testcomponent.formGroup.get('extraControl')?.setValue(loan1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBeFalse();

    expect(testcomponent.extraComponent?.canGenerateTmpDocs).toBeTruthy();

    testcomponent.extraComponent?.onGenerateTmpDocs();
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeTruthy();
    expect(testcomponent.formGroup.valid).toBeTruthy();

    flush();
  }));

  describe('calcLoanTmpDocs return exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      calcLoanTmpDocsSpy = storageService.calcLoanTmpDocs.and.returnValue(asyncError<string>('Service failed'));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    xit('shall display error dialog', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const loan1: AccountExtraLoan = new AccountExtraLoan();
      loan1.startDate = moment().add(1, 'M');
      loan1.endDate = moment().add(2, 'years');
      loan1.TotalMonths = 24;
      loan1.RepayMethod = RepaymentMethodEnum.EqualPrincipalAndInterset;
      loan1.InterestFree = false;
      loan1.RepayDayInMonth = 15;
      expect(loan1.isAccountValid).toBeTruthy();

      testcomponent.formGroup.get('extraControl')?.setValue(loan1);
      flush();
      tick();
      fixture.detectChanges();

      expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
      expect(testcomponent.formGroup.valid).toBeFalse();

      expect(testcomponent.extraComponent?.canGenerateTmpDocs).toBeTruthy();

      testcomponent.extraComponent?.onGenerateTmpDocs();
      flush();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));
  });

  it('shall work with disabled mode', fakeAsync(() => {
    fixture.detectChanges();
    expect(testcomponent.extraComponent?.isFieldChangable).toBeTruthy();

    testcomponent.formGroup.disable();
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.extraComponent?.isFieldChangable).toBeFalsy();
  }));

  it('shall work with reference doc.', fakeAsync(() => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    testcomponent.extraComponent?.onRefDocClick(123);
    expect(routerstub.navigate).toHaveBeenCalledTimes(1);
    expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/display/123']);
  }));
});

@Component({
  template: `
  <form [formGroup]="formGroup">
    <hih-finance-account-extra-loan formControlName="extraControl"
      [tranAmount]="tranAmount"
      [controlCenterID]="controlCenterID"
      [orderID]="orderID"
      [arUIAccount]="arUIAccount"
    >
    </hih-finance-account-extra-loan>
  </form>
  `
})
export class AccountExtraLoanTestFormComponent {
  public formGroup: FormGroup;
  public tranAmount = 0;
  public controlCenterID?: number;
  public orderID?: number;
  public arUIAccount: UIAccountForSelection[] = [];

  @ViewChild(AccountExtraLoanComponent, {static: true}) extraComponent: AccountExtraLoanComponent | undefined;

  constructor() {
    this.formGroup = new FormGroup({
      extraControl: new FormControl()
    });
  }
}
