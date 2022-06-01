import { waitForAsync, ComponentFixture, TestBed, inject, tick, fakeAsync, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NZ_I18N, en_US, } from 'ng-zorro-antd/i18n';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';

import { FinanceUIModule } from '../../finance-ui.module';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { DocumentNormalCreateComponent } from './document-normal-create.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError, } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, Document, DocumentItem, momentDateFormat } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';

describe('DocumentNormalCreateComponent', () => {
  let component: DocumentNormalCreateComponent;
  let fixture: ComponentFixture<DocumentNormalCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllOrdersSpy: any;
  let createDocumentSpy: any;
  let searchDocItemSpy: any;
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

  beforeEach(waitForAsync(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    const homeService: Partial<HomeDefOdataService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const odataService: any = jasmine.createSpyObj('FinanceOdataService', [
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
    searchDocItemSpy = odataService.searchDocItem.and.returnValue(of({contentList: []}));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule(),
      ],
      declarations: [
        DocumentHeaderComponent,
        DocumentItemsComponent,
        DocumentNormalCreateComponent,
        MessageDialogComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: odataService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentNormalCreateComponent);
    component = fixture.componentInstance;
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
      searchDocItemSpy.and.returnValue(asyncData({contentList: []}));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('step 0: should set the default values: base currency, date, and so on', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.headerForm.get('headerControl')).toBeTruthy('Expect header control has been initialized');
      expect(component.itemsForm.get('itemControl')).toBeTruthy('Expect item control has been initialized');

      flush();
      fixture.detectChanges();

      const docobj: Document = component.headerForm.get('headerControl')?.value as Document;
      expect(docobj.TranCurr).toEqual(fakeData.chosedHome.BaseCurrency);
    }));

    it('step 0: should not go to next page if header is not valid', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      // Shall not allow go the next page
      expect(component.nextButtonEnabled).toBeFalse();

      flush();
    }));

    it('step 0: should go to next page if header is valid for document with local currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Shall not allow go the next page
      expect(component.nextButtonEnabled).toBeFalse();

      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();

      // Event call the next
      component.next();
      expect(component.currentStep).toEqual(1);

      flush();
    }));

    it('step 0: should go to next page if header is valid for document with foreign currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Shall not allow go the next page
      expect(component.nextButtonEnabled).toBeFalse();

      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = 'USD';
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      docheader.ExgRate = 653;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();

      // Event call the next
      component.next();
      expect(component.currentStep).toEqual(1);

      flush();
    }));

    it('step 1: should not go to next page if item is invalid', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Shall not allow go the next page
      expect(component.nextButtonEnabled).toBeFalse();

      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();

      // Event call the next
      component.next();
      expect(component.currentStep).toEqual(1);

      expect(component.nextButtonEnabled).toBeFalse();

      flush();
    }));

    it('step 1: should go to next page if item is valid', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0.
      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      component.next();

      // Step 1.
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new  DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemsForm.get('itemControl')?.setValue(aritems);
      component.itemsForm.get('itemControl')?.markAsDirty();
      tick();
      fixture.detectChanges();

      component.next();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      flush();
    }));

    xit('step 2: should popup an error dialog if verification failed on generated object', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0.
      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      const nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1.
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new  DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemsForm.get('itemControl')?.setValue(aritems);
      component.itemsForm.get('itemControl')?.markAsDirty();
      tick();
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
      flush();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
      fixture.detectChanges();

      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBeNull();
      expect(component.currentStep).toBe(2);
      flush();
      tick();
      fixture.detectChanges();

      flush();
    }));

    it('step 3: should display error result when service return failure', fakeAsync(() => {
      createDocumentSpy.and.returnValue(asyncError<string>('create document failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Header
      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      component.next();
      expect(component.currentStep).toEqual(1);

      // Items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new  DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemsForm.get('itemControl')?.setValue(aritems);
      component.itemsForm.get('itemControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      component.next();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      // Save the document
      component.next();
      flush();
      fixture.detectChanges();

      // // Shall no dialog
      // const dlgElement: any = overlayContainerElement.querySelector(modalClassName)!;
      // expect(dlgElement).toBeFalsy();

      // Check the result
      expect(createDocumentSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(component.docIdCreated).toBeUndefined();
      expect(component.docPostingFailed).toBeTruthy();
    }));

    xit('step 3: should save document for base currency case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Header
      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = fakeData.chosedHome.BaseCurrency;
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      component.next();
      expect(component.currentStep).toEqual(1);

      // Items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new  DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemsForm.get('itemControl')?.setValue(aritems);
      component.itemsForm.get('itemControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      component.next();
      expect(component.currentStep).toEqual(2);

      // Save the document
      component.next();
      flush();
      fixture.detectChanges();

      // // Shall no dialog
      // const dlgElement: any = overlayContainerElement.querySelector(modalClassName)!;
      // expect(dlgElement).toBeFalsy();

      // Check the result
      expect(createDocumentSpy).toHaveBeenCalled();
    }));

    it('step 3: should save document for foreign currency case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Header
      const docheader = new Document();
      docheader.TranDate = moment('2020-02-02', momentDateFormat);
      docheader.Desp = 'Test on 2nd May, 2020';
      docheader.TranCurr = 'USD';
      component.headerForm.get('headerControl')?.setValue(docheader);
      component.headerForm.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      docheader.ExgRate = 634;
      component.headerForm.get('headerControl')?.setValue(docheader);
      tick();
      fixture.detectChanges();
      component.next();
      expect(component.currentStep).toEqual(1);

      // Items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new  DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemsForm.get('itemControl')?.setValue(aritems);
      component.itemsForm.get('itemControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      component.next();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(2);

      // Save the document
      component.next();
      flush();
      fixture.detectChanges();

      // // Shall no dialog
      // const dlgElement: any = overlayContainerElement.querySelector(modalClassName)!;
      // expect(dlgElement).toBeFalsy();

      // Check the result
      expect(createDocumentSpy).toHaveBeenCalled();
    }));

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
      searchDocItemSpy.and.returnValue(asyncData({contentList: []}));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display error when currency service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Currency service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Currency service failed',
        'Expected dialog to show the error message: Currency service failed');

      // Close the dialog
      const closeBtn  = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('2. should display error when accont category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Account category service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Account category service failed',
        'Expected snack bar to show the error message: Account category service failed');

      // Close the dialog
      const closeBtn  = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('3. should display error when doc type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Doc type service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Doc type service failed',
        'Expected snack bar to show the error message: Doc type service failed');

      // Close the dialog
      const closeBtn  = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('4. should display error when tran type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Tran type service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Tran type service failed',
        'Expected snack bar to show the error message: Tran type service failed');

      // Close the dialog
      const closeBtn  = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('5. should display error when accont service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Account service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Account service failed',
        'Expected snack bar to show the error message: Account service failed');

      // Close the dialog
      const closeBtn  = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('6. should display error when control center service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Control center service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Control center service failed',
        'Expected snack bar to show the error message: Control center service failed');

      // Close the dialog
      const closeBtn  = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('7. should display error when order service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Order service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit

      // tick();
      fixture.detectChanges();
      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Order service failed',
        'Expected snack bar to show the error message: Order service failed');

      // Close the dialog
      const closeBtn  = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));
  });
});
