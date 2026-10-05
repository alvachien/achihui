import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { TranslocoService } from '@jsverse/transloco';
import { of, Subject } from 'rxjs';
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
import { dateFormat, financeTranTypeTransferIn } from '@model/index';
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

    // The KPI/compute pipeline runs on empty pages too: aggregates are 0,
    // and neither chart is built without rows.
    it('3. keeps the aggregates empty', async () => {
      fixture.detectChanges(); // ngOninit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.incomeAmount()).toBe(0);
      expect(component.outgoAmount()).toBe(0);
      expect(component.netAmount()).toBe(0);
      expect(component.processedCount()).toBe(0);
      expect(component.chartTrendOption()).toBeNull();
      expect(component.chartCompositionOption()).toBeNull();
    });
  });

  describe('work with data with result', () => {
    beforeEach(() => {
      // The spy object is built once in beforeAll; the new KPI/tag tests need
      // a clean call tally per test.
      searchDocItemSpy.mockReset();
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

    it('3. builds the KPI aggregates and the trend chart', async () => {
      fixture.detectChanges(); // ngOninit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // The two mock rows share date/account/type and are income, so the
      // single aggregated row is 1200 + 1200.
      expect(component.incomeAmount()).toBe(2400);
      expect(component.outgoAmount()).toBe(0);
      expect(component.netAmount()).toBe(2400);
      expect(component.processedCount()).toBe(2);
      // Date is grouped (transfer default) -> trend chart; no breakdown
      // dimension selected -> no composition chart.
      expect(component.chartTrendOption()).not.toBeNull();
      expect(component.chartCompositionOption()).toBeNull();
    });

    it('4. closing a criteria tag drops the criterion and re-queries', async () => {
      fixture.detectChanges(); // ngOninit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));

      // date-range tag + income-only tag
      expect(fixture.nativeElement.querySelectorAll('nz-tag').length).toBe(2);
      // ngOnInit's metadata load produced exactly one query.
      expect(searchDocItemSpy).toHaveBeenCalledTimes(1);

      component.onRemoveDirection();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.insightOption()?.TransactionDirection).toBeUndefined();
      expect(searchDocItemSpy).toHaveBeenCalledTimes(2);
      // Only the fixed date-range tag survives the close.
      expect(fixture.nativeElement.querySelectorAll('nz-tag').length).toBe(1);
    });

    it('5. rolls a composition chart in when a breakdown dimension is grouped', async () => {
      fixture.detectChanges(); // ngOninit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.listGroupFields.update((items) => {
        items.forEach((item) => {
          if (item.key === 'trantype') {
            item.direction = 'right';
          }
        });
        return [...items];
      });
      fixture.detectChanges();

      const opt = component.chartCompositionOption();
      expect(opt).not.toBeNull();
    });

    // The closeable criteria tags render synchronously in ngOnInit while the
    // initial load is still in flight, so a user can trigger a second, broader
    // query before the first (narrower) one resolves. Whichever resolves LAST
    // must not win — only the newest fetch owns the UI state. Regression guard
    // for the re-entrant fetchData race: without the generation token the stale
    // first response overwrites listData and the KPIs show income-only totals.
    it('6. ignores a stale earlier response that lands after a newer fetch', async () => {
      // Replace the auto-resolving searchDocItem with manually-driven subjects
      // so the two in-flight queries can be resolved in an arbitrary order.
      const pending: Subject<SafeAny>[] = [];
      searchDocItemSpy.mockReset();
      searchDocItemSpy.and.callFake(() => {
        const s = new Subject<SafeAny>();
        pending.push(s);
        return s.asObservable();
      });

      // Mirrors the production shape from V_FIN_DOCUMENT_ITEM: expense rows
      // carry a NEGATIVE Amount (OriginAmount stays as booked).
      const row = (isExpense: boolean, amount: number): SafeAny => ({
        DocumentID: amount,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: format(subYears(new Date(), 1), dateFormat),
        DocumentDesp: 'test',
        AccountID: fakeData.finAccounts[0].Id,
        TransactionType: fakeData.finTranTypes[0].Id,
        IsExpense: isExpense,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: amount,
        Amount: isExpense ? -amount : amount,
        AmountInLocalCurrency: isExpense ? -amount : amount,
        ItemDesp: 'test',
      });

      fixture.detectChanges(); // ngOnInit -> forkJoin(metadata)
      await new Promise<void>((r) => setTimeout(r, 0)); // metadata resolves -> fetchData #1
      fixture.detectChanges();
      expect(pending.length).toBe(1); // initial (direction=true) query is in flight

      // Close the direction tag BEFORE #1 resolves -> fetchData #2 (broader).
      component.onRemoveDirection();
      expect(pending.length).toBe(2);

      // Newer query (#2) resolves first with an expense row.
      pending[1].next({ totalCount: 1, contentList: [row(true, 500)] });
      pending[1].complete();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.outgoAmount()).toBe(500);
      expect(component.incomeAmount()).toBe(0);

      // Stale query (#1) resolves later with an income row -> must be dropped.
      pending[0].next({ totalCount: 1, contentList: [row(false, 100)] });
      pending[0].complete();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.outgoAmount()).toBe(500);
      expect(component.incomeAmount()).toBe(0);
      expect(component.listData().length).toBe(1);
      expect(component.isLoadingData()).toBe(false);
    });

    // Exclude-transfer never reaches the server query, so closing its tag must
    // re-aggregate the rows already in hand — no second network round-trip.
    it('7. closing the exclude-transfer tag re-aggregates locally without re-querying', async () => {
      searchDocItemSpy.mockReset();
      const transferRow: SafeAny = {
        DocumentID: 3,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: format(subYears(new Date(), 1), dateFormat),
        DocumentDesp: 'transfer',
        AccountID: fakeData.finAccounts[0].Id,
        TransactionType: financeTranTypeTransferIn,
        IsExpense: false,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 999,
        Amount: 999,
        AmountInLocalCurrency: 999,
        ItemDesp: 'transfer',
      };
      // NB: finTranTypes[0] is Id 1 == financeTranTypeOpeningAsset, itself an
      // excluded transfer type — pick a genuinely normal one.
      const normalTranType = fakeData.finTranTypes.find((tt) => tt.Id === 2)!;
      const normalRow: SafeAny = {
        ...transferRow,
        DocumentID: 4,
        TransactionType: normalTranType.Id,
        Amount: 100,
        OriginAmount: 100,
        AmountInLocalCurrency: 100,
      };
      searchDocItemSpy.and.returnValue(asyncData({ totalCount: 2, contentList: [transferRow, normalRow] }));
      TestBed.inject(UIStatusService).docInsightOption = {
        SelectedDataRange: [new Date(), addMonths(new Date(), 1)],
        ExcludeTransfer: true,
      };

      fixture.detectChanges(); // ngOnInit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Transfer row excluded from KPIs and the transaction count.
      expect(component.processedCount()).toBe(1);
      expect(component.incomeAmount()).toBe(100);
      expect(searchDocItemSpy).toHaveBeenCalledTimes(1);

      component.onRemoveExcludeTransfer();
      fixture.detectChanges();

      // Both rows now count — rebuilt from the buffered rows, no new query.
      expect(component.insightOption()?.ExcludeTransfer).toBe(false);
      expect(component.processedCount()).toBe(2);
      expect(component.incomeAmount()).toBe(1099);
      expect(searchDocItemSpy).toHaveBeenCalledTimes(1);
    });

    // Regression: V_FIN_DOCUMENT_ITEM signs expense amounts negative. When
    // searchDocItem's $select omitted IsExpense every row fell through into
    // the income bucket, so a pure-expense query showed Income = -100 and
    // Outgo = 0. The cards must book it as Outgo = 100 / Income = 0 instead.
    it('8. books a pure expense as positive Outgoing, not negative Income', async () => {
      searchDocItemSpy.mockReset();
      searchDocItemSpy.and.returnValue(
        asyncData({
          totalCount: 1,
          contentList: [
            {
              DocumentID: 9,
              ItemID: 1,
              HomeID: fakeData.chosedHome.ID,
              TransactionDate: format(subYears(new Date(), 1), dateFormat),
              DocumentDesp: 'expense',
              AccountID: fakeData.finAccounts[0].Id,
              // finTranTypes[0].Id === 1 is an opening/transfer type — pick a
              // normal one (same choice as test 7).
              TransactionType: fakeData.finTranTypes.find((tt) => tt.Id === 2)!.Id,
              IsExpense: true,
              Currency: fakeData.chosedHome.BaseCurrency,
              OriginAmount: 100,
              Amount: -100,
              AmountInLocalCurrency: -100,
              ItemDesp: 'expense',
            },
          ],
        }),
      );
      TestBed.inject(UIStatusService).docInsightOption = {
        SelectedDataRange: [new Date(), addMonths(new Date(), 1)],
      };

      fixture.detectChanges(); // ngOnInit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.incomeAmount()).toBe(0);
      expect(component.outgoAmount()).toBe(100);
      expect(component.netAmount()).toBe(-100);
      expect(component.processedCount()).toBe(1);
    });
  });

  describe('opened without insight option', () => {
    beforeEach(() => {
      searchDocItemSpy.mockReset();
      TestBed.inject(UIStatusService).docInsightOption = undefined;
    });

    // Deep link / fresh tab: without criteria the page must not fire a
    // query and show where to start instead of a blank grid.
    it('shows the guidance result and never queries', async () => {
      fixture.detectChanges(); // ngOninit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(searchDocItemSpy).toHaveBeenCalledTimes(0);
      expect(component.chartTrendOption()).toBeNull();
      expect(fixture.nativeElement.querySelector('nz-result')).toBeTruthy();
    });
  });
});
