import { async, ComponentFixture, TestBed, inject, tick, fakeAsync, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgZorroAntdModule, NZ_I18N, en_US, } from 'ng-zorro-antd';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';

import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { DocumentNormalCreateComponent } from './document-normal-create.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError, } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('DocumentNormalCreateComponent', () => {
  let component: DocumentNormalCreateComponent;
  let fixture: ComponentFixture<DocumentNormalCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllOrdersSpy: any;
  const modalClassName = '.ant-modal-body';

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

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    uiServiceStub.getUILabel = (le: any) => '';
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
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
    ]);
    fetchAllCurrenciesSpy = odataService.fetchAllCurrencies.and.returnValue(of([]));
    fetchAllDocTypesSpy = odataService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = odataService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = odataService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = odataService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = odataService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = odataService.fetchAllOrders.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [
        DocumentHeaderComponent,
        DocumentItemsComponent,
        DocumentNormalCreateComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        // { provide: Router, useValue: routerSpy },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: odataService },
        { provide: NZ_I18N, useValue: en_US },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentNormalCreateComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. should prevent errors by the checking logic', () => {
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
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('step 1: should set the default values: base currency, date, and so on', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.docForm.get('headerControl')).toBeTruthy('Expect control has been initialized');
    }));

    // it('step 1: should not allow go to second step if there are failure in first step', fakeAsync(() => {
    //   fixture.detectChanges(); // ngOnInit

    //   let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
    //   expect(component._stepper.selectedIndex).toBe(0);

    //   nextButtonNativeEl.click();
    //   fixture.detectChanges();

    //   tick(); // Complete the Observables in ngOnInit
    //   fixture.detectChanges();

    //   expect(component.firstFormGroup.valid).toBe(false);
    //   expect(component._stepper.selectedIndex).toBe(0);
    // }));

    // it('step 1: should go to second step for valid base currency case', fakeAsync(() => {
    //   fixture.detectChanges(); // ngOnInit
    //   tick(); // Complete the Observables in ngOnInit
    //   fixture.detectChanges();

    //   let curdoc: Document = new Document();
    //   curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
    //   curdoc.Desp = 'test';
    //   curdoc.TranDate = moment();
    //   component.firstFormGroup.get('headerControl').setValue(curdoc);
    //   component.firstFormGroup.get('headerControl').updateValueAndValidity();
    //   expect(component.firstFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
    //   component.firstFormGroup.updateValueAndValidity();
    //   fixture.detectChanges();

    //   expect(component.firstFormGroup.valid).toBe(true);

    //   // Click the next button
    //   let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
    //   expect(component._stepper.selectedIndex).toBe(0);

    //   nextButtonNativeEl.click();
    //   fixture.detectChanges();
    //   flush();
    //   fixture.detectChanges();

    //   expect(component._stepper.selectedIndex).toBe(1);
    // }));

    // it('step 1: should go to second step for valid foreign currency case', fakeAsync(() => {
    //   fixture.detectChanges(); // ngOnInit
    //   tick(); // Complete the Observables in ngOnInit
    //   fixture.detectChanges();

    //   let curdoc: Document = new Document();
    //   curdoc.TranCurr = 'USD';
    //   curdoc.Desp = 'test';
    //   curdoc.TranDate = moment();
    //   curdoc.ExgRate = 654.23;
    //   component.firstFormGroup.get('headerControl').setValue(curdoc);
    //   component.firstFormGroup.updateValueAndValidity();
    //   fixture.detectChanges();

    //   // Click the next button
    //   let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
    //   expect(component._stepper.selectedIndex).toBe(0);

    //   nextButtonNativeEl.click();
    //   flush();
    //   fixture.detectChanges();

    //   expect(component._stepper.selectedIndex).toBe(1);
    // }));

    // it('step 2: should not allow go to third step if there are no items in second step', fakeAsync(() => {
    //   fixture.detectChanges(); // ngOnInit

    //   // Now in step 1
    //   expect(component._stepper.selectedIndex).toBe(0);
    //   tick(); // Complete the Observables in ngOnInit
    //   fixture.detectChanges();

    //   let curdoc: Document = new Document();
    //   curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
    //   curdoc.Desp = 'test';
    //   curdoc.TranDate = moment();
    //   component.firstFormGroup.get('headerControl').setValue(curdoc);
    //   component.firstFormGroup.updateValueAndValidity();
    //   fixture.detectChanges();

    //   // Click the next button > second step
    //   let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
    //   nextButtonNativeEl.click();
    //   fixture.detectChanges();

    //   // Now in step 2, click the next button > third step
    //   expect(component._stepper.selectedIndex).toBe(1);
    //   nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
    //   nextButtonNativeEl.click();
    //   fixture.detectChanges();

    //   // It shall be stop at step 2.
    //   expect(component._stepper.selectedIndex).toBe(1);
    // }));

    // it('step 2: should not allow go to third step if there are items without account', fakeAsync(() => {
    //   fixture.detectChanges(); // ngOnInit
    //   tick(); // Complete the Observables in ngOnInit
    //   fixture.detectChanges();

    //   let curdoc: Document = new Document();
    //   curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
    //   curdoc.Desp = 'test';
    //   curdoc.TranDate = moment();
    //   component.firstFormGroup.get('headerControl').setValue(curdoc);
    //   component.firstFormGroup.updateValueAndValidity();
    //   fixture.detectChanges();

    //   // Click the next button > second step
    //   let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
    //   nextButtonNativeEl.click();
    //   fixture.detectChanges();

    //   // Setup the second step
    //   // Add item
    //   let ditem: DocumentItem = new DocumentItem();
    //   ditem.ItemId = 1;
    //   ditem.TranAmount = 200;
    //   ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
    //   ditem.TranType = 2;
    //   ditem.Desp = 'test';
    //   component.itemFormGroup.get('itemControl').setValue([ditem]);
    //   component.itemFormGroup.get('itemControl').updateValueAndValidity();
    //   expect(component.itemFormGroup.valid).toBeFalsy();
    //   fixture.detectChanges();

    //   // Then, click the next button > third step
    //   nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
    //   nextButtonNativeEl.click();
    //   fixture.detectChanges();

    //   // It shall not allow
    //   expect(component._stepper.selectedIndex).toBe(1);
    // }));

    // // Asset account should not allowed

    // // ADP account should not allowed

    // // System tran type should not allowed

    // // Order which not valid in this date shall not allow

    // it('step 2: should allow go third step if items are valid', fakeAsync(() => {
    //   fixture.detectChanges(); // ngOnInit
    //   tick(); // Complete the Observables in ngOnInit
    //   fixture.detectChanges();

    //   let curdoc: Document = new Document();
    //   curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
    //   curdoc.Desp = 'test';
    //   curdoc.TranDate = moment();
    //   component.firstFormGroup.get('headerControl').setValue(curdoc);
    //   component.firstFormGroup.updateValueAndValidity();
    //   fixture.detectChanges();

    //   // Click the next button > second step
    //   let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
    //   nextButtonNativeEl.click();
    //   fixture.detectChanges();

    //   // Add items
    //   let ditem: DocumentItem = new DocumentItem();
    //   ditem.AccountId = 11;
    //   ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
    //   ditem.TranType = 2;
    //   ditem.Desp = 'test';
    //   ditem.TranAmount = 20;
    //   ditem.ItemId = 1;
    //   component.itemFormGroup.get('itemControl').setValue([ditem]);
    //   component.itemFormGroup.get('itemControl').updateValueAndValidity();
    //   fixture.detectChanges();
    //   expect(component.itemFormGroup.valid).toBeTruthy();

    //   // Then, click the next button > third step
    //   nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
    //   nextButtonNativeEl.click();
    //   fixture.detectChanges();

    //   // It shall not allowed
    //   expect(component._stepper.selectedIndex).toBe(2);
    // }));

    // Reset should work
  });

  describe('Exception case handling', () => {
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
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display error when currency service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Currency service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Currency service failed',
        'Expected dialog to show the error message: Currency service failed');
      flush();
    }));

    it('2. should display error when accont category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Account category service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Account category service failed',
        'Expected snack bar to show the error message: Account category service failed');
      flush();
    }));

    it('3. should display error when doc type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Doc type service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Doc type service failed',
        'Expected snack bar to show the error message: Doc type service failed');
      flush();
    }));

    it('4. should display error when tran type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Tran type service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Tran type service failed',
        'Expected snack bar to show the error message: Tran type service failed');
      flush();
    }));

    it('5. should display error when accont service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Account service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Account service failed',
        'Expected snack bar to show the error message: Account service failed');
      flush();
    }));

    it('6. should display error when control center service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Control center service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Control center service failed',
        'Expected snack bar to show the error message: Control center service failed');
      flush();
    }));

    it('7. should display error when order service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Order service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit

      // tick();
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement.textContent).toContain('Order service failed',
        'Expected snack bar to show the error message: Order service failed');
      flush();
    }));
  });
});
