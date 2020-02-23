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
import { DocumentLoanCreateComponent } from './document-loan-create.component';
import { AccountExtraLoanComponent } from '../../account/account-extra-loan';
import { getTranslocoModule, FakeDataHelper, ActivatedRouteUrlStub, asyncData, asyncError, } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService, } from '../../../../services';
import { UserAuthInfo, Document, DocumentItem, Account, AccountExtraLoan, RepaymentMethodEnum, TemplateDocLoan, } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';

describe('DocumentLoanCreateComponent', () => {
  let component: DocumentLoanCreateComponent;
  let fixture: ComponentFixture<DocumentLoanCreateComponent>;
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
  let activatedRouteStub: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService>;

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
      'fetchAllCurrencies',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    uiServiceStub.getUILabel = (le: any) => '';
  });

  beforeEach(async(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('createbrwfrm', {})] as UrlSegment[]);

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
        DocumentHeaderComponent,
        AccountExtraLoanComponent,
        DocumentLoanCreateComponent,
        MessageDialogComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
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
  });  

  it('setp 0: account is manadatory', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.currentStep).toEqual(0);
    expect(component.firstFormGroup.valid).toBeFalsy();

    // Update document header - missed desp
    let dochead: Document = new Document();
    dochead.TranDate = moment();
    dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
    dochead.Desp = 'test';
    component.firstFormGroup.get('headerControl').setValue(dochead);
    component.firstFormGroup.get('headerControl').markAsDirty();
    tick();
    fixture.detectChanges();
    expect(component.firstFormGroup.valid).toBeFalsy();;
    expect(component.nextButtonEnabled).toBeFalsy();

    // Account - missing
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

    // Add an account
    component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
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

    // Update document header - missed desp
    let dochead: Document = new Document();
    dochead.TranDate = moment();
    dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
    dochead.Desp = 'test';
    component.firstFormGroup.get('headerControl').setValue(dochead);
    component.firstFormGroup.get('headerControl').markAsDirty();
    tick();
    fixture.detectChanges();
    expect(component.firstFormGroup.valid).toBeFalsy();;
    expect(component.nextButtonEnabled).toBeFalsy();

    // Account
    component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
    component.firstFormGroup.get('accountControl').markAsDirty();
    // Amount - missing
    // Control center
    component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
    component.firstFormGroup.get('ccControl').markAsDirty();
    // Order - empty
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

    // Update document header - missed desp
    let dochead: Document = new Document();
    dochead.TranDate = moment();
    dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
    dochead.Desp = 'test';
    component.firstFormGroup.get('headerControl').setValue(dochead);
    component.firstFormGroup.get('headerControl').markAsDirty();
    tick();
    fixture.detectChanges();
    expect(component.firstFormGroup.valid).toBeFalsy();;
    expect(component.nextButtonEnabled).toBeFalsy();

    // Account
    component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
    component.firstFormGroup.get('accountControl').markAsDirty();
    // Amount - missing
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

    expect(component.currentStep).toEqual(0);
    expect(component.firstFormGroup.valid).toBeFalsy();

    // Update document header - missed desp
    let dochead: Document = new Document();
    dochead.TranDate = moment();
    dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
    dochead.Desp = 'test';
    component.firstFormGroup.get('headerControl').setValue(dochead);
    component.firstFormGroup.get('headerControl').markAsDirty();
    tick();
    fixture.detectChanges();
    expect(component.firstFormGroup.valid).toBeFalsy();;
    expect(component.nextButtonEnabled).toBeFalsy();

    // Account
    component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
    component.firstFormGroup.get('accountControl').markAsDirty();
    // Amount
    component.firstFormGroup.get('amountControl').setValue(100.20);
    component.firstFormGroup.get('amountControl').markAsDirty();
    // Control center
    component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
    component.firstFormGroup.get('ccControl').markAsDirty();
    // Order - empty
    tick();
    fixture.detectChanges();
    expect(component.firstFormGroup.valid).toBeTruthy();
    expect(component.nextButtonEnabled).toBeTruthy();

    // Go to next page
    component.next();
    tick();
    fixture.detectChanges();
    expect(component.currentStep).toEqual(1);

    // Go back to step 0
    component.pre();
    tick();
    fixture.detectChanges();
    expect(component.currentStep).toEqual(0);

    flush();
  }));

  it('setp 1: loan extra info is manadatory', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.currentStep).toEqual(0);
    expect(component.firstFormGroup.valid).toBeFalsy();

    // Update document header - missed desp
    let dochead: Document = new Document();
    dochead.TranDate = moment();
    dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
    dochead.Desp = 'test';
    component.firstFormGroup.get('headerControl').setValue(dochead);
    component.firstFormGroup.get('headerControl').markAsDirty();
    tick();
    fixture.detectChanges();
    expect(component.firstFormGroup.valid).toBeFalsy();;
    expect(component.nextButtonEnabled).toBeFalsy();

    // Account
    component.firstFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
    component.firstFormGroup.get('accountControl').markAsDirty();
    // Amount
    component.firstFormGroup.get('amountControl').setValue(100.20);
    component.firstFormGroup.get('amountControl').markAsDirty();
    // Control center
    component.firstFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
    component.firstFormGroup.get('ccControl').markAsDirty();
    // Order - empty
    tick();
    fixture.detectChanges();
    expect(component.firstFormGroup.valid).toBeTruthy();
    expect(component.nextButtonEnabled).toBeTruthy();

    // Go to next page
    component.next();
    tick();
    fixture.detectChanges();
    expect(component.currentStep).toEqual(1);

    expect(component.extraFormGroup.valid).toBeFalsy();
    expect(component.nextButtonEnabled).toBeFalsy();

    // Update the correct extra info
    const extraLoan: AccountExtraLoan = new AccountExtraLoan();
    extraLoan.startDate = moment();
    extraLoan.endDate = moment().add(1, 'y');
    extraLoan.InterestFree = true;
    extraLoan.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
    extraLoan.TotalMonths = 12;
    expect(extraLoan.isAccountValid).toBeTruthy();
    extraLoan.loanTmpDocs.push(
      {
        DocId: 1,
        AccountId: fakeData.finAccounts[0].Id,
        TranType: fakeData.finTranTypes[0].Id,
        TranAmount: 100,
        ControlCenterId: fakeData.finControlCenters[0].Id,
        Desp: 'test',
        TranDate: moment().add(1, 'd')
      } as TemplateDocLoan);
    expect(extraLoan.isValid).toBeTruthy();
    component.extraFormGroup.get('loanAccountControl').setValue(extraLoan);
    component.extraFormGroup.get('loanAccountControl').markAsDirty();
    tick();
    fixture.detectChanges();
    expect(component.extraFormGroup.valid).toBeTruthy();
    expect(component.nextButtonEnabled).toBeTruthy();

    flush();
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
