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

import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { AccountExtraDownpaymentComponent } from '../../account/account-extra-downpayment';
import { DocumentDownpaymentCreateComponent } from './document-downpayment-create.component';
import { getTranslocoModule, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, Document, DocumentItem, AccountExtraAdvancePayment, RepeatFrequencyEnum,
  TemplateDocADP, } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';

describe('DocumentDownpaymentCreateComponent', () => {
  let component: DocumentDownpaymentCreateComponent;
  let fixture: ComponentFixture<DocumentDownpaymentCreateComponent>;
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
  let createADPDocumentSpy: any;
  let activatedRouteStub: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService>;
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
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    createADPDocumentSpy = storageService.createADPDocument.and.returnValue(of({}));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    uiServiceStub.getUILabel = (le: any) => '';
  });

  beforeEach(async(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('createadp', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [
        AccountExtraDownpaymentComponent,
        DocumentHeaderComponent,
        DocumentItemsComponent,
        DocumentDownpaymentCreateComponent,
        MessageDialogComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
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
    fixture = TestBed.createComponent(DocumentDownpaymentCreateComponent);
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
      expect(component.headerFormGroup.valid).toBeFalsy();

      flush();
    }));

    it('setp 0: document header is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      // Update document header - missed desp
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      // dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeFalsy();;
      expect(component.nextButtonEnabled).toBeFalsy();

      // Now add the desp back
      dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.headerFormGroup.valid).toBeFalsy();

      flush();
    }));

    it('setp 0: amount is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.headerFormGroup.valid).toBeFalsy();
      // Account
      component.headerFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.headerFormGroup.get('accountControl').markAsDirty();
      // Amount
      // Tran. type
      component.headerFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      component.headerFormGroup.get('tranTypeControl').markAsDirty();
      // Control center - empty
      // component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // component.firstFormGroup.get('ccControl').markAsDirty();
      // Order
      component.headerFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.headerFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add amount back
      component.headerFormGroup.get('amountControl').setValue(100.20);
      component.headerFormGroup.get('amountControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('setp 0: account is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.headerFormGroup.valid).toBeFalsy();
      // Account
      // Amount
      component.headerFormGroup.get('amountControl').setValue(100.20);
      component.headerFormGroup.get('amountControl').markAsDirty();
      // Tran. type
      component.headerFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      component.headerFormGroup.get('tranTypeControl').markAsDirty();
      // Control center - empty
      // component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // component.firstFormGroup.get('ccControl').markAsDirty();
      // Order
      component.headerFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.headerFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Correct missed fields
      component.headerFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.headerFormGroup.get('accountControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('setp 0: tran. type is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.headerFormGroup.valid).toBeFalsy();
      // Account
      component.headerFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.headerFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.headerFormGroup.get('amountControl').setValue(100.20);
      component.headerFormGroup.get('amountControl').markAsDirty();
      // Tran. type
      // Control center - empty
      // component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      // component.firstFormGroup.get('ccControl').markAsDirty();
      // Order
      component.headerFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.headerFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Correct missed fields
      component.headerFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      component.headerFormGroup.get('tranTypeControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('setp 0: costing object is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.headerFormGroup.valid).toBeFalsy();
      // Account
      component.headerFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.headerFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.headerFormGroup.get('amountControl').setValue(100.20);
      component.headerFormGroup.get('amountControl').markAsDirty();
      // Tran. type
      component.headerFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      component.headerFormGroup.get('tranTypeControl').markAsDirty();
      // Control center - empty
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Second false case: input both
      component.headerFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.headerFormGroup.get('ccControl').markAsDirty();
      component.headerFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      component.headerFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Now correct it - remove order
      component.headerFormGroup.get('orderControl').setValue(undefined);
      component.headerFormGroup.get('orderControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('setp 0: shall go to step 1 in valid case', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.headerFormGroup.valid).toBeFalsy();
      // Account
      component.headerFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.headerFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.headerFormGroup.get('amountControl').setValue(100.20);
      component.headerFormGroup.get('amountControl').markAsDirty();
      // Tran. type
      component.headerFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      component.headerFormGroup.get('tranTypeControl').markAsDirty();
      // Control center
      component.headerFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.headerFormGroup.get('ccControl').markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();
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

    it('setp 1: account extra info is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.headerFormGroup.valid).toBeFalsy();
      // Account
      component.headerFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.headerFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.headerFormGroup.get('amountControl').setValue(100.20);
      component.headerFormGroup.get('amountControl').markAsDirty();
      // Tran. type
      component.headerFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      component.headerFormGroup.get('tranTypeControl').markAsDirty();
      // Control center
      component.headerFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.headerFormGroup.get('ccControl').markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Now go to step 1
      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toEqual(1);
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add extra info.
      const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      const startdt = moment().add(1, 'M');
      dp1.StartDate = startdt;
      dp1.RepeatType = RepeatFrequencyEnum.Month;
      dp1.Comment = 'test';
      dp1.dpTmpDocs.push({
        TranType: fakeData.finTranTypes[0].Id,
        TranDate: moment(),
        TranAmount: 100,
        Desp: 'test'
      } as TemplateDocADP);
      component.accountExtraInfoFormGroup.get('infoControl').setValue(dp1);
      component.accountExtraInfoFormGroup.get('infoControl').markAsDirty();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it('setp 2: show go to step 2 in valid case', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.headerFormGroup.valid).toBeFalsy();
      // Account
      component.headerFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.headerFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.headerFormGroup.get('amountControl').setValue(100.20);
      component.headerFormGroup.get('amountControl').markAsDirty();
      // Tran. type
      component.headerFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      component.headerFormGroup.get('tranTypeControl').markAsDirty();
      // Control center
      component.headerFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.headerFormGroup.get('ccControl').markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Now go to step 1
      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toEqual(1);
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add extra info.
      const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      const startdt = moment().add(1, 'M');
      dp1.StartDate = startdt;
      dp1.RepeatType = RepeatFrequencyEnum.Month;
      dp1.Comment = 'test';
      dp1.dpTmpDocs.push({
        TranType: fakeData.finTranTypes[0].Id,
        TranDate: moment(),
        TranAmount: 100,
        Desp: 'test'
      } as TemplateDocADP);
      component.accountExtraInfoFormGroup.get('infoControl').setValue(dp1);
      component.accountExtraInfoFormGroup.get('infoControl').markAsDirty();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      // Click th next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(2);

      flush();
    }));

    it('setp 2: popup dialog if verification failed in generated object', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.headerFormGroup.valid).toBeFalsy();
      // Account
      component.headerFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.headerFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.headerFormGroup.get('amountControl').setValue(100.20);
      component.headerFormGroup.get('amountControl').markAsDirty();
      // Tran. type
      component.headerFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      component.headerFormGroup.get('tranTypeControl').markAsDirty();
      // Control center
      component.headerFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.headerFormGroup.get('ccControl').markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Now go to step 1
      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toEqual(1);
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add extra info.
      const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      const startdt = moment().add(1, 'M');
      dp1.StartDate = startdt;
      dp1.RepeatType = RepeatFrequencyEnum.Month;
      dp1.Comment = 'test';
      dp1.dpTmpDocs.push({
        TranType: fakeData.finTranTypes[0].Id,
        TranDate: moment(),
        TranAmount: 100,
        Desp: 'test'
      } as TemplateDocADP);
      component.accountExtraInfoFormGroup.get('infoControl').setValue(dp1);
      component.accountExtraInfoFormGroup.get('infoControl').markAsDirty();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      // Click th next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component.currentStep).toBe(2);
      // Fake an error in generated doc
      dochead.Desp = '';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      fixture.detectChanges();
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

    it('setp 3: show success result if document posted', fakeAsync(() => {
      createADPDocumentSpy.and.returnValue(asyncData({
        Id: 1
      } as Document));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.headerFormGroup.valid).toBeFalsy();
      // Account
      component.headerFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.headerFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.headerFormGroup.get('amountControl').setValue(100.20);
      component.headerFormGroup.get('amountControl').markAsDirty();
      // Tran. type
      component.headerFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      component.headerFormGroup.get('tranTypeControl').markAsDirty();
      // Control center
      component.headerFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.headerFormGroup.get('ccControl').markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Now go to step 1
      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toEqual(1);
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add extra info.
      const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      const startdt = moment().add(1, 'M');
      dp1.StartDate = startdt;
      dp1.RepeatType = RepeatFrequencyEnum.Month;
      dp1.Comment = 'test';
      dp1.dpTmpDocs.push({
        TranType: fakeData.finTranTypes[0].Id,
        TranDate: moment(),
        TranAmount: 100,
        Desp: 'test'
      } as TemplateDocADP);
      component.accountExtraInfoFormGroup.get('infoControl').setValue(dp1);
      component.accountExtraInfoFormGroup.get('infoControl').markAsDirty();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      // Click th next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component.currentStep).toBe(2);
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.isDocPosting).toBeTruthy();
      flush();
      tick();
      fixture.detectChanges();
      expect(createADPDocumentSpy).toHaveBeenCalled();
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBe(1);
      expect(component.currentStep).toBe(3);

      flush();
    }));

    it('setp 3: show error result if document failed to post', fakeAsync(() => {
      createADPDocumentSpy.and.returnValue(asyncError('error on document posting'));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      // Update a valid document header
      let dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(dochead);
      component.headerFormGroup.get('headerControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTrue();
      expect(component.headerFormGroup.valid).toBeFalsy();
      // Account
      component.headerFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.headerFormGroup.get('accountControl').markAsDirty();
      // Amount
      component.headerFormGroup.get('amountControl').setValue(100.20);
      component.headerFormGroup.get('amountControl').markAsDirty();
      // Tran. type
      component.headerFormGroup.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      component.headerFormGroup.get('tranTypeControl').markAsDirty();
      // Control center
      component.headerFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.headerFormGroup.get('ccControl').markAsDirty();
      // Order - empty
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Now go to step 1
      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toEqual(1);
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add extra info.
      const dp1: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      const startdt = moment().add(1, 'M');
      dp1.StartDate = startdt;
      dp1.RepeatType = RepeatFrequencyEnum.Month;
      dp1.Comment = 'test';
      dp1.dpTmpDocs.push({
        TranType: fakeData.finTranTypes[0].Id,
        TranDate: moment(),
        TranAmount: 100,
        Desp: 'test'
      } as TemplateDocADP);
      component.accountExtraInfoFormGroup.get('infoControl').setValue(dp1);
      component.accountExtraInfoFormGroup.get('infoControl').markAsDirty();
      fixture.detectChanges();
      expect(component.nextButtonEnabled).toBeTruthy();
      // Click th next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2
      expect(component.currentStep).toBe(2);
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.isDocPosting).toBeTruthy();
      flush();
      tick();
      fixture.detectChanges();
      expect(createADPDocumentSpy).toHaveBeenCalled();
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBeNull();
      expect(component.currentStep).toBe(3);

      flush();
    }));
  });

  it('1a. should create with adr', fakeAsync(() => {
    activatedRouteStub.setURL([new UrlSegment('createadr', {})] as UrlSegment[]);

    expect(component).toBeTruthy();

    // fixture.detectChanges(); // ngOnInit

    // tick(); // Complete the Observables in ngOnInit
    // fixture.detectChanges();

    // expect(component._stepper.selectedIndex).toEqual(0); // At first page
  }));

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
