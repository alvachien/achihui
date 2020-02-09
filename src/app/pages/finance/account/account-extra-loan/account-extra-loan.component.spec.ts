import { async, ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { ViewChild, Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';

import { AccountExtraLoanComponent } from './account-extra-loan.component';
import { getTranslocoModule, ActivatedRouteUrlStub } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, } from '../../../../services';
import { UserAuthInfo, UIAccountForSelection } from '../../../../model';

describe('AccountExtraLoanComponent', () => {
  let testcomponent: AccountExtraLoanTestFormComponent;
  let fixture: ComponentFixture<AccountExtraLoanTestFormComponent>;

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    uiServiceStub.getUILabel = (le: any) => '';
    const storageService: any = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'createADPDocument',
      'fetchAllCurrencies',
    ]);

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
        { provide: FinanceOdataService, useValue: storageService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtraLoanTestFormComponent);
    testcomponent = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(testcomponent).toBeTruthy();
  });
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
  public tranAmount: number = 0;
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
