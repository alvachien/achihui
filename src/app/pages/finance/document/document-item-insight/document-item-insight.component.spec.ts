import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NzModalService } from 'ng-zorro-antd/modal';

import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { DocumentItemInsightComponent } from './document-item-insight.component';
import { SafeAny } from '@common/any';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { format, addMonths, subYears } from 'date-fns';
import { dateFormat } from '@model/index';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

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

    storageService = createSpyObj('FinanceOdataService', [
      'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'searchDocItem',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    searchDocItemSpy = storageService.searchDocItem.and.returnValue(of([]));
    authServiceStub.authSubject = signal(new UserAuthInfo());

    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [
        FormsModule,
        NzTransferModule,
        NzTooltipModule,
        ReactiveFormsModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: NZ_I18N, useValue: en_US },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentItemInsightComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // The transfer captions come from imperative translate() calls, which a
  // runtime language switch does not re-run on its own — they used to stay in
  // the previous language while the rest of the page re-translated.
  it('re-translates the group-field transfer on runtime language switch', () => {
    const transloco = TestBed.inject(TranslocoService);

    try {
      expect(component.transferTitles()).toEqual(['Available', 'Selected']);
      expect(component.listGroupFields().map((f) => f.title)).toEqual(['Date', 'Transaction Type', 'Account']);

      transloco.setActiveLang('zh');
      fixture.detectChanges();

      expect(component.transferTitles()).toEqual(['可选', '已选']);
      expect(component.listGroupFields().map((f) => f.title)).toEqual(['日期', '交易类型', '账户']);
      // The rebuild reuses the same item objects, so nz-transfer's split
      // (date starts on the right) survives the language switch.
      expect(component.listGroupFields().find((f) => f.key === 'date')?.direction).toEqual('right');
    } finally {
      transloco.setActiveLang('en'); // leave the global service as others expect it
    }
  });

  describe('work with data with empty result', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      searchDocItemSpy.and.returnValue(
        asyncData({
          totalCount: 0,
          contentList: [],
        }),
      );

      const uisrv = TestBed.inject(UIStatusService);
      uisrv.docInsightOption = {
        SelectedDataRange: [new Date(), addMonths(new Date(), 1)],
        TransactionDirection: true,
      };
    });

    it('1. shall initialize the data', async () => {
      fixture.detectChanges(); // ngOninit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(fetchAllAccountCategoriesSpy).toHaveBeenCalled();
      expect(fetchAllTranTypesSpy).toHaveBeenCalled();
      expect(fetchAllAccountsSpy).toHaveBeenCalled();
    });

    it('2. fetch data', async () => {
      fixture.detectChanges(); // ngOninit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.fetchData();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(searchDocItemSpy).toHaveBeenCalled();
    });
  });

  describe('work with data with result', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      searchDocItemSpy.and.returnValue(
        asyncData({
          totalCount: 2,
          contentList: [
            {
              DocumentID: 1,
              ItemID: 1,
              HomeID: fakeData.chosedHome.ID,
              TransactionDate: format(subYears(new Date(), 1), dateFormat),
              DocumentDesp: 'test',
              AccountID: fakeData.finAccounts[0].Id,
              TransactionType: fakeData.finTranTypes[0].Id,
              IsExpense: false,
              Currency: fakeData.chosedHome.BaseCurrency,
              OriginAmount: 1200,
              Amount: 1200,
              AmountInLocalCurrency: 1200,
              ItemDesp: 'test',
            },
            {
              DocumentID: 2,
              ItemID: 1,
              HomeID: fakeData.chosedHome.ID,
              TransactionDate: format(subYears(new Date(), 1), dateFormat),
              DocumentDesp: 'test',
              AccountID: fakeData.finAccounts[0].Id,
              TransactionType: fakeData.finTranTypes[0].Id,
              IsExpense: false,
              Currency: fakeData.chosedHome.BaseCurrency,
              OriginAmount: 1200,
              Amount: 1200,
              AmountInLocalCurrency: 1200,
              ItemDesp: 'test',
            },
          ],
        }),
      );

      const uisrv = TestBed.inject(UIStatusService);
      uisrv.docInsightOption = {
        SelectedDataRange: [new Date(), addMonths(new Date(), 1)],
        TransactionDirection: true,
      };
    });

    it('1. shall initialize the data', async () => {
      fixture.detectChanges(); // ngOninit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(fetchAllAccountCategoriesSpy).toHaveBeenCalled();
      expect(fetchAllTranTypesSpy).toHaveBeenCalled();
      expect(fetchAllAccountsSpy).toHaveBeenCalled();
    });

    it('2. fetch data', async () => {
      fixture.detectChanges(); // ngOninit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.fetchData();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(searchDocItemSpy).toHaveBeenCalled();
    });
  });
});
