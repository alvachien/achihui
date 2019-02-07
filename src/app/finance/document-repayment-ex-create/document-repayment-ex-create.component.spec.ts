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
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MatStepperNext, MatStepperPrevious, MatCheckbox,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { DocumentRepaymentExCreateComponent } from './document-repayment-ex-create.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { store } from '@angular/core/src/render3';
import { UIAccountForSelection, financeAccountCategoryBorrowFrom, Account, Document, AccountExtraLoan, } from 'app/model';

describe('DocumentRepaymentExCreateComponent', () => {
  let component: DocumentRepaymentExCreateComponent;
  let fixture: ComponentFixture<DocumentRepaymentExCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllOrdersSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllCurrenciesSpy: any;
  let routerSpy: any;
  let createRepayDocSpy: any;
  let readAccountSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
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
      'createLoanRepayDoc',
      'readAccount',
    ]);
    fetchAllAccountCategoriesSpy = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = stroageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = stroageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = stroageService.fetchAllControlCenters.and.returnValue(of([]));
    createRepayDocSpy = stroageService.createLoanRepayDoc.and.returnValue(of({}));
    readAccountSpy = stroageService.readAccount.and.returnValue(of({}));
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
        MessageDialogComponent,
        DocumentRepaymentExCreateComponent,
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
    fixture = TestBed.createComponent(DocumentRepaymentExCreateComponent);
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

  describe('3. should prevent errors by the checking logic', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let loanAccount: UIAccountForSelection;

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

      readAccountSpy.and.returnValue(asyncData(fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      })));
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

      expect(component.tranCurrency).toEqual(fakeData.chosedHome.BaseCurrency);
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Also, the date shall be inputted
      expect(component.tranDate).toBeTruthy();
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

    it('step 1: account is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Tran date - default
      // Account
      // component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.firstStepCompleted).toBeFalsy();
      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: desp is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.CategoryId === financeAccountCategoryBorrowFrom;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      // component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.firstStepCompleted).toBeFalsy();

      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: exchange rate is required for foreign currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.CategoryId === financeAccountCategoryBorrowFrom;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      component.firstFormGroup.get('currControl').setValue('USD');
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('#exgrate'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#exgrate_plan'))).toBeTruthy();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeFalsy();

      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: shall go to step 2 in valid case (base currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.CategoryId === financeAccountCategoryBorrowFrom;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      expect(readAccountSpy).toHaveBeenCalled();

      flush();
    }));

    it('step 1: shall go to step 2 in valid case (foreign currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.CategoryId === financeAccountCategoryBorrowFrom;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      component.firstFormGroup.get('currControl').setValue('USD');
      // Exchange rate
      component.firstFormGroup.get('exgControl').setValue(643.23);
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      expect(readAccountSpy).toHaveBeenCalled();

      flush();
    }));

    it('step 2: should load Loan account', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      tick();
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();
      expect(component.dataSource.data.length).toBeGreaterThan(0);
      expect(component.loanStepCompleted).toBeFalsy();
    }));

    it('step 2: should show a snackbar if Loan account read failed', fakeAsync(() => {
      readAccountSpy.and.returnValue(asyncError('account read failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      tick();
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();

      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('account read failed',
        'Expected snack bar to show the error message: account read failed');
      tick(2000); // Close the snackbar
      flush();

      expect(component.dataSource.data.length).toEqual(0);
      expect(component.loanStepCompleted).toBeFalsy();
    }));

    it('step 2: should read the same account only once', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      expect(readAccountSpy).toHaveBeenCalledTimes(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      tick();
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalledTimes(1);

      // Now go back to step 1
      let prvButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperPrevious))[0].nativeElement;
      prvButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);

      // Then clik on next button again
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      expect(readAccountSpy).toHaveBeenCalledTimes(1); // Shall not read account again
    }));

    it('step 2: should read another loan account if it has been changed in step 1', fakeAsync(() => {
      readAccountSpy.withArgs(22).and.returnValue(asyncData(fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      })));
      readAccountSpy.withArgs(23).and.returnValue(asyncData(fakeData.finAccounts.find((val: Account) => {
        return val.Id === 23;
      })));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      expect(readAccountSpy).toHaveBeenCalledTimes(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      tick();
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalledTimes(1);

      // Now go back to step 1
      let prvButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperPrevious))[0].nativeElement;
      prvButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);

      // Change the account
      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 23;
      });
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      fixture.detectChanges();
      expect(component.firstStepCompleted).toBeTruthy();
      expect(readAccountSpy).toHaveBeenCalledTimes(1); // Shall not read account again

      // Then clik on next button again
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      expect(readAccountSpy).toHaveBeenCalledTimes(2); // Shall not read account again
      // expect(component.dataSource.data.length).toEqual(fakeData.finAccounts.findIndex((acnt: Account) => {
      //   return acnt.Id === 23;
      // }));
    }));

    it('step 2: should not allow zero selections of tmp docs', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      tick();
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Select nothing!
      expect(component.loanStepCompleted).toBeFalsy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should not allow multiple selections of tmp docs', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      tick();
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Now try to select multiple items
      let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(chkboxes.length).toBeGreaterThan(3);
      let checkboxInstance: MatCheckbox = chkboxes[1].componentInstance;
      checkboxInstance.toggle();
      fixture.detectChanges();
      checkboxInstance = chkboxes[2].componentInstance;
      checkboxInstance.toggle();
      fixture.detectChanges();
      // (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      // (<HTMLInputElement>chkboxes[2].nativeElement.querySelector('input')).click();
      // // component.masterToggle();
      fixture.detectChanges();

      expect(component.loanStepCompleted).toBeFalsy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should go to step 3 if only one tmp docs selected', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      expect(component._stepper.selectedIndex).toBe(0);
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      tick();
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Now try to select only a single item
      let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(chkboxes.length).toBeGreaterThan(3);
      (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      fixture.detectChanges();

      expect(component.loanStepCompleted).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3: should not allow go to step 4 if no paying account', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Now try to select only a single item
      let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(chkboxes.length).toBeGreaterThan(3);
      (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      fixture.detectChanges();
      expect(component.loanStepCompleted).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3:
      expect(component.payingStepCompleted).toBeFalsy();

      // Click on next button shall not work
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3: should not allow go to step 4 if paying account row has not account info', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Now try to select only a single item
      let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(chkboxes.length).toBeGreaterThan(3);
      (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      fixture.detectChanges();
      expect(component.loanStepCompleted).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3:
      expect(component.payingStepCompleted).toBeFalsy();
      component.onCreatePayingAccount();
      fixture.detectChanges();
      // Assign values to the paying account info
      let arPayAcnt: any[] = component.dataSourcePayingAccount.data.slice();
      // arPayAcnt[0].accountID = 11; 
      arPayAcnt[0].amount = 10;
      component.dataSourcePayingAccount.data = arPayAcnt;
      fixture.detectChanges();
      expect(component.payingStepCompleted).toBeFalsy();

      // Click on next button shall not work
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3: should not allow go to step 4 if paying account row has not amount', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Now try to select only a single item
      let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(chkboxes.length).toBeGreaterThan(3);
      (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      fixture.detectChanges();
      expect(component.loanStepCompleted).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3:
      expect(component.payingStepCompleted).toBeFalsy();
      component.onCreatePayingAccount();
      fixture.detectChanges();
      // Assign values to the paying account info
      let arPayAcnt: any[] = component.dataSourcePayingAccount.data.slice();
      arPayAcnt[0].accountID = 11; 
      // arPayAcnt[0].amount = 10;
      component.dataSourcePayingAccount.data = arPayAcnt;
      fixture.detectChanges();
      expect(component.payingStepCompleted).toBeFalsy();

      // Click on next button shall not work
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3: should not allow go to step 4 if paying amount not equal to total amount', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Now try to select only a single item
      let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(chkboxes.length).toBeGreaterThan(3);
      (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      fixture.detectChanges();
      expect(component.loanStepCompleted).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3:
      expect(component.payingStepCompleted).toBeFalsy();
      component.onCreatePayingAccount();
      fixture.detectChanges();
      // Assign values to the paying account info
      let arPayAcnt: any[] = component.dataSourcePayingAccount.data.slice();
      arPayAcnt[0].accountID = 11; 
      arPayAcnt[0].amount = 10;
      component.dataSourcePayingAccount.data = arPayAcnt;
      fixture.detectChanges();
      expect(component.payingStepCompleted).toBeFalsy();

      // Click on next button shall not work
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);
    }));

    it('step 3: should allow to step 4 if paying accounts inputted properly', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Now try to select only a single item
      let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(chkboxes.length).toBeGreaterThan(3);
      (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      fixture.detectChanges();
      expect(component.loanStepCompleted).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3:
      expect(component.payingStepCompleted).toBeFalsy();
      component.onCreatePayingAccount();
      fixture.detectChanges();
      // Assign values to the paying account info
      let arPayAcnt: any[] = component.dataSourcePayingAccount.data.slice();
      arPayAcnt[0].accountID = 11; 
      arPayAcnt[0].amount = component.totalAmount;
      component.dataSourcePayingAccount.data = arPayAcnt;
      fixture.detectChanges();
      expect(component.payingStepCompleted).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(3);
    }));
  });

  describe('4. Submit and its subsequence', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let loanAccount: UIAccountForSelection;

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

      readAccountSpy.and.returnValue(asyncData(fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      })));

      let rtndoc: Document = new Document();
      rtndoc.Id = 100;
      createRepayDocSpy.and.returnValue(asyncData(rtndoc));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should popup dialog if failed in document checking (base currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Now try to select only a single item
      let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(chkboxes.length).toBeGreaterThan(3);
      (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      fixture.detectChanges();
      expect(component.loanStepCompleted).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3:
      expect(component.payingStepCompleted).toBeFalsy();
      component.onCreatePayingAccount();
      fixture.detectChanges();
      // Assign values to the paying account info
      let arPayAcnt: any[] = component.dataSourcePayingAccount.data.slice();
      arPayAcnt[0].accountID = 11; 
      arPayAcnt[0].amount = component.totalAmount;
      component.dataSourcePayingAccount.data = arPayAcnt;
      fixture.detectChanges();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(3);

      // Submit
      component.arAccounts = []; // Ensure the check will fail!
      component.onSubmit();
      fixture.detectChanges();
      expect(createRepayDocSpy).not.toHaveBeenCalled();
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

    it('should handle create success case with navigate to display (base currency)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Now try to select only a single item
      let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(chkboxes.length).toBeGreaterThan(3);
      (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      fixture.detectChanges();
      expect(component.loanStepCompleted).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3:
      expect(component.payingStepCompleted).toBeFalsy();
      component.onCreatePayingAccount();
      fixture.detectChanges();
      // Assign values to the paying account info
      let arPayAcnt: any[] = component.dataSourcePayingAccount.data.slice();
      arPayAcnt[0].accountID = 11; 
      arPayAcnt[0].amount = component.totalAmount;
      component.dataSourcePayingAccount.data = arPayAcnt;
      fixture.detectChanges();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(3);

      // Submit
      component.onSubmit();
      fixture.detectChanges();
      expect(createRepayDocSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container');
      expect(messageElement.textContent).not.toBeNull();

      // Then, after the snackbar disappear, expect navigate!
      tick(2000);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/display/100']);

      flush();
    }));

    it('should handle create failed case with a popup dialog (base currency)', fakeAsync(() => {
      createRepayDocSpy.and.returnValue(asyncError('Doc Created Failed!'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Now try to select only a single item
      let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(chkboxes.length).toBeGreaterThan(3);
      (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      fixture.detectChanges();
      expect(component.loanStepCompleted).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3:
      expect(component.payingStepCompleted).toBeFalsy();
      component.onCreatePayingAccount();
      fixture.detectChanges();
      // Assign values to the paying account info
      let arPayAcnt: any[] = component.dataSourcePayingAccount.data.slice();
      arPayAcnt[0].accountID = 11; 
      arPayAcnt[0].amount = component.totalAmount;
      component.dataSourcePayingAccount.data = arPayAcnt;
      fixture.detectChanges();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[2].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(3);

      // Submit
      component.onSubmit();
      fixture.detectChanges();
      expect(createRepayDocSpy).toHaveBeenCalled();
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
  });

  describe('5. variable in uistatus (navigate from dashboard)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let loanAccount: UIAccountForSelection;
    let uiService: UIStatusService;

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

      readAccountSpy.and.returnValue(asyncData(fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      })));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    beforeEach(inject([UIStatusService],
      (oc: UIStatusService) => {
      uiService = oc;

      // Set the template doc
      uiService.currentTemplateLoanDoc = (fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      }).ExtraInfo as AccountExtraLoan).loanTmpDocs[0];
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should load the data in ngOnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // For reading account
      fixture.detectChanges();
      expect(component.firstFormGroup.get('accountControl').value).not.toBeUndefined();

      expect(readAccountSpy).toHaveBeenCalled();
      expect(component.selectionTmpDoc.selected.length).toEqual(1);
    }));
  });

  describe('6. reset shall work', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let loanAccount: UIAccountForSelection;

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

      readAccountSpy.and.returnValue(asyncData(fakeData.finAccounts.find((val: Account) => {
        return val.Id === 22;
      })));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('reset shall work', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      loanAccount = component.arUIAccount.find((val: UIAccountForSelection) => {
        return val.Id === 22;
      });
      // Tran date - default
      // Account
      component.firstFormGroup.get('accountControl').setValue(loanAccount);
      // Currency - default
      // Exchange rate
      // Exchange rate plan
      // Desp
      component.firstFormGroup.get('despControl').setValue('test');

      fixture.detectChanges();
      expect(component.firstStepCompleted).toBeTruthy();

      // Click on next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // Now try to select only a single item
      let chkboxes: any = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(chkboxes.length).toBeGreaterThan(3);
      (<HTMLInputElement>chkboxes[1].nativeElement.querySelector('input')).click();
      fixture.detectChanges();
      expect(component.loanStepCompleted).toBeTruthy();

      // Click on next button
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(2);

      // Step 3:
      expect(component.payingStepCompleted).toBeFalsy();
      component.onCreatePayingAccount();
      fixture.detectChanges();
      // Assign values to the paying account info
      let arPayAcnt: any[] = component.dataSourcePayingAccount.data.slice();
      arPayAcnt[0].accountID = 11; 
      arPayAcnt[0].amount = component.totalAmount;
      component.dataSourcePayingAccount.data = arPayAcnt;
      fixture.detectChanges();
      expect(component.payingStepCompleted).toBeTruthy();

      // Now do the reset
      component.onReset();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toBe(0);
      expect(component.dataSource.data.length).toEqual(0);
      expect(component.dataSourcePayingAccount.data.length).toEqual(0);
      expect(component.loanAccount).toBeUndefined();

      // Expect default values
      expect(component.firstFormGroup.get('currControl').value).toEqual(fakeData.chosedHome.BaseCurrency);
      expect(component.firstFormGroup.get('dateControl').value).not.toBeUndefined();
    }));
  });
});
