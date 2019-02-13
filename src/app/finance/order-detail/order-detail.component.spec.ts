import { async, ComponentFixture, TestBed, fakeAsync, inject, tick, flush, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MatStepperNext,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { OrderDetailComponent } from './order-detail.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';
import { Order } from '../../model';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllControlCentersSpy: any;
  let readOrderSpy: any;
  let createOrderSpy: any;
  let changeOrderSpy: any;
  let routerSpy: any;
  let activatedRouteStub: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllControlCenters',
      'readOrder',
      'createOrder',
      'changeOrder',
    ]);
    readOrderSpy = stroageService.readOrder.and.returnValue(of({}));
    createOrderSpy = stroageService.createOrder.and.returnValue(of({}));
    changeOrderSpy = stroageService.changeOrder.and.returnValue(of({}));
    fetchAllControlCentersSpy = stroageService.fetchAllControlCenters.and.returnValue(of([]));
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    const fetchAllCurrenciesSpy: any = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        OrderDetailComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
  });

  it('1. should be created without data', () => {
    expect(component).toBeTruthy();
  });

  describe('2. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      // CC
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display error when control center service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Control center service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(0);

      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Control center service failed',
        'Expected snack bar to show the error message: Control center service failed');
      flush();
    }));
  });

  describe('3. Create mode: checking logic and submit', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      // CC
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      // Create order
      createOrderSpy.and.returnValue(asyncData(fakeData.finOrders[0]));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('step 1: should set the default values: date, and so on', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      expect(component.isFieldChangable).toBeTruthy();

      expect(component.firstFormGroup.get('validFromControl').value).toBeTruthy();
      expect(component.firstFormGroup.get('validToControl').value).toBeTruthy();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      expect(component.firstStepCompleted).toBeFalsy();
    }));
    it('step 1: name is a must', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.firstFormGroup.get('validFromControl').value).toBeTruthy();
      expect(component.firstFormGroup.get('validToControl').value).toBeTruthy();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.firstStepCompleted).toBeFalsy();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      // Click the next button - no work!
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));
    it('step 1: shall allow got to step for valid case', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      component.firstFormGroup.get('nameControl').setValue('test');
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();
      expect(component._stepper.selectedIndex).toEqual(0); // At first step

      // Click the next button - no work!
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(1); // At second step
    }));
    it('step 2: rules is mandatory', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // First step
      component.firstFormGroup.get('nameControl').setValue('test');
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Second step
      expect(component._stepper.selectedIndex).toEqual(1); // At second step
      expect(component.ruleStepCompleted).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
    }));
    it('step 2: prevent the case that rule without control center', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // First step
      component.firstFormGroup.get('nameControl').setValue('test');
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Second step
      expect(component._stepper.selectedIndex).toEqual(1); // At second step
      expect(component.dataSource.data.length).toEqual(0);
      component.onCreateRule();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(1);
      component.dataSource.data[0].Precent = 100;
      fixture.detectChanges();

      expect(component.ruleStepCompleted).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
    }));
    it('step 2: prevent the case that rule without precent', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // First step
      component.firstFormGroup.get('nameControl').setValue('test');
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Second step
      expect(component._stepper.selectedIndex).toEqual(1); // At second step
      expect(component.dataSource.data.length).toEqual(0);
      component.onCreateRule();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(1);
      component.dataSource.data[0].ControlCenterId = fakeData.finControlCenters[0].Id;
      // component.dataSource.data[0].Precent = 100;
      fixture.detectChanges();

      expect(component.ruleStepCompleted).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
    }));
    it('step 2: prevent the case that precent is less than zero', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // First step
      component.firstFormGroup.get('nameControl').setValue('test');
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Second step
      expect(component._stepper.selectedIndex).toEqual(1); // At second step
      expect(component.dataSource.data.length).toEqual(0);
      component.onCreateRule();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(1);
      component.dataSource.data[0].ControlCenterId = fakeData.finControlCenters[0].Id;
      component.dataSource.data[0].Precent = -1;
      fixture.detectChanges();

      expect(component.ruleStepCompleted).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
    }));
    it('step 2: prevent the case that precent sum up is less than 100', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // First step
      component.firstFormGroup.get('nameControl').setValue('test');
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Second step
      expect(component._stepper.selectedIndex).toEqual(1); // At second step
      expect(component.dataSource.data.length).toEqual(0);
      component.onCreateRule();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(1);
      component.dataSource.data[0].ControlCenterId = fakeData.finControlCenters[0].Id;
      component.dataSource.data[0].Precent = 90;
      fixture.detectChanges();

      expect(component.ruleStepCompleted).toBeFalsy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(1);
    }));
    it('step 2: shall go to step 3 for valid cases', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // First step
      component.firstFormGroup.get('nameControl').setValue('test');
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Second step
      expect(component._stepper.selectedIndex).toEqual(1); // At second step
      expect(component.dataSource.data.length).toEqual(0);
      component.onCreateRule();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(1);
      component.dataSource.data[0].ControlCenterId = fakeData.finControlCenters[0].Id;
      component.dataSource.data[0].Precent = 100;
      fixture.detectChanges();

      expect(component.ruleStepCompleted).toBeTruthy();
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(2);
    }));
    it('step 3: check fail case', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // First step
      component.firstFormGroup.get('nameControl').setValue('test');
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Second step
      expect(component._stepper.selectedIndex).toEqual(1); // At second step
      expect(component.dataSource.data.length).toEqual(0);
      component.onCreateRule();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(1);
      component.dataSource.data[0].ControlCenterId = fakeData.finControlCenters[0].Id;
      component.dataSource.data[0].Precent = 100;
      fixture.detectChanges();

      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Third step
      expect(component._stepper.selectedIndex).toEqual(2);
      component.dataSource.data[0].Precent = 90; // Ensure check failed
      component.onSubmit();
      expect(createOrderSpy).not.toHaveBeenCalled();

      // Error dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      tick();
      fixture.detectChanges();
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      // And, there shall no changes in the selected tab
      expect(component._stepper.selectedIndex).toBe(2);

      flush();
    }));
    it('step 3: submit success and navigation', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // First step
      component.firstFormGroup.get('nameControl').setValue('test');
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Second step
      expect(component._stepper.selectedIndex).toEqual(1); // At second step
      expect(component.dataSource.data.length).toEqual(0);
      component.onCreateRule();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(1);
      component.dataSource.data[0].ControlCenterId = fakeData.finControlCenters[0].Id;
      component.dataSource.data[0].Precent = 100;
      fixture.detectChanges();

      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Third step
      expect(component._stepper.selectedIndex).toEqual(2);
      component.onSubmit();
      expect(createOrderSpy).toHaveBeenCalled();

      tick();
      fixture.detectChanges();

      // Expect there is snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();

      tick(2000);
      fixture.detectChanges();
      // There shall be a navigation
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/order/display/' + fakeData.finOrders[0].Id.toString()]);

      flush();
    }));
    it('step 3: submit success and re-create', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // First step
      component.firstFormGroup.get('nameControl').setValue('test');
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Second step
      expect(component._stepper.selectedIndex).toEqual(1); // At second step
      expect(component.dataSource.data.length).toEqual(0);
      component.onCreateRule();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(1);
      component.dataSource.data[0].ControlCenterId = fakeData.finControlCenters[0].Id;
      component.dataSource.data[0].Precent = 100;
      fixture.detectChanges();

      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Third step
      expect(component._stepper.selectedIndex).toEqual(2);
      component.onSubmit();
      expect(createOrderSpy).toHaveBeenCalled();

      tick();
      fixture.detectChanges();

      // Expect there is snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();
      // Only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();

      // There shall be a navigation
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(component._stepper.selectedIndex).toEqual(0); // Reset
      expect(component.firstFormGroup.get('validFromControl').value).toBeTruthy();
      expect(component.firstFormGroup.get('validToControl').value).toBeTruthy();

      flush();
    }));
    it('step 3: submit fail case', fakeAsync(() => {
      createOrderSpy.and.returnValue(asyncError('500 error!'));

      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // First step
      component.firstFormGroup.get('nameControl').setValue('test');
      fixture.detectChanges();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Second step
      expect(component._stepper.selectedIndex).toEqual(1); // At second step
      expect(component.dataSource.data.length).toEqual(0);
      component.onCreateRule();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(1);
      component.dataSource.data[0].ControlCenterId = fakeData.finControlCenters[0].Id;
      component.dataSource.data[0].Precent = 100;
      fixture.detectChanges();

      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Third step
      expect(component._stepper.selectedIndex).toEqual(2);
      component.onSubmit();
      tick();
      fixture.detectChanges();

      // Error dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      // And, there shall no changes in the selected tab
      expect(component._stepper.selectedIndex).toBe(2);

      flush();
    }));
  });

  describe('3. Display mode: checking data loading', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let currentOrder: Order;

    beforeEach(() => {
      currentOrder = fakeData.finOrders[0];

      // CC
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      // Create order
      readOrderSpy.and.returnValue(asyncData(currentOrder));

      // Change the URL
      // let activatedRoute: any = fixture.debugElement.injector.get(ActivatedRoute) as any;
      // activatedRoute.setURL([new UrlSegment('display', { id : currentOrder.Id.toString() })] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer, ActivatedRoute],
      (oc: OverlayContainer, actRoute: any) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();

      // Change the URL
      actRoute = new ActivatedRouteUrlStub([new UrlSegment('display', { id : currentOrder.Id.toString() })] as UrlSegment[]);
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('step 1: should set thevalues: date, and so on', fakeAsync(() => {

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      tick(); // For readOrder;
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeFalsy();
      expect(readOrderSpy).toHaveBeenCalled();

      expect(component.firstFormGroup.get('validFromControl').value).toBeTruthy();
      expect(component.firstFormGroup.get('validToControl').value).toBeTruthy();
      expect(component.orderName).toEqual(currentOrder.Name);
      expect(component._stepper.selectedIndex).toEqual(0); // At first page

      flush();
    }));
  });
});
