import { waitForAsync, ComponentFixture, TestBed, inject, tick, fakeAsync, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule, FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NZ_I18N, en_US, } from 'ng-zorro-antd/i18n';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import * as moment from 'moment';

import { getTranslocoModule, FakeDataHelper, asyncData, asyncError, ElementClass_DialogContent, ElementClass_DialogCloseButton, } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, Document, DocumentItem, momentDateFormat } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { DocumentNormalMassCreateComponent } from './document-normal-mass-create.component';
import { DocumentNormalMassCreateItemComponent } from '../document-normal-mass-create-item';

describe('DocumentNormalMassCreateComponent', () => {
  let component: DocumentNormalMassCreateComponent;
  let fixture: ComponentFixture<DocumentNormalMassCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllOrdersSpy: any;
  let massCreateNormalDocumentSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinControlCenter();
    fakeData.buildFinAccounts();
    fakeData.buildFinOrders();
  });

  beforeEach(waitForAsync(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const homeService: Partial<HomeDefOdataService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const odataService: any = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllCurrencies',
      'fetchAllDocTypes',
      'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'massCreateNormalDocument',
    ]);
    fetchAllCurrenciesSpy = odataService.fetchAllCurrencies.and.returnValue(of([]));
    fetchAllDocTypesSpy = odataService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = odataService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = odataService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = odataService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = odataService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = odataService.fetchAllOrders.and.returnValue(of([]));
    massCreateNormalDocumentSpy = odataService.massCreateNormalDocument.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule(),
      ],
      declarations: [
        DocumentNormalMassCreateItemComponent,
        MessageDialogComponent,
        DocumentNormalMassCreateComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: odataService },
        { provide: NZ_I18N, useValue: en_US },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentNormalMassCreateComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Working with data', () => {
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
      // Mass create
      massCreateNormalDocumentSpy.and.returnValue(of({
        PostedDocuments: [{
          Id: 1,
          TranDateFormatString: '2020-01-01'
        }],
        FailedDocuments: []
      }));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
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
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
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
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
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
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
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
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
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
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
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
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
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
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('step 0: should create one initial item', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const control: FormArray = component.itemsFormGroup.controls.items as FormArray;
      expect(control.length).toEqual(1);

      expect(component.currentStep).toEqual(0);

      // Ensure create work
      const nidx = component.onCreateNewItem(null);
      expect(nidx).toBeGreaterThan(0);
      if (nidx > 0) {
        const nidx2 = component.onCopyItem(null, nidx);
        if (nidx2 > 0) {
          component.onRemoveItem(null, nidx2);
        }
        component.onRemoveItem(null, nidx);
      }
    }));

    it('step 1: display confirm info', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const control: FormArray = component.itemsFormGroup.controls.items as FormArray;
      expect(control.length).toEqual(1);

      const newItem: FormGroup = control.controls[0] as FormGroup;
      expect(newItem).toBeTruthy();
      newItem.get('dateControl').setValue(new Date());
      newItem.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      newItem.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      newItem.get('amountControl').setValue(100);
      newItem.get('despControl').setValue('test');
      newItem.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      newItem.updateValueAndValidity();
      expect(control.valid).toBeTrue();

      expect(component.nextButtonEnabled).toBeTrue();
      component.next();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(1);
      expect(component.confirmInfo.length).toBeGreaterThan(0);

      flush();
    }));

    it('step 2: display result', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const control: FormArray = component.itemsFormGroup.controls.items as FormArray;
      expect(control.length).toEqual(1);

      const newItem: FormGroup = control.controls[0] as FormGroup;
      expect(newItem).toBeTruthy();
      newItem.get('dateControl').setValue(new Date());
      newItem.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      newItem.get('tranTypeControl').setValue(fakeData.finTranTypes[0].Id);
      newItem.get('amountControl').setValue(100);
      newItem.get('despControl').setValue('test');
      newItem.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      newItem.updateValueAndValidity();
      expect(control.valid).toBeTrue();

      expect(component.nextButtonEnabled).toBeTrue();
      component.next();
      fixture.detectChanges();
      
      expect(component.currentStep).toEqual(1);
      expect(component.confirmInfo.length).toBeGreaterThan(0);

      expect(component.nextButtonEnabled).toBeTrue();
      component.next();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(2);
      expect(component.docIdCreated.length).toBeGreaterThan(0);

      flush();
    }));
  });
});
