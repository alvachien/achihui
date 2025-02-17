import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  inject,
  tick,
  fakeAsync,
  flush,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import moment from 'moment';

import { FinanceUIModule } from '../../finance-ui.module';
import {
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,
} from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, RepeatedDatesAPIOutput, DocumentItemView, momentDateFormat } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { DocumentRecurredMassCreateComponent } from './document-recurred-mass-create.component';
import { DocumentNormalMassCreateItemComponent } from '../document-normal-mass-create-item';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

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

  beforeEach(waitForAsync(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    //const uiServiceStub: Partial<UIStatusService> = {};
    const homeService: Partial<HomeDefOdataService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const odataService = jasmine.createSpyObj('FinanceOdataService', [
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
    declarations: [
        DocumentNormalMassCreateItemComponent,
        MessageDialogComponent,
        DocumentRecurredMassCreateComponent,
    ],
    imports: [FormsModule,
        FinanceUIModule,
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule()],
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
  }));

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
        StartDate: moment().startOf('month'),
        EndDate: moment().endOf('month'),
      });
      ardates.push({
        StartDate: moment().add(1, 'months').startOf('month'),
        EndDate: moment().add(1, 'months').endOf('month'),
      });
      ardates.push({
        StartDate: moment().add(2, 'months').startOf('month'),
        EndDate: moment().add(2, 'months').endOf('month'),
      });
      getRepeatedDatesSpy.and.returnValue(asyncData(ardates));

      // search Doc Items
      ardocitems = [];
      ardocitems.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: moment().add(1, 'days').format(momentDateFormat),
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
        TransactionDate: moment().add(1, 'weeks').format(momentDateFormat),
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

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should popup error dialog if fetchAllAccountCategories fails', fakeAsync(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllTranTypes fails', fakeAsync(() => {
      fetchAllTranTypesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllAccounts fails', fakeAsync(() => {
      fetchAllAccountsSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllControlCenters fails', fakeAsync(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllOrders fails', fakeAsync(() => {
      fetchAllOrdersSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllCurrencies fails', fakeAsync(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllDocTypes fails', fakeAsync(() => {
      fetchAllDocTypesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      //flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      discardPeriodicTasks();
    }));

    it('Step 0: search page without input', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.currentStep).toEqual(0);
      expect(component.searchFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      flush();
    }));

    it('Step 0: frequency is manadatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeFalsy();

      // Add frequency
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();

      flush();
    }));

    it('Step 0: Account is manadatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeFalsy();

      // Add account
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('Step 1: Error dialog if getRepeatedDates failed', fakeAsync(() => {
      getRepeatedDatesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('Step 1: Error dialog if searchDocItem failed', fakeAsync(() => {
      searchDocItemSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('Step 1: Existing document items', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(1);
      expect(component.listDates.length).toEqual(ardates.length);
      expect(component.listExistingDocItems.length).toBeGreaterThan(0);

      expect(component.nextButtonEnabled).toBeTruthy();

      discardPeriodicTasks();
      flush();
    }));

    it('Step 2: Default value', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);
      expect(component.defaultValueFormGroup.valid).toBeFalse();
      expect(component.nextButtonEnabled).toBeFalse();

      flush();
    }));

    it('Step 2: Default page account is manadatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(undefined);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.defaultValueFormGroup.get('amountControl')?.setValue(100);
      component.defaultValueFormGroup.get('despControl')?.setValue('test');
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBeFalse();

      expect(component.nextButtonEnabled).toBeFalse();

      flush();
    }));

    it('Step 2: Default page tran type is manadatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(undefined);
      component.defaultValueFormGroup.get('amountControl')?.setValue(100);
      component.defaultValueFormGroup.get('despControl')?.setValue('test');
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBeFalse();

      expect(component.nextButtonEnabled).toBeFalse();

      flush();
    }));

    it('Step 2: Default page amount is manadatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.defaultValueFormGroup.get('amountControl')?.setValue(undefined);
      component.defaultValueFormGroup.get('despControl')?.setValue('test');
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBeFalse();

      expect(component.nextButtonEnabled).toBeFalse();

      flush();
    }));

    it('Step 2: Default page desp is manadatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.defaultValueFormGroup.get('amountControl')?.setValue(100);
      component.defaultValueFormGroup.get('despControl')?.setValue(undefined);
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBeFalse();

      expect(component.nextButtonEnabled).toBeFalse();

      flush();
    }));

    it('Step 2: Default page cost object is manadatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      component.defaultValueFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.defaultValueFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.defaultValueFormGroup.get('amountControl')?.setValue(100);
      component.defaultValueFormGroup.get('despControl')?.setValue('test');
      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBeFalse();

      component.defaultValueFormGroup.get('ccControl')?.setValue(undefined);
      component.defaultValueFormGroup.get('orderControl')?.setValue(undefined);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBeFalse();

      component.defaultValueFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.defaultValueFormGroup.updateValueAndValidity();
      expect(component.defaultValueFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('Step 3: Items', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      tick();
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
      tick();
      fixture.detectChanges();

      // Step 3. Items
      expect(component.currentStep).toEqual(3);

      flush();
    }));

    it('Step 4: Confirm', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      tick();
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
      tick();
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
      tick();
      fixture.detectChanges();

      // Step 4. Confirm
      expect(component.currentStep).toEqual(4);

      flush();
    }));

    it('Step 5: Result page', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0. Input search criteria
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
      component.searchFormGroup.get('frqControl')?.setValue(component.arFrequencies[0].value);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.markAsDirty();
      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 1. Existing doc. items
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();

      // Step 2. Default value
      fixture.detectChanges();
      tick();
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
      tick();
      fixture.detectChanges();

      // Step 3. Items
      expect(component.currentStep).toEqual(3);
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Step 4. Confirm
      expect(component.currentStep).toEqual(4);
      expect(component.nextButtonEnabled).toBeTruthy();
      component.next();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Step 5.
      expect(component.currentStep).toEqual(5);
      expect(component.docIdCreated.length).toBeGreaterThan(0);

      flush();
    }));
  });
});
