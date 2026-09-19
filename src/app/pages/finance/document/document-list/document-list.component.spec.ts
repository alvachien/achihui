import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';

import { DocumentListComponent } from './document-list.component';
import {
  createSpyObj,
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ElementClass_DialogCloseButton,
  ElementClass_DialogContent,
} from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import {
  UserAuthInfo,
  HomeMember,
  Document,
  DocumentItem,
  financeDocTypeNormal,
  BaseListModel,
  dateFormat,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
} from '../../../../model';
import { format } from 'date-fns';
import { resolveDateScope } from '../../../../shared/date-scope';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { FilterOperation } from 'actslib';
import { translate } from '@jsverse/transloco';

describe('DocumentListComponent', () => {
  let component: DocumentListComponent;
  let fixture: ComponentFixture<DocumentListComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllDocTypesSpy: SafeAny;
  let fetchAllCurrenciesSpy: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let fetchAllDocumentsSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  // const uiServiceStub: Partial<UIStatusService> = {};
  const ardocs: BaseListModel<Document> = {
    totalCount: 0,
    contentList: [],
  };
  let homeServiceStub: Partial<HomeDefOdataService> = {};

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
      'fetchAllDocTypes',
      'fetchAllCurrencies',
      'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'fetchAllDocuments',
    ]);
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    // ngOnInit now consumes fetchAllDocuments immediately (page fetch + the
    // unfiltered `N` baseline) - the default must be a BaseListModel shape.
    fetchAllDocumentsSpy = storageService.fetchAllDocuments.and.returnValue(
      of({ totalCount: 0, contentList: [] as Document[] }),
    );
    authServiceStub.authSubject = signal(new UserAuthInfo());
    homeServiceStub = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
      curHomeMember: signal<HomeMember | null>(fakeData.chosedHome.Members[0] ?? null),
    };
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, getTranslocoModule()],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        NzModalService,
        { provide: NZ_I18N, useValue: en_US },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    // TestBed.overrideModule(, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts the caption counts at zero (the old nzTotal placeholder 1 would flash "0 | 1")', () => {
    expect(component.totalDocumentCount()).toBe(0);
    expect(component.totalCountAll()).toBe(0);
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));

      // Delete all docs
      ardocs.totalCount = 2;
      ardocs.contentList.push({
        Id: 1,
        HID: fakeData.chosedHome.ID,
        DocType: financeDocTypeNormal,
        TranCurr: fakeData.chosedHome.BaseCurrency,
        Desp: 'test',
        TranDate: new Date(),
        Items: [
          {
            DocId: 1,
            ItemId: 1,
            AccountId: fakeData.finAccounts[0].Id,
            TranType: fakeData.finTranTypes[0].Id,
            TranAmount: 100,
          } as DocumentItem,
          {
            DocId: 1,
            ItemId: 2,
            AccountId: fakeData.finAccounts[0].Id,
            TranType: fakeData.finTranTypes[2].Id,
            TranAmount: 300,
          } as DocumentItem,
        ],
      } as Document);
      ardocs.contentList.push({
        Id: 2,
        HID: fakeData.chosedHome.ID,
        DocType: financeDocTypeNormal,
        TranCurr: fakeData.chosedHome.BaseCurrency,
        Desp: 'test',
        TranDate: new Date(),
        Items: [
          {
            DocId: 2,
            ItemId: 1,
            AccountId: fakeData.finAccounts[0].Id,
            TranType: fakeData.finTranTypes[0].Id,
            TranAmount: 200,
          } as DocumentItem,
          {
            DocId: 2,
            ItemId: 2,
            AccountId: fakeData.finAccounts[0].Id,
            TranType: fakeData.finTranTypes[2].Id,
            TranAmount: 400,
          } as DocumentItem,
        ],
      } as Document);

      fetchAllDocumentsSpy.and.returnValue(asyncData(ardocs));
    });

    it('should not show data before OnInit', () => {
      expect(component.listOfDocs().length).toEqual(0);
    });

    it('should show data after OnInit', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.listOfDocs().length).toBeGreaterThan(0);
      // expect(component.listOfDocs().length).toEqual(ardocs.totalCount);
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should render a table row per document after data loads', async () => {
      // Regression: the @for body was wrapped in an inert <ng-template>, so
      // listOfDocs was populated by the API but no rows reached the DOM.
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.listOfDocs().length).toBeGreaterThan(0);

      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBeGreaterThanOrEqual(component.listOfDocs().length);
    });

    it('shall trigger navigation on menus for document creating', () => {
      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      component.onCreateNormalDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createnormal']);

      component.onCreateTransferDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createtransfer']);

      component.onCreateADPDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createadp']);

      component.onCreateADRDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createadr']);

      component.onCreateExgDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createexg']);

      component.onCreateAssetBuyInDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createassetbuy']);

      component.onCreateAssetSoldOutDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createassetsold']);

      component.onCreateBorrowFromDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createbrwfrm']);

      component.onCreateLendToDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createlendto']);

      component.onCreateAssetValChgDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createassetvalchg']);

      component.onCreateRepayDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createloanrepay']);

      // component.onDisplayDocument(doc: Document): void {
      //   expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/display', doc.Id]);
      // }

      component.onMassCreateNormalDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/masscreatenormal']);
    });
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
      fetchAllDocumentsSpy.and.returnValue(asyncData(ardocs));
    });

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when account category fails', async () => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
    });

    it('should display error when currencies fails', async () => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
    });

    it('should display error when doc type fails', async () => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
    });

    it('should display error when tran type fails', async () => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
    });

    it('should display error when account fails', async () => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
    });

    it('should display error when control center fails', async () => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
    });

    it('should display error when order fails', async () => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
    });

    it('should display error when docs fails', async () => {
      // tell spy to return an async error observable
      fetchAllDocumentsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
    });
  });

  describe('4. filter bar (server-paginated port)', () => {
    // Bare-condition spelling (the dialog's case-1 Submit shape): Desp Contains
    // 'foo' → the fragment `contains(Desp,'foo')`.
    const DESP_CONTAINS_FOO = { property: 'Desp', operation: FilterOperation.Contains, lowValue: 'foo' };

    beforeEach(() => {
      // Spies are module-level and keep their last configuration across
      // describes - pin clean, error-free returns for this suite.
      fetchAllDocumentsSpy.and.returnValue(of({ totalCount: 0, contentList: [] as Document[] }));
      fetchAllAccountCategoriesSpy.and.returnValue(of([]));
      fetchAllCurrenciesSpy.and.returnValue(of([]));
      fetchAllDocTypesSpy.and.returnValue(of([]));
      fetchAllTranTypesSpy.and.returnValue(of([]));
      fetchAllAccountsSpy.and.returnValue(of([]));
      fetchAllControlCentersSpy.and.returnValue(of([]));
      fetchAllOrdersSpy.and.returnValue(of([]));
    });

    // The list fetch always goes through the 6-arg overload (items, top, skip,
    // orderby, search, fragment); the unfiltered `N` baseline fetch uses 3.
    // (Item-count can't tell them apart under the "No restriction" scope.)
    function listCalls(): SafeAny[][] {
      return fetchAllDocumentsSpy.mock.calls.filter((c: SafeAny[]) => c.length > 3);
    }
    function lastListCall(): SafeAny[] {
      const calls = listCalls();
      return calls[calls.length - 1];
    }

    // Let ngOnInit's fetches AND nz-table's synthetic initial emission settle
    // (whatever it emits is deduped or lands here, before the assertions start).
    async function settleInit(): Promise<void> {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 100));
      fetchAllDocumentsSpy.mockClear();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let createSpy: any;
    afterEach(() => {
      createSpy?.mockRestore();
      createSpy = undefined;
    });

    // Stub the prototype so it catches the instance the component injects
    // (book-list pattern: openFilterDialog goes through modal.create).
    function stubDialogClose(result: SafeAny): void {
      createSpy = vi
        .spyOn(NzModalService.prototype, 'create')
        .mockReturnValue({ afterClose: of(result) } as SafeAny as NzModalRef);
    }

    it('fetches the unfiltered baseline count on init (the N of N | M)', () => {
      fetchAllDocumentsSpy.mockClear();
      fixture.detectChanges();
      expect(fetchAllDocumentsSpy).toHaveBeenCalledWith([], 1, 0);
    });

    it('refetches with the search text after the live-filter debounce', async () => {
      await settleInit();

      component.onSearchInput('groceries');
      await new Promise<void>((r) => setTimeout(r, 100)); // still inside the 300 ms window
      expect(listCalls().length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 300)); // window elapses → commit + refetch
      expect(component.searchText()).toBe('groceries');
      expect(listCalls().length).toBe(1);
      expect(lastListCall()[4]).toBe('groceries'); // the search argument
      expect(lastListCall()[1]).toBe(20); // page 1, first page size 20
      expect(lastListCall()[2]).toBe(0);
    });

    it('translates the structured filter to a $filter fragment, separate from search', () => {
      fetchAllDocumentsSpy.mockClear();
      component.searchText.set('abc');
      component.filterDef.set(DESP_CONTAINS_FOO);
      expect(component.hasFilter()).toBe(true);
      component.onSearch();
      expect(lastListCall()[4]).toBe('abc');
      expect(lastListCall()[5]).toBe(`contains(Desp,'foo')`);
    });

    it('applies the dialog result and resets to page 1 on submit', () => {
      stubDialogClose({ root: DESP_CONTAINS_FOO });
      component.pageIndex.set(3);
      component.onEditFilter();

      expect(component.filterDef()).toEqual(DESP_CONTAINS_FOO);
      expect(component.pageIndex()).toBe(1);
      expect(lastListCall()[2]).toBe(0); // skipped from page 1
      expect(lastListCall()[5]).toBe(`contains(Desp,'foo')`);
    });

    it('keeps the previous filter when the dialog is cancelled', () => {
      component.filterDef.set(DESP_CONTAINS_FOO);
      stubDialogClose(undefined);
      fetchAllDocumentsSpy.mockClear();
      component.onEditFilter();

      expect(component.filterDef()).toEqual(DESP_CONTAINS_FOO);
      expect(listCalls().length).toBe(0);
    });

    it('clears the filter and refetches without a fragment', () => {
      component.filterDef.set(DESP_CONTAINS_FOO);
      fetchAllDocumentsSpy.mockClear();
      component.onClearFilter();

      expect(component.filterDef()).toBeUndefined();
      expect(component.hasFilter()).toBe(false);
      expect(lastListCall()[5]).toBe('');
    });

    it('sends a This-Month TranDate clause by default (legacy page-scope path)', () => {
      fetchAllDocumentsSpy.mockClear();
      component.onSearch();
      const month = resolveDateScope('month');
      expect(lastListCall()[0]).toEqual([
        {
          fieldName: 'TranDate',
          operator: GeneralFilterOperatorEnum.Between,
          lowValue: format(month!.bgn, dateFormat),
          highValue: format(month!.end, dateFormat),
          valueType: GeneralFilterValueType.number,
        },
      ]);
    });

    it("'No restriction' drops the date clause and refetches from page 1", () => {
      component.pageIndex.set(5);
      fetchAllDocumentsSpy.mockClear();
      // A real dropdown click drives BOTH outputs (keyChange before rangeChange
      // - see DateScopeComponent.select); the refetch consults the new key, so
      // a stale default 'month' key must not be left behind here.
      component.scopeKey.set('none');
      component.onScopeChange(undefined);
      expect(component.pageIndex()).toBe(1);
      expect(lastListCall()[0]).toEqual([]); // non-child member: no scope clause left

      // A dialog-side custom window is now the only date narrowing possible;
      // picking another scope sends its exact bounds.
      component.onScopeChange({ bgn: new Date(2026, 0, 1), end: new Date(2026, 0, 31) });
      const items: SafeAny[] = lastListCall()[0];
      expect(items[0].fieldName).toBe('TranDate');
      expect(items[0].lowValue).toBe('2026-01-01');
      expect(items[0].highValue).toBe('2026-01-31');
    });

    it('menu label falls back to "New filter" and summarizes once active', () => {
      expect(component.filterMenuText()).toEqual(translate('Filter.NewFilter'));
      component.filterDef.set(DESP_CONTAINS_FOO);
      expect(component.filterMenuText()).toContain('foo');
    });

    it('flags filterActive for either mechanism and resets when both clear', () => {
      expect(component.filterActive()).toBe(false);
      component.searchText.set('   '); // whitespace is not a filter
      expect(component.filterActive()).toBe(false);
      component.searchText.set('abc');
      expect(component.filterActive()).toBe(true);
      component.searchText.set('');

      component.filterDef.set(DESP_CONTAINS_FOO);
      expect(component.filterActive()).toBe(true);
      component.onClearFilter();
      expect(component.filterActive()).toBe(false);
    });

    it('flags filterActive while the date scope deviates from the default', () => {
      // Any scope other than This-Month changes the query - the bar highlight
      // (like the scope trigger's own bolding) keys off the active preset.
      expect(component.filterActive()).toBe(false);
      component.scopeKey.set('none'); // widening is still a deviation
      expect(component.filterActive()).toBe(true);
      component.scopeKey.set('lastMonth');
      expect(component.filterActive()).toBe(true);
      component.scopeKey.set('month');
      expect(component.filterActive()).toBe(false);
    });

    it('swallows repeated emissions of the current query and keeps sort across refetches', async () => {
      await settleInit();

      const q = (pageIndex: number): SafeAny => ({
        pageIndex,
        pageSize: 20,
        sort: [{ key: 'date', value: 'descend', name: 'date' }],
        filters: [],
      });
      // Real interaction: page 4, default sort retained → fetch with TranDate desc.
      component.onQueryParamsChange(q(4));
      expect(listCalls().length).toBe(1);
      expect(lastListCall()[2]).toBe(60);
      expect(lastListCall()[3]).toEqual({ field: 'TranDate', order: 'desc' });

      // Same query re-emitted: deduped.
      component.onQueryParamsChange(q(4));
      expect(listCalls().length).toBe(1);

      // A search commit bypasses the dedupe although page and sort are unchanged.
      component.searchText.set('abc');
      component.onSearch();
      expect(listCalls().length).toBe(2);
      expect(lastListCall()[4]).toBe('abc');
    });

    it('renders the filter bar and the count caption in the same filter row', async () => {
      await settleInit();
      fixture.detectChanges();
      const row = fixture.nativeElement.querySelector('.filter-row') as HTMLElement | null;
      expect(row).toBeTruthy();
      const bar = row?.querySelector('.filter-bar');
      expect(bar).toBeTruthy();
      expect(bar?.querySelector('hih-date-scope')).toBeTruthy(); // merged from the header
      expect(row?.querySelector('.table-count')).toBeTruthy();
    });
  });
});
