import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NzModalService } from 'ng-zorro-antd/modal';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import { createSpyObj, getTranslocoModule, FakeDataHelper } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { StatementOfIncomeExpenseComponent } from './statement-of-income-expense.component';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('StatementOfIncomeExpenseComponent', () => {
  let component: StatementOfIncomeExpenseComponent;
  let fixture: ComponentFixture<StatementOfIncomeExpenseComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchCashReportMoMSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  const homeServiceStub: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    homeServiceStub.ChosedHome = fakeData.chosedHome;

    storageService = createSpyObj('FinanceOdataService', ['fetchCashReportMoM']);
    fetchCashReportMoMSpy = storageService.fetchCashReportMoM.and.returnValue(of([]));
    authServiceStub.authSubject = signal(new UserAuthInfo());
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [NgxEchartsModule.forRoot({ echarts }), RouterTestingModule, getTranslocoModule()],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        NzModalService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementOfIncomeExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    const btest = false;
    if (btest) {
      expect(fetchCashReportMoMSpy).toHaveBeenCalled();
    }
  });
});
