import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
  MatStepperNext,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';

import { AccountStatusFilterPipe, OrderValidFilterPipe, UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { HttpLoaderTestFactory, FakeDataHelper, asyncData } from '../../../testing';
import { DocumentNormalCreateComponent } from './document-normal-create.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { DocumentItem } from 'app/model';

describe('DocumentNormalCreateComponent', () => {
  let component: DocumentNormalCreateComponent;
  let fixture: ComponentFixture<DocumentNormalCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllOrdersSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllCurrenciesSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
    ]);
    fetchAllAccountCategoriesSpy = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = stroageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = stroageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = stroageService.fetchAllControlCenters.and.returnValue(of([]));
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
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
        UIAccountStatusFilterPipe,
        UIAccountCtgyFilterPipe,
        UIAccountCtgyFilterExPipe,
        UIOrderValidFilterPipe,
        DocumentNormalCreateComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinCurrencyService, useValue: currService },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: Router, useValue: routerSpy },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentNormalCreateComponent);
    component = fixture.componentInstance;
  });

  it('1. should create without data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('2. verify the steppers logic', () => {
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

    it('should set the default values: base currency, date, and so on', fakeAsync(() => {
      expect(component.firstFormGroup).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      flush();
      fixture.detectChanges();

      expect(component.TranCurrency).toEqual(fakeData.chosedHome.BaseCurrency);
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Also, the date shall be inputted
      expect(component.TranDate).toBeTruthy();
    }));

    it('step 1: should have accounts and others loaded', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      expect(component.arUIAccount.length).toEqual(0);
      expect(component.arUIOrder.length).toEqual(0);

      flush();
      fixture.detectChanges();

      expect(component.arUIAccount.length).toBeGreaterThan(0);
      expect(component.arUIOrder.length).toBeGreaterThan(0);
    }));

    it('step 1: should not allow go to second step if there are failure in first step', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;

      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBe(false);
      expect(component._stepper.selectedIndex).toBe(0);
    }));

    it('step 1: should go to second step if there are no failure in first step', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      component.firstFormGroup.get('despControl').setValue('Test');
      flush();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      expect(component._stepper.selectedIndex).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBe(true);
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should not allow go to third step if there are no items in second step', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Now in step 1
      expect(component._stepper.selectedIndex).toBe(0);
      // On step 1, setup the content
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 2, click the next button > third step
      expect(component._stepper.selectedIndex).toBe(1);
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // // It shall show a snackbar for error info.
      // let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      // expect(messageElement.textContent).toContain('No items or invalid item detected',
      //   'Expected snack bar to show the error message: No items or invalid item detected');
      // flush();
      // fixture.detectChanges();
      // flush();

      // It shall be stop at step 2.
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should not allow go to third step if there are items without account', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(1);
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // It shall not allowed
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should not allow go third step if there are items without tran. type', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // flush();
      // fixture.detectChanges();

      // It shall not allowed
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    it('step 2: should not allowed go third step if there are items without amount', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      // Setup the first step
      component.firstFormGroup.get('despControl').setValue('Test');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      // Click the next button > second step
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Setup the second step
      component.onCreateDocItem();
      fixture.detectChanges();

      // Then, click the next button > third step
      nextButtonNativeEl = fixture.debugElement.queryAll(By.directive(MatStepperNext))[1].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // flush();
      // fixture.detectChanges();

      // It shall not allowed
      expect(component._stepper.selectedIndex).toBe(1);
    }));

    // Asset account should not allowed

    // Asset account should not allowed

    // ADP account should not allowed

    // System tran type should not allowed

    // Should not allow neither control center nor order

    // Should not allow input control center and order both

    // Submit should work

    // Reset should work
  });
});
