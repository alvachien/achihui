import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, inject, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';

import { FinanceUIModule } from '../../finance-ui.module';
import {
  getTranslocoModule,
  ActivatedRouteUrlStub,
  FakeDataHelper,
  asyncData,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,
} from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, PlanTypeEnum } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { PlanDetailComponent } from './plan-detail.component';
import { SafeAny } from 'src/common';

describe('PlanDetailComponent', () => {
  let component: PlanDetailComponent;
  let fixture: ComponentFixture<PlanDetailComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllCurrenciesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let readPlanSpy: SafeAny;
  let createPlanSpy: SafeAny;
  let changePlanSpy: SafeAny;
  let activatedRouteStub: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  const homeServiceStub: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinPlans();

    homeServiceStub.ChosedHome = fakeData.chosedHome;

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllCurrencies',
      'fetchAllTranTypes',
      'fetchAllAccountCategories',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'readPlan',
      'createPlan',
      'changePlan',
    ]);
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    readPlanSpy = storageService.readPlan.and.returnValue(of({}));
    createPlanSpy = storageService.createPlan.and.returnValue(of({}));
    changePlanSpy = storageService.changePlan.and.returnValue(of({}));
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
      declarations: [MessageDialogComponent, PlanDetailComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
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
    fixture = TestBed.createComponent(PlanDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(changePlanSpy).not.toHaveBeenCalled();
  });

  describe('1. create mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(asyncData(fakeData.currencies));
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(
        asyncData(fakeData.finAccountCategories)
      );
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(
        asyncData(fakeData.finControlCenters)
      );
      createPlanSpy.and.returnValue(asyncData(fakeData.finPlans[0]));
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
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.isCreateMode).toBeTruthy();
      expect(component.saveButtonEnabled).toBeFalsy();

      // Default values
      expect(component.detailFormGroup.get('startDateControl')?.value).toBeTruthy();
      expect(component.detailFormGroup.get('endDateControl')?.value).toBeTruthy();
      expect(component.detailFormGroup.get('currControl')?.value).toEqual(fakeData.chosedHome.BaseCurrency);

      flush();
    }));

    it('type is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
      fixture.detectChanges();

      component.detailFormGroup.get('despControl')?.setValue('test');
      component.detailFormGroup.get('amountControl')?.setValue(200);

      component.detailFormGroup.markAsDirty();
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeFalsy();
      expect(component.saveButtonEnabled).toBeFalsy();

      component.detailFormGroup.get('typeControl')?.setValue(PlanTypeEnum.Account);
      component.detailFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.detailFormGroup.markAsDirty();
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();
      expect(component.saveButtonEnabled).toBeTruthy();

      flush();
    }));

    it('desp is manadatory', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
      fixture.detectChanges();

      component.detailFormGroup.get('typeControl')?.setValue(PlanTypeEnum.Account);
      component.detailFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.detailFormGroup.get('amountControl')?.setValue(200);

      component.detailFormGroup.markAsDirty();
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeFalsy();
      expect(component.saveButtonEnabled).toBeFalsy();

      component.detailFormGroup.get('despControl')?.setValue('test');
      component.detailFormGroup.markAsDirty();
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();
      expect(component.saveButtonEnabled).toBeTruthy();

      flush();
    }));

    it('it shall create plan with type Account successfully', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
      fixture.detectChanges();

      component.detailFormGroup.get('typeControl')?.setValue(PlanTypeEnum.Account);
      component.detailFormGroup.get('accountControl')?.setValue(fakeData.finAccounts[0].Id);
      component.detailFormGroup.get('amountControl')?.setValue(200);
      component.detailFormGroup.get('despControl')?.setValue('test');
      component.detailFormGroup.markAsDirty();

      component.detailFormGroup.markAsDirty();
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();
      expect(component.saveButtonEnabled).toBeTruthy();

      component.onSubmit();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(createPlanSpy).toHaveBeenCalled();
      expect(component.isObjectSubmitted).toEqual(true);
      expect(component.isObjectSubmitting).toEqual(false);
      expect(component.objectIdCreated).toBeTruthy();

      flush();
    }));

    it('it shall create plan with type Account Category successfully', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
      fixture.detectChanges();

      component.detailFormGroup.get('typeControl')?.setValue(PlanTypeEnum.AccountCategory);
      component.detailFormGroup.get('acntCtgyControl')?.setValue(fakeData.finAccountCategories[0].ID);
      component.detailFormGroup.get('amountControl')?.setValue(200);
      component.detailFormGroup.get('despControl')?.setValue('test');
      component.detailFormGroup.markAsDirty();

      component.detailFormGroup.markAsDirty();
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();
      expect(component.saveButtonEnabled).toBeTruthy();

      component.onSubmit();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(createPlanSpy).toHaveBeenCalled();
      expect(component.isObjectSubmitted).toEqual(true);
      expect(component.isObjectSubmitting).toEqual(false);
      expect(component.objectIdCreated).toBeTruthy();

      flush();
    }));

    it('it shall create plan with type Control Center successfully', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
      fixture.detectChanges();

      component.detailFormGroup.get('typeControl')?.setValue(PlanTypeEnum.ControlCenter);
      component.detailFormGroup.get('controlCenterControl')?.setValue(fakeData.finControlCenters[0].Id);
      component.detailFormGroup.get('amountControl')?.setValue(200);
      component.detailFormGroup.get('despControl')?.setValue('test');
      component.detailFormGroup.markAsDirty();

      component.detailFormGroup.markAsDirty();
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();
      expect(component.saveButtonEnabled).toBeTruthy();

      component.onSubmit();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(createPlanSpy).toHaveBeenCalled();
      expect(component.isObjectSubmitted).toEqual(true);
      expect(component.isObjectSubmitting).toEqual(false);
      expect(component.objectIdCreated).toBeTruthy();

      flush();
    }));

    it('it shall create plan with type Tran type successfully', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
      fixture.detectChanges();

      component.detailFormGroup.get('typeControl')?.setValue(PlanTypeEnum.TranType);
      component.detailFormGroup.get('tranTypeControl')?.setValue(fakeData.finTranTypes[0].Id);
      component.detailFormGroup.get('amountControl')?.setValue(200);
      component.detailFormGroup.get('despControl')?.setValue('test');
      component.detailFormGroup.markAsDirty();

      component.detailFormGroup.markAsDirty();
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();
      expect(component.saveButtonEnabled).toBeTruthy();

      component.onSubmit();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(createPlanSpy).toHaveBeenCalled();
      expect(component.isObjectSubmitted).toEqual(true);
      expect(component.isObjectSubmitting).toEqual(false);
      expect(component.objectIdCreated).toBeTruthy();

      flush();
    }));

    it('shall popup dialog for currencies service failure', fakeAsync(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncError('currencies service failed'));

      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
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

    it('shall popup dialog for transaction type service failure', fakeAsync(() => {
      fetchAllTranTypesSpy.and.returnValue(asyncError('transaction type service failed'));

      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
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

    it('shall popup dialog for account category service failure', fakeAsync(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError('account category service failed'));

      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
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

    it('shall popup dialog for account service failure', fakeAsync(() => {
      fetchAllAccountsSpy.and.returnValue(asyncError('accounts service failed'));

      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
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

    it('shall popup dialog for control center service failure', fakeAsync(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncError('control center service failed'));

      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
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

  describe('2. display mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);

      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(asyncData(fakeData.currencies));
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(
        asyncData(fakeData.finAccountCategories)
      );
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(
        asyncData(fakeData.finControlCenters)
      );
      readPlanSpy.and.returnValue(asyncData(fakeData.finPlans[0]));
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
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeFalsy();
      expect(component.isCreateMode).toBeFalsy();
      expect(component.detailFormGroup.disabled).toBeTruthy();

      flush();
    }));

    it('shall popup dialog for currencies service failure', fakeAsync(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncError('currencies service failed'));

      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
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

    it('shall popup dialog for transaction type service failure', fakeAsync(() => {
      fetchAllTranTypesSpy.and.returnValue(asyncError('transaction type service failed'));

      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
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

    it('shall popup dialog for account category service failure', fakeAsync(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError('account category service failed'));

      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
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

    it('shall popup dialog for account service failure', fakeAsync(() => {
      fetchAllAccountsSpy.and.returnValue(asyncError('accounts service failed'));

      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
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

    it('shall popup dialog for control center service failure', fakeAsync(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncError('control center service failed'));

      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
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

    it('shall popup dialog for read plan service failure', fakeAsync(() => {
      readPlanSpy.and.returnValue(asyncError('read plan service failed'));

      fixture.detectChanges();
      tick(); // activateRoute
      fixture.detectChanges();
      tick(); // forkJoin
      fixture.detectChanges();
      tick(); // nz-spin
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
