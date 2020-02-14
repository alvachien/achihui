import { async, ComponentFixture, TestBed, inject, fakeAsync, tick, flush } from '@angular/core/testing';
import { ViewChild, Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NgZorroAntdModule, NZ_I18N, en_US, } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import * as moment from 'moment';

import { AccountExtraLoanComponent } from './account-extra-loan.component';
import { getTranslocoModule, ActivatedRouteUrlStub, FakeDataHelper } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService, } from '../../../../services';
import { UserAuthInfo, UIAccountForSelection, BuildupAccountForSelection, AccountExtraLoan } from '../../../../model';

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
    uiServiceStub.getUILabel = (le: any) => '';
    arUIAccounts = BuildupAccountForSelection(fakeData.finAccounts, fakeData.finAccountCategories);
  });

  beforeEach(async(() => {
    calcLoanTmpDocsSpy = storageService.calcLoanTmpDocs.and.returnValue(of([]));
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
        AccountExtraLoanComponent,
        AccountExtraLoanTestFormComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: NZ_I18N, useValue: en_US },
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
    testcomponent.formGroup.get('extraControl').setValue(loan1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.formGroup.valid).toBeFalse();

    const loanval2 = testcomponent.formGroup.get('extraControl').value as AccountExtraLoan;
    expect(loanval2.startDate).toBeTruthy();
    expect(loanval2.startDate.isSame(startdt)).toBeTruthy();
    expect(testcomponent.extraComponent.listTmpDocs.length).toEqual(0);

    flush();
  }));

  it('shall work with disabled mode', fakeAsync(() => {
    fixture.detectChanges();
    expect(testcomponent.extraComponent.isFieldChangable).toBeTruthy();

    testcomponent.formGroup.disable();
    flush();
    tick();
    fixture.detectChanges();

    expect(testcomponent.extraComponent.isFieldChangable).toBeFalsy();
  }));

  it('shall work with reference doc.', fakeAsync(() => {
    const routerstub = TestBed.get(Router);
    spyOn(routerstub, 'navigate');

    testcomponent.extraComponent.onRefDocClick(123);
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

  @ViewChild(AccountExtraLoanComponent, {static: true}) extraComponent: AccountExtraLoanComponent;

  constructor() {
    this.formGroup = new FormGroup({
      extraControl: new FormControl()
    });
  }
}
