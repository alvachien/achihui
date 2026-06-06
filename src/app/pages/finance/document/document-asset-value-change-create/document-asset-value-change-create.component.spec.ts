import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { format, parse, subYears, addMonths } from 'date-fns';
import { By } from '@angular/platform-browser';

import { UIAccountCtgyFilterExPipe, UIAccountStatusFilterPipe } from '../../pipes';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentAssetValueChangeCreateComponent } from './document-asset-value-change-create.component';
import {createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError} from '../../../../../testing';
import { HomeDefOdataService, AuthService, UIStatusService, FinanceOdataService } from '@services/index';
import { UserAuthInfo, Document, DocumentItemView, Account, financeAccountCategoryAsset, dateFormat } from '@model/index';
import { MessageDialogComponent } from '../../../message-dialog';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DocumentAssetValueChangeCreateComponent', () => {
  let component: DocumentAssetValueChangeCreateComponent;
  let fixture: ComponentFixture<DocumentAssetValueChangeCreateComponent>;
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
  let getDocumentItemByAccountSpy: SafeAny;
  let createAssetValChgDocumentSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService>;
  let assetAccount: Account;
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    assetAccount = fakeData.finAccounts.find((val) => val.CategoryId === financeAccountCategoryAsset)!;

    storageService = createSpyObj('FinanceOdataService', [
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

  beforeEach(async () => {
    TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [FormsModule,
        
        ReactiveFormsModule,
        NoopAnimationsModule,
        getTranslocoModule(),
        RouterTestingModule],
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
    fixture = TestBed.createComponent(DocumentAssetValueChangeCreateComponent);
    component = fixture.componentInstance;
    // Defensive reset: test pollution from preceding test files can leave
    // curDocType as undefined, causing onVerify to fail
    component.curDocType = 13;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const btest = false;
    if (btest) {
      expect(getDocumentItemByAccountSpy).toHaveBeenCalled();
    }
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
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(
        asyncData({
          totalCount: 0,
          contentList: [],
        })
      );
      createAssetValChgDocumentSpy = storageService.createAssetValChgDocument.and.returnValue(
        asyncData({
          Id: 1,
        })
      );
    });

    beforeEach(() => {
    const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
  });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('step 0: initial status', async () => {
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
      dochead.TranDate = new Date();
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

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = new Date();
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
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 0: amount is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = new Date();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      // Control center - empty
      // component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // component.firstFormGroup.get('ccControl').markAsDirty();
      // Order
      component.firstFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add amount back
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 0: costing object is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = new Date();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center - empty
      // Order - empty
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Second false case: input both
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      component.firstFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Now correct it - remove order
      component.firstFormGroup.get('orderControl')?.setValue(undefined);
      component.firstFormGroup.get('orderControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 1: back to step 0 shall work', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = new Date();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center - empty
      // Order
      component.firstFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Now go to step 1
      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toEqual(1);
      expect(component.nextButtonEnabled).toBeFalsy();

      // Go back to step 0
      component.pre();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 1: shall calculate correct document item with case value descreased', async () => {
      // Prepare the data
      const docitemview: DocumentItemView[] = [];
      docitemview.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: format(subYears(new Date(), 1), dateFormat),
        DocumentDesp: 'buy',
        AccountID: assetAccount.Id,
        TransactionType: 1,
        IsExpense: false,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 1200,
        Amount: 1200,
        AmountInLocalCurrency: 1200,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'Buy asset',
      });
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(
        asyncData({
          totalCount: 1,
          contentList: docitemview,
        })
      );

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = new Date();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(1000);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center - empty
      // Order
      component.firstFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      expect(component.existingDocItems.length).toBe(2);
      expect(component.existingDocItems[0].tranAmount).toBe(1200);
      expect(component.existingDocItems[1].tranAmount).toBe(-200);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 1: shall calculate correct document item with case value increased', async () => {
      // Prepare the data
      const docitemview: DocumentItemView[] = [];
      docitemview.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: format(subYears(new Date(), 1), dateFormat),
        DocumentDesp: 'buy',
        AccountID: assetAccount.Id,
        TransactionType: 1,
        IsExpense: false,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 1200,
        Amount: 1200,
        AmountInLocalCurrency: 1200,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'Buy asset',
      });
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(
        asyncData({
          totalCount: 1,
          contentList: docitemview,
        })
      );

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = new Date();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(2000);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center - empty
      // Order
      component.firstFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      expect(component.existingDocItems.length).toBe(2);
      expect(component.existingDocItems[0].tranAmount).toBe(1200);
      expect(component.existingDocItems[1].tranAmount).toBe(800);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 2: shall popup dialog if verification on generated document failed', async () => {
      // Prepare the data
      const docitemview: DocumentItemView[] = [];
      docitemview.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: format(subYears(new Date(), 1), dateFormat),
        DocumentDesp: 'buy',
        AccountID: assetAccount.Id,
        TransactionType: 1,
        IsExpense: false,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 1200,
        Amount: 1200,
        AmountInLocalCurrency: 1200,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'Buy asset',
      });
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(
        asyncData({
          totalCount: 1,
          contentList: docitemview,
        })
      );

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = new Date();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(1000);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center - empty
      // Order
      component.firstFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setp 1
      expect(component.currentStep).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      // Fake an error in generated doc
      dochead.Desp = '';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      fixture.detectChanges();
      // Click the next button
      nextButtonNativeEl.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
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
      fixture.detectChanges();

      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBeNull();
      expect(component.currentStep).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 2: shall display success page when posted succeed', async () => {
      // Prepare the data
      const docitemview: DocumentItemView[] = [];
      docitemview.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: format(subYears(new Date(), 1), dateFormat),
        DocumentDesp: 'buy',
        AccountID: assetAccount.Id,
        TransactionType: 1,
        IsExpense: false,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 1200,
        Amount: 1200,
        AmountInLocalCurrency: 1200,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'Buy asset',
      });
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(
        asyncData({
          totalCount: 1,
          contentList: docitemview,
        })
      );

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = new Date();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(1000);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center - empty
      // Order
      component.firstFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setp 1
      expect(component.currentStep).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(createAssetValChgDocumentSpy).toHaveBeenCalled();
      expect(component.currentStep).toBe(2);
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toEqual(1);
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 2: shall display error page when posted failed', async () => {
      // Prepare the data
      const docitemview: DocumentItemView[] = [];
      docitemview.push({
        DocumentID: 1,
        ItemID: 1,
        HomeID: fakeData.chosedHome.ID,
        TransactionDate: format(subYears(new Date(), 1), dateFormat),
        DocumentDesp: 'buy',
        AccountID: assetAccount.Id,
        TransactionType: 1,
        IsExpense: false,
        Currency: fakeData.chosedHome.BaseCurrency,
        OriginAmount: 1200,
        Amount: 1200,
        AmountInLocalCurrency: 1200,
        ControlCenterID: fakeData.finControlCenters[0].Id,
        ItemDesp: 'Buy asset',
      });
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(
        asyncData({
          totalCount: 1,
          contentList: docitemview,
        })
      );
      createAssetValChgDocumentSpy.and.returnValue(asyncError('failed in creation'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = new Date();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.get('headerControl')?.valid).toBe(true);
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup.get('accountControl')?.setValue(assetAccount.Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(1000);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center - empty
      // Order
      component.firstFormGroup.get('orderControl')?.setValue(fakeData.finOrders[0].Id);
      component.firstFormGroup.get('orderControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setp 1
      expect(component.currentStep).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(createAssetValChgDocumentSpy).toHaveBeenCalled();
      expect(component.currentStep).toBe(2);
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBeUndefined();
      expect(component.docPostingFailed).toBeTruthy();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

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
      getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(
        asyncData({
          contentList: [],
          totalCount: 0,
        })
      );
      createAssetValChgDocumentSpy = storageService.createAssetValChgDocument.and.returnValue(asyncData(1));
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

      await new Promise<void>(r => setTimeout(r, 0));
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
