import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject } from '@angular/core/testing';
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
  MatStepperNext,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';

import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIOrderValidFilterExPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { DocumentTransferCreateComponent } from './document-transfer-create.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { Document, DocumentItem, financeDocTypeTransfer, financeTranTypeTransferOut,
  financeTranTypeTransferIn, } from '../../model';
import { DocumentHeaderComponent } from '../document-header';

describe('DocumentTransferCreateComponent', () => {
  let component: DocumentTransferCreateComponent;
  let fixture: ComponentFixture<DocumentTransferCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllOrdersSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllCurrenciesSpy: any;
  let createDocSpy: any;
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
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'createDocument',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    createDocSpy = storageService.createDocument.and.returnValue(of({}));
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
        DocumentTransferCreateComponent,
        MessageDialogComponent,
        DocumentHeaderComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinCurrencyService, useValue: currService },
        { provide: FinanceStorageService, useValue: storageService },
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
    fixture = TestBed.createComponent(DocumentTransferCreateComponent);
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

    it('step 1: should set the default values: base currency, date, and so on', fakeAsync(() => {
      expect(component.headerFormGroup.valid).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));

    it('step 1: should have accounts and orders loaded', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      expect(component.arUIAccount.length).toEqual(0);
      expect(component.arUIOrder.length).toEqual(0);

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.arUIAccount.length).toBeGreaterThan(0);
      expect(component.arUIOrder.length).toBeGreaterThan(0);
    }));

    it('step 1: amount is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      expect(component.arUIAccount.length).toEqual(0);
      expect(component.arUIOrder.length).toEqual(0);

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.updateValueAndValidity();
      expect(component.headerFormGroup.valid).toBeFalsy('Expect header form is invalid because amount is missing');
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: shall go to step 2 for base currency case', fakeAsync(() => {
      expect(component.headerFormGroup.valid).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 1: shall go to step 2 for foreign currency case', fakeAsync(() => {
      expect(component.headerFormGroup.valid).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = 'USD';
      curdoc.ExgRate = 653.33;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: account is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component._stepper.selectedIndex).toBe(1);

      // However, it is invalid
      expect(component.fromFormGroup.valid).toBeFalsy();

      // Click the next button, still at second step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(1);
    }));

    // Step 2: Asset account should not allowed
    // Step 2: ADP account should not allowed

    it('step 2: neither control center nor order', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(100);
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component._stepper.selectedIndex).toBe(1);

      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      fixture.detectChanges();

      // However, it is invalid
      expect(component.fromFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: control center and order both', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component._stepper.selectedIndex).toBe(1);

      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      fixture.detectChanges();

      // However, it is invalid
      expect(component.fromFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 3: account is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component._stepper.selectedIndex).toBe(1);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component._stepper.selectedIndex).toBe(2);
      expect(component.toFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3: to account shall not identical as from account', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header form');
      component.headerFormGroup.updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(100);
      expect(component.headerFormGroup.valid).toBeTruthy('Expect a valid header step');
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component._stepper.selectedIndex).toBe(1, 'Expect the stepper is now in From Step');
      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component._stepper.selectedIndex).toBe(2);
      component.toFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.toFormGroup.updateValueAndValidity();
      expect(component.toFormGroup.valid).toBeFalsy('Expect the from account and to account are not the same');

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    // Step 3: Asset account should not allowed
    // Step 3: ADP account should not allowed

    it('step 3: neither control center nor order', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component._stepper.selectedIndex).toBe(1);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component._stepper.selectedIndex).toBe(2);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      fixture.detectChanges();
      expect(component.toFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3: control center and order both', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(100);
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component._stepper.selectedIndex).toBe(1);

      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component._stepper.selectedIndex).toBe(2);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      fixture.detectChanges();
      expect(component.toFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));
  });

  xdescribe('4. Account filter in from step', () => {
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
  });
  xdescribe('5. Order filter in from step', () => {
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
  });
  xdescribe('6. Account filter in to step', () => {
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
  });
  xdescribe('7. Order filter in to step', () => {
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
  });

  describe('8. Submit and its subsequences', () => {
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

      // Create document
      let doc: Document = new Document();
      doc.Id = 100;
      doc.DocType = financeDocTypeTransfer;
      doc.Desp = 'Transfer test';
      doc.TranCurr = fakeData.chosedHome.BaseCurrency;
      doc.TranDate = moment();
      let ditem1: DocumentItem = new DocumentItem();
      ditem1.ItemId = 1;
      ditem1.AccountId = fakeData.finAccounts[0].Id;
      ditem1.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem1.TranType = financeTranTypeTransferOut;
      ditem1.Desp = 'From';
      ditem1.TranAmount = 220;
      let ditem2: DocumentItem = new DocumentItem();
      ditem2.ItemId = 2;
      ditem2.AccountId = fakeData.finAccounts[1].Id;
      ditem2.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem2.TranType = financeTranTypeTransferIn;
      ditem2.Desp = 'To';
      ditem2.TranAmount = 220;
      doc.Items = [ditem1, ditem2];
      fakeData.setFinTransferDocumentForCreate(doc);

      createDocSpy.and.returnValue(asyncData(fakeData.finTransferDocumentForCreate));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should handle checking failed case with a popup dialog', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the header step
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].TranAmount);
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      // Click the next button > from step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the From step
      expect(component._stepper.selectedIndex).toBe(1);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].AccountId);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].ControlCenterId);
      fixture.detectChanges();
      // Then, click the next button > To step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the To step
      expect(component._stepper.selectedIndex).toBe(2);
      component.toFormGroup.get('accountControl').setValue(fakeData.finTransferDocumentForCreate.Items[1].AccountId);
      component.toFormGroup.get('ccControl').setValue(fakeData.finTransferDocumentForCreate.Items[1].ControlCenterId);
      component.toFormGroup.updateValueAndValidity();
      fixture.detectChanges();
      // Then, click the next button > Review step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now go to submit
      expect(component._stepper.selectedIndex).toBe(3);
      component.arAccounts = []; // Ensure check failed
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
      expect(component._stepper.selectedIndex).toBe(3);

      flush();
    }));

    it('should handle create success case with navigate to display', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the header step
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].TranAmount);
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the From step
      expect(component._stepper.selectedIndex).toBe(1);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].AccountId);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].ControlCenterId);
      fixture.detectChanges();
      // Then, click the next button > To step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the To step
      expect(component._stepper.selectedIndex).toBe(2);
      component.toFormGroup.get('accountControl').setValue(fakeData.finTransferDocumentForCreate.Items[1].AccountId);
      component.toFormGroup.get('ccControl').setValue(fakeData.finTransferDocumentForCreate.Items[1].ControlCenterId);
      component.toFormGroup.updateValueAndValidity();
      fixture.detectChanges();
      // Then, click the next button > Review step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now go to submit
      expect(component._stepper.selectedIndex).toBe(3);
      component.onSubmit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(createDocSpy).toHaveBeenCalled();

      // Expect there is snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container');
      expect(messageElement.textContent).not.toBeNull();

      // Then, after the snackbar disappear, expect navigate!
      tick(2000);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/display/' + fakeData.finTransferDocumentForCreate.Id.toString()]);

      flush();
    }));

    it('should handle create success case with recreate', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the header step
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].TranAmount);
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the From step
      expect(component._stepper.selectedIndex).toBe(1);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].AccountId);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].ControlCenterId);
      fixture.detectChanges();
      // Then, click the next button > To step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the To step
      expect(component._stepper.selectedIndex).toBe(2);
      component.toFormGroup.get('accountControl').setValue(fakeData.finTransferDocumentForCreate.Items[1].AccountId);
      component.toFormGroup.get('ccControl').setValue(fakeData.finTransferDocumentForCreate.Items[1].ControlCenterId);
      component.toFormGroup.updateValueAndValidity();
      fixture.detectChanges();
      // Then, click the next button > Review step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now go to submit
      expect(component._stepper.selectedIndex).toBe(3);
      component.onSubmit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();

      // Then, click the re-create button
      let actionButton: any = overlayContainerElement.querySelector('button.mat-button') as HTMLButtonElement;
      actionButton.click();
      tick(); // onAction has been executed
      fixture.detectChanges();

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      fixture.detectChanges();
      // Check the reset
      expect(component._stepper.selectedIndex).toBe(0);

      flush(); // Empty the call stack
    }));

    it('should handle create failed case with a popup dialog', fakeAsync(() => {
      createDocSpy.and.returnValue(asyncError('Doc Created Failed!'));

      fixture.detectChanges(); // ngOnInit

      // Setup the header step
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].TranAmount);
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the From step
      expect(component._stepper.selectedIndex).toBe(1);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].AccountId);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finTransferDocumentForCreate.Items[0].ControlCenterId);
      fixture.detectChanges();
      // Then, click the next button > To step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the To step
      expect(component._stepper.selectedIndex).toBe(2);
      component.toFormGroup.get('accountControl').setValue(fakeData.finTransferDocumentForCreate.Items[1].AccountId);
      component.toFormGroup.get('ccControl').setValue(fakeData.finTransferDocumentForCreate.Items[1].ControlCenterId);
      component.toFormGroup.updateValueAndValidity();
      fixture.detectChanges();
      // Then, click the next button > Review step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now go to submit
      expect(component._stepper.selectedIndex).toBe(3, 'Expect to the confirm step');
      component.onSubmit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(createDocSpy).toHaveBeenCalled();

      // Expect there is a pop-up dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      // And, there shall no changes in the selected tab - review step
      expect(component._stepper.selectedIndex).toBe(3);

      flush();
    }));
  });

  describe('10. Reset shall work', () => {
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

    it('shall clear all items', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the header step
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(300);
      component.headerFormGroup.updateValueAndValidity();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the From step
      expect(component._stepper.selectedIndex).toBe(1);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();
      // Then, click the next button > To step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the To step
      expect(component._stepper.selectedIndex).toBe(2);
      component.toFormGroup.get('accountControl').setValue(fakeData.finAccounts[1].Id);
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.toFormGroup.updateValueAndValidity();
      fixture.detectChanges();
      // Then, click the next button > Review step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now go to review step
      expect(component._stepper.selectedIndex).toBe(3);
      component.onReset();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(0);

      flush(); // clean
    }));
  });
});
