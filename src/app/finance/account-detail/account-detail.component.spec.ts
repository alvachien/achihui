import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { MatStepperNext, } from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { AccountDetailComponent } from './account-detail.component';
import { AccountExtADPExComponent } from '../account-ext-adpex';
import { AccountExtAssetExComponent } from '../account-ext-asset-ex';
import { AccountExtLoanExComponent } from '../account-ext-loan-ex';
import { UIMode, financeAccountCategoryCash, financeAccountCategoryAdvancePayment,
  financeAccountCategoryAdvanceReceived, financeAccountCategoryAsset, financeAccountCategoryBorrowFrom,
  financeAccountCategoryLendTo, Account, AccountStatusEnum, AccountExtraLoan,
  AccountExtraAsset, AccountExtraAdvancePayment } from '../../model';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';
import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIAccountCtgyFilterExPipe, } from '../pipes';

describe('AccountDetailComponent', () => {
  let component: AccountDetailComponent;
  let fixture: ComponentFixture<AccountDetailComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let routerSpy: any;
  let activatedRouteStub: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllAssetCtgySpy: any;
  let fetchAllAccountsSpy: any;
  let readAccountSpy: any;
  let createAccountSpy: any;
  let changeAccountSpy: any;
  let updateAccountStatusSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);
    const homeService: Partial<HomeDefDetailService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllAssetCategories',
      'fetchAllAccounts',
      'readAccount',
      'createAccount',
      'changeAccount',
      'updateAccountStatus',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAssetCtgySpy = storageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    readAccountSpy = storageService.readAccount.and.returnValue(of({}));
    createAccountSpy = storageService.createAccount.and.returnValue(of({}));
    changeAccountSpy = storageService.changeAccount.and.returnValue(of({}));
    updateAccountStatusSpy = storageService.updateAccountStatus.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        MatMomentDateModule,
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
        AccountExtADPExComponent,
        AccountExtAssetExComponent,
        AccountExtLoanExComponent,
        AccountDetailComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: FinanceStorageService, useValue: storageService },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDetailComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  it('1. should be created without data', () => {
    expect(component).toBeTruthy();
  });

  describe('2. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAssetCtgySpy.and.returnValue(asyncData(fakeData.finAssetCategories));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display error when account category service fails', fakeAsync(() => {
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

    it('2. should display error when asset category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Asset category service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Asset category service failed',
        'Expected snack bar to show the error message: Asset category service failed');
      flush();
    }));
  });

  describe('Create mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAssetCtgySpy.and.returnValue(asyncData(fakeData.finAssetCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      createAccountSpy.and.returnValue(asyncData(fakeData.finAccounts[0]));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('step 1: name is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      // component.firstFormGroup.get('nameControl').setValue('test');
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.firstStepCompleted).toBeFalsy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();

      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));
    it('step 1: category is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      // component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.firstStepCompleted).toBeFalsy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();

      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));
    it('step 1: category - Advance payment is not supported', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryAdvancePayment);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeFalsy();

      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));
    it('step 1: category - Advance received is not supported', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryAdvanceReceived);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeFalsy();

      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));
    it('step 1: category - Asset is not supported', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryAsset);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeFalsy();

      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));
    it('step 1: category - Borrow from is not supported', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryBorrowFrom);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeFalsy();

      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));
    it('step 1: category - Lend to is not supported', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryLendTo);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeFalsy();

      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));
    it('step 1: shall go to step 2 in valid case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();

      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(1); // At second step page
    }));
    it('step 2: shall go to step 3 in valid case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();

      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(1); // At second step page

      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('.extraNone')).nativeElement;
      expect(emptyElement.hidden).toBeFalsy();

      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(2); // At third step page
    }));
    it('shall save cash account successfully', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step extra
      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('.extraNone')).nativeElement;
      expect(emptyElement.hidden).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step Status
      expect(component._stepper.selectedIndex).toEqual(2); // At third step page

      // Do the submit
      component.onSubmit();
      expect(createAccountSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container');
      expect(messageElement.textContent).not.toBeNull();

      // Then, after the snackbar disappear, expect navigate!
      tick(2000);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/account/display/' + fakeData.finAccounts[0].Id.toString()]);

      flush();
    }));
    it('shall handle recreate case after cash account successfully', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step extra
      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('.extraNone')).nativeElement;
      expect(emptyElement.hidden).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step Status
      expect(component._stepper.selectedIndex).toEqual(2); // At third step page

      // Do the submit
      component.onSubmit();
      expect(createAccountSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container');
      expect(messageElement.textContent).not.toBeNull();
      let actionButton: any = overlayContainerElement.querySelector('button.mat-button') as HTMLButtonElement;
      actionButton.click();
      tick(); // onAction has been executed
      fixture.detectChanges();

      // After the reset
      expect(component._stepper.selectedIndex).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      flush();
    }));
    it('shall popup dialog if account created failed', fakeAsync(() => {
      createAccountSpy.and.returnValue(asyncError('Server 500 error!'));

      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step extra
      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('.extraNone')).nativeElement;
      expect(emptyElement.hidden).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step Status
      expect(component._stepper.selectedIndex).toEqual(2); // At third step page

      // Do the submit
      component.onSubmit();
      expect(createAccountSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

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

  describe('Display mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAssetCtgySpy.and.returnValue(asyncData(fakeData.finAssetCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));

      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall display cash account (normal)', fakeAsync(() => {
      let cashAccount: Account = new Account();
      cashAccount.Id = 122;
      cashAccount.Name = 'Cash';
      cashAccount.Comment = 'Test';
      cashAccount.OwnerId = fakeData.currentUser.getUserId();
      cashAccount.CategoryId = financeAccountCategoryCash;
      cashAccount.Status = AccountStatusEnum.Normal;
      readAccountSpy.and.returnValue(asyncData(cashAccount));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // Complete the readAccount in ngOnInit
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();

      // Step 0
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      expect(component.firstFormGroup.get('nameControl').value).toEqual(cashAccount.Name);
      expect(component.firstFormGroup.get('ctgyControl').value).toEqual(cashAccount.CategoryId);
      expect(component.firstFormGroup.get('cmtControl').value).toEqual(cashAccount.Comment);
      expect(component.firstFormGroup.get('ownerControl').value).toEqual(cashAccount.OwnerId);
      expect(component.firstFormGroup.disabled).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component._stepper.selectedIndex).toEqual(1);
      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('.extraNone')).nativeElement;
      expect(emptyElement.hidden).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component._stepper.selectedIndex).toEqual(2);
      expect(component.statusFormGroup.get('statusControl').value).toEqual(AccountStatusEnum.Normal);

      // Can do nothing
      flush();
    }));
    it('shall handle error case if account read failed', fakeAsync(() => {
      readAccountSpy.and.returnValue(asyncError('Server 500!'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // Complete the readAccount in ngOnInit
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();

      // Expect a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container');
      expect(messageElement.textContent).not.toBeNull();

      tick(2000); // Let's dismiss the snackbar
      fixture.detectChanges();

      // Can do nothing
      flush();
    }));
    it('shall display Advance Payment account (normal)', fakeAsync(() => {
      let curAccount: Account = fakeData.finAccounts.find((val: Account) => {
        return val.CategoryId === financeAccountCategoryAdvancePayment;
      });
      readAccountSpy.and.returnValue(asyncData(curAccount));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // Complete the readAccount in ngOnInit
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();

      // Step 0
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      expect(component.firstFormGroup.get('nameControl').value).toEqual(curAccount.Name);
      expect(component.firstFormGroup.get('ctgyControl').value).toEqual(curAccount.CategoryId);
      expect(component.firstFormGroup.get('cmtControl').value).toEqual(curAccount.Comment ? curAccount.Comment : null);
      expect(component.firstFormGroup.get('ownerControl').value).toEqual(curAccount.OwnerId ? curAccount.OwnerId : null);
      expect(component.firstFormGroup.disabled).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component._stepper.selectedIndex).toEqual(1);
      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('hih-finance-account-ext-adpex')).nativeElement;
      let adpInfo: AccountExtraAdvancePayment = component.extraADPFormGroup.get('extADPControl').value as AccountExtraAdvancePayment;
      expect(adpInfo.RepeatType).toEqual((curAccount.ExtraInfo as AccountExtraAdvancePayment).RepeatType);
      expect(emptyElement.hidden).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component._stepper.selectedIndex).toEqual(2);
      expect(component.statusFormGroup.get('statusControl').value).toEqual(AccountStatusEnum.Normal);

      // Can do nothing
      flush();
    }));
    it('shall display Asset account (normal)', fakeAsync(() => {
      let curAccount: Account = fakeData.finAccounts.find((val: Account) => {
        return val.CategoryId === financeAccountCategoryAsset;
      });
      readAccountSpy.and.returnValue(asyncData(curAccount));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // Complete the readAccount in ngOnInit
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();

      // Step 0
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      expect(component.firstFormGroup.get('nameControl').value).toEqual(curAccount.Name);
      expect(component.firstFormGroup.get('ctgyControl').value).toEqual(curAccount.CategoryId);
      expect(component.firstFormGroup.get('cmtControl').value).toEqual(curAccount.Comment ? curAccount.Comment : null);
      expect(component.firstFormGroup.get('ownerControl').value).toEqual(curAccount.OwnerId ? curAccount.OwnerId : null);
      expect(component.firstFormGroup.disabled).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component._stepper.selectedIndex).toEqual(1);
      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('hih-finance-account-ext-asset-ex')).nativeElement;
      let assetInfo: AccountExtraAsset = component.extraAssetFormGroup.get('extAssetControl').value as AccountExtraAsset;
      expect(assetInfo.Name).toEqual((curAccount.ExtraInfo as AccountExtraAsset).Name);
      expect(emptyElement.hidden).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component._stepper.selectedIndex).toEqual(2);
      expect(component.statusFormGroup.get('statusControl').value).toEqual(AccountStatusEnum.Normal);

      // Can do nothing
      flush();
    }));
    it('shall display Borrow from account (normal)', fakeAsync(() => {
      let curAccount: Account = fakeData.finAccounts.find((val: Account) => {
        return val.CategoryId === financeAccountCategoryBorrowFrom;
      });
      readAccountSpy.and.returnValue(asyncData(curAccount));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // Complete the readAccount in ngOnInit
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();

      // Step 0
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      expect(component.firstFormGroup.get('nameControl').value).toEqual(curAccount.Name);
      expect(component.firstFormGroup.get('ctgyControl').value).toEqual(curAccount.CategoryId);
      expect(component.firstFormGroup.get('cmtControl').value).toEqual(curAccount.Comment ? curAccount.Comment : null);
      expect(component.firstFormGroup.get('ownerControl').value).toEqual(curAccount.OwnerId ? curAccount.OwnerId : null);
      expect(component.firstFormGroup.disabled).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component._stepper.selectedIndex).toEqual(1);
      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('hih-finance-account-ext-loan-ex')).nativeElement;
      expect(emptyElement.hidden).toBeFalsy();
      let loanInfo: AccountExtraLoan = component.extraLoanFormGroup.get('extLoanControl').value as AccountExtraLoan;
      expect(loanInfo.TotalMonths).toEqual((curAccount.ExtraInfo as AccountExtraLoan).TotalMonths);
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component._stepper.selectedIndex).toEqual(2);
      expect(component.statusFormGroup.get('statusControl').value).toEqual(AccountStatusEnum.Normal);

      // Can do nothing
      flush();
    }));
  });

  describe('Change mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAssetCtgySpy.and.returnValue(asyncData(fakeData.finAssetCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));

      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('it shall display snackbar after successfully change cash account (normal)', fakeAsync(() => {
      let cashAccount: Account = new Account();
      cashAccount.Id = 122;
      cashAccount.Name = 'Cash';
      cashAccount.Comment = 'Test';
      cashAccount.OwnerId = fakeData.currentUser.getUserId();
      cashAccount.CategoryId = financeAccountCategoryCash;
      cashAccount.Status = AccountStatusEnum.Normal;
      readAccountSpy.and.returnValue(asyncData(cashAccount));
      changeAccountSpy.and.returnValue(asyncData(cashAccount));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // Complete the readAccount in ngOnInit
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();

      // Step 0
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      expect(component.firstFormGroup.get('nameControl').value).toEqual(cashAccount.Name);
      expect(component.firstFormGroup.get('ctgyControl').value).toEqual(cashAccount.CategoryId);
      expect(component.firstFormGroup.get('cmtControl').value).toEqual(cashAccount.Comment);
      expect(component.firstFormGroup.get('ownerControl').value).toEqual(cashAccount.OwnerId);
      expect(component.firstFormGroup.disabled).toBeFalsy();
      component.firstFormGroup.get('nameControl').setValue('Cash Account 2');
      component.firstFormGroup.get('nameControl').markAsDirty();
      fixture.detectChanges();
      expect(component.firstFormGroup.dirty).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component._stepper.selectedIndex).toEqual(1);
      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('.extraNone')).nativeElement;
      expect(emptyElement.hidden).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component._stepper.selectedIndex).toEqual(2);
      expect(component.statusFormGroup.get('statusControl').value).toEqual(AccountStatusEnum.Normal);

      // Do the submit
      component.onSubmit();
      expect(changeAccountSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container');
      expect(messageElement.textContent).not.toBeNull();

      // Then, after the snackbar disappear, expect navigate!
      tick(2000);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/account/display/' + cashAccount.Id.toString()]);

      flush();
    }));
    it('it shall display dialog if failed to change cash account (normal)', fakeAsync(() => {
      let cashAccount: Account = new Account();
      cashAccount.Id = 122;
      cashAccount.Name = 'Cash';
      cashAccount.Comment = 'Test';
      cashAccount.OwnerId = fakeData.currentUser.getUserId();
      cashAccount.CategoryId = financeAccountCategoryCash;
      cashAccount.Status = AccountStatusEnum.Normal;
      readAccountSpy.and.returnValue(asyncData(cashAccount));
      changeAccountSpy.and.returnValue(asyncError('Change failed with 500'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // Complete the readAccount in ngOnInit
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();

      // Step 0
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      expect(component.firstFormGroup.get('nameControl').value).toEqual(cashAccount.Name);
      expect(component.firstFormGroup.get('ctgyControl').value).toEqual(cashAccount.CategoryId);
      expect(component.firstFormGroup.get('cmtControl').value).toEqual(cashAccount.Comment);
      expect(component.firstFormGroup.get('ownerControl').value).toEqual(cashAccount.OwnerId);
      expect(component.firstFormGroup.disabled).toBeFalsy();
      component.firstFormGroup.get('nameControl').setValue('Cash Account 2');
      component.firstFormGroup.get('nameControl').markAsDirty();
      fixture.detectChanges();
      expect(component.firstFormGroup.dirty).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component._stepper.selectedIndex).toEqual(1);
      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('.extraNone')).nativeElement;
      expect(emptyElement.hidden).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component._stepper.selectedIndex).toEqual(2);
      expect(component.statusFormGroup.get('statusControl').value).toEqual(AccountStatusEnum.Normal);

      // Do the submit
      component.onSubmit();
      expect(changeAccountSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

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
    it('it shall navigate to account the account close successfully (normal)', fakeAsync(() => {
      let cashAccount: Account = new Account();
      cashAccount.Id = 122;
      cashAccount.Name = 'Cash';
      cashAccount.Comment = 'Test';
      cashAccount.OwnerId = fakeData.currentUser.getUserId();
      cashAccount.CategoryId = financeAccountCategoryCash;
      cashAccount.Status = AccountStatusEnum.Normal;
      readAccountSpy.and.returnValue(asyncData(cashAccount));
      updateAccountStatusSpy.and.returnValue(asyncData(cashAccount));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // Complete the readAccount in ngOnInit
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();

      // Step 0
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      expect(component.firstFormGroup.get('nameControl').value).toEqual(cashAccount.Name);
      expect(component.firstFormGroup.get('ctgyControl').value).toEqual(cashAccount.CategoryId);
      expect(component.firstFormGroup.get('cmtControl').value).toEqual(cashAccount.Comment);
      expect(component.firstFormGroup.get('ownerControl').value).toEqual(cashAccount.OwnerId);
      expect(component.firstFormGroup.disabled).toBeFalsy();
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component._stepper.selectedIndex).toEqual(1);
      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('.extraNone')).nativeElement;
      expect(emptyElement.hidden).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component._stepper.selectedIndex).toEqual(2);
      expect(component.statusFormGroup.get('statusControl').value).toEqual(AccountStatusEnum.Normal);

      // Do the submit
      component.onCloseAccount();
      expect(updateAccountStatusSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/account/display/' + cashAccount.Id.toString()]);

      flush();
    }));
    it('it shall display snackbar if failed to close a account (normal)', fakeAsync(() => {
      let cashAccount: Account = new Account();
      cashAccount.Id = 122;
      cashAccount.Name = 'Cash';
      cashAccount.Comment = 'Test';
      cashAccount.OwnerId = fakeData.currentUser.getUserId();
      cashAccount.CategoryId = financeAccountCategoryCash;
      cashAccount.Status = AccountStatusEnum.Normal;
      readAccountSpy.and.returnValue(asyncData(cashAccount));
      updateAccountStatusSpy.and.returnValue(asyncError('Server 500 error'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // Complete the readAccount in ngOnInit
      fixture.detectChanges();
      expect(readAccountSpy).toHaveBeenCalled();

      // Step 0
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      expect(component.firstFormGroup.get('nameControl').value).toEqual(cashAccount.Name);
      expect(component.firstFormGroup.get('ctgyControl').value).toEqual(cashAccount.CategoryId);
      expect(component.firstFormGroup.get('cmtControl').value).toEqual(cashAccount.Comment);
      expect(component.firstFormGroup.get('ownerControl').value).toEqual(cashAccount.OwnerId);
      expect(component.firstFormGroup.disabled).toBeFalsy();
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component._stepper.selectedIndex).toEqual(1);
      let emptyElement: HTMLElement = fixture.debugElement.query(By.css('.extraNone')).nativeElement;
      expect(emptyElement.hidden).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component._stepper.selectedIndex).toEqual(2);
      expect(component.statusFormGroup.get('statusControl').value).toEqual(AccountStatusEnum.Normal);

      // Do the submit
      component.onCloseAccount();
      expect(updateAccountStatusSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container');
      expect(messageElement.textContent).not.toBeNull();

      // Then, after the snackbar disappear, expect navigate!
      tick(2000);

      flush();
    }));
  });
});
