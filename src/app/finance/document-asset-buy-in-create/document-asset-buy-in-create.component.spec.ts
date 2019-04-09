import { async, ComponentFixture, TestBed, tick, flush, fakeAsync, inject } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
  MatStepperNext, } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { Component, Input } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { DocumentAssetBuyInCreateComponent } from './document-asset-buy-in-create.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { DocumentItem, AccountExtraAsset, Document, } from '../../model';
import { AccountExtAssetExComponent } from '../account-ext-asset-ex';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';

describe('DocumentAssetBuyInCreateComponent', () => {
  let component: DocumentAssetBuyInCreateComponent;
  let fixture: ComponentFixture<DocumentAssetBuyInCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllAssetCategoriesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllOrdersSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllCurrenciesSpy: any;
  let createDocSpy: any;
  let routerSpy: any;
  let activatedRouteStub: any;

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

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'fetchAllAssetCategories',
      'createAssetBuyinDocument',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    createDocSpy = storageService.createAssetBuyinDocument.and.returnValue(of({}));
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;

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
        AccountExtAssetExComponent,
        DocumentAssetBuyInCreateComponent,
        MessageDialogComponent,
        DocumentHeaderComponent,
        DocumentItemsComponent,
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
    fixture = TestBed.createComponent(DocumentAssetBuyInCreateComponent);
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

    it('8. should display error when asset category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAssetCategoriesSpy.and.returnValue(asyncError<string>('Asset category service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Asset category service failed',
        'Expected snack bar to show the error message: Asset category service failed');
      flush();
    }));
  });

  describe('3. should prevent errors by the checking logic', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAssetCategoriesSpy.and.returnValue(asyncData(fakeData.finAssetCategories));
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

    it('step 1. amount is a must', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy('Amount is not inputted');
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1. asset category is a must', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      // extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1. asset name is a must', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      // extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1. owner is a must', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      // component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1. prevent the case that neither control center nor order inputted', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      // component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy('no cost object assignment');
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1. prevent the case that both control center and order inputted', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy('cost object over assigned');
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1 (legacy asset). transaction date must earlier than today', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment().add(1, 'M');
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      component.firstFormGroup.get('legacyControl').setValue(true);
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy('Legacy asset requires a earlier date');
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1. shall go to step 2 in base currency case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      expect(component.itemFormGroup.valid).toBeFalsy();
    }));

    it('step 1. shall go to step 2 in foreign currency case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = 'USD';
      curdoc.ExgRate = 654.23;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      expect(component.itemFormGroup.valid).toBeFalsy();
    }));

    it('step 2. items is required for non-legacy case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      expect(component.itemFormGroup.valid).toBeFalsy();
    }));

    it('step 2. items is not required for legacy case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment().subtract(1, 'y');
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      component.firstFormGroup.get('legacyControl').setValue(true);
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      expect(component.itemFormGroup.disabled).toBeFalsy();
    }));

    // Asset account should not allowed

    // ADP account should not allowed

    // System tran type should not allowed

    // Order which not valid in this date shall not allow

    it('step 2 (non-legacy): should allow go third step if items are valid', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      expect(component.itemFormGroup.valid).toBeFalsy();

      // Setup the second step
      let ditem: DocumentItem = new DocumentItem();
      ditem.AccountId = 11;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      ditem.TranAmount = 20;
      ditem.ItemId = 1;
      component.itemFormGroup.get('itemControl').setValue([ditem]);
      component.itemFormGroup.get('itemControl').updateValueAndValidity();
      fixture.detectChanges();
      expect(component.itemFormGroup.valid).toBeTruthy();
      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allowed
      expect(component._stepper.selectedIndex).toBe(2);
    }));
  });

  describe('4. Submit and its sequencies', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAssetCategoriesSpy.and.returnValue(asyncData(fakeData.finAssetCategories));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));

      // Accounts
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      // CC
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      // Order
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));

      createDocSpy.and.returnValue(asyncData(110));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should show a popup dialog if checking failed', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      expect(component.itemFormGroup.valid).toBeFalsy();

      // Setup the second step
      let ditem: DocumentItem = new DocumentItem();
      ditem.AccountId = 11;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      ditem.TranAmount = 20;
      ditem.ItemId = 1;
      component.itemFormGroup.get('itemControl').setValue([ditem]);
      component.itemFormGroup.get('itemControl').updateValueAndValidity();
      fixture.detectChanges();
      expect(component.itemFormGroup.valid).toBeTruthy();
      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allowed
      expect(component._stepper.selectedIndex).toBe(2);

      // Now go to submit
      component.arTranTypes = []; // Ensure check failed!!
      component.onSubmit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();

      flush();
    }));

    it('should handle create success case with navigate to display', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      expect(component.itemFormGroup.valid).toBeFalsy();

      // Setup the second step
      let ditem: DocumentItem = new DocumentItem();
      ditem.AccountId = 11;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      ditem.TranAmount = 20;
      ditem.ItemId = 1;
      component.itemFormGroup.get('itemControl').setValue([ditem]);
      component.itemFormGroup.get('itemControl').updateValueAndValidity();
      fixture.detectChanges();
      expect(component.itemFormGroup.valid).toBeTruthy();
      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allowed
      expect(component._stepper.selectedIndex).toBe(2);

      // Now go to submit
      component.onSubmit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(createDocSpy).toHaveBeenCalled();
      // expect(createDocSpy).toHaveBeenCalledWith()

      // Expect there is snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container');
      expect(messageElement.textContent).not.toBeNull();

      // Then, after the snackbar disappear, expect navigate!
      tick(2000);
      flush();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/display/110']);

      flush();
    }));

    it('should handle create fail case with a popup dialog', fakeAsync(() => {
      createDocSpy.and.returnValue(asyncError('Doc Created Failed!'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Step 1.
      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      curdoc.TranDate = moment();
      component.firstFormGroup.get('headerControl').setValue(curdoc);
      component.firstFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100);
      // Asset
      let extAsset: AccountExtraAsset = new AccountExtraAsset();
      extAsset.CategoryID = fakeData.finAssetCategories[0].ID;
      extAsset.Name = 'Asset 1';
      extAsset.Comment = 'test Comment';
      component.firstFormGroup.get('assetAccountControl').setValue(extAsset);
      component.firstFormGroup.get('assetAccountControl').updateValueAndValidity();
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Legacy
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // Order
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      // Click next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toBe(1);

      // Step 2.
      expect(component.itemFormGroup.valid).toBeFalsy();

      // Setup the second step
      let ditem: DocumentItem = new DocumentItem();
      ditem.AccountId = 11;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      ditem.TranAmount = 20;
      ditem.ItemId = 1;
      component.itemFormGroup.get('itemControl').setValue([ditem]);
      component.itemFormGroup.get('itemControl').updateValueAndValidity();
      fixture.detectChanges();
      expect(component.itemFormGroup.valid).toBeTruthy();
      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allowed
      expect(component._stepper.selectedIndex).toBe(2);

      // Now go to submit
      component.onSubmit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(createDocSpy).toHaveBeenCalled();

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
