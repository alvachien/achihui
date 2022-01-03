import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, flush, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, UrlSegment, ActivatedRoute } from '@angular/router';
import { NZ_I18N, en_US, } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import * as moment from 'moment';
import { By } from '@angular/platform-browser';

import { FinanceUIModule } from '../../finance-ui.module';
import { UIAccountCtgyFilterExPipe, UIAccountStatusFilterPipe } from '../../pipes';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { DocumentAssetSoldCreateComponent } from './document-asset-sold-create.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService, } from '../../../../services';
import { UserAuthInfo, Document, DocumentItem, Account, financeAccountCategoryAsset, } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';

describe('DocumentAssetSoldCreateComponent', () => {
  let component: DocumentAssetSoldCreateComponent;
  let fixture: ComponentFixture<DocumentAssetSoldCreateComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllAssetCategoriesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllOrdersSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllCurrenciesSpy: any;
  let createAssetSoldoutDocumentSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService>;
  let assetAccount: Account;
  const modalClassName = '.ant-modal-body';
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
    assetAccount = fakeData.finAccounts.find((val: Account) => {
      return val.CategoryId === financeAccountCategoryAsset;
    })!;

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllAccountCategories',
      'fetchAllAssetCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'fetchAllCurrencies',
      'createAssetSoldoutDocument',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    createAssetSoldoutDocumentSpy = storageService.createAssetSoldoutDocument.and.returnValue(of({}));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        getTranslocoModule(),
        RouterTestingModule,
      ],
      declarations: [
        UIAccountCtgyFilterExPipe,
        UIAccountStatusFilterPipe,
        DocumentHeaderComponent,
        DocumentItemsComponent,
        DocumentAssetSoldCreateComponent,
        MessageDialogComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
      ]
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          MessageDialogComponent,
        ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAssetSoldCreateComponent);
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
      fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(asyncData(fakeData.finAssetCategories));
      fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(asyncData(fakeData.finOrders));
      fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(asyncData(fakeData.currencies));
      createAssetSoldoutDocumentSpy = storageService.createAssetSoldoutDocument.and.returnValue(asyncData({Id: 1}));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('setp 0: initial status', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      flush();
    }));

    it('setp 0: document header is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update document header - missed desp
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      // dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.20);
      component.firstFormGroup.get('amountControl')?.markAsDirty();

      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();;
      expect(component.nextButtonEnabled).toBeFalsy();

      // Now correct the header's desp
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeTruthy();

      flush();
    }));

    it('setp 0: asset account is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();
  
      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account - missing
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.20);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('setp 0: amount is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();
  
      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount - missing
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the missing part
      component.firstFormGroup.get('amountControl')?.setValue(100.20);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('setp 0: shall go to step 1 when input is valid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();
  
      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.20);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(1);

      // Previous
      component.pre();
      fixture.detectChanges();
      expect(component.currentStep).toBe(0);

      flush();
    }));

    it('setp 1: item is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();
  
      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.20);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toBe(1);
      expect(component.itemFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new  DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.itemFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('setp 1: item amount shall equal to the amount in header', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();
  
      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.20);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toBe(1);
      expect(component.itemFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new  DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 200.2;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.itemFormGroup.valid).toBeFalsy('Amount is mismatch');
      expect(component.nextButtonEnabled).toBeFalsy();

      flush();
    }));

    it('setp 1: shall go to step 2 when input is valid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();
  
      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.20);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      // Add the items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new  DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(2);
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('setp 2: shall popup dialog in verification failed', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();
  
      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.20);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      // Add the items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new  DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      expect(component.currentStep).toBe(2);
      fixture.detectChanges();
      // Fake an error in generated doc
      dochead.Desp = '';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      fixture.detectChanges();
      // Click the next button
      nextButtonNativeEl.click();
      flush();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
      fixture.detectChanges();

      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBeNull();
      expect(component.currentStep).toBe(2);
      flush();
      tick();
      fixture.detectChanges();

      flush();
    }));

    it('setp 3: shall show success page', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();
  
      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.20);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      // Add the items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new  DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      expect(component.currentStep).toBe(2);
      fixture.detectChanges();
      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(createAssetSoldoutDocumentSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toEqual(1);
      flush();
      tick();
      fixture.detectChanges();

      flush();
    }));

    it('setp 3: shall show failed page', fakeAsync(() => {
      createAssetSoldoutDocumentSpy = storageService.createAssetSoldoutDocument.and.returnValue(asyncError('Failed in creation'));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();
  
      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.20);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      // Add the items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new  DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = 'Test 1';
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes[0].Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get('itemControl')?.setValue(aritems);
      component.itemFormGroup.get('itemControl')?.markAsDirty();
      tick();
      fixture.detectChanges();
      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      expect(component.currentStep).toBe(2);
      fixture.detectChanges();
      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(createAssetSoldoutDocumentSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBeNull();
      expect(component.docPostingFailed).toBeTruthy();
      flush();
      tick();
      fixture.detectChanges();

      flush();
    }));
  });

  describe('shall display error dialog when service failed', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(asyncData(fakeData.finAssetCategories));
      fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(asyncData(fakeData.finOrders));
      fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(asyncData(fakeData.currencies));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Account Category fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when Asset Category fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAssetCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when Doc type fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when Tran. type fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when currency fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when account fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when control center fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when order fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));
  });
});
