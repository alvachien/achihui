import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, flush, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';

import { FinanceUIModule } from '../../finance-ui.module';
import {
  getTranslocoModule,
  FakeDataHelper,
  ActivatedRouteUrlStub,
  asyncData,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,
} from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, TemplateDocLoan } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { DocumentLoanRepayCreateComponent } from './document-loan-repay-create.component';
import { UIAccountCtgyFilterExPipe, UIAccountStatusFilterPipe } from '../../pipes';
import { SafeAny } from 'src/common';

describe('DocumentLoanRepayCreateComponent', () => {
  let component: DocumentLoanRepayCreateComponent;
  let fixture: ComponentFixture<DocumentLoanRepayCreateComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllDocTypesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllCurrenciesSpy: SafeAny;
  let createLoanRepayDocSpy: SafeAny;
  let fetchAllLoanTmpDocsSpy: SafeAny;
  let readAccountSpy: SafeAny;
  let fetchLoanTmpDocCountForAccountSpy: SafeAny;
  let activatedRouteStub: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  let homeService: Partial<HomeDefOdataService>;
  // const modalClassName = '.ant-modal-body';
  // const nextButtonId = '#button_next_step';

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
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'fetchAllCurrencies',
      'createLoanRepayDoc',
      'fetchAllLoanTmpDocs',
      'readAccount',
      'fetchLoanTmpDocCountForAccount',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    createLoanRepayDocSpy = storageService.createLoanRepayDoc.and.returnValue(of({}));
    fetchAllLoanTmpDocsSpy = storageService.fetchAllLoanTmpDocs.and.returnValue(of([]));
    readAccountSpy = storageService.readAccount.and.returnValue(of({}));
    fetchLoanTmpDocCountForAccountSpy = storageService.fetchLoanTmpDocCountForAccount.and.returnValue(of([]));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('createloanrepay', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        FinanceUIModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        getTranslocoModule(),
      ],
      declarations: [
        DocumentLoanRepayCreateComponent,
        MessageDialogComponent,
        UIAccountCtgyFilterExPipe,
        UIAccountStatusFilterPipe,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
      ],
    }).compileComponents();

    // TestBed.overrideModule(BrowserDynamicTestingModule, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLoanRepayCreateComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    const btest = false;
    if (btest) {
      expect(createLoanRepayDocSpy).not.toHaveBeenCalled();
      expect(fetchLoanTmpDocCountForAccountSpy).toHaveBeenCalled();
    }
  });

  describe('Working with data', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let loanTmpDoc: TemplateDocLoan;

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

      loanTmpDoc = new TemplateDocLoan();
      loanTmpDoc.HID = fakeData.chosedHome.ID;
      loanTmpDoc.Desp = 'Loan 1';
      loanTmpDoc.TranDate = moment();
      loanTmpDoc.DocId = 3;
      loanTmpDoc.AccountId = 1;
      loanTmpDoc.TranAmount = 300;
      fetchAllLoanTmpDocsSpy = storageService.fetchAllLoanTmpDocs.and.returnValue(asyncData([loanTmpDoc]));

      readAccountSpy = storageService.readAccount.and.returnValue(asyncData(fakeData.finAccounts[0]));
      createLoanRepayDocSpy = storageService.createLoanRepayDoc.and.returnValue(
        asyncData({
          Id: 101,
        })
      );
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should popup error dialog if fetchAllAccountCategories fails', fakeAsync(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllTranTypes fails', fakeAsync(() => {
      fetchAllTranTypesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllAccounts fails', fakeAsync(() => {
      fetchAllAccountsSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllControlCenters fails', fakeAsync(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllOrders fails', fakeAsync(() => {
      fetchAllOrdersSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllCurrencies fails', fakeAsync(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllDocTypes fails', fakeAsync(() => {
      fetchAllDocTypesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('step 0: search for template loan document', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.searchFormGroup.valid).toBeFalsy();

      // Search filter
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().toDate(), moment().add(1, 'month').toDate()]);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.updateValueAndValidity();

      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeFalsy();
      expect(component.selectedLoanTmpDoc.length).toEqual(0);

      // Now search for loan tmplate doc.
      component.onSearchLoanTmp();
      tick();
      fixture.detectChanges();
      expect(component.listOfLoanTmpDoc.length).toBeGreaterThan(0);
      // Add to select
      component.onTmpLoanDocRowSelectChanged(true, component.listOfLoanTmpDoc[0]);
      fixture.detectChanges();
      expect(component.selectedLoanTmpDoc.length).toEqual(1);
      expect(component.nextButtonEnabled).toBeTruthy();

      // Deselect
      component.onTmpLoanDocRowSelectChanged(false, component.listOfLoanTmpDoc[0]);
      fixture.detectChanges();
      expect(component.selectedLoanTmpDoc.length).toEqual(0);
      expect(component.nextButtonEnabled).toBeFalsy();

      flush();
    }));

    it('step 0: shall popup error dialog if failed to search for template loan', fakeAsync(() => {
      fetchAllLoanTmpDocsSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.searchFormGroup.valid).toBeFalsy();

      // Search filter
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().toDate(), moment().add(1, 'month').toDate()]);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.updateValueAndValidity();

      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeFalsy();
      expect(component.selectedLoanTmpDoc.length).toEqual(0);

      // Now search for loan tmplate doc.
      component.onSearchLoanTmp();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    xit('step 0: shall popup error dialog if failed to read loan account', fakeAsync(() => {
      readAccountSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.searchFormGroup.valid).toBeFalsy();

      // Search filter
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().toDate(), moment().add(1, 'month').toDate()]);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.updateValueAndValidity();

      expect(component.searchFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeFalsy();
      expect(component.selectedLoanTmpDoc.length).toEqual(0);

      // Now search for loan tmplate doc.
      component.onSearchLoanTmp();
      tick();
      fixture.detectChanges();
      expect(component.listOfLoanTmpDoc.length).toBeGreaterThan(0);
      // Add to select
      component.onTmpLoanDocRowSelectChanged(true, component.listOfLoanTmpDoc[0]);
      fixture.detectChanges();
      expect(component.selectedLoanTmpDoc.length).toBeGreaterThan(0);
      expect(component.nextButtonEnabled).toBeTruthy();

      component.next();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    xit('step 1: items', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);

      // Step 0. Search filter
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().toDate(), moment().add(1, 'month').toDate()]);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.updateValueAndValidity();
      // Now search for loan tmplate doc.
      component.onSearchLoanTmp();
      tick();
      fixture.detectChanges();
      expect(component.listOfLoanTmpDoc.length).toBeGreaterThan(0);
      // Add to select
      component.onTmpLoanDocRowSelectChanged(true, component.listOfLoanTmpDoc[0]);
      fixture.detectChanges();
      expect(component.selectedLoanTmpDoc.length).toBeGreaterThan(0);
      expect(component.nextButtonEnabled).toBeTruthy();

      component.next();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Step 1. Items
      expect(component.currentStep).toEqual(1);
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add items
      // component.onCreateItem();
      // expect(component.listItems.length).toEqual(1);

      // component.listItems[0].AccountId = fakeData.finAccounts[0].Id!;
      // component.listItems[0].TranAmount = component.amountOpen!;
      // component.onItemAmountChange();
      // expect(component.nextButtonEnabled).toBeTruthy();

      // flush();
    }));

    xit('step 2: confirm', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);

      // Step 0. Search filter
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().toDate(), moment().add(1, 'month').toDate()]);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.updateValueAndValidity();
      // Now search for loan tmplate doc.
      component.onSearchLoanTmp();
      tick();
      fixture.detectChanges();
      expect(component.listOfLoanTmpDoc.length).toBeGreaterThan(0);
      // Add to select
      component.onTmpLoanDocRowSelectChanged(true, component.listOfLoanTmpDoc[0]);
      fixture.detectChanges();
      expect(component.selectedLoanTmpDoc.length).toBeGreaterThan(0);
      expect(component.nextButtonEnabled).toBeTruthy();

      component.next();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Step 1. Items
      expect(component.currentStep).toEqual(1);
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add items
      // component.onCreateItem();
      // expect(component.listItems.length).toEqual(1);

      // component.listItems[0].AccountId = fakeData.finAccounts[0].Id!;
      // component.listItems[0].TranAmount = component.amountOpen!;
      // component.onItemAmountChange();
      // expect(component.nextButtonEnabled).toBeTruthy();

      // component.next();
      // fixture.detectChanges();

      // // Step 2.
      // expect(component.currentStep).toEqual(2);

      // flush();
    }));

    xit('step 3: result with success', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);

      // Step 0. Search filter
      component.searchFormGroup
        .get('dateRangeControl')
        ?.setValue([moment().toDate(), moment().add(1, 'month').toDate()]);
      component.searchFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.searchFormGroup.updateValueAndValidity();
      // Now search for loan tmplate doc.
      component.onSearchLoanTmp();
      tick();
      fixture.detectChanges();
      expect(component.listOfLoanTmpDoc.length).toBeGreaterThan(0);
      // Add to select
      component.onTmpLoanDocRowSelectChanged(true, component.listOfLoanTmpDoc[0]);
      fixture.detectChanges();
      expect(component.selectedLoanTmpDoc.length).toBeGreaterThan(0);
      expect(component.nextButtonEnabled).toBeTruthy();

      component.next();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Step 1. Items
      expect(component.currentStep).toEqual(1);
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add items
      // component.onCreateItem();
      // component.listItems[0].AccountId = fakeData.finAccounts[0].Id!;
      // component.listItems[0].TranAmount = component.amountOpen!;
      // component.onItemAmountChange();
      // expect(component.nextButtonEnabled).toBeTruthy();

      // component.next();
      // fixture.detectChanges();

      // // Step 2. Confirm
      // expect(component.currentStep).toEqual(2);
      // expect(component.nextButtonEnabled).toBeTruthy();
      // component.next();
      // fixture.detectChanges();
      // tick();
      // fixture.detectChanges();

      // flush();
    }));
  });

  describe('Working with data about navigation', () => {
    let overlayContainer: OverlayContainer;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let overlayContainerElement: HTMLElement;
    let loanTmpDoc: TemplateDocLoan;

    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('createloanrepay', {}), new UrlSegment('122', {})] as UrlSegment[]);

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

      loanTmpDoc = new TemplateDocLoan();
      loanTmpDoc.HID = fakeData.chosedHome.ID;
      loanTmpDoc.Desp = 'Loan 1';
      loanTmpDoc.TranDate = moment();
      loanTmpDoc.DocId = 3;
      loanTmpDoc.AccountId = 1;
      loanTmpDoc.TranAmount = 300;
      fetchAllLoanTmpDocsSpy = storageService.fetchAllLoanTmpDocs.and.returnValue(asyncData([loanTmpDoc]));

      readAccountSpy = storageService.readAccount.and.returnValue(asyncData(fakeData.finAccounts[0]));
      createLoanRepayDocSpy = storageService.createLoanRepayDoc.and.returnValue(
        asyncData({
          Id: 101,
        })
      );
    });

    beforeEach(inject([OverlayContainer, UIStatusService], (oc: OverlayContainer, uisvc: UIStatusService) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();

      uisvc.SelectedLoanTmp = loanTmpDoc;
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall work as expect', () => {
      // TBD.
    });
  });
});
