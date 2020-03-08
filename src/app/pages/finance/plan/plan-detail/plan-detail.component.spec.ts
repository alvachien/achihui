import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, UrlSegment } from '@angular/router';
import { NgZorroAntdModule, NZ_I18N, en_US, } from 'ng-zorro-antd';
import { BehaviorSubject, of, } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';

import { getTranslocoModule, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError,
  ElementClass_DialogContent, ElementClass_DialogCloseButton, } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService, } from '../../../../services';
import { UserAuthInfo, Plan, PlanTypeEnum, } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { PlanDetailComponent } from './plan-detail.component';

describe('PlanDetailComponent', () => {
  let component: PlanDetailComponent;
  let fixture: ComponentFixture<PlanDetailComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllCurrenciesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllControlCentersSpy: any;
  let readPlanSpy: any;
  let createPlanSpy: any;
  let changePlanSpy: any;
  let activatedRouteStub: any;
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
    uiServiceStub.getUILabel = (le: any) => '';
  });

  beforeEach(async(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        MessageDialogComponent,
        PlanDetailComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
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
    fixture = TestBed.createComponent(PlanDetailComponent);
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
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(asyncData(fakeData.currencies));
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(asyncData(fakeData.finControlCenters));
      createPlanSpy.and.returnValue(asyncData(fakeData.finPlans[0]));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
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
      expect(component.detailFormGroup.get('startDateControl').value).toBeTruthy();
      expect(component.detailFormGroup.get('endDateControl').value).toBeTruthy();
      expect(component.detailFormGroup.get('currControl').value).toEqual(fakeData.chosedHome.BaseCurrency);

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

      component.detailFormGroup.get('despControl').setValue('test');
      component.detailFormGroup.get('amountControl').setValue(200);

      component.detailFormGroup.markAsDirty();
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeFalsy();
      expect(component.saveButtonEnabled).toBeFalsy();

      component.detailFormGroup.get('typeControl').setValue(PlanTypeEnum.Account);
      component.detailFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
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

      component.detailFormGroup.get('typeControl').setValue(PlanTypeEnum.Account);
      component.detailFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.detailFormGroup.get('amountControl').setValue(200);

      component.detailFormGroup.markAsDirty();
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeFalsy();
      expect(component.saveButtonEnabled).toBeFalsy();

      component.detailFormGroup.get('despControl').setValue('test');
      component.detailFormGroup.markAsDirty();
      fixture.detectChanges();
      expect(component.detailFormGroup.valid).toBeTruthy();
      expect(component.saveButtonEnabled).toBeTruthy();

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
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
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
