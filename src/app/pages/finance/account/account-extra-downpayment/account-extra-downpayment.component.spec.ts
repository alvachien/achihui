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
import { getTranslocoModule, FakeDataHelper, FormGroupHelper } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService, } from '../../../../services';
import { UserAuthInfo, TranType, AccountExtraAdvancePayment } from '../../../../model';

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
    calcADPTmpDocsSpy = storageService.calcADPTmpDocs.and.returnValue(of([]));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    uiServiceStub.getUILabel = (le: any) => '';
  });

  beforeEach(async(() => {
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

    let dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    let startdt = moment().add(1, 'M');
    dp1.StartDate = startdt;
    testcomponent.formGroup.get('extraControl').setValue(dp1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.valid).toBeFalse();

    let dpval2 = testcomponent.formGroup.get('extraControl').value as AccountExtraAdvancePayment;
    expect(dpval2.StartDate).toBeTruthy();
    expect(dpval2.StartDate.isSame(startdt)).toBeTruthy();
    expect(dpval2.RepeatType).toBeFalsy();
    expect(dpval2.Comment).toBeFalsy();
    expect(dpval2.RefDocId).toBeFalsy();
  }));
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
  public tranAmount: number = 0;
  public arTranTypes: TranType[] = [];
  public tranType: number = 100;

  @ViewChild(AccountExtraDownpaymentComponent, {static: true}) extraComponent: AccountExtraDownpaymentComponent;
  
  constructor() {
    this.formGroup = new FormGroup({
      extraControl: new FormControl()
    });
  }
}
