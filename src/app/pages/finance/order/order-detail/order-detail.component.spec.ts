import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { addYears, subYears } from 'date-fns';
import { NzModalService } from 'ng-zorro-antd/modal';

import { OrderDetailComponent } from './order-detail.component';
import {
  createSpyObj,
  getTranslocoModule,
  ActivatedRouteUrlStub,
  FakeDataHelper,
  asyncData,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,
} from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { OverlayContainer } from '@angular/cdk/overlay';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let readOrderSpy: SafeAny;
  let createOrderSpy: SafeAny;
  let changeOrderSpy: SafeAny;
  let changeOrderByPatchSpy: SafeAny;
  let activatedRouteStub: SafeAny;
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

    storageService = createSpyObj('FinanceOdataService', [
      'fetchAllControlCenters',
      'readOrder',
      'createOrder',
      'changeOrder',
      'changeOrderByPatch',
    ]);
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    readOrderSpy = storageService.readOrder.and.returnValue(of({}));
    createOrderSpy = storageService.createOrder.and.returnValue(of({}));
    changeOrderSpy = storageService.changeOrder.and.returnValue(of({}));
    changeOrderByPatchSpy = storageService.changeOrderByPatch.and.returnValue(of({}));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [
        FormsModule,

        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
        NzFormModule,
        NzInputModule,
        NzSelectModule,
        NzDatePickerModule,
        NzButtonModule,
        NzTableModule,
        NzResultModule,
        NzPageHeaderModule,
        NzBreadCrumbModule,
        NzSpinModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    // TestBed.overrideModule(BrowserDynamicTestingModule, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('1. create mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      createOrderSpy.and.returnValue(asyncData(fakeData.finOrders[0]));
    });
    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.isCreateMode).toBeTruthy();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('Name is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      // component.detailFormGroup.get('nameControl').setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(new Date());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(addYears(new Date(), 1));
      // Comment
      component.detailFormGroup.get('cmtControl')?.setValue('test');
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeFalsy();

      component.detailFormGroup.get('nameControl')?.setValue('test');
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('Validity is manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      component.detailFormGroup.get('nameControl')?.setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(new Date());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(subYears(new Date(), 1));
      // Comment
      component.detailFormGroup.get('cmtControl')?.setValue('test');
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeFalsy();

      component.detailFormGroup.get('endDateControl')?.setValue(addYears(new Date(), 1));
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('Settlement rules are manadatory', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      component.detailFormGroup.get('nameControl')?.setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(new Date());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(addYears(new Date(), 1));
      // Comment
      component.detailFormGroup.get('cmtControl')?.setValue('test');
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();
      expect(component.saveButtonEnabled).toBeFalsy();

      // Add the rules
      component.onCreateRule();
      expect(component.listRules.length).toBe(1);
      expect(component.saveButtonEnabled).toBeFalsy();

      // Add the second rule
      component.onCreateRule();
      expect(component.listRules.length).toBe(2);
      expect(component.saveButtonEnabled).toBeFalsy();

      // Change it.
      component.listRules[0].ControlCenterId = fakeData.finControlCenters[0].Id;
      component.listRules[0].Precent = 30;
      component.listRules[1].ControlCenterId = fakeData.finControlCenters[0].Id;
      component.listRules[1].Precent = 70;
      fixture.detectChanges();
      expect(component.saveButtonEnabled).toBeTruthy();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall show success result', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      component.detailFormGroup.get('nameControl')?.setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(new Date());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(addYears(new Date(), 1));
      // Comment
      component.detailFormGroup.get('cmtControl')?.setValue('test');
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();
      expect(component.saveButtonEnabled).toBeFalsy();

      if (fakeData.finControlCenters.length > 1) {
        // Add the rules
        component.onCreateRule();
        expect(component.listRules.length).toBe(1);
        expect(component.saveButtonEnabled).toBeFalsy();

        // Add the second rule
        component.onCreateRule();
        expect(component.listRules.length).toBe(2);
        expect(component.saveButtonEnabled).toBeFalsy();

        // Change it.
        component.listRules[0].ControlCenterId = fakeData.finControlCenters[0].Id;
        component.listRules[0].Precent = 30;
        component.listRules[1].ControlCenterId = fakeData.finControlCenters[1].Id;
        component.listRules[1].Precent = 70;
        fixture.detectChanges();
        expect(component.saveButtonEnabled).toBeTruthy();
      } else if (fakeData.finControlCenters.length === 1) {
        // Add the rules
        component.onCreateRule();
        expect(component.listRules.length).toBe(1);
        expect(component.saveButtonEnabled).toBeFalsy();

        component.listRules[0].ControlCenterId = fakeData.finControlCenters[0].Id;
        component.listRules[0].Precent = 100;
        fixture.detectChanges();
        expect(component.saveButtonEnabled).toBeTruthy();
      } else {
        // Let it fails
        expect(fakeData.finControlCenters.length).toBeTruthy();
      }

      // Do the save
      component.onSubmit();
      expect(component.isOrderSubmitting).toBe(true);
      expect(createOrderSpy).toHaveBeenCalled();

      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.isOrderSubmitted).toBe(true);
      expect(component.orderIdCreated).toBeTruthy();
      expect(component.orderSavedFailed).toBeFalsy();

      await new Promise<void>((r) => setTimeout(r, 0)); // nz-spin
      fixture.detectChanges();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall show failed result', async () => {
      createOrderSpy.and.returnValue(asyncError('failed in creation'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      component.detailFormGroup.get('nameControl')?.setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(new Date());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(addYears(new Date(), 1));
      // Comment
      component.detailFormGroup.get('cmtControl')?.setValue('test');
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();
      expect(component.saveButtonEnabled).toBeFalsy();

      if (fakeData.finControlCenters.length > 1) {
        // Add the rules
        component.onCreateRule();
        expect(component.listRules.length).toBe(1);
        expect(component.saveButtonEnabled).toBeFalsy();

        // Add the second rule
        component.onCreateRule();
        expect(component.listRules.length).toBe(2);
        expect(component.saveButtonEnabled).toBeFalsy();

        // Change it.
        component.listRules[0].ControlCenterId = fakeData.finControlCenters[0].Id;
        component.listRules[0].Precent = 30;
        component.listRules[1].ControlCenterId = fakeData.finControlCenters[1].Id;
        component.listRules[1].Precent = 70;
        fixture.detectChanges();
        expect(component.saveButtonEnabled).toBeTruthy();
      } else if (fakeData.finControlCenters.length === 1) {
        // Add the rules
        component.onCreateRule();
        expect(component.listRules.length).toBe(1);
        expect(component.saveButtonEnabled).toBeFalsy();

        component.listRules[0].ControlCenterId = fakeData.finControlCenters[0].Id;
        component.listRules[0].Precent = 100;
        fixture.detectChanges();
        expect(component.saveButtonEnabled).toBeTruthy();
      } else {
        // Let it fails
        expect(fakeData.finControlCenters.length).toBeTruthy();
      }

      // Do the save
      component.onSubmit();
      expect(component.isOrderSubmitting).toBe(true);
      expect(createOrderSpy).toHaveBeenCalled();

      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // nz-spin
      fixture.detectChanges();
      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.isOrderSubmitted).toBe(true);
      expect(component.orderIdCreated).toBeFalsy();
      expect(component.orderSavedFailed).toBeTruthy();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall popup error dialog if settlement rules are invalid', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      component.detailFormGroup.get('nameControl')?.setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(new Date());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(addYears(new Date(), 1));
      // Comment
      component.detailFormGroup.get('cmtControl')?.setValue('test');
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();
      expect(component.saveButtonEnabled).toBeFalsy();

      if (fakeData.finControlCenters.length > 1) {
        // Add the rules
        component.onCreateRule();
        expect(component.listRules.length).toBe(1);
        expect(component.saveButtonEnabled).toBeFalsy();

        // Add the second rule
        component.onCreateRule();
        expect(component.listRules.length).toBe(2);
        expect(component.saveButtonEnabled).toBeFalsy();

        // Change it.
        component.listRules[0].ControlCenterId = fakeData.finControlCenters[0].Id;
        component.listRules[0].Precent = 30;
        component.listRules[1].ControlCenterId = fakeData.finControlCenters[0].Id;
        component.listRules[1].Precent = 70;
        fixture.detectChanges();
        expect(component.saveButtonEnabled).toBeTruthy();
      } else if (fakeData.finControlCenters.length === 1) {
        // Add the rules
        component.onCreateRule();
        expect(component.listRules.length).toBe(1);
        expect(component.saveButtonEnabled).toBeFalsy();

        component.listRules[0].ControlCenterId = fakeData.finControlCenters[0].Id;
        component.listRules[0].Precent = 110;
        fixture.detectChanges();
        expect(component.saveButtonEnabled).toBeTruthy();
      } else {
        // Let it fails
        expect(fakeData.finControlCenters.length).toBeTruthy();
      }

      // Do the save
      component.onSubmit();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
      fixture.detectChanges();

      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.orderIdCreated).toBeUndefined();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should display error when Service fails on control center', async () => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('2. change mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);

      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      readOrderSpy.and.returnValue(asyncData(fakeData.finOrders[0]));
      changeOrderSpy.and.returnValue(asyncData(fakeData.finOrders[0]));
      changeOrderByPatchSpy.and.returnValue(asyncData(fakeData.finOrders[0]));
    });
    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('change mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.isCreateMode).toBeFalsy();
      expect(component.listRules.length).toBeGreaterThan(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall show success result', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();
      // Change the name
      component.detailFormGroup.get('nameControl')?.setValue('test2');
      component.detailFormGroup.get('nameControl')?.markAsDirty();

      expect(component.saveButtonEnabled).toBe(true);

      // Do the save
      component.onSubmit();
      expect(component.isOrderSubmitting).toBe(true);
      expect(changeOrderByPatchSpy).toHaveBeenCalled();

      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.isOrderSubmitted).toBe(true);
      //expect(component.orderIdCreated).toBeUndefined();
      expect(component.orderSavedFailed).toBeFalsy();

      await new Promise<void>((r) => setTimeout(r, 0)); // nz-spin
      fixture.detectChanges();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall show failed result without rule change', async () => {
      changeOrderByPatchSpy.and.returnValue(asyncError('failed in creation'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();
      // Change the name
      component.detailFormGroup.get('nameControl')?.setValue('test2');
      component.detailFormGroup.get('nameControl')?.markAsDirty();

      expect(component.saveButtonEnabled).toBe(true);

      // Do the save
      component.onSubmit();
      expect(component.isOrderSubmitting).toBe(true);
      expect(changeOrderByPatchSpy).toHaveBeenCalled();

      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // nz-spin
      fixture.detectChanges();
      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.isOrderSubmitted).toBe(true);
      expect(component.orderIdCreated).toBeUndefined();
      expect(component.orderSavedFailed).toBeTruthy();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall popup error dialog if settlement rules are invalid', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.listRules.length).toBeGreaterThan(0);

      const nidx = component.listRules.length;
      component.onCreateRule();
      component.listRules[nidx].ControlCenterId = fakeData.finControlCenters[0].Id;
      component.listRules[nidx].Precent = 50;
      fixture.detectChanges();
      expect(component.saveButtonEnabled).toBeTruthy();

      // Do the save
      component.onSubmit();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
      fixture.detectChanges();

      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.orderIdCreated).toBeUndefined();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should display error when Service fails on control center', async () => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should display error when Service fails on read order', async () => {
      // tell spy to return an async error observable
      readOrderSpy.and.returnValue(asyncError<string>('read order failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('3. display mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);

      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      readOrderSpy.and.returnValue(asyncData(fakeData.finOrders[0]));
    });
    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('display mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeFalsy();
      expect(component.isCreateMode).toBeFalsy();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should display error when Service fails on control center', async () => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should display error when Service fails on read order', async () => {
      // tell spy to return an async error observable
      readOrderSpy.and.returnValue(asyncError<string>('read order failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
});
