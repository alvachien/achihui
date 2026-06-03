import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';

import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { DocumentNormalCreateComponent } from './document-normal-create.component';
import {createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError} from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, Document, DocumentItem, momentDateFormat } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { SafeAny } from '@common/any';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DocumentNormalCreateComponent', () => {
  let component: DocumentNormalCreateComponent;
  let fixture: ComponentFixture<DocumentNormalCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: SafeAny;
  let fetchAllDocTypesSpy: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let createDocumentSpy: SafeAny;
  let searchDocItemSpy: SafeAny;
  const modalClassName = '.ant-modal-body';
  const nextButtonId = '#button_next_step';

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
    const uiServiceStub: Partial<UIStatusService> = {};
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
      'createDocument',
      'searchDocItem',
    ]);
    fetchAllCurrenciesSpy = odataService.fetchAllCurrencies.and.returnValue(of([]));
    fetchAllDocTypesSpy = odataService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = odataService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = odataService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = odataService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = odataService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = odataService.fetchAllOrders.and.returnValue(of([]));
    createDocumentSpy = odataService.createDocument.and.returnValue(of({}));
    searchDocItemSpy = odataService.searchDocItem.and.returnValue(of({ contentList: [] }));

    TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [FormsModule,

        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule(),
        NzFormModule,
        NzAlertModule,
        NzTypographyModule,
        NzDividerModule,
        NzResultModule,
        NzSpinModule,
        NzStepsModule,
        NzPageHeaderModule,
        NzBreadCrumbModule,
        DocumentHeaderComponent,
        DocumentItemsComponent],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: odataService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
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
    fixture = TestBed.createComponent(DocumentNormalCreateComponent);
    component = fixture.componentInstance;
    // Defensive reset: test pollution from preceding test files can leave
    // curDocType as undefined, causing onVerify to fail
    component.curDocType = 1;
    // fixture.detectChanges();
  });

  it('1. should create', () => {
    expect(component).toBeTruthy();
  });

  describe('3. working with data', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

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
      // Search doc item
      searchDocItemSpy.and.returnValue(asyncData({ contentList: [] }));
    });

    beforeEach(() => {
    const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
  });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('step 0: should set the default values: base currency, date, and so on', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.headerForm.get('headerControl')).toBeTruthy();
      expect(component.itemsForm.get('itemControl')).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      const docobj: Document = component.headerForm.get('headerControl')?.value as Document;
      expect(docobj.TranCurr).toEqual(fakeData.chosedHome.BaseCurrency);
    });

    it.skip('step 0: should not go to next page if header is not valid', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      // Shall not allow go the next page
      expect(component.nextButtonEnabled).toBe(false);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 0: should go to next page if header is valid for document with local currency', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Shall not allow go the next page
      expect(component.nextButtonEnabled).toBe(false);

      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Event call the next
      component.next();
      expect(component.currentStep).toEqual(1);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 0: should go to next page if header is valid for document with foreign currency', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Shall not allow go the next page
      expect(component.nextButtonEnabled).toBe(false);

      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = 'USD';
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      docheader.ExgRate = 653;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Event call the next
      component.next();
      expect(component.currentStep).toEqual(1);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 1: should not go to next page if item is invalid', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Shall not allow go the next page
      expect(component.nextButtonEnabled).toBe(false);

      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Event call the next
      component.next();
      expect(component.currentStep).toEqual(1);

      expect(component.nextButtonEnabled).toBe(false);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 1: should go to next page if item is valid', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0.
      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      component.next();

      // Step 1.
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemsForm.get('itemControl')?.setValue(aritems);
      component.itemsForm.get('itemControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      component.next();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 2: should popup an error dialog if verification failed on generated object', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0.
      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1.
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemsForm.get('itemControl')?.setValue(aritems);
      component.itemsForm.get('itemControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      expect(component.currentStep).toEqual(2);
      // Fake an error in generated doc
      docheader.Desp = '';
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      fixture.detectChanges();
      nextButtonNativeEl.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
      fixture.detectChanges();

      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBeNull();
      expect(component.currentStep).toBe(2);
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
    });

    it('step 3: should display error result when service return failure', async () => {
      createDocumentSpy.and.returnValue(asyncError<string>('create document failed'));

      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Header
      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      component.next();
      expect(component.currentStep).toEqual(1);

      // Items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemsForm.get('itemControl')?.setValue(aritems);
      component.itemsForm.get('itemControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      component.next();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      // Save the document
      component.next();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // // Shall no dialog
      // const dlgElement: any = overlayContainerElement.querySelector(modalClassName)!;
      // expect(dlgElement).toBeFalsy();

      // Check the result
      expect(createDocumentSpy).toHaveBeenCalled();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.docIdCreated).toBeUndefined();
      expect(component.docPostingFailed).toBeTruthy();
    });

    it.skip('step 3: should save document for base currency case', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Header
      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      component.next();
      expect(component.currentStep).toEqual(1);

      // Items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemsForm.get('itemControl')?.setValue(aritems);
      component.itemsForm.get('itemControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      component.next();
      expect(component.currentStep).toEqual(2);

      // Save the document
      component.next();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // // Shall no dialog
      // const dlgElement: any = overlayContainerElement.querySelector(modalClassName)!;
      // expect(dlgElement).toBeFalsy();

      // Check the result
      expect(createDocumentSpy).toHaveBeenCalled();
    });

    it('step 3: should save document for foreign currency case', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Header
      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = 'USD';
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      docheader.ExgRate = 634;
      component.headerForm.get('headerControl')?.setValue(docheader);
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      component.next();
      expect(component.currentStep).toEqual(1);

      // Items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemsForm.get('itemControl')?.setValue(aritems);
      component.itemsForm.get('itemControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      component.next();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      // Save the document
      component.next();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // // Shall no dialog
      // const dlgElement: any = overlayContainerElement.querySelector(modalClassName)!;
      // expect(dlgElement).toBeFalsy();

      // Check the result
      expect(createDocumentSpy).toHaveBeenCalled();
    });

    // // Asset account should not allowed

    // // ADP account should not allowed

    // // System tran type should not allowed

    // // Order which not valid in this date shall not allow

    // Reset should work
  });

  describe('2. Exception case handling', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

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
      searchDocItemSpy.and.returnValue(asyncData({ contentList: [] }));
    });

    beforeEach(() => {
    const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
  });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display error when currency service fails', async () => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Currency service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent, 'Expected dialog to show the error message: Currency service failed')
        .toContain('Currency service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
    });

    it('2. should display error when accont category service fails', async () => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Account category service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent, 'Expected snack bar to show the error message: Account category service failed')
        .toContain('Account category service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
    });

    it('3. should display error when doc type service fails', async () => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Doc type service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent, 'Expected snack bar to show the error message: Doc type service failed')
        .toContain('Doc type service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
    });

    it('4. should display error when tran type service fails', async () => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Tran type service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent, 'Expected snack bar to show the error message: Tran type service failed')
        .toContain('Tran type service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
    });

    it('5. should display error when accont service fails', async () => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Account service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent, 'Expected snack bar to show the error message: Account service failed')
        .toContain('Account service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
    });

    it('6. should display error when control center service fails', async () => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Control center service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent, 'Expected snack bar to show the error message: Control center service failed')
        .toContain('Control center service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
    });

    it('7. should display error when order service fails', async () => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Order service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit

      // await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent, 'Expected snack bar to show the error message: Order service failed')
        .toContain('Order service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
    });
  });
});
