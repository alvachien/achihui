import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import { FinanceUIModule } from '../../finance-ui.module';
import { getTranslocoModule, FakeDataHelper } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { StatementOfIncomeExpenseComponent } from './statement-of-income-expense.component';
import { SafeAny } from 'src/common';

xdescribe('StatementOfIncomeExpenseComponent', () => {
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

    storageService = jasmine.createSpyObj('FinanceOdataService', ['fetchCashReportMoM']);
    fetchCashReportMoMSpy = storageService.fetchCashReportMoM.and.returnValue(of([]));
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
      declarations: [StatementOfIncomeExpenseComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        NzModalService,
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
