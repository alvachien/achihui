import { async, ComponentFixture, TestBed, tick, flush, inject, fakeAsync, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
  MatStepperNext, } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { UIMode, UserAuthInfo, Account, AccountExtraLoan, Document, } from '../../model';
import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { DocumentLoanCreateComponent } from './document-loan-create.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService,
  AuthService } from 'app/services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { AccountExtLoanExComponent } from '../account-ext-loan-ex';
import { DocumentHeaderComponent } from '../document-header';

describe('DocumentLoanCreateComponent', () => {
  let component: DocumentLoanCreateComponent;
  let fixture: ComponentFixture<DocumentLoanCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllOrdersSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllCurrenciesSpy: any;
  let routerSpy: any;
  let activatedRouteStub: any;
  let createDocSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
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
      'createLoanDocument',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    createDocSpy = storageService.createLoanDocument.and.returnValue(of({}));
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('createbrwfrm', {})] as UrlSegment[]);
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
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
        AccountExtLoanExComponent,
        DocumentLoanCreateComponent,
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
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLoanCreateComponent);
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

      fixture.detectChanges();
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
      tick(); // Complete the Observables in ngOnInit

      // tick();
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
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));

    it('step 1: should have accounts and others loaded (createbrwfrm)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      expect(component.arUIAccount.length).toEqual(0);
      expect(component.arUIOrder.length).toEqual(0);

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.arUIAccount.length).toBeGreaterThan(0);
      expect(component.arUIOrder.length).toBeGreaterThan(0);
    }));

    it('step 1: should have accounts and others loaded (createlendto)', fakeAsync(() => {
      activatedRouteStub.setURL([new UrlSegment('createlendto', {})] as UrlSegment[]);

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
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      // component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy('Amount is missing');

      // Click the next button, not working!
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
    }));

    it('step 1: Account is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      // component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy('Account is missing');

      // Click the next button, not working!
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
    }));

    it('step 1: shall not allow input control center and order both', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // CC
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);

      fixture.detectChanges();

      component.firstFormGroup.updateValueAndValidity();
      expect(component.firstFormGroup.valid).toBeFalsy('not allow input control center and order both');

      // Click the next button - no work!
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: shall not allow neither control center nor order case', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // Control center
      // component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order

      component.firstFormGroup.updateValueAndValidity();
      expect(component.firstFormGroup.valid).toBeFalsy('not allow neither control center nor order');

      // Click the next button - no work!
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: shall go to step 2 for base currency case', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 1: shall go to step 2 for foreign currency case', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = 'USD';
      curdoc.ExgRate = 645.23;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: shall not allow go to step 3 for invalid account', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      // Input nothing!
      expect(component.extraFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: shall allow go to step 3 for valid account', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      let loanAccount: AccountExtraLoan = fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      }).ExtraInfo as AccountExtraLoan;
      component.extraFormGroup.get('loanAccountControl').setValue(loanAccount);
      component.extraFormGroup.get('loanAccountControl').updateValueAndValidity();
      component.extraFormGroup.updateValueAndValidity();
      fixture.detectChanges();
      expect(component.extraFormGroup.valid).toBeTruthy();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));
  });

  describe('4. submit and its subsequnce', () => {
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

      let docObj: Document = new Document();
      docObj.Id = 100;
      createDocSpy.and.returnValue(asyncData(docObj));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall popup dialog if failed in checking', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      let loanAccount: AccountExtraLoan = fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      }).ExtraInfo as AccountExtraLoan;
      component.extraFormGroup.get('loanAccountControl').setValue(loanAccount);
      component.extraFormGroup.get('loanAccountControl').updateValueAndValidity();
      fixture.detectChanges();
      expect(component.extraFormGroup.valid).toBeTruthy();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      component.arTranTypes = []; // Ensure check failed
      component.onSubmit();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      let btnElement: HTMLElement = overlayContainerElement.querySelector('button') as HTMLElement;
      if (btnElement) {
        btnElement.click();
        fixture.detectChanges();
        flush();
      }
    }));

    it('shall work in success case', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      let loanAccount: AccountExtraLoan = fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      }).ExtraInfo as AccountExtraLoan;
      component.extraFormGroup.get('loanAccountControl').setValue(loanAccount);
      component.extraFormGroup.get('loanAccountControl').updateValueAndValidity();
      fixture.detectChanges();
      expect(component.extraFormGroup.valid).toBeTruthy();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

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
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/display/100']);

      flush();
    }));

    it('shall handle recreate button in success case', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      let loanAccount: AccountExtraLoan = fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      }).ExtraInfo as AccountExtraLoan;
      component.extraFormGroup.get('loanAccountControl').setValue(loanAccount);
      component.extraFormGroup.get('loanAccountControl').updateValueAndValidity();
      fixture.detectChanges();
      expect(component.extraFormGroup.valid).toBeTruthy();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      component.onSubmit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(createDocSpy).toHaveBeenCalled();

      // Expect there is snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container');
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

    it('shall popup dialog for fail case', fakeAsync(() => {
      createDocSpy.and.returnValue(asyncError('Doc Created Failed!'));

      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100000);
      // Account
      component.firstFormGroup.get('accountControl').setValue(11); // Cash
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      let loanAccount: AccountExtraLoan = fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      }).ExtraInfo as AccountExtraLoan;
      component.extraFormGroup.get('loanAccountControl').setValue(loanAccount);
      component.extraFormGroup.get('loanAccountControl').updateValueAndValidity();
      fixture.detectChanges();
      expect(component.extraFormGroup.valid).toBeTruthy();

      // Click the next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      component.onSubmit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a pop-up dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button.message-dialog-button-ok') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      // And, there shall no changes in the selected tab - review step
      expect(component._stepper.selectedIndex).toBe(2);

      flush();
    }));
  });
});
