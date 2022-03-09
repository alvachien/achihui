import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, inject, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of, } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import { FinanceUIModule } from '../../finance-ui.module';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError,
  ElementClass_DialogContent, ElementClass_DialogCloseButton } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService, } from '../../../../services';
import { UserAuthInfo, FinanceReportByOrder, Order, FinanceReportEntryByTransactionType, } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { ControlCenterMonthOnMonthReportComponent } from './control-center-month-on-month-report.component';

describe('ControlCenterMonthOnMonthReportComponent', () => {
  let component: ControlCenterMonthOnMonthReportComponent;
  let fixture: ComponentFixture<ControlCenterMonthOnMonthReportComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchReportByTransactionTypeSpy: any;
  let fetchAllTranTypesSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  const homeServiceStub: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();
    homeServiceStub.ChosedHome = fakeData.chosedHome;

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchReportByTransactionType',
      'fetchAllTranTypes'
    ]);
    fetchReportByTransactionTypeSpy = storageService.fetchReportByTransactionType.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgxEchartsModule.forRoot({ echarts }),
        FinanceUIModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [ ControlCenterMonthOnMonthReportComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        NzModalService,
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterMonthOnMonthReportComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
