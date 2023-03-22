import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, flush, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';

import { FinanceUIModule } from '../../finance-ui.module';
import { OrderDetailComponent } from './order-detail.component';
import {
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
import { MessageDialogComponent } from '../../../message-dialog';
import { SafeAny } from 'src/common';

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

    storageService = jasmine.createSpyObj('FinanceOdataService', [
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

  beforeEach(waitForAsync(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [OrderDetailComponent, MessageDialogComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [MessageDialogComponent],
      },
    }).compileComponents();
  }));

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
    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.isCreateMode).toBeTruthy();

      flush();
    }));

    it('Name is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      // component.detailFormGroup.get('nameControl').setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(moment().toDate());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(moment().add(1, 'y').toDate());
      // Comment
      component.detailFormGroup.get('cmtControl')?.setValue('test');
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeFalsy();

      component.detailFormGroup.get('nameControl')?.setValue('test');
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();

      flush();
    }));

    it('Validity is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      component.detailFormGroup.get('nameControl')?.setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(moment().toDate());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(moment().subtract(1, 'y').toDate());
      // Comment
      component.detailFormGroup.get('cmtControl')?.setValue('test');
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeFalsy();

      component.detailFormGroup.get('endDateControl')?.setValue(moment().add(1, 'y').toDate());
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();

      flush();
    }));

    it('Settlement rules are manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      component.detailFormGroup.get('nameControl')?.setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(moment().toDate());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(moment().add(1, 'y').toDate());
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

      flush();
    }));

    it('shall show success result', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      component.detailFormGroup.get('nameControl')?.setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(moment().toDate());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(moment().add(1, 'y').toDate());
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
      expect(component.isOrderSubmitting).toBeTrue();
      expect(createOrderSpy).toHaveBeenCalled();

      tick();
      fixture.detectChanges();
      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.isOrderSubmitted).toBeTrue();
      expect(component.orderIdCreated).toBeTruthy();
      expect(component.orderSavedFailed).toBeFalsy();

      tick(); // nz-spin
      fixture.detectChanges();

      flush();
    }));

    it('shall show failed result', fakeAsync(() => {
      createOrderSpy.and.returnValue(asyncError('failed in creation'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      component.detailFormGroup.get('nameControl')?.setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(moment().toDate());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(moment().add(1, 'y').toDate());
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
      expect(component.isOrderSubmitting).toBeTrue();
      expect(createOrderSpy).toHaveBeenCalled();

      tick();
      fixture.detectChanges();
      tick(); // nz-spin
      fixture.detectChanges();
      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.isOrderSubmitted).toBeTrue();
      expect(component.orderIdCreated).toBeFalsy();
      expect(component.orderSavedFailed).toBeTruthy();

      flush();
    }));

    it('shall popup error dialog if settlement rules are invalid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Name
      component.detailFormGroup.get('nameControl')?.setValue('test');
      // Valid from
      component.detailFormGroup.get('startDateControl')?.setValue(moment().toDate());
      // Valid to
      component.detailFormGroup.get('endDateControl')?.setValue(moment().add(1, 'y').toDate());
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
      flush();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
      fixture.detectChanges();

      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.orderIdCreated).toBeUndefined();
      flush();
      tick();
      fixture.detectChanges();

      flush();
    }));

    it('should display error when Service fails on control center', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
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
    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('change mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.isCreateMode).toBeFalsy();
      expect(component.listRules.length).toBeGreaterThan(0);

      flush();
    }));

    it('shall show success result', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      // Change the name
      component.detailFormGroup.get('nameControl')?.setValue('test2');
      component.detailFormGroup.get('nameControl')?.markAsDirty();

      expect(component.saveButtonEnabled).toBeTrue();

      // Do the save
      component.onSubmit();
      expect(component.isOrderSubmitting).toBeTrue();
      expect(changeOrderByPatchSpy).toHaveBeenCalled();

      tick();
      fixture.detectChanges();
      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.isOrderSubmitted).toBeTrue();
      //expect(component.orderIdCreated).toBeUndefined();
      expect(component.orderSavedFailed).toBeFalsy();

      tick(); // nz-spin
      fixture.detectChanges();

      flush();
    }));

    it('shall show failed result without rule change', fakeAsync(() => {
      changeOrderByPatchSpy.and.returnValue(asyncError('failed in creation'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      // Change the name
      component.detailFormGroup.get('nameControl')?.setValue('test2');
      component.detailFormGroup.get('nameControl')?.markAsDirty();

      expect(component.saveButtonEnabled).toBeTrue();

      // Do the save
      component.onSubmit();
      expect(component.isOrderSubmitting).toBeTrue();
      expect(changeOrderByPatchSpy).toHaveBeenCalled();

      tick();
      fixture.detectChanges();
      tick(); // nz-spin
      fixture.detectChanges();
      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.isOrderSubmitted).toBeTrue();
      expect(component.orderIdCreated).toBeUndefined();
      expect(component.orderSavedFailed).toBeTruthy();

      flush();
    }));

    it('shall popup error dialog if settlement rules are invalid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
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
      flush();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);
      fixture.detectChanges();

      expect(component.isOrderSubmitting).toBeFalsy();
      expect(component.orderIdCreated).toBeUndefined();
      flush();
      tick();
      fixture.detectChanges();

      flush();
    }));

    it('should display error when Service fails on control center', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
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

    it('should display error when Service fails on read order', fakeAsync(() => {
      // tell spy to return an async error observable
      readOrderSpy.and.returnValue(asyncError<string>('read order failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
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
  });

  describe('3. display mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);

      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      readOrderSpy.and.returnValue(asyncData(fakeData.finOrders[0]));
    });
    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('display mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeFalsy();
      expect(component.isCreateMode).toBeFalsy();

      flush();
    }));

    it('should display error when Service fails on control center', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
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

    it('should display error when Service fails on read order', fakeAsync(() => {
      // tell spy to return an async error observable
      readOrderSpy.and.returnValue(asyncError<string>('read order failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
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
  });
});
