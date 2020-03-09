import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, UrlSegment, ActivatedRoute } from '@angular/router';
import { NgZorroAntdModule, NZ_I18N, en_US, } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import * as moment from 'moment';
import { By } from '@angular/platform-browser';

import { UIAccountCtgyFilterExPipe, UIAccountStatusFilterPipe } from '../../pipes';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentAssetValueChangeCreateComponent } from './document-asset-value-change-create.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { HomeDefOdataService, AuthService, UIStatusService, FinanceOdataService } from 'src/app/services';
import { UserAuthInfo, Document, DocumentItem, DocumentItemView, Account, financeAccountCategoryAsset, } from 'src/app/model';
import { MessageDialogComponent } from '../../../message-dialog';

describe('DocumentAssetValueChangeCreateComponent', () => {
  let component: DocumentAssetValueChangeCreateComponent;
  let fixture: ComponentFixture<DocumentAssetValueChangeCreateComponent>;
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
  let getDocumentItemByAccountSpy: any;
  let createAssetValChgDocumentSpy: any;
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
    assetAccount = fakeData.finAccounts.find(val => {
      return val.CategoryId === financeAccountCategoryAsset;
    });

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllAccountCategories',
      'fetchAllAssetCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'createADPDocument',
      'fetchAllCurrencies',
      'getDocumentItemByAccount',
      'createAssetValChgDocument',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(of([]));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    createAssetValChgDocumentSpy = storageService.createAssetValChgDocument.and.returnValue(of({}));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        getTranslocoModule(),
        RouterTestingModule,
      ],
      declarations: [
        UIAccountCtgyFilterExPipe,
        UIAccountStatusFilterPipe,
        DocumentHeaderComponent,
        DocumentAssetValueChangeCreateComponent,
        MessageDialogComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: NZ_I18N, useValue: en_US },
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
    fixture = TestBed.createComponent(DocumentAssetValueChangeCreateComponent);
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
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(asyncData({
        totalCount: 0,
        contentList: [],
      }));
      createAssetValChgDocumentSpy = storageService.createAssetValChgDocument.and.returnValue(asyncData(1));
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
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();;
      expect(component.nextButtonEnabled).toBeFalsy();

      // Now add the desp back
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();

      flush();
    }));

    it('setp 0: asset account is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account - missing
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100.20);
      component.firstFormGroup.get('amountControl').markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl').markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the asset account
      component.firstFormGroup.get('accountControl').setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl').markAsDirty();
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

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl').setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl').markAsDirty();
      // Amount
      // Control center - empty
      // component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // component.firstFormGroup.get('ccControl').markAsDirty();
      // Order
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add amount back
      component.firstFormGroup.get('amountControl').setValue(100.20);
      component.firstFormGroup.get('amountControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('setp 0: costing object is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl').setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100.20);
      component.firstFormGroup.get('amountControl').markAsDirty();
      // Control center - empty
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Second false case: input both
      component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl').markAsDirty();
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Now correct it - remove order
      component.firstFormGroup.get('orderControl').setValue(undefined);
      component.firstFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('setp 1: back to step 0 shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Step 0
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl').setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl').setValue(100.20);
      component.firstFormGroup.get('amountControl').markAsDirty();
      // Control center - empty
      // Order 
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Now go to step 1
      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toEqual(1);
      expect(component.nextButtonEnabled).toBeFalsy();

      // Go back to step 0
      component.pre();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(0);

      flush();
    }));

    it('setp 1: shall calculate correct document item with case value descreased', fakeAsync(() => {
      // Prepare the data
      const docitemview: DocumentItemView[] = [];
      docitemview.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: moment().subtract(1, 'y'),
        DocumentDesp: 'buy',
        AccountID: assetAccount.Id,
        TransactionType: 1,
        IsExpense: false,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 1200,
        Amount: 1200,
        AmountInLocalCurrency: 1200,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'Buy asset'
      });
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(asyncData({
        totalCount: 1,
        contentList: docitemview,
      }));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Step 0
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl').setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl').setValue(1000);
      component.firstFormGroup.get('amountControl').markAsDirty();
      // Control center - empty
      // Order 
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toBe(1);
      tick();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      expect(component.existingDocItems.length).toBe(2);
      expect(component.existingDocItems[0].tranAmount).toBe(1200);
      expect(component.existingDocItems[1].tranAmount).toBe(-200);

      flush();
    }));

    it('setp 1: shall calculate correct document item with case value increased', fakeAsync(() => {
      // Prepare the data
      const docitemview: DocumentItemView[] = [];
      docitemview.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: moment().subtract(1, 'y'),
        DocumentDesp: 'buy',
        AccountID: assetAccount.Id,
        TransactionType: 1,
        IsExpense: false,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 1200,
        Amount: 1200,
        AmountInLocalCurrency: 1200,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'Buy asset'
      });
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(asyncData({
        totalCount: 1,
        contentList: docitemview,
      }));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Step 0
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl').setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl').setValue(2000);
      component.firstFormGroup.get('amountControl').markAsDirty();
      // Control center - empty
      // Order 
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl').markAsDirty();
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
      tick();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      expect(component.existingDocItems.length).toBe(2);
      expect(component.existingDocItems[0].tranAmount).toBe(1200);
      expect(component.existingDocItems[1].tranAmount).toBe(800);

      flush();
    }));

    it('setp 2: shall popup dialog if verification on generated document failed', fakeAsync(() => {
      // Prepare the data
      const docitemview: DocumentItemView[] = [];
      docitemview.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: moment().subtract(1, 'y'),
        DocumentDesp: 'buy',
        AccountID: assetAccount.Id,
        TransactionType: 1,
        IsExpense: false,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 1200,
        Amount: 1200,
        AmountInLocalCurrency: 1200,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'Buy asset'
      });
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(asyncData({
        totalCount: 1,
        contentList: docitemview,
      }));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Step 0
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl').setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl').setValue(1000);
      component.firstFormGroup.get('amountControl').markAsDirty();
      // Control center - empty
      // Order 
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setp 1
      expect(component.currentStep).toBe(1);
      tick();
      fixture.detectChanges();
      // Fake an error in generated doc
      dochead.Desp = '';
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
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
      expect(component.currentStep).toBe(1);
      flush();
      tick();
      fixture.detectChanges();

      flush();
    }));

    it('setp 2: shall display success page when posted succeed', fakeAsync(() => {
      // Prepare the data
      const docitemview: DocumentItemView[] = [];
      docitemview.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: moment().subtract(1, 'y'),
        DocumentDesp: 'buy',
        AccountID: assetAccount.Id,
        TransactionType: 1,
        IsExpense: false,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 1200,
        Amount: 1200,
        AmountInLocalCurrency: 1200,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'Buy asset'
      });
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(asyncData({
        totalCount: 1,
        contentList: docitemview,
      }));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Step 0
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl').setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl').setValue(1000);
      component.firstFormGroup.get('amountControl').markAsDirty();
      // Control center - empty
      // Order 
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setp 1
      expect(component.currentStep).toBe(1);
      tick();
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      tick();
      fixture.detectChanges();
      expect(createAssetValChgDocumentSpy).toHaveBeenCalled();
      expect(component.currentStep).toBe(2);
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toEqual(1);
      flush();
      tick();
      fixture.detectChanges();

      flush();
    }));

    it('setp 2: shall display error page when posted failed', fakeAsync(() => {
      // Prepare the data
      const docitemview: DocumentItemView[] = [];
      docitemview.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: moment().subtract(1, 'y'),
        DocumentDesp: 'buy',
        AccountID: assetAccount.Id,
        TransactionType: 1,
        IsExpense: false,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 1200,
        Amount: 1200,
        AmountInLocalCurrency: 1200,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'Buy asset'
      });
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(asyncData({
        totalCount: 1,
        contentList: docitemview,
      }));
      createAssetValChgDocumentSpy.and.returnValue(asyncError('failed in creation'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Step 0
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl').setValue(dochead);
      component.firstFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl').setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl').setValue(1000);
      component.firstFormGroup.get('amountControl').markAsDirty();
      // Control center - empty
      // Order 
      component.firstFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setp 1
      expect(component.currentStep).toBe(1);
      tick();
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      tick();
      fixture.detectChanges();
      expect(createAssetValChgDocumentSpy).toHaveBeenCalled();
      expect(component.currentStep).toBe(2);
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
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(asyncData({
        contentList: [],
        totalCount: 0,
      }));
      createAssetValChgDocumentSpy = storageService.createAssetValChgDocument.and.returnValue(asyncData(1));
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
