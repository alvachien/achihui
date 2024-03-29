import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzElementPatchModule } from 'ng-zorro-antd/core/element-patch';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UserAuthInfo } from 'src/app/model';
import { AuthService, FinanceOdataService, HomeDefOdataService, UIStatusService } from 'src/app/services';

import { FakeDataHelper, asyncData, getTranslocoModule } from 'src/testing';
import { ReconcileByMonthComponent } from './reconcile-by-month.component';
import { SafeAny } from 'src/common';
import { of } from 'rxjs';

describe('ReconcileByMonthComponent', () => {
  let component: ReconcileByMonthComponent;
  let fixture: ComponentFixture<ReconcileByMonthComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());

    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };
  });

  beforeEach(async () => {
    const odataService = jasmine.createSpyObj('FinanceOdataService', ['fetchAllAccountCategories', 'fetchAllAccounts']);
    fetchAllAccountCategoriesSpy = odataService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = odataService.fetchAllAccounts.and.returnValue(of([]));

    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        NzStepsModule,
        NzSwitchModule,
        NzSelectModule,
        NzButtonModule,
        NzPageHeaderModule,
        NzBreadCrumbModule,
        NzInputModule,
        NzInputNumberModule,
        NzTableModule,
        NzModalModule,
        NzToolTipModule,
        NzIconModule,
        NzDividerModule,
        NzFormModule,
        NzElementPatchModule,
        NzDatePickerModule,
        getTranslocoModule(),
      ],
      declarations: [ReconcileByMonthComponent],
      providers: [
        UIStatusService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: odataService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReconcileByMonthComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('work with data', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
    });

    it('1. shall initialize the data', fakeAsync(() => {
      fixture.detectChanges(); // ngOninit
      tick();
      fixture.detectChanges();

      expect(component.arAccounts.length).toEqual(fakeData.finAccounts.length);
    }));
  });
});
