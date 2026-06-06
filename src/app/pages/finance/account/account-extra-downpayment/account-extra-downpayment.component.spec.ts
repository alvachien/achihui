import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import { ViewChild, Component } from '@angular/core';
import { addMonths } from 'date-fns';
import { NzModalService } from 'ng-zorro-antd/modal';

import { AccountExtraDownpaymentComponent } from './account-extra-downpayment.component';
import {createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError} from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import {
  UserAuthInfo,
  TranType,
  AccountExtraAdvancePayment,
  RepeatFrequencyEnum,
  RepeatedDatesWithAmountAPIOutput,
} from '../../../../model';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AccountExtraDownpaymentComponent', () => {
  let testcomponent: FinanceAccountExtraDPTestFormComponent;
  let fixture: ComponentFixture<FinanceAccountExtraDPTestFormComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let homeService: Partial<HomeDefOdataService>;
  let calcADPTmpDocsSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    storageService = createSpyObj('FinanceOdataService', ['calcADPTmpDocs']);
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    calcADPTmpDocsSpy = storageService.calcADPTmpDocs.and.returnValue(of([]));
    TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [FormsModule,
        
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        RouterTestingModule,
        getTranslocoModule()],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceAccountExtraDPTestFormComponent);
    testcomponent = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(testcomponent).toBeTruthy();

    const btest = false;
    if (btest) {
      expect(calcADPTmpDocsSpy).toHaveBeenCalled();
    }
  });

  it('shall work with data 1: init status', async () => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.formGroup.dirty).toBe(false);
    expect(testcomponent.formGroup.valid).toBe(false);

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it('shall work with data 2: input start date', async () => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = addMonths(new Date(), 1);
    dp1.StartDate = startdt;
    testcomponent.formGroup.get('extraControl')?.setValue(dp1);
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.formGroup.valid).toBe(false);
    expect(testcomponent.extraComponent?.canCalcTmpDocs).toBe(false);

    const dpval2 = testcomponent.formGroup.get('extraControl')?.value as AccountExtraAdvancePayment;
    expect(dpval2.StartDate).toBeTruthy();
    expect(dpval2.StartDate.getTime()).toEqual(startdt.getTime());
    expect(dpval2.RepeatType).toBeFalsy();
    expect(dpval2.Comment).toBeFalsy();
    expect(dpval2.RefDocId).toBeFalsy();

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it('shall work with data 3: input start date, repeat type', async () => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = addMonths(new Date(), 1);
    dp1.StartDate = startdt;
    dp1.RepeatType = RepeatFrequencyEnum.Month;
    testcomponent.formGroup.get('extraControl')?.setValue(dp1);
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.extraComponent?.canCalcTmpDocs).toBeFalsy();
    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBe(false);

    const dpval2 = testcomponent.formGroup.get('extraControl')?.value as AccountExtraAdvancePayment;
    expect(dpval2.StartDate).toBeTruthy();
    expect(dpval2.StartDate.getTime()).toEqual(startdt.getTime());
    expect(dpval2.RepeatType).toEqual(dp1.RepeatType);
    expect(dpval2.Comment).toBeFalsy();
    expect(dpval2.RefDocId).toBeFalsy();

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it('shall work with data 4: input start date, repeat type, comment', async () => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = addMonths(new Date(), 1);
    dp1.StartDate = startdt;
    dp1.RepeatType = RepeatFrequencyEnum.Month;
    dp1.Comment = 'test';
    testcomponent.formGroup.get('extraControl')?.setValue(dp1);
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.extraComponent?.canCalcTmpDocs).toBeTruthy();
    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBe(false);

    const dpval2 = testcomponent.formGroup.get('extraControl')?.value as AccountExtraAdvancePayment;
    expect(dpval2.StartDate).toBeTruthy();
    expect(dpval2.StartDate.getTime()).toEqual(startdt.getTime());
    expect(dpval2.RepeatType).toEqual(dp1.RepeatType);
    expect(dpval2.Comment).toEqual(dp1.Comment);
    expect(dpval2.RefDocId).toBeFalsy();

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it('shall work with data 4a: input start date, repeat type, comment but without tranamount', async () => {
    testcomponent.tranAmount = 0;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = addMonths(new Date(), 1);
    dp1.StartDate = startdt;
    dp1.RepeatType = RepeatFrequencyEnum.Month;
    dp1.Comment = 'test';
    testcomponent.formGroup.get('extraControl')?.setValue(dp1);
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.extraComponent?.canCalcTmpDocs).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBe(false);

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it('shall work with data 5: input start date, repeat type, comment, calcTmpDocs (no return)', async () => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = addMonths(new Date(), 1);
    dp1.StartDate = startdt;
    dp1.RepeatType = RepeatFrequencyEnum.Month;
    dp1.Comment = 'test';
    testcomponent.formGroup.get('extraControl')?.setValue(dp1);
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.extraComponent?.canCalcTmpDocs).toBeTruthy();
    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBe(false);

    testcomponent.extraComponent?.onGenerateTmpDocs();
    expect(testcomponent.formGroup.valid).toBe(false);

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it('shall work with data 6: input start date, repeat type, comment, calcTmpDocs (with return)', async () => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;
    const aroutput: RepeatedDatesWithAmountAPIOutput[] = [];
    aroutput.push({
      TranDate: new Date(),
      TranAmount: 10,
      Desp: '1',
    } as RepeatedDatesWithAmountAPIOutput);
    aroutput.push({
      TranDate: addMonths(new Date(), 1),
      TranAmount: 10,
      Desp: '2',
    } as RepeatedDatesWithAmountAPIOutput);
    calcADPTmpDocsSpy = storageService.calcADPTmpDocs.and.returnValue(asyncData(aroutput));

    fixture.detectChanges();
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = addMonths(new Date(), 1);
    dp1.StartDate = startdt;
    dp1.RepeatType = RepeatFrequencyEnum.Month;
    dp1.Comment = 'test';
    testcomponent.formGroup.get('extraControl')?.setValue(dp1);
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.extraComponent?.canCalcTmpDocs).toBeTruthy();
    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBe(false);

    testcomponent.extraComponent?.onGenerateTmpDocs();
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl')?.valid).toBeTruthy();
    expect(testcomponent.formGroup.valid).toBeTruthy();

    await new Promise<void>(r => setTimeout(r, 0));
  });

  it('shall work with disabled mode', async () => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    expect(testcomponent.extraComponent?.isFieldChangable).toBeTruthy();

    testcomponent.formGroup.disable();
    await new Promise<void>(r => setTimeout(r, 0));
    await new Promise<void>(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(testcomponent.extraComponent?.isFieldChangable).toBeFalsy();
  });

  it('shall work with reference doc.', async () => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    const routerstub = TestBed.inject(Router);
    vi.spyOn(routerstub, 'navigate');

    testcomponent.extraComponent?.onRefDocClick(123);
    expect(routerstub.navigate).toHaveBeenCalledTimes(1);
    expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/display/123']);
  });

  describe('calcTmpDocs return exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      calcADPTmpDocsSpy = storageService.calcADPTmpDocs.and.returnValue(asyncError<string>('Service failed'));
    });

    beforeEach(() => {
    const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
  });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall display error dialog', async () => {
      testcomponent.tranAmount = 100;
      testcomponent.arTranTypes = fakeData.finTranTypes;

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      const startdt = addMonths(new Date(), 1);
      dp1.StartDate = startdt;
      dp1.RepeatType = RepeatFrequencyEnum.Month;
      dp1.Comment = 'test';
      testcomponent.formGroup.get('extraControl')?.setValue(dp1);
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(testcomponent.extraComponent?.canCalcTmpDocs).toBeTruthy();
      expect(testcomponent.formGroup.get('extraControl')?.valid).toBeFalsy();
      expect(testcomponent.formGroup.valid).toBe(false);

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
});

@Component({
    template: `
    <form [formGroup]="formGroup">
      <hih-finance-account-extra-downpayment
        formControlName="extraControl"
        [tranAmount]="tranAmount"
        [tranType]="tranType"
        [allTranTypes]="arTranTypes"
      >
      </hih-finance-account-extra-downpayment>
    </form>
  `,
    imports: [
      FormsModule,
      ReactiveFormsModule,
      AccountExtraDownpaymentComponent,
    ]
})
export class FinanceAccountExtraDPTestFormComponent {
  public formGroup: UntypedFormGroup;
  public tranAmount = 0;
  public arTranTypes: TranType[] = [];
  public tranType = 100;

  @ViewChild(AccountExtraDownpaymentComponent, { static: true })
  extraComponent: AccountExtraDownpaymentComponent | undefined;

  constructor() {
    this.formGroup = new UntypedFormGroup({
      extraControl: new UntypedFormControl(),
    });
  }
}
