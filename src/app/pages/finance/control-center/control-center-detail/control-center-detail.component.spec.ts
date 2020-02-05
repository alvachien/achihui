import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, UrlSegment, ActivatedRoute } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { ControlCenterDetailComponent } from './control-center-detail.component';
import { getTranslocoModule, ActivatedRouteUrlStub, FakeDataHelper } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('ControlCenterDetailComponent', () => {
  let component: ControlCenterDetailComponent;
  let fixture: ComponentFixture<ControlCenterDetailComponent>;
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();
    fakeData.buildFinAccountExtraAdvancePayment();
    fakeData.buildFinADPDocumentForCreate();
  });

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    uiServiceStub.getUILabel = (le: any) => '';
    const activatedRouteStub: any = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);
    // const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const homeService: Partial<HomeDefOdataService> = {};
    homeService.ChosedHome = fakeData.chosedHome;

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        getTranslocoModule(),
        RouterTestingModule,
      ],
      declarations: [ ControlCenterDetailComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HomeDefOdataService, useValue: homeService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
