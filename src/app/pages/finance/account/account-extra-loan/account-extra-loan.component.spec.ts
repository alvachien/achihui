import { async, ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

import { AccountExtraLoanComponent } from './account-extra-loan.component';
import { getTranslocoModule, ActivatedRouteUrlStub } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('AccountExtraLoanComponent', () => {
  let component: AccountExtraLoanComponent;
  let fixture: ComponentFixture<AccountExtraLoanComponent>;

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
        NgZorroAntdModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        AccountExtraLoanComponent,
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
    fixture = TestBed.createComponent(AccountExtraLoanComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
