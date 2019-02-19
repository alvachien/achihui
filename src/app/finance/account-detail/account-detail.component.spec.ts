import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { MatStepperNext, } from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { AccountDetailComponent } from './account-detail.component';
import { AccountExtADPExComponent } from '../account-ext-adpex';
import { AccountExtAssetExComponent } from '../account-ext-asset-ex';
import { AccountExtLoanExComponent } from '../account-ext-loan-ex';
import { UIMode, financeAccountCategoryCash, financeAccountCategoryAdvancePayment } from '../../model';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';
import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIAccountCtgyFilterExPipe, } from '../pipes';

describe('AccountDetailComponent', () => {
  let component: AccountDetailComponent;
  let fixture: ComponentFixture<AccountDetailComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let routerSpy: any;
  let activatedRouteStub: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllAssetCtgySpy: any;
  let fetchAllAccountsSpy: any;
  let readAccountSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);
    const homeService: Partial<HomeDefDetailService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllAssetCategories',
      'fetchAllAccounts',
      'readAccount',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAssetCtgySpy = storageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    readAccountSpy = storageService.readAccount.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        MatMomentDateModule,
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
        AccountExtADPExComponent,
        AccountExtAssetExComponent,
        AccountExtLoanExComponent,
        AccountDetailComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: FinanceStorageService, useValue: storageService },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDetailComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  it('1. should be created without data', () => {
    expect(component).toBeTruthy();
  });

  describe('2. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAssetCtgySpy.and.returnValue(asyncData(fakeData.finAssetCategories));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display error when account category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Account category service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Account category service failed',
        'Expected snack bar to show the error message: Account category service failed');
      flush();
    }));

    it('2. should display error when asset category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Asset category service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Asset category service failed',
        'Expected snack bar to show the error message: Asset category service failed');
      flush();
    }));
  });

  describe('Create mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAssetCtgySpy.and.returnValue(asyncData(fakeData.finAssetCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('step 1: name is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      // component.firstFormGroup.get('nameControl').setValue('test');
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.firstStepCompleted).toBeFalsy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();

      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));
    it('step 1: category is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      // component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.firstStepCompleted).toBeFalsy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();

      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));
    it('step 1: category - Advance payment is not supported', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      console.log('Start the check1');
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryAdvancePayment);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      console.log('Start the check2');
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeFalsy();

      console.log('Try to click the button');
      // let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      // nextButtonNativeEl.click();
      // fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(0); // At first page
    }));

    it('step 1: shall go to step 2 in valid case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();

      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(1); // At second step page
    }));
    it('step 2: shall go to step 3 in valid case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component._stepper.selectedIndex).toEqual(0); // At first page
      // Name
      component.firstFormGroup.get('nameControl').setValue('test');
      // Category
      component.firstFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      // Owner
      component.firstFormGroup.get('ownerControl').setValue(fakeData.currentUser.getUserId());
      // Comment
      component.firstFormGroup.get('cmtControl').setValue('test');
      fixture.detectChanges();

      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.firstStepCompleted).toBeTruthy();
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.directive(MatStepperNext))[0].nativeElement;
      nextButtonNativeEl.click();

      fixture.detectChanges();
      expect(component._stepper.selectedIndex).toEqual(1); // At second step page
    }));
  });
});
