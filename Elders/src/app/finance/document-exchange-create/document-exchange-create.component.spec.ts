import { async, ComponentFixture, TestBed, fakeAsync, inject, tick, flush, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
  MatStepperNext, MatCheckbox, } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIOrderValidFilterExPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { DocumentExchangeCreateComponent } from './document-exchange-create.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { Document, DocumentWithPlanExgRate, } from '../../model';

describe('DocumentExchangeCreateComponent', () => {
  let component: DocumentExchangeCreateComponent;
  let fixture: ComponentFixture<DocumentExchangeCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllOrdersSpy: any;
  let fetchAllControlCentersSpy: any;
  let createDocumentSpy: any;
  let fetchPreviousDocSpy: any;
  let updatePreviousDocSpy: any;
  let fetchAllCurrenciesSpy: any;
  let routerSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();
  });

  beforeEach(async(() => {
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'createDocument',
      'fetchPreviousDocWithPlanExgRate',
      'updatePreviousDocWithPlanExgRate',
    ]);
    fetchAllAccountCategoriesSpy = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = stroageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = stroageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = stroageService.fetchAllControlCenters.and.returnValue(of([]));
    createDocumentSpy = stroageService.createDocument.and.returnValue(of({}));
    fetchPreviousDocSpy = stroageService.fetchPreviousDocWithPlanExgRate.and.returnValue(of([]));
    updatePreviousDocSpy = stroageService.updatePreviousDocWithPlanExgRate.and.returnValue(of({}));
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        UIAccountStatusFilterPipe,
        UIAccountCtgyFilterPipe,
        UIAccountCtgyFilterExPipe,
        UIOrderValidFilterPipe,
        UIOrderValidFilterExPipe,
        DocumentExchangeCreateComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinCurrencyService, useValue: currService },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: Router, useValue: routerSpy },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentExchangeCreateComponent);
    component = fixture.componentInstance;
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

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Currency service failed',
        'Expected snack bar to show the error message: Currency service failed');
      flush();
    }));

    it('2. should display error when accont category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Account category service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Account category service failed',
        'Expected snack bar to show the error message: Account category service failed');
      flush();
    }));

    it('3. should display error when doc type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Doc type service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Doc type service failed',
        'Expected snack bar to show the error message: Doc type service failed');
      flush();
    }));

    it('4. should display error when tran type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Tran type service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Tran type service failed',
        'Expected snack bar to show the error message: Tran type service failed');
      flush();
    }));

    it('5. should display error when accont service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Account service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Account service failed',
        'Expected snack bar to show the error message: Account service failed');
      flush();
    }));

    it('6. should display error when control center service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Control center service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Control center service failed',
        'Expected snack bar to show the error message: Control center service failed');
      flush();
    }));

    it('7. should display error when order service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Order service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Order service failed',
        'Expected snack bar to show the error message: Order service failed');
      flush();
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

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('step 1: should set the default values: date, and so on', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Also, the date shall be inputted
      expect(component.tranDate).toBeTruthy();
    }));

    it('step 1: should have accounts and orders loaded', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      expect(component.arUIAccount.length).toEqual(0);
      expect(component.arUIOrder.length).toEqual(0);

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.arUIAccount.length).toBeGreaterThan(0);
      expect(component.arUIOrder.length).toBeGreaterThan(0);
      expect(component.firstFormGroup.get('dateControl').value).toBeTruthy();
    }));

    it('step 1. desp is a must', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      // component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 2. account is a must', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      // component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeFalsy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2. amount is a must', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      // component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeFalsy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2. currency is a must', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      // component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeFalsy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2. prevent the case that neither control center nor order', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      // component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2. prevent the case that both control center and order', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2. exchange rate is mandatory for foreign currency case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue('USD');
      // Exg rate
      // Control Center
      // component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2. allow go to step 3 in valid case (base currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      // component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 2. allow go to step 3 in valid case (foreign currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.fromFormGroup.get('exgControl').setValue(632.23);
      // Control Center
      // component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3. account is must', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      // component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeFalsy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3. amount is must', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      // component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeFalsy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3. currency is must', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      // component.toFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeFalsy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3. prevent the case that neither cc nor order', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      // component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3. prevent the case that both cc and order', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3. exchange rate is a must for foreign currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue('USD');
      // Exg rate
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3. currencies shall be different (step 2 and step 3 both base currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3. currencies shall be different but one of them must be base currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.fromFormGroup.get('exgControl').setValue(623.23);
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue('EUR');
      // Exg rate
      component.toFormGroup.get('exgControl').setValue(923.34);
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3. shall go to step 4 in valid case (2 is base currency, 3 is foreign currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.toFormGroup.get('exgControl').setValue(634.45);
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(3);

      expect(fetchPreviousDocSpy).toHaveBeenCalledWith('USD');
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);

      flush();
    }));

    it('step 3. shall go to step 4 in valid case (2 is foreign currency, 3 is base currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(100);
      // Currency
      component.fromFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.fromFormGroup.get('exgControl').setValue(623.34);
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // component.toFormGroup.get('exgControl').setValue(634.45);
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(3);

      expect(fetchPreviousDocSpy).toHaveBeenCalledWith('USD');
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);

      flush();
    }));

    it('step 4. shall load the previous docs (2 is base currency, 3 is foreign currency)', fakeAsync(() => {
      let arprvdocs: DocumentWithPlanExgRate[] = [];
      for (let j: number = 0; j < 5; j++) {
        let pdoc: DocumentWithPlanExgRate = new DocumentWithPlanExgRate();
        pdoc.Desp = `test${j + 1}`;
        pdoc.DocID = j + 1;
        pdoc.ExgRate = 622.2;
        pdoc.ExgRate_Plan = true;
        pdoc.TranCurr = 'USD';
        pdoc.TranDate = moment().subtract(1, 'M').add(j + 1, 'w');
        arprvdocs.push(pdoc);
      }
      fetchPreviousDocSpy.and.returnValue(asyncData(arprvdocs));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(634.45);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.toFormGroup.get('exgControl').setValue(634.45);
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      tick(); // Let's the fetch document complete;
      fixture.detectChanges();

      // Step 4.
      expect(component._stepper.selectedIndex).toBe(3);
      expect(fetchPreviousDocSpy).toHaveBeenCalled();
      expect(component.dataSource.data.length).toBeGreaterThan(3);
    }));

    it('step 4. shall popup a dialog if failed to fetch previous docs (2 is base currency, 3 is foreign currency)', fakeAsync(() => {
      fetchPreviousDocSpy.and.returnValue(asyncError('Server 500 error'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(634.45);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.toFormGroup.get('exgControl').setValue(634.45);
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      tick(); // Let's the fetch document complete;
      fixture.detectChanges();

      // Step 4.
      expect(component._stepper.selectedIndex).toBe(3);

      // Expect there is popup dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      // And, there shall no changes in the selected tab
      expect(component._stepper.selectedIndex).toBe(3);

      flush();
    }));
  });

  describe('4. submit and its sequence', () => {
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

      let rtndoc: Document = new Document();
      rtndoc.Id = 120;
      createDocumentSpy.and.returnValue(asyncData(rtndoc));

      let arprvdocs: DocumentWithPlanExgRate[] = [];
      for (let j: number = 0; j < 5; j++) {
        let pdoc: DocumentWithPlanExgRate = new DocumentWithPlanExgRate();
        pdoc.Desp = `test${j + 1}`;
        pdoc.DocID = j + 1;
        pdoc.ExgRate = 622.2;
        pdoc.ExgRate_Plan = true;
        pdoc.TranCurr = 'USD';
        pdoc.TranDate = moment().subtract(1, 'M').add(j + 1, 'w');
        arprvdocs.push(pdoc);
      }
      fetchPreviousDocSpy.and.returnValue(asyncData(arprvdocs));
      updatePreviousDocSpy.and.returnValue(asyncData({}));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall popup error dialog if failed in document checking - amount (2 is base currency, 3 is foreign currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(600);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.toFormGroup.get('exgControl').setValue(634.45);
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(3);

      // Step 4.
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[3].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(4);

      // Step 5.
      component.onSubmit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a pop-up dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      // And, there shall no changes in the selected tab
      expect(component._stepper.selectedIndex).toBe(4);

      flush();
    }));

    it('shall popup error dialog if failed in document checking - others (2 is base currency, 3 is foreign currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(634.45);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.toFormGroup.get('exgControl').setValue(634.45);
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(3);

      // Step 4.
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[3].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(4);

      // Step 5.
      component.arTranTypes = []; // Ensure check failed
      component.onSubmit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a pop-up dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      // And, there shall no changes in the selected tab
      expect(component._stepper.selectedIndex).toBe(4);

      flush();
    }));

    it('submit shall work without prv docs (2 is base currency, 3 is foreign currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(634.45);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.toFormGroup.get('exgControl').setValue(634.45);
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(3);

      // Step 4.
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[3].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(4);

      // Step 5.
      component.onSubmit();
      expect(createDocumentSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container');
      expect(messageElement.textContent).not.toBeNull();

      // Then, after the snackbar disappear, expect navigate!
      tick(2000);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/display/120']);

      flush();
    }));

    it('submit shall work with prv docs (2 is base currency, 3 is foreign currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(634.45);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.toFormGroup.get('exgControl').setValue(634.45);
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      tick(); // Let's the fetch document complete;
      fixture.detectChanges();

      // Step 4.
      expect(component._stepper.selectedIndex).toBe(3);
      expect(fetchPreviousDocSpy).toHaveBeenCalled();
      expect(component.dataSource.data.length).toBeGreaterThan(3);

      // Select doc
      // Cannot simulate the checkbox behavior because there are other columns as checkbox
      component.selection.select(component.dataSource.data[0]);
      // let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      // expect(chkboxes.length).toBeGreaterThan(3);
      // (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      fixture.detectChanges();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[3].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(4);

      // Step 5.
      component.onSubmit();
      expect(createDocumentSpy).toHaveBeenCalled();
      tick(); // createDoc complete
      fixture.detectChanges();
      tick(); // Update prv docs work
      fixture.detectChanges();

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container');
      expect(messageElement.textContent).not.toBeNull();

      // Then, after the snackbar disappear, expect navigate!
      tick(2000);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/display/120']);

      flush();
    }));

    it('submit popup error dialog if create doc success but failed update prv docs (2 is base currency, 3 is foreign currency)', fakeAsync(() => {
      updatePreviousDocSpy.and.returnValue(asyncError('Server 500 error'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(634.45);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.toFormGroup.get('exgControl').setValue(634.45);
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      tick(); // Let's the fetch document complete;
      fixture.detectChanges();

      // Step 4.
      expect(component._stepper.selectedIndex).toBe(3);
      // Select doc
      // Cannot simulate the checkbox behavior because there are other columns as checkbox
      component.selection.select(component.dataSource.data[0]);
      fixture.detectChanges();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[3].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(4);

      // Step 5.
      component.onSubmit();
      expect(createDocumentSpy).toHaveBeenCalled();
      tick(); // createDoc complete
      fixture.detectChanges();
      expect(updatePreviousDocSpy).toHaveBeenCalled();
      tick(); // Update prv docs work
      fixture.detectChanges();

      // Expect there is a pop-up dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush(); // Close the dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      tick(); // Let's wait a tick
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/display/120']);

      flush();
    }));

    it('shall popup error dialog if createDocument service failed (2 is base currency, 3 is foreign currency)', fakeAsync(() => {
      createDocumentSpy.and.returnValue(asyncError('Doc Created Failed!'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      // Tran. date - default
      // Desp
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Account
      component.fromFormGroup.get('accountControl').setValue(11);
      // Amount
      component.fromFormGroup.get('amountControl').setValue(634.45);
      // Currency
      component.fromFormGroup.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      // Exg rate
      // Control Center
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.fromFormGroup.valid).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3.
      // Account
      component.toFormGroup.get('accountControl').setValue(11);
      // Amount
      component.toFormGroup.get('amountControl').setValue(100);
      // Currency
      component.toFormGroup.get('currControl').setValue('USD');
      // Exg rate
      component.toFormGroup.get('exgControl').setValue(634.45);
      // Control Center
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      // component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      // Update UI
      fixture.detectChanges();

      expect(component.toFormGroup.valid).toBeTruthy();
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(3);

      // Step 4.
      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[3].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(4);

      // Step 5.
      component.onSubmit();
      fixture.detectChanges();
      expect(createDocumentSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is a pop-up dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      // And, there shall no changes in the selected tab
      expect(component._stepper.selectedIndex).toBe(4);

      flush();
    }));
  });
});
