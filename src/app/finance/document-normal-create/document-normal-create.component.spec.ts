import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MatStepperNext, } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { DocumentNormalCreateComponent } from './document-normal-create.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { Document, DocumentItem, financeDocTypeNormal, UIDisplayStringUtil, UICommonLabelEnum } from 'app/model';

describe('DocumentNormalCreateComponent', () => {
  let component: DocumentNormalCreateComponent;
  let fixture: ComponentFixture<DocumentNormalCreateComponent>;
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

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'createDocument',
    ]);
    fetchAllAccountCategoriesSpy = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = stroageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = stroageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = stroageService.fetchAllControlCenters.and.returnValue(of([]));
    createDocSpy = stroageService.createDocument.and.returnValue(of({}));
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
        DocumentNormalCreateComponent,
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
    fixture = TestBed.createComponent(DocumentNormalCreateComponent);
    component = fixture.componentInstance;
  });

  it('1. should create without data', () => {
    fixture.detectChanges(); // ngOnInit
    expect(component).toBeTruthy();
  });

  describe('2. should prevent errors by the checking logic', () => {
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
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.TranCurrency).toEqual(fakeData.chosedHome.BaseCurrency);
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Also, the date shall be inputted
      expect(component.TranDate).toBeTruthy();
    }));

    it('step 1: should have accounts and others loaded', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      expect(component.arUIAccount.length).toEqual(0);
      expect(component.arUIOrder.length).toEqual(0);

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.arUIAccount.length).toBeGreaterThan(0);
      expect(component.arUIOrder.length).toBeGreaterThan(0);
    }));

    it('step 1: should not allow go to second step if there are failure in first step', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBe(false);
      expect(component.firstStepCompleted).toBe(false);
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: shall show exchange rate for foreign currency', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Input foreign currency
      component.firstFormGroup.get('currControl').setValue('USD');
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('#exgrate'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#exgrate_plan'))).toBeTruthy();
    }));

    it('step 1: shall input exchange rate for foreign currency', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Input foreign currency
      component.firstFormGroup.get('currControl').setValue('USD');
      fixture.detectChanges();

      expect(component.firstStepCompleted).toBeFalsy();

      // Shall not allow go to second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: should go to second step for valid base currency case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      component.firstFormGroup.get('currControl').setValue('USD');
      component.firstFormGroup.get('exgControl').setValue(654.35);
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBe(true);
      expect(component.firstStepCompleted).toBe(true);
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 1: should go to second step for valid foreign currency case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBe(true);
      expect(component.firstStepCompleted).toBe(true);
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should not allow go to third step if there are no items in second step', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Now in step 1
      expect(component._stepper.selectedIndex).toBe(0);

      // On step 1, setup the content
      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 2, click the next button > third step
      expect(component._stepper.selectedIndex).toBe(1);
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // // It shall show a snackbar for error info.
      // let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      // expect(messageElement.textContent).toContain('No items or invalid item detected',
      //   'Expected snack bar to show the error message: No items or invalid item detected');
      // flush();
      // fixture.detectChanges();
      // flush();

      // It shall be stop at step 2.
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should not allow go to third step if there are items without account', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(1);
      // Add item
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allow
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should not allow go third step if there are items without tran. type', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();
      // Add item
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = 11;
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      // ditem.TranType = 2;
      ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allow
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should not allow go third step if there are items without amount', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Add item
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = 11;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allow
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    // Asset account should not allowed

    // ADP account should not allowed

    // System tran type should not allowed

    // Order which not valid in this date shall not allow

    it('step 2: should not allow go third step if item has neither control center nor order', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Add item
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = 11;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      ditem.TranAmount = 200;
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allow
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should not allow go third step if item has control center and order both', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Add item
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = 11;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.OrderId = fakeData.finOrders[0].Id;
      ditem.TranType = 2;
      ditem.TranAmount = 20;
      ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allow
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should not allow go third step if item miss desp', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Add item
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = 11;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.TranAmount = 20;
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allow
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should allow go third step if items are valid', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Add item
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = 11;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      ditem.TranAmount = 20;
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allowed
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    // Reset should work
  });

  describe('3. Exception case handling (async loading)', () => {
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

      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);
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

      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);
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

      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);
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

      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);
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

      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);
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

      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);
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

      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);
      tick(); // Complete the Observables in ngOnInit

      // tick();
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Order service failed',
        'Expected snack bar to show the error message: Order service failed');
      flush();
    }));
  });

  // Add item/Remove item
  describe('4. Items operation', () => {
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

  // 5. Foreign currency handling - DONE.
  // 6. Item tag

  xdescribe('7. Account filter in Items step', () => {
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

  xdescribe('8. Order filter in Items step', () => {
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

  describe('9. Submit and its subsequences', () => {
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
      doc.DocType = financeDocTypeNormal;
      doc.Desp = 'Test';
      doc.TranCurr = fakeData.chosedHome.BaseCurrency;
      doc.TranDate = moment();
      let ditem: DocumentItem = new DocumentItem();
      ditem.ItemId = 1;
      ditem.AccountId = 11;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      ditem.TranAmount = 20;
      doc.Items = [ditem];
      fakeData.setFinNormalDocumentForCreate(doc);

      createDocSpy.and.returnValue(asyncData(fakeData.finNormalDocumentForCreate));
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

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue(fakeData.finNormalDocumentForCreate.Desp);
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Add item
      let ditem: DocumentItem = fakeData.finNormalDocumentForCreate.Items[0];
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now go to submit
      component.arTranType = []; // Ensure check failed
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
      expect(component._stepper.selectedIndex).toBe(2);

      flush();
    }));

    it('should handle create success case with navigate to display', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue(fakeData.finNormalDocumentForCreate.Desp);
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Add item
      let ditem: DocumentItem = fakeData.finNormalDocumentForCreate.Items[0];
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now go to submit
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
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/display/' + fakeData.finNormalDocumentForCreate.Id.toString()]);

      flush();
    }));

    it('should handle create success case with recreate', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue(fakeData.finNormalDocumentForCreate.Desp);
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Add item
      let ditem: DocumentItem = fakeData.finNormalDocumentForCreate.Items[0];
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      flush();
      fixture.detectChanges();

      // Now go to submit
      component.onSubmit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(createDocSpy).toHaveBeenCalled();

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
      expect(component.dataSource.data.length).toEqual(0);
      expect(component.firstFormGroup.get('dateControl').value).not.toBeNull();
      expect(component.firstFormGroup.get('despControl').value).toBeFalsy();
      expect(component.firstFormGroup.get('currControl').value).toEqual(fakeData.chosedHome.BaseCurrency);

      flush(); // Empty the call stack
    }));

    it('should handle create failed case with a popup dialog', fakeAsync(() => {
      createDocSpy.and.returnValue(asyncError('Doc Created Failed!'));

      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue(fakeData.finNormalDocumentForCreate.Desp);
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Add item
      let ditem: DocumentItem = fakeData.finNormalDocumentForCreate.Items[0];
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now go to submit
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

      // And, there shall no changes in the selected tab
      expect(component._stepper.selectedIndex).toBe(2);

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

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue('Test');
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Add item
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = 11;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      ditem.TranAmount = 20;
      component.dataSource.data = [ditem];
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now go to submit
      expect(component._stepper.selectedIndex).toBe(2);
      component.onReset();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(0);
      expect(component.dataSource.data.length).toEqual(0);
      expect(component.firstFormGroup.get('dateControl').value).not.toBeNull();
      expect(component.firstFormGroup.get('despControl').value).toBeFalsy();
      expect(component.firstFormGroup.get('currControl').value).toEqual(fakeData.chosedHome.BaseCurrency);
    }));
  });
});
