import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { startOfMonth, endOfMonth, addMonths, addDays, addWeeks, format } from 'date-fns';
import { dateFormat } from '../../../../model';

import {createSpyObj, getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,} from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, RepeatedDatesAPIOutput, DocumentItemView } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { DocumentRecurredMassCreateComponent } from './document-recurred-mass-create.component';
import { DocumentNormalMassCreateItemComponent } from '../document-normal-mass-create-item';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';

describe('DocumentRecurredMassCreateComponent', () => {
  let component: DocumentRecurredMassCreateComponent;
  let fixture: ComponentFixture<DocumentRecurredMassCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: SafeAny;
  let fetchAllDocTypesSpy: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let massCreateNormalDocumentSpy: SafeAny;
  let getRepeatedDatesSpy: SafeAny;
  let searchDocItemSpy: SafeAny;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinControlCenter();
    fakeData.buildFinAccounts();
    fakeData.buildFinOrders();
  });

  beforeEach(async () => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    //const uiServiceStub: Partial<UIStatusService> = {};
    const homeService: Partial<HomeDefOdataService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const odataService = createSpyObj('FinanceOdataService', [
      'fetchAllCurrencies',
      'fetchAllDocTypes',
      'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'massCreateNormalDocument',
      'getRepeatedDates',
      'searchDocItem',
    ]);
    fetchAllCurrenciesSpy = odataService.fetchAllCurrencies.and.returnValue(of([]));
    fetchAllDocTypesSpy = odataService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = odataService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = odataService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = odataService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = odataService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = odataService.fetchAllOrders.and.returnValue(of([]));
    massCreateNormalDocumentSpy = odataService.massCreateNormalDocument.and.returnValue(of({}));
    getRepeatedDatesSpy = odataService.getRepeatedDates.and.returnValue(of([]));
    searchDocItemSpy = odataService.searchDocItem.and.returnValue(
      of({
        contentList: [],
      })
    );

    TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [FormsModule,

        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule(),
        NzFormModule,
        NzInputModule,
        NzSelectModule,
        NzInputNumberModule,
        NzDatePickerModule,
        NzCheckboxModule,
        NzResultModule,
        NzStepsModule,
        NzPageHeaderModule,
        NzBreadCrumbModule,
        NzDescriptionsModule,
        NzTableModule,
        NzCollapseModule,
        NzDividerModule,
        DocumentNormalMassCreateItemComponent],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        NzModalService,
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: odataService },
        { provide: NZ_I18N, useValue: en_US },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    // TestBed.overrideModule(BrowserDynamicTestingModule, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentRecurredMassCreateComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Working with data', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let ardates: RepeatedDatesAPIOutput[] = [];
    let ardocitems: DocumentItemView[] = [];

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));

      // Accounts
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      // CC
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      // Order
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));

      // Repeated docs
      ardates = [];
      ardates.push({
        StartDate: startOfMonth(new Date()),
        EndDate: endOfMonth(new Date()),
      });
      ardates.push({
        StartDate: startOfMonth(addMonths(new Date(), 1)),
        EndDate: endOfMonth(addMonths(new Date(), 1)),
      });
      ardates.push({
        StartDate: startOfMonth(addMonths(new Date(), 2)),
        EndDate: endOfMonth(addMonths(new Date(), 2)),
      });
      getRepeatedDatesSpy.and.returnValue(asyncData(ardates));

      // search Doc Items
      ardocitems = [];
      ardocitems.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: addDays(new Date(), 1),
        DocumentDesp: 'doc 1',
        AccountID: fakeData.finAccounts[0].Id,
        TransactionType: fakeData.finTranTypes[0].Id,
        IsExpense: fakeData.finTranTypes[0].Expense,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 100.23,
        Amount: 100.23,
        AmountInLocalCurrency: 100.23,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'item 1',
      });
      ardocitems.push({
        DocumentID: 2,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: addWeeks(new Date(), 1),
        DocumentDesp: 'doc 2',
        AccountID: fakeData.finAccounts[0].Id,
        TransactionType: fakeData.finTranTypes[0].Id,
        IsExpense: fakeData.finTranTypes[0].Expense,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 200.23,
        Amount: 200.23,
        AmountInLocalCurrency: 200.23,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'item 2.1',
      });
      searchDocItemSpy.and.returnValue(
        asyncData({
          totalCount: 20,
          contentList: ardocitems,
        })
      );

      // Mass create
      massCreateNormalDocumentSpy.and.returnValue(
        asyncData({
          PostedDocuments: [
            {
              Id: 1,
              TranDateFormatString: '2020-01-01',
            },
          ],
          FailedDocuments: [],
        })
      );
    });

    beforeEach(() => {
    const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
  });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should popup error dialog if fetchAllAccountCategories fails', async () => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllTranTypes fails', async () => {
      fetchAllTranTypesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllAccounts fails', async () => {
      fetchAllAccountsSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllControlCenters fails', async () => {
      fetchAllControlCentersSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllOrders fails', async () => {
      fetchAllOrdersSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllCurrencies fails', async () => {
      fetchAllCurrenciesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllDocTypes fails', async () => {
      fetchAllDocTypesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      //await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
    });

    it('Step 0: search page without input', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.currentStep).toEqual(0);
      expect(component.searchFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 0: frequency is manadatory', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeFalsy();

      // Add frequency
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 0: Account is manadatory', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeFalsy();

      // Add account
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 1: Error dialog if getRepeatedDates failed', async () => {
      getRepeatedDatesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 1: Error dialog if searchDocItem failed', async () => {
      searchDocItemSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 1: Existing document items', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(1);
      expect(component.listDates.length).toEqual(ardates.length);
      expect(component.listExistingDocItems.length).toBeGreaterThan(0);

      expect(component.nextButtonEnabled).toBeTruthy();
      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 2: Default value', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);
      expect(component.defaultValueFormGroup.valid).toBe(false);
      expect(component.nextButtonEnabled).toBe(false);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 2: Default page account is manadatory', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(undefined);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.defaultValueFormGroup.get('amountControl')?.setValue(100);
      component.defaultValueFormGroup.get('despControl')?.setValue('test');
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBe(false);

      expect(component.nextButtonEnabled).toBe(false);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 2: Default page tran type is manadatory', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(undefined);
      component.defaultValueFormGroup.get('amountControl')?.setValue(100);
      component.defaultValueFormGroup.get('despControl')?.setValue('test');
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBe(false);

      expect(component.nextButtonEnabled).toBe(false);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 2: Default page amount is manadatory', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.defaultValueFormGroup.get('amountControl')?.setValue(undefined);
      component.defaultValueFormGroup.get('despControl')?.setValue('test');
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBe(false);

      expect(component.nextButtonEnabled).toBe(false);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 2: Default page desp is manadatory', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.defaultValueFormGroup.get('amountControl')?.setValue(100);
      component.defaultValueFormGroup.get('despControl')?.setValue(undefined);
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBe(false);

      expect(component.nextButtonEnabled).toBe(false);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 2: Default page cost object is manadatory', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.defaultValueFormGroup.get('amountControl')?.setValue(100);
      component.defaultValueFormGroup.get('despControl')?.setValue('test');
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBe(false);

      component.defaultValueFormGroup.get('ccControl')?.setValue(undefined);
      component.defaultValueFormGroup.get('orderControl')?.setValue(undefined);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBe(false);

      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 3: Items', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.defaultValueFormGroup.get('amountControl')?.setValue(100);
      component.defaultValueFormGroup.get('despControl')?.setValue('test');
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      component.next();
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 3. Items
      expect(component.currentStep).toEqual(3);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 4: Confirm', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.defaultValueFormGroup.get('amountControl')?.setValue(100);
      component.defaultValueFormGroup.get('despControl')?.setValue('test');
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      component.next();
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 3. Items
      expect(component.currentStep).toEqual(3);

      // Add item and delete it
      const nidx = component.onCreateNewItem(undefined);
      if (nidx > 0) {
        const nidx2 = component.onCopyItem(undefined, nidx);
        if (nidx2 > 0) {
          component.onRemoveItem(undefined, nidx2);
        }
        component.onRemoveItem(undefined, nidx);
      }

      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 4. Confirm
      expect(component.currentStep).toEqual(4);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('Step 5: Result page', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([startOfMonth(new Date()), endOfMonth(new Date())]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.defaultValueFormGroup.get('amountControl')?.setValue(100);
      component.defaultValueFormGroup.get('despControl')?.setValue('test');
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      component.next();
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 3. Items
      expect(component.currentStep).toEqual(3);
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 4. Confirm
      expect(component.currentStep).toEqual(4);
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 5.
      expect(component.currentStep).toEqual(5);
      expect(component.docIdCreated.length).toBeGreaterThan(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });
  });
});
