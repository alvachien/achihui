import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NzModalService } from 'ng-zorro-antd/modal';

import { FinanceUIModule } from '../../finance-ui.module';
import { getTranslocoModule, FakeDataHelper, asyncData } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, momentDateFormat } from '../../../../model';
import { DocumentItemInsightComponent } from './document-item-insight.component';
import { SafeAny } from '@common/any';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import moment from 'moment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DocumentItemInsightComponent', () => {
  let component: DocumentItemInsightComponent;
  let fixture: ComponentFixture<DocumentItemInsightComponent>;

  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let searchDocItemSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

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
      'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'searchDocItem',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    searchDocItemSpy = storageService.searchDocItem.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());

    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [DocumentItemInsightComponent],
    imports: [FormsModule,
        FinanceUIModule,
        NzTransferModule,
        NzToolTipModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule()],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: NZ_I18N, useValue: en_US },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(DocumentItemInsightComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('work with data with empty result', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      searchDocItemSpy.and.returnValue(asyncData({
        totalCount: 0,
        contentList: []
      }));

      let uisrv = TestBed.inject(UIStatusService);
      uisrv.docInsightOption = {
        SelectedDataRange: [moment(), moment().add(1, 'M')],
        TransactionDirection: true
      };
    });

    it('1. shall initialize the data', fakeAsync(() => {
      fixture.detectChanges(); // ngOninit
      tick();
      fixture.detectChanges();

      expect(fetchAllAccountCategoriesSpy).toHaveBeenCalled();
      expect(fetchAllTranTypesSpy).toHaveBeenCalled();
      expect(fetchAllAccountsSpy).toHaveBeenCalled();
    }));

    it('2. fetch data', fakeAsync(() => {
      fixture.detectChanges(); // ngOninit
      tick();
      fixture.detectChanges();

      component.fetchData();
      tick();
      fixture.detectChanges();
      expect(searchDocItemSpy).toHaveBeenCalled();
    }));
  });

  describe('work with data with result', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      searchDocItemSpy.and.returnValue(asyncData({
        totalCount: 2,
        contentList: [{
          DocumentID: 1,
          ItemID: 1,
          HomeID: fakeData.chosedHome.ID,
          TransactionDate: moment().subtract(1, 'y').format(momentDateFormat),
          DocumentDesp: 'test',
          AccountID: fakeData.finAccounts[0].Id,
          TransactionType: fakeData.finTranTypes[0].Id,
          IsExpense: false,
          Currency: fakeData.chosedHome.BaseCurrency,
          OriginAmount: 1200,
          Amount: 1200,
          AmountInLocalCurrency: 1200,
          ItemDesp: 'test',
        }, {
          DocumentID: 2,
          ItemID: 1,
          HomeID: fakeData.chosedHome.ID,
          TransactionDate: moment().subtract(1, 'y').format(momentDateFormat),
          DocumentDesp: 'test',
          AccountID: fakeData.finAccounts[0].Id,
          TransactionType: fakeData.finTranTypes[0].Id,
          IsExpense: false,
          Currency: fakeData.chosedHome.BaseCurrency,
          OriginAmount: 1200,
          Amount: 1200,
          AmountInLocalCurrency: 1200,
          ItemDesp: 'test',
        }]
      }));

      let uisrv = TestBed.inject(UIStatusService);
      uisrv.docInsightOption = {
        SelectedDataRange: [moment(), moment().add(1, 'M')],
        TransactionDirection: true
      };
    });

    it('1. shall initialize the data', fakeAsync(() => {
      fixture.detectChanges(); // ngOninit
      tick();
      fixture.detectChanges();

      expect(fetchAllAccountCategoriesSpy).toHaveBeenCalled();
      expect(fetchAllTranTypesSpy).toHaveBeenCalled();
      expect(fetchAllAccountsSpy).toHaveBeenCalled();
    }));

    it('2. fetch data', fakeAsync(() => {
      fixture.detectChanges(); // ngOninit
      tick();
      fixture.detectChanges();

      component.fetchData();
      tick();
      fixture.detectChanges();
      expect(searchDocItemSpy).toHaveBeenCalled();
    }));
  });
});
