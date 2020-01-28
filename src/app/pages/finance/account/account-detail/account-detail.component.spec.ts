import { async, ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';

import { AccountDetailComponent } from './account-detail.component';
import { getTranslocoModule, FakeDataHelper, FormGroupHelper, ActivatedRouteUrlStub } from '../../../../../testing';
import { AccountExtraAssetComponent } from '../account-extra-asset';
import { AccountExtraDownpaymentComponent } from '../account-extra-downpayment';
import { AccountExtraLoanComponent } from '../account-extra-loan';
import { AuthService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('AccountDetailComponent', () => {
  let component: AccountDetailComponent;
  let fixture: ComponentFixture<AccountDetailComponent>;

  beforeEach(async(() => {
    const activatedRouteStub: any = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());

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
        AccountDetailComponent,
        AccountExtraAssetComponent,
        AccountExtraDownpaymentComponent,
        AccountExtraLoanComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
