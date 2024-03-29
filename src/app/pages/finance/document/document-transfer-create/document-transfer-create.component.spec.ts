import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  fakeAsync,
  inject,
  tick,
  flush,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';

import { FinanceUIModule } from '../../finance-ui.module';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentTransferCreateComponent } from './document-transfer-create.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, Document } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { SafeAny } from 'src/common';

describe('DocumentTransferCreateComponent', () => {
  let component: DocumentTransferCreateComponent;
  let fixture: ComponentFixture<DocumentTransferCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: SafeAny;
  let fetchAllDocTypesSpy: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let createDocumentSpy: SafeAny;

  const modalClassName = '.ant-modal-body';
  const nextButtonId = '#button_next_step';
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  const homeService: Partial<HomeDefOdataService> = {};  
  const odataService: SafeAny = jasmine.createSpyObj('FinanceOdataService', [
    'fetchAllCurrencies',
    'fetchAllDocTypes',
    'fetchAllAccountCategories',
    'fetchAllTranTypes',
    'fetchAllAccounts',
    'fetchAllControlCenters',
    'fetchAllOrders',
    'createDocument',
  ]);

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinControlCenter();
    fakeData.buildFinAccounts();
    fakeData.buildFinOrders();

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    homeService.ChosedHome = fakeData.chosedHome;
    fetchAllCurrenciesSpy = odataService.fetchAllCurrencies.and.returnValue(of([]));
    fetchAllDocTypesSpy = odataService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = odataService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = odataService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = odataService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = odataService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = odataService.fetchAllOrders.and.returnValue(of([]));
    createDocumentSpy = odataService.createDocument.and.returnValue(of({}));
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      declarations: [DocumentHeaderComponent, DocumentTransferCreateComponent, MessageDialogComponent],
      providers: [
        NzModalService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: odataService },
        { provide: NZ_I18N, useValue: en_US },
      ],
    }).compileComponents();

    // TestBed.overrideModule(BrowserDynamicTestingModule, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTransferCreateComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('1. should create without data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('2. Exception case handling (async loading)', () => {
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
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display error when currency service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Currency service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Currency service failed',
      //   'Expected snack bar to show the error message: Currency service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      discardPeriodicTasks();
    }));

    it('2. should display error when accont category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Account category service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Account category service failed',
      //   'Expected snack bar to show the error message: Account category service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      discardPeriodicTasks();
    }));

    it('3. should display error when doc type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Doc type service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Doc type service failed',
      //   'Expected snack bar to show the error message: Doc type service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      discardPeriodicTasks();
    }));

    it('4. should display error when tran type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Tran type service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Tran type service failed',
      //   'Expected snack bar to show the error message: Tran type service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      discardPeriodicTasks();
    }));

    it('5. should display error when accont service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Account service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Account service failed',
      //   'Expected snack bar to show the error message: Account service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      discardPeriodicTasks();
    }));

    it('6. should display error when control center service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Control center service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Control center service failed',
      //   'Expected snack bar to show the error message: Control center service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      discardPeriodicTasks();
    }));

    it('7. should display error when order service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Order service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Order service failed',
      //   'Expected snack bar to show the error message: Order service failed');

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      discardPeriodicTasks();
    }));
  });

  describe('3. should prevent errors by the checking logic', () => {
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
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('step 0: should set the default values: base currency, date, and so on', fakeAsync(() => {
      expect(component.headerFormGroup.valid).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0); // First step
      flush();
      fixture.detectChanges();

      const docobj: Document = component.headerFormGroup.get('headerControl')?.value as Document;
      expect(docobj.TranCurr).toEqual('');
    }));

    it('step 0: should have accounts and orders loaded', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      expect(component.arUIAccounts.length).toEqual(0);
      expect(component.arUIOrders.length).toEqual(0);

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.arUIAccounts.length).toBeGreaterThan(0);
      expect(component.arUIOrders.length).toBeGreaterThan(0);
    }));

    it('step 0: amount is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      expect(component.arUIAccounts.length).toEqual(0);
      expect(component.arUIOrders.length).toEqual(0);

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      component.headerFormGroup.updateValueAndValidity();
      expect(component.headerFormGroup.valid)
        .withContext('Expect header form is invalid because amount is missing')
        .toBeFalsy();
      fixture.detectChanges();

      // Click the next button
      expect(component.nextButtonEnabled).toBeFalse();

      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      expect(component.currentStep).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(0);
    }));

    it('step 0: shall go to step 1 for base currency case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0); // At first page

      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('amountControl')?.setValue(100);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      expect(component.currentStep).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(1);
    }));

    it('step 0: shall go to step 1 for foreign currency case', fakeAsync(() => {
      expect(component.headerFormGroup.valid).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0); // At first page

      const curdoc: Document = new Document();
      curdoc.TranCurr = 'USD';
      curdoc.ExgRate = 653.33;
      curdoc.Desp = 'test';
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('amountControl')?.setValue(100);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      component.headerFormGroup.updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      expect(component.currentStep).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(1);
    }));

    it('step 1: account is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      component.headerFormGroup.get('amountControl')?.setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      expect(component.headerFormGroup.valid).withContext('Expect header from is valid').toBeTruthy();
      expect(component.nextButtonEnabled).withContext('Expect next button is enabled').toBeTruthy();
      expect(component.currentStep).toBe(0);
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 1
      expect(component.currentStep).toBe(1);

      // However, it is invalid
      expect(component.fromFormGroup.valid).toBeFalsy();

      // Click the next button, still at second step
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(1);
    }));

    // Step 1: Asset account should not allowed
    // Step 1: ADP account should not allowed

    it('step 1: neither control center nor order', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      component.headerFormGroup.get('amountControl')?.setValue(100);
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1);

      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      fixture.detectChanges();

      // However, it is invalid
      expect(component.fromFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(1);
    }));

    it('step 1: control center and order both', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      component.headerFormGroup.get('amountControl')?.setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1);

      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.fromFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      fixture.detectChanges();

      // However, it is invalid
      expect(component.fromFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(1);
    }));

    it('step 2: account is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      component.headerFormGroup.get('amountControl')?.setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1);
      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component.currentStep).toBe(2);
      expect(component.toFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(2);
    }));

    it('step 2: to account shall not identical as from account', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl')?.valid)
        .withContext('Expect a valid header form')
        .toBeTruthy();
      component.headerFormGroup.updateValueAndValidity();
      component.headerFormGroup.get('amountControl')?.setValue(100);
      expect(component.headerFormGroup.valid).toBeTruthy('Expect a valid header step');
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1, 'Expect the stepper is now in From Step');
      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component.currentStep).toBe(2);
      component.toFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.toFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.toFormGroup.updateValueAndValidity();
      expect(component.toFormGroup.valid).toBeFalsy('Expect the from account and to account are not the same');

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(2);
    }));

    // Step 2: Asset account should not allowed
    // Step 2: ADP account should not allowed

    it('step 2: neither control center nor order', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      component.headerFormGroup.get('amountControl')?.setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1);
      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component.currentStep).toBe(2);
      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      fixture.detectChanges();
      expect(component.toFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(2);
    }));

    it('step 2: control center and order both', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      component.headerFormGroup.get('amountControl')?.setValue(100);
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1);

      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component.currentStep).toBe(2);
      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.fromFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      fixture.detectChanges();
      expect(component.toFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(2);
    }));

    it('step 3: review and confirm', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      component.headerFormGroup.get('amountControl')?.setValue(100);
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1);

      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component.currentStep).toBe(2);
      component.toFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[1].Id);
      component.toFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      tick();
      fixture.detectChanges();
      expect(component.toFormGroup.valid).toBeTruthy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(3);
      expect(component.isDocPosting).toBeFalsy();

      // You can also one step back
      component.pre();
      fixture.detectChanges();
      expect(component.currentStep).toBe(2);

      flush();
    }));

    xit('step 3: shall popup dialog for invalid generated doc', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0
      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      component.headerFormGroup.get('amountControl')?.setValue(100);
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toBe(1);

      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component.currentStep).toBe(2);
      component.toFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[1].Id);
      component.toFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      tick();
      fixture.detectChanges();
      expect(component.toFormGroup.valid).toBeTruthy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 3
      expect(component.currentStep).toBe(3);
      expect(component.isDocPosting).toBeFalsy();
      // Just for test - make the check failed
      component.headerFormGroup.get('amountControl')?.setValue(0);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      flush();
      fixture.detectChanges(); // Trigers the generate document object, and it failed

      // Expect an error dialog
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const messageElement = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();

      // Close the dialog
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('step 4: will create the doc and show the result', fakeAsync(() => {
      createDocumentSpy.and.returnValue(
        asyncData({
          Id: 1,
          TranCurr: fakeData.chosedHome.BaseCurrency,
          Desp: 'Test',
        })
      );
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0
      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      component.headerFormGroup.get('amountControl')?.setValue(100);
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 1
      expect(component.currentStep).toBe(1);

      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 2
      expect(component.currentStep).toBe(2);
      component.toFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[1].Id);
      component.toFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      tick();
      fixture.detectChanges();
      expect(component.toFormGroup.valid).toBeTruthy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in stp 3
      expect(component.currentStep).toBe(3);
      expect(component.isDocPosting).toBeFalsy();
      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 4
      expect(component.isDocPosting).toBeTruthy();

      // Now the call is finished
      tick();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(createDocumentSpy).toHaveBeenCalled();
      expect(component.currentStep).toBe(4);
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBeTruthy();

      tick();

      // Navigation shall work
      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onDisplayCreatedDoc();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/display/1']);

      flush();
    }));

    it('step 4: will show the failed result', fakeAsync(() => {
      createDocumentSpy.and.returnValue(asyncError('failed in creation'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 0
      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl')?.setValue(curdoc);
      component.headerFormGroup.get('headerControl')?.updateValueAndValidity();
      component.headerFormGroup.get('amountControl')?.setValue(100);
      expect(component.headerFormGroup.get('headerControl')?.valid).withContext('Expect a valid header').toBeTruthy();
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 1
      expect(component.currentStep).toBe(1);

      component.fromFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 2
      expect(component.currentStep).toBe(2);
      component.toFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[1].Id);
      component.toFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      tick();
      fixture.detectChanges();
      expect(component.toFormGroup.valid).toBeTruthy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in stp 3
      expect(component.currentStep).toBe(3);
      expect(component.isDocPosting).toBeFalsy();
      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 4
      expect(component.isDocPosting).toBeTruthy();

      // Now the call is finished
      tick();
      fixture.detectChanges();
      expect(createDocumentSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toBe(4);
      expect(component.isDocPosting).withContext('expect variable isDocPosting is false').toBeFalsy();
      expect(component.docIdCreated).withContext('expect variable docIdCreated is null').toBeFalsy();
      expect(component.docPostingFailed).toEqual('failed in creation');

      flush();
    }));
  });
});
