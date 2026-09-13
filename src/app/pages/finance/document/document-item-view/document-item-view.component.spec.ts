import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NzModalService } from 'ng-zorro-antd/modal';

import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType } from '../../../../model';
import { DocumentItemViewComponent } from './document-item-view.component';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('DocumentItemViewComponent', () => {
  let component: DocumentItemViewComponent;
  let fixture: ComponentFixture<DocumentItemViewComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllDocTypesSpy: SafeAny;
  let fetchAllCurrenciesSpy: SafeAny;
  // let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  // let fetchAllDocumentsSpy: SafeAny;
  let searchDocItemSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};

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
      // 'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      // 'fetchAllDocuments',
      'searchDocItem',
    ]);
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    // fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    // fetchAllDocumentsSpy = storageService.fetchAllDocuments.and.returnValue(of([]));
    searchDocItemSpy = storageService.searchDocItem.and.returnValue(of([]));
    authServiceStub.authSubject = signal(new UserAuthInfo());
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, getTranslocoModule()],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: NZ_I18N, useValue: en_US },
        { provide: FinanceOdataService, useValue: storageService },
        NzModalService,
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
    fixture = TestBed.createComponent(DocumentItemViewComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('working with data', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      // fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
      // fetchAllDocumentsSpy = storageService.fetchAllDocuments.and.returnValue(of([]));
      searchDocItemSpy = storageService.searchDocItem.and.returnValue(of([]));
    });
    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('data fetch okay', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.listDocItem().length).toEqual(0);
      expect(searchDocItemSpy).not.toHaveBeenCalled();
    });

    it('should display error when Service fails on Account', async () => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // fetchDocItems bails out when no filter is set ("Not allow select all"),
      // so the old bare call never issued any request and no error modal could
      // appear. The filterDocItem input setter stores the filter AND kicks off
      // the fetch itself.
      const flt = new GeneralFilterItem();
      flt.fieldName = 'AccountID';
      flt.operator = GeneralFilterOperatorEnum.Equal;
      flt.lowValue = fakeData.finAccounts[0].Id;
      flt.valueType = GeneralFilterValueType.number;
      component.filterDocItem = [flt];

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // let the forkJoin error arrive
      fixture.detectChanges();

      // Expect the error dialog(s). NOTE: the filterDocItem setter fetches
      // AND the table's initial nzQueryParams emission re-fetches (this
      // component has no query dedupe like book-list), so the failing
      // forkJoin can legitimately raise two identical error modals.
      const modalCount = overlayContainerElement.querySelectorAll('.ant-modal-body').length;
      expect(modalCount).toBeGreaterThanOrEqual(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button(s): close every dialog shown.
      const closeBtns = overlayContainerElement.querySelectorAll('.ant-modal-close');
      expect(closeBtns.length).toBe(modalCount);
      closeBtns.forEach((btn) => (btn as HTMLButtonElement).click());
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
});
