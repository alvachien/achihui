import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';

import { AccountExtraAssetComponent } from '../../account/account-extra-asset';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { DocumentAssetBuyCreateComponent } from './document-asset-buy-create.component';
import {createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError} from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import {
  UserAuthInfo,
  financeAccountCategoryAsset,
  Document,
  DocumentItem,
  AccountExtraAsset,
} from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { SafeAny } from '@common/any';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DocumentAssetBuyCreateComponent', () => {
  let component: DocumentAssetBuyCreateComponent;
  let fixture: ComponentFixture<DocumentAssetBuyCreateComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllAssetCategoriesSpy: SafeAny;
  let fetchAllDocTypesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllCurrenciesSpy: SafeAny;
  let createAssetBuyinDocumentSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService>;
  let assetAccount: SafeAny;
  //const modalClassName = '.ant-modal-body';
  const nextButtonId = '#button_next_step';

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();
    assetAccount = fakeData.finAccounts.find((val) => {
      return val.CategoryId === financeAccountCategoryAsset;
    });

    storageService = createSpyObj('FinanceOdataService', [
      'fetchAllAccountCategories',
      'fetchAllAssetCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'createAssetBuyinDocument',
      'fetchAllCurrencies',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    createAssetBuyinDocumentSpy = storageService.createAssetBuyinDocument.and.returnValue(of({}));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [FormsModule,

        ReactiveFormsModule,
        NoopAnimationsModule,
        getTranslocoModule(),
        RouterTestingModule,
        NzFormModule,
        NzSelectModule,
        NzInputNumberModule,
        NzCheckboxModule,
        NzSpinModule,
        NzResultModule,
        NzDividerModule,
        NzStepsModule,
        NzPageHeaderModule,
        NzBreadCrumbModule,
        AccountExtraAssetComponent,
        DocumentHeaderComponent,
        DocumentItemsComponent],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    // TestBed.overrideModule(BrowserDynamicTestingModule, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAssetBuyCreateComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('working with data', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(
        asyncData(fakeData.finAccountCategories)
      );
      fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(
        asyncData(fakeData.finAssetCategories)
      );
      fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(asyncData(fakeData.finOrders));
      fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(
        asyncData(fakeData.finControlCenters)
      );
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(asyncData(fakeData.currencies));
      createAssetBuyinDocumentSpy = storageService.createAssetBuyinDocument.and.returnValue(of({}));
    });

    beforeEach(() => {
    const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
  });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('setp 0: initial status', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 0: document header is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update document header - missed desp
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      // dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Now add the desp back
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 0: asset account is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account - missing
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('assetAccountControl')?.valid).toBeTruthy();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 0: amount is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      // Amount - missing
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('assetAccountControl')?.valid).toBeTruthy();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the missing part
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 0: owner is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner - missing
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('assetAccountControl')?.valid).toBeTruthy();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the missing part
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 0: legacy flag is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      // Legacy - missing
      component.firstFormGroup.get('legacyControl')?.setValue(undefined);
      component.firstFormGroup.get('legacyControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('assetAccountControl')?.valid).toBeTruthy();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the missing part
      component.firstFormGroup.get('legacyControl')?.setValue(false);
      component.firstFormGroup.get('legacyControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 0: shall go to step 1 with valid non-legacy case', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      // Legacy
      component.firstFormGroup.get('legacyControl')?.setValue(false);
      component.firstFormGroup.get('legacyControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(1);
      expect(component.itemFormGroup.enabled).toBe(true);

      // Shall go back to step 0
      component.pre();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 1: item is manadatory with non-legacy case', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      // Legacy
      component.firstFormGroup.get('legacyControl')?.setValue(false);
      component.firstFormGroup.get('legacyControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(1);
      expect(component.itemFormGroup.enabled).toBe(true);

      // No items
      expect(component.itemFormGroup.valid).toBe(false);
      expect(component.nextButtonEnabled).toBeFalsy();

      // Now add items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      component.itemFormGroup.updateValueAndValidity();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.itemFormGroup.valid).toBe(true);
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 1: item amount shall equal to amount in step 0 with non-legacy case', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      // Legacy
      component.firstFormGroup.get('legacyControl')?.setValue(false);
      component.firstFormGroup.get('legacyControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1.
      expect(component.currentStep).toEqual(1);
      expect(component.itemFormGroup.enabled).toBe(true);

      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.itemFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 2: go to review page with valid non-legacy case', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      // Legacy
      component.firstFormGroup.get('legacyControl')?.setValue(false);
      component.firstFormGroup.get('legacyControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      expect(component.currentStep).toBe(2);
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 3: popup dialog if generated document object failed in verification', async () => {
      createAssetBuyinDocumentSpy.and.returnValue(asyncData(1));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      // Legacy
      component.firstFormGroup.get('legacyControl')?.setValue(false);
      component.firstFormGroup.get('legacyControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      // Fake an error
      dochead.Desp = '';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.markAsDirty();
      fixture.detectChanges();
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 3.
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toBe(2);
      expect(component.isDocPosting).toBeFalsy();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 3: display success result page with valid non-legacy case', async () => {
      createAssetBuyinDocumentSpy.and.returnValue(
        asyncData({
          Id: 1,
        })
      );

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      // Legacy
      component.firstFormGroup.get('legacyControl')?.setValue(false);
      component.firstFormGroup.get('legacyControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 3.
      expect(component.isDocPosting).toBeTruthy();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toBe(3);
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toEqual(1);
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 3: display failed  result page with valid non-legacy case', async () => {
      createAssetBuyinDocumentSpy.and.returnValue(asyncError('doc failed to create'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      // Legacy
      component.firstFormGroup.get('legacyControl')?.setValue(false);
      component.firstFormGroup.get('legacyControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 3.
      expect(component.isDocPosting).toBeTruthy();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toBe(3);
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBeUndefined();
      expect(component.docPostingFailed).toBeTruthy();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('setp 0: shall go to step 1 with valid legacy case', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment().subtract(1, 'y');
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('assetAccountControl')?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get('assetAccountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup.get('ownerControl')?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get('ownerControl')?.markAsDirty();
      // Legacy
      component.firstFormGroup.get('legacyControl')?.setValue(true);
      component.firstFormGroup.get('legacyControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(1);
      expect(component.itemFormGroup.disabled).toBe(true);

      // Shall go back to step 0
      component.pre();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });
  });

  describe('shall display error dialog when service failed', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(
        asyncData(fakeData.finAccountCategories)
      );
      fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(
        asyncData(fakeData.finAssetCategories)
      );
      fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(asyncData(fakeData.finOrders));
      fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(
        asyncData(fakeData.finControlCenters)
      );
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(asyncData(fakeData.currencies));
    });

    beforeEach(() => {
    const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
  });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Account Category fetched fails', async () => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
    });

    it('should display error when Asset Category fetched fails', async () => {
      // tell spy to return an async error observable
      fetchAllAssetCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should display error when Doc type fetched fails', async () => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should display error when Tran. type fetched fails', async () => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should display error when currency fetched fails', async () => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should display error when account fetched fails', async () => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should display error when control center fetched fails', async () => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should display error when order fetched fails', async () => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });
  });
});
