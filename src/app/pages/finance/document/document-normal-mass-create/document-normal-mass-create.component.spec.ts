import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

import {createSpyObj, getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,} from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { DocumentNormalMassCreateComponent } from './document-normal-mass-create.component';
import { DocumentNormalMassCreateItemComponent } from '../document-normal-mass-create-item';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DocumentNormalMassCreateComponent', () => {
  let component: DocumentNormalMassCreateComponent;
  let fixture: ComponentFixture<DocumentNormalMassCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: SafeAny;
  let fetchAllDocTypesSpy: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let massCreateNormalDocumentSpy: SafeAny;

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

  beforeEach(async () => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const homeService: Partial<HomeDefOdataService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const odataService = createSpyObj('FinanceOdataService', [
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
    // declarations moved to imports
    imports: [FormsModule,
        
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule()],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: odataService },
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
      massCreateNormalDocumentSpy.and.returnValue(
        of({
          PostedDocuments: [
            {
              Id: 1,
              TranDateFormatString: '2020-01-01',
            },
          ],
          FailedDocuments: [],
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

    it('should popup error dialog if fetchAllAccountCategories fails', async () => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllTranTypes fails', async () => {
      fetchAllTranTypesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllAccounts fails', async () => {
      fetchAllAccountsSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllControlCenters fails', async () => {
      fetchAllControlCentersSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllOrders fails', async () => {
      fetchAllOrdersSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllCurrencies fails', async () => {
      fetchAllCurrenciesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllDocTypes fails', async () => {
      fetchAllDocTypesSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 0: should create one initial item', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const control: UntypedFormArray = component.itemsFormGroup?.controls['items'] as UntypedFormArray;
      expect(control.length).toEqual(1);

      expect(component.currentStep).toEqual(0);

      // Ensure create work
      const nidx = component.onCreateNewItem();
      expect(nidx).toBeGreaterThan(0);
      if (nidx > 0) {
        const nidx2 = component.onCopyItem(undefined, nidx);
        if (nidx2 > 0) {
          component.onRemoveItem(undefined, nidx2);
        }
        component.onRemoveItem(undefined, nidx);
      }
    });

    it('step 1: display confirm info', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const control: UntypedFormArray = component.itemsFormGroup?.controls['items'] as UntypedFormArray;
      expect(control.length).toEqual(1);

      const newItem: UntypedFormGroup = control.controls[0] as UntypedFormGroup;
      expect(newItem).toBeTruthy();
      newItem.get('dateControl')?.setValue(new Date());
      newItem.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      newItem.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      newItem.get('amountControl')?.setValue(100);
      newItem.get('despControl')?.setValue('test');
      newItem.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      newItem.updateValueAndValidity();
      expect(control.valid).toBe(true);

      expect(component.nextButtonEnabled).toBe(true);
      component.next();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(1);
      expect(component.confirmInfo.length).toBeGreaterThan(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('step 2: display result', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>(r => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const control: UntypedFormArray = component.itemsFormGroup?.controls['items'] as UntypedFormArray;
      expect(control.length).toEqual(1);

      const newItem: UntypedFormGroup = control.controls[0] as UntypedFormGroup;
      expect(newItem).toBeTruthy();
      newItem.get('dateControl')?.setValue(new Date());
      newItem.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      newItem.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      newItem.get('amountControl')?.setValue(100);
      newItem.get('despControl')?.setValue('test');
      newItem.get('ccControl')?.setValue(fakeData.finControlCenters[0].Id);
      newItem.updateValueAndValidity();
      expect(control.valid).toBe(true);

      expect(component.nextButtonEnabled).toBe(true);
      component.next();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(1);
      expect(component.confirmInfo.length).toBeGreaterThan(0);

      expect(component.nextButtonEnabled).toBe(true);
      component.next();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(2);
      expect(component.docIdCreated.length).toBeGreaterThan(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });
  });
});
