import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import moment from 'moment';
import { By } from '@angular/platform-browser';

import { DocumentHeaderComponent } from '../document-header';
import { DocumentLoanCreateComponent } from './document-loan-create.component';
import { AccountExtraLoanComponent } from '../../account/account-extra-loan';
import {createSpyObj, getTranslocoModule,
  FakeDataHelper,
  ActivatedRouteUrlStub,
  asyncData,
  asyncError,} from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, Document, AccountExtraLoan, RepaymentMethodEnum, TemplateDocLoan } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { SafeAny } from '@common/any';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DocumentLoanCreateComponent', () => {
  let component: DocumentLoanCreateComponent;
  let fixture: ComponentFixture<DocumentLoanCreateComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllDocTypesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllCurrenciesSpy: SafeAny;
  let createLoanDocumentSpy: SafeAny;
  let activatedRouteStub: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  let homeService: Partial<HomeDefOdataService>;
  // const modalClassName = '.ant-modal-body';
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

    storageService = createSpyObj('FinanceOdataService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'fetchAllCurrencies',
      'createLoanDocument',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    createLoanDocumentSpy = storageService.createLoanDocument.and.returnValue(of({}));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('createbrwfrm', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [RouterTestingModule,
        FormsModule,

        ReactiveFormsModule,
        NoopAnimationsModule,
        getTranslocoModule(),
        NzFormModule,
        NzSelectModule,
        NzInputModule,
        NzInputNumberModule,
        NzCheckboxModule,
        NzAlertModule,
        NzSpinModule,
        NzResultModule,
        NzStepsModule,
        NzPageHeaderModule,
        NzBreadCrumbModule,
        DocumentHeaderComponent,
        AccountExtraLoanComponent],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        NzModalService,
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: NZ_I18N, useValue: en_US },
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
    fixture = TestBed.createComponent(DocumentLoanCreateComponent);
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

    it.skip('step 0: account is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update document header - missed desp
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Account - missing
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

      // Add an account
      component.firstFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 0: amount is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update document header - missed desp
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Account
      component.firstFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount - missing
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
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

      // Update document header - missed desp
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Account
      component.firstFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount - missing
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
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      // Account
      component.firstFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Go to next page
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.currentStep).toEqual(1);

      // Go back to step 0
      component.pre();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.currentStep).toEqual(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 1: loan extra info is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      // Account
      component.firstFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Go to next page
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      expect(component.extraFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Update the correct extra info
      const extraLoan: AccountExtraLoan = new AccountExtraLoan();
      extraLoan.startDate = moment();
      extraLoan.endDate = moment().add(1, 'y');
      extraLoan.InterestFree = true;
      extraLoan.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
      extraLoan.TotalMonths = 12;
      extraLoan.Comment = 'test';
      expect(extraLoan.isAccountValid).toBeTruthy();
      extraLoan.loanTmpDocs.push({
        DocId: 1,
        AccountId: fakeData.finAccounts[0].Id,
        TranType: fakeData.finTranTypes[0].Id,
        TranAmount: 100,
        ControlCenterId: fakeData.finControlCenters[0].Id,
        Desp: 'test',
        TranDate: moment().add(1, 'd'),
      } as TemplateDocLoan);
      expect(extraLoan.isValid).toBeTruthy();
      component.extraFormGroup.get('loanAccountControl')?.setValue(extraLoan);
      component.extraFormGroup.get('loanAccountControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.extraFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 2: shall go to step 2 in valid case', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      // Account
      component.firstFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Go to next page
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1.
      const extraLoan: AccountExtraLoan = new AccountExtraLoan();
      extraLoan.startDate = moment();
      extraLoan.endDate = moment().add(1, 'y');
      extraLoan.InterestFree = true;
      extraLoan.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
      extraLoan.TotalMonths = 12;
      extraLoan.Comment = 'test';
      expect(extraLoan.isAccountValid).toBeTruthy();
      extraLoan.loanTmpDocs.push({
        DocId: 1,
        AccountId: fakeData.finAccounts[0].Id,
        TranType: fakeData.finTranTypes[0].Id,
        TranAmount: 100,
        ControlCenterId: fakeData.finControlCenters[0].Id,
        Desp: 'test',
        TranDate: moment().add(1, 'd'),
      } as TemplateDocLoan);
      expect(extraLoan.isValid).toBeTruthy();
      component.extraFormGroup.get('loanAccountControl')?.setValue(extraLoan);
      component.extraFormGroup.get('loanAccountControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Go to next page
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(2);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 2: shall popup error dialog if verfication failed in generated object', async () => {
      createLoanDocumentSpy.and.returnValue(
        asyncData({
          Id: 1,
        } as Document)
      );
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      // Account
      component.firstFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Go to next page
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1.
      const extraLoan: AccountExtraLoan = new AccountExtraLoan();
      extraLoan.startDate = moment();
      extraLoan.endDate = moment().add(1, 'y');
      extraLoan.InterestFree = true;
      extraLoan.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
      extraLoan.TotalMonths = 12;
      extraLoan.Comment = 'test';
      expect(extraLoan.isAccountValid).toBeTruthy();
      extraLoan.loanTmpDocs.push({
        DocId: 1,
        AccountId: fakeData.finAccounts[0].Id,
        TranType: fakeData.finTranTypes[0].Id,
        TranAmount: 100,
        ControlCenterId: fakeData.finControlCenters[0].Id,
        Desp: 'test',
        TranDate: moment().add(1, 'd'),
      } as TemplateDocLoan);
      expect(extraLoan.isValid).toBeTruthy();
      component.extraFormGroup.get('loanAccountControl')?.setValue(extraLoan);
      component.extraFormGroup.get('loanAccountControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Go to next page
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      // Fake an error in generated doc
      dochead.Desp = '';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      fixture.detectChanges();
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
      expect(component.currentStep).toBe(2);
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 3: shall display success result after document posted', async () => {
      createLoanDocumentSpy.and.returnValue(
        asyncData({
          Id: 1,
        } as Document)
      );
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      // Account
      component.firstFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Go to next page
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1.
      const extraLoan: AccountExtraLoan = new AccountExtraLoan();
      extraLoan.startDate = moment();
      extraLoan.endDate = moment().add(1, 'y');
      extraLoan.InterestFree = true;
      extraLoan.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
      extraLoan.TotalMonths = 12;
      extraLoan.Comment = 'test';
      expect(extraLoan.isAccountValid).toBeTruthy();
      extraLoan.loanTmpDocs.push({
        DocId: 1,
        AccountId: fakeData.finAccounts[0].Id,
        TranType: fakeData.finTranTypes[0].Id,
        TranAmount: 100,
        ControlCenterId: fakeData.finControlCenters[0].Id,
        Desp: 'test',
        TranDate: moment().add(1, 'd'),
      } as TemplateDocLoan);
      expect(extraLoan.isValid).toBeTruthy();
      component.extraFormGroup.get('loanAccountControl')?.setValue(extraLoan);
      component.extraFormGroup.get('loanAccountControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Go to next page
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.isDocPosting).toBeTruthy();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(createLoanDocumentSpy).toHaveBeenCalled();
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBe(1);
      expect(component.currentStep).toBe(3);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it.skip('step 3: shall display error result after document failed to post', async () => {
      createLoanDocumentSpy.and.returnValue(asyncError('Failed to post'));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = 'test';
      component.firstFormGroup.get('headerControl')?.setValue(dochead);
      component.firstFormGroup.get('headerControl')?.markAsDirty();
      // Account
      component.firstFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.firstFormGroup.get('accountControl')?.markAsDirty();
      // Amount
      component.firstFormGroup.get('amountControl')?.setValue(100.2);
      component.firstFormGroup.get('amountControl')?.markAsDirty();
      // Control center
      component.firstFormGroup.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get('ccControl')?.markAsDirty();
      // Order - empty
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Go to next page
      const nextButtonNativeEl = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1.
      const extraLoan: AccountExtraLoan = new AccountExtraLoan();
      extraLoan.startDate = moment();
      extraLoan.endDate = moment().add(1, 'y');
      extraLoan.InterestFree = true;
      extraLoan.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
      extraLoan.TotalMonths = 12;
      extraLoan.Comment = 'test';
      expect(extraLoan.isAccountValid).toBeTruthy();
      extraLoan.loanTmpDocs.push({
        DocId: 1,
        AccountId: fakeData.finAccounts[0].Id,
        TranType: fakeData.finTranTypes[0].Id,
        TranAmount: 100,
        ControlCenterId: fakeData.finControlCenters[0].Id,
        Desp: 'test',
        TranDate: moment().add(1, 'd'),
      } as TemplateDocLoan);
      expect(extraLoan.isValid).toBeTruthy();
      component.extraFormGroup.get('loanAccountControl')?.setValue(extraLoan);
      component.extraFormGroup.get('loanAccountControl')?.markAsDirty();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Go to next page
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.isDocPosting).toBeTruthy();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(createLoanDocumentSpy).toHaveBeenCalled();
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBeNull();
      expect(component.currentStep).toBe(3);

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

    it.skip('should display error when Account Category fetched fails', async () => {
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

    it.skip('should display error when Doc type fetched fails', async () => {
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
    });

    it.skip('should display error when Tran. type fetched fails', async () => {
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
    });

    it.skip('should display error when currency fetched fails', async () => {
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
    });

    it.skip('should display error when account fetched fails', async () => {
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
    });

    it.skip('should display error when control center fetched fails', async () => {
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
    });

    it.skip('should display error when order fetched fails', async () => {
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
    });
  });
});
