import { async, ComponentFixture, TestBed, inject, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NgZorroAntdModule, NZ_I18N, en_US, } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import { ViewChild, Component } from '@angular/core';
import * as moment from 'moment';

import { AccountExtraDownpaymentComponent } from './account-extra-downpayment.component';
import { getTranslocoModule, FakeDataHelper, FormGroupHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService, } from '../../../../services';
import { UserAuthInfo, TranType, AccountExtraAdvancePayment, RepeatFrequencyEnum, RepeatedDatesWithAmountAPIOutput } from '../../../../model';

describe('AccountExtraDownpaymentComponent', () => {
  let testcomponent: FinanceAccountExtraDPTestFormComponent;
  let fixture: ComponentFixture<FinanceAccountExtraDPTestFormComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let homeService: Partial<HomeDefOdataService>;
  let calcADPTmpDocsSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'calcADPTmpDocs',
    ]);
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    uiServiceStub.getUILabel = (le: any) => '';
  });

  beforeEach(async(() => {
    calcADPTmpDocsSpy = storageService.calcADPTmpDocs.and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        AccountExtraDownpaymentComponent,
        FinanceAccountExtraDPTestFormComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: NZ_I18N, useValue: en_US },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceAccountExtraDPTestFormComponent);
    testcomponent = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(testcomponent).toBeTruthy();
  });

  it('shall work with data 1: init status', fakeAsync(() => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.dirty).toBeFalse();
    expect(testcomponent.formGroup.valid).toBeFalse();

    flush();
  }));

  it('shall work with data 2: input start date', fakeAsync(() => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = moment().add(1, 'M');
    dp1.StartDate = startdt;
    testcomponent.formGroup.get('extraControl').setValue(dp1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.valid).toBeFalse();
    expect(testcomponent.extraComponent.canCalcTmpDocs).toBeFalse();

    const dpval2 = testcomponent.formGroup.get('extraControl').value as AccountExtraAdvancePayment;
    expect(dpval2.StartDate).toBeTruthy();
    expect(dpval2.StartDate.isSame(startdt)).toBeTruthy();
    expect(dpval2.RepeatType).toBeFalsy();
    expect(dpval2.Comment).toBeFalsy();
    expect(dpval2.RefDocId).toBeFalsy();

    flush();
  }));

  it('shall work with data 3: input start date, repeat type', fakeAsync(() => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = moment().add(1, 'M');
    dp1.StartDate = startdt;
    dp1.RepeatType = RepeatFrequencyEnum.Month;
    testcomponent.formGroup.get('extraControl').setValue(dp1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.extraComponent.canCalcTmpDocs).toBeFalsy();
    expect(testcomponent.formGroup.get('extraControl').valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBeFalse();

    const dpval2 = testcomponent.formGroup.get('extraControl').value as AccountExtraAdvancePayment;
    expect(dpval2.StartDate).toBeTruthy();
    expect(dpval2.StartDate.isSame(startdt)).toBeTruthy();
    expect(dpval2.RepeatType).toEqual(dp1.RepeatType);
    expect(dpval2.Comment).toBeFalsy();
    expect(dpval2.RefDocId).toBeFalsy();

    flush();
  }));

  it('shall work with data 4: input start date, repeat type, comment', fakeAsync(() => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = moment().add(1, 'M');
    dp1.StartDate = startdt;
    dp1.RepeatType = RepeatFrequencyEnum.Month;
    dp1.Comment = 'test';
    testcomponent.formGroup.get('extraControl').setValue(dp1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.extraComponent.canCalcTmpDocs).toBeTruthy();
    expect(testcomponent.formGroup.get('extraControl').valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBeFalse();

    const dpval2 = testcomponent.formGroup.get('extraControl').value as AccountExtraAdvancePayment;
    expect(dpval2.StartDate).toBeTruthy();
    expect(dpval2.StartDate.isSame(startdt)).toBeTruthy();
    expect(dpval2.RepeatType).toEqual(dp1.RepeatType);
    expect(dpval2.Comment).toEqual(dp1.Comment);
    expect(dpval2.RefDocId).toBeFalsy();

    flush();
  }));

  it('shall work with data 4a: input start date, repeat type, comment but without tranamount', fakeAsync(() => {
    testcomponent.tranAmount = undefined;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = moment().add(1, 'M');
    dp1.StartDate = startdt;
    dp1.RepeatType = RepeatFrequencyEnum.Month;
    dp1.Comment = 'test';
    testcomponent.formGroup.get('extraControl').setValue(dp1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.extraComponent.canCalcTmpDocs).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBeFalse();

    flush();
  }));

  it('shall work with data 5: input start date, repeat type, comment, calcTmpDocs (no return)', fakeAsync(() => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = moment().add(1, 'M');
    dp1.StartDate = startdt;
    dp1.RepeatType = RepeatFrequencyEnum.Month;
    dp1.Comment = 'test';
    testcomponent.formGroup.get('extraControl').setValue(dp1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.extraComponent.canCalcTmpDocs).toBeTruthy();
    expect(testcomponent.formGroup.get('extraControl').valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBeFalse();

    testcomponent.extraComponent.onGenerateTmpDocs();
    expect(testcomponent.formGroup.valid).toBeFalse();

    flush();
  }));

  it('shall work with data 6: input start date, repeat type, comment, calcTmpDocs (with return)', fakeAsync(() => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;
    let aroutput: RepeatedDatesWithAmountAPIOutput[] = [];
    aroutput.push({
      TranDate: moment(),
      TranAmount: 10,
      Desp: '1'    
    } as RepeatedDatesWithAmountAPIOutput);
    aroutput.push({
      TranDate: moment().add(1, 'M'),
      TranAmount: 10,
      Desp: '2'
    } as RepeatedDatesWithAmountAPIOutput);
    calcADPTmpDocsSpy = storageService.calcADPTmpDocs.and.returnValue(asyncData(aroutput));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    const startdt = moment().add(1, 'M');
    dp1.StartDate = startdt;
    dp1.RepeatType = RepeatFrequencyEnum.Month;
    dp1.Comment = 'test';
    testcomponent.formGroup.get('extraControl').setValue(dp1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.extraComponent.canCalcTmpDocs).toBeTruthy();
    expect(testcomponent.formGroup.get('extraControl').valid).toBeFalsy();
    expect(testcomponent.formGroup.valid).toBeFalse();

    testcomponent.extraComponent.onGenerateTmpDocs();
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.get('extraControl').valid).toBeTruthy();
    expect(testcomponent.formGroup.valid).toBeTruthy();

    flush();
  }));

  it('shall work with disabled mode', fakeAsync(() => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    fixture.detectChanges();
    expect(testcomponent.extraComponent.isFieldChangable).toBeTruthy();

    testcomponent.formGroup.disable();
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.extraComponent.isFieldChangable).toBeFalsy();
  }));

  it('shall work with reference doc.', fakeAsync(() => {
    testcomponent.tranAmount = 100;
    testcomponent.arTranTypes = fakeData.finTranTypes;

    const routerstub = TestBed.get(Router);
    spyOn(routerstub, 'navigate');

    testcomponent.extraComponent.onRefDocClick(123);
    expect(routerstub.navigate).toHaveBeenCalledTimes(1);
    expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/display/123']);
  }));

  describe('calcTmpDocs return exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      calcADPTmpDocsSpy = storageService.calcADPTmpDocs.and.returnValue(asyncError<string>('Service failed'));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall display error dialog', fakeAsync(() => {
      testcomponent.tranAmount = 100;
      testcomponent.arTranTypes = fakeData.finTranTypes;
  
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
  
      const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      const startdt = moment().add(1, 'M');
      dp1.StartDate = startdt;
      dp1.RepeatType = RepeatFrequencyEnum.Month;
      dp1.Comment = 'test';
      testcomponent.formGroup.get('extraControl').setValue(dp1);
      flush();
      tick();
      fixture.detectChanges();
  
      expect(testcomponent.extraComponent.canCalcTmpDocs).toBeTruthy();
      expect(testcomponent.formGroup.get('extraControl').valid).toBeFalsy();
      expect(testcomponent.formGroup.valid).toBeFalse();
  
      testcomponent.extraComponent.onGenerateTmpDocs();
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
});

@Component({
  template: `
  <form [formGroup]="formGroup">
    <hih-finance-account-extra-downpayment formControlName="extraControl"
      [tranAmount]="tranAmount"
      [tranType]="tranType"
      [allTranTypes]="arTranTypes"
    >
    </hih-finance-account-extra-downpayment>
  </form>
  `
})
export class FinanceAccountExtraDPTestFormComponent {
  public formGroup: FormGroup;
  public tranAmount = 0;
  public arTranTypes: TranType[] = [];
  public tranType = 100;

  @ViewChild(AccountExtraDownpaymentComponent, {static: true}) extraComponent: AccountExtraDownpaymentComponent;

  constructor() {
    this.formGroup = new FormGroup({
      extraControl: new FormControl()
    });
  }
}
