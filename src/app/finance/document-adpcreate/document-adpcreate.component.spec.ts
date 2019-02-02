import { async, ComponentFixture, TestBed, flush, tick, fakeAsync, inject } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
  MatStepperNext, } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { DocumentADPCreateComponent } from './document-adpcreate.component';
import { UserAuthInfo, Document  } from '../../model';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService,
  AuthService, } from 'app/services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';

@Component({selector: 'hih-finance-account-ext-adp', template: ''})
class AccountExtADPComponent {
  @Input() uiMode: any;
  @Input() extObject: any;
  @Input() tranType: any;
  @Input() tranAmount: any;
  generateAccountInfoForSave(): void {
    // Empty;
  }
}

describe('DocumentADPCreateComponent', () => {
  let component: DocumentADPCreateComponent;
  let fixture: ComponentFixture<DocumentADPCreateComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
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
  let activatedRouteStub: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('createadp', {})] as UrlSegment[]);
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'createADPDocument',
    ]);
    fetchAllAccountCategoriesSpy = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = stroageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = stroageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = stroageService.fetchAllControlCenters.and.returnValue(of([]));
    createDocSpy = stroageService.createADPDocument.and.returnValue(of({}));
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
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
        AccountExtADPComponent,
        DocumentADPCreateComponent,
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
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
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
    fixture = TestBed.createComponent(DocumentADPCreateComponent);
    component = fixture.componentInstance;
  });

  it('1. should create without data', () => {
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
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.TranCurrency).toEqual(fakeData.chosedHome.BaseCurrency);
      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Also, the date shall be inputted
      expect(component.TranDate).toBeTruthy();
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

    it('step 1: account is mandatory', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Input all fields exclude account
      // Tran date - default
      // Tran type
      component.firstFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(200);
      // Currency - default
      // Exchange rate - not need
      // CC or order
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.firstStepCompleted).toBeFalsy();

      // Click the next button - no work!
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: amount is mandatory', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Input all fields exclude amount
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Tran type
      component.firstFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');
      // Currency - default
      // Exchange rate - not need
      // CC or order
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.firstStepCompleted).toBeFalsy();

      // Click the next button - no work!
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: desp is mandatory', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Input all fields exclude desp
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Tran type
      component.firstFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      // Desp
      // component.firstFormGroup.get('despControl').setValue('test');
      // Currency - default
      // Amount
      component.firstFormGroup.get('amountControl').setValue(200);
      // Exchange rate - not need
      // CC or order
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.firstStepCompleted).toBeFalsy();

      // Click the next button - no work!
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: tran. type is mandatory', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Input all fields exclude desp
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Tran type
      // component.firstFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');
      // Currency - default
      // Amount
      component.firstFormGroup.get('amountControl').setValue(200);
      // Exchange rate - not need
      // CC or order
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.firstStepCompleted).toBeFalsy();

      // Click the next button - no work!
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: shall not allow input control center and order both', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Input all fields
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Tran type
      component.firstFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');
      // Currency - default
      // Amount
      component.firstFormGroup.get('amountControl').setValue(200);
      // Exchange rate - not need
      // CC
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      fixture.detectChanges();

      expect(component.firstStepCompleted).toBeFalsy();

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

      // Input all fields
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Tran type
      component.firstFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');
      // Currency - default
      // Amount
      component.firstFormGroup.get('amountControl').setValue(200);
      // Exchange rate - not need
      fixture.detectChanges();

      expect(component.firstStepCompleted).toBeFalsy();

      // Click the next button - no work!
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

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

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Tran type
      component.firstFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(200);
      // Exchange rate - not need
      // CC or order
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();
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

    it('step 1: shall go to step 2 for base currency case', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Tran type
      component.firstFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(200);
      // Exchange rate - not need
      // Order
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();

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

      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Tran type
      component.firstFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(200);
      // Exchange rate - not need
      // Order
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);

      // Input foreign currency
      component.firstFormGroup.get('currControl').setValue('USD');
      component.firstFormGroup.get('exgControl').setValue(654.22);

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(1);
    }));
  });
});
