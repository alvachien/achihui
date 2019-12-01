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
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIOrderValidFilterExPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../../../src/testing';
import { PlanDetailComponent } from './plan-detail.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { Plan, PlanTypeEnum } from 'app/model';
import { ThemeStorage } from 'app/theme-picker';

describe('PlanDetailComponent', () => {
  let component: PlanDetailComponent;
  let fixture: ComponentFixture<PlanDetailComponent>;
  let fakeData: FakeDataHelper;
  let routerSpy: any;
  let activatedRouteStub: any;
  let fetchAllCurrenciesSpy: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllOrdersSpy: any;
  let createPlanSpy: any;
  let readPlanSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    const homeService: Partial<HomeDefDetailService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('createbrwfrm', {})] as UrlSegment[]);
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'createPlan',
      'readPlan',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    createPlanSpy = storageService.createPlan.and.returnValue(of({}));
    readPlanSpy = storageService.readPlan.and.returnValue(of({}));

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
        UIAccountStatusFilterPipe,
        UIAccountCtgyFilterPipe,
        UIAccountCtgyFilterExPipe,
        UIOrderValidFilterPipe,
        UIOrderValidFilterExPipe,
        PlanDetailComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        ThemeStorage,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: FinCurrencyService, useValue: currService },
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
    fixture = TestBed.createComponent(PlanDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create without data', () => {
    expect(component).toBeTruthy();
  });

  describe('Handle exception case', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
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

    it('should display error when control center service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      let errmsg: string = 'Control center service failed';
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>(errmsg));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Expect a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.message-dialog-content').textContent).toContain(errmsg,
        'Expected dialog to show the error message: ' + errmsg);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      fixture.detectChanges();

      flush();
    }));
    it('should display error when currencies fails', fakeAsync(() => {
      // tell spy to return an async error observable
      let errmsg: string = 'currencies service failed';
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>(errmsg));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Expect a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.message-dialog-content').textContent).toContain(errmsg,
        'Expected dialog to show the error message: ' + errmsg);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      fixture.detectChanges();

      flush();
    }));
    it('should display error when account category fails', fakeAsync(() => {
      // tell spy to return an async error observable
      let errmsg: string = 'account categories service failed';
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>(errmsg));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Expect a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.message-dialog-content').textContent).toContain(errmsg,
        'Expected dialog to show the error message: ' + errmsg);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      fixture.detectChanges();

      flush();
    }));
    it('should display error when tran type fails', fakeAsync(() => {
      // tell spy to return an async error observable
      let errmsg: string = 'tran type service failed';
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>(errmsg));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Expect a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.message-dialog-content').textContent).toContain(errmsg,
        'Expected dialog to show the error message: ' + errmsg);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      fixture.detectChanges();

      flush();
    }));
    it('should display error when accounts fails', fakeAsync(() => {
      // tell spy to return an async error observable
      let errmsg: string = 'accounts service failed';
      fetchAllAccountsSpy.and.returnValue(asyncError<string>(errmsg));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Expect a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.message-dialog-content').textContent).toContain(errmsg,
        'Expected dialog to show the error message: ' + errmsg);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      fixture.detectChanges();

      flush();
    }));
  });

  describe('1. Create mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let curPlan: Plan;

    beforeEach(() => {
      curPlan = new Plan();
      curPlan.TargetBalance = 100;
      curPlan.TargetDate = moment().add(1, 'M');
      curPlan.TranCurrency = 'CNY';
      curPlan.AccountID = fakeData.finAccounts[0].Id;
      curPlan.Description = 'test';
      curPlan.PlanType = PlanTypeEnum.Account;
      curPlan.StartDate = moment();
      curPlan.ID = 11;

      createPlanSpy.and.returnValue(asyncData(curPlan));

      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
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

    it('shall load the default value', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.mainFormGroup.get('dateControl')).toBeTruthy();
      expect(component.mainFormGroup.valid).toBeFalsy();
    }));

    it('account is manadatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      // Date - default
      // Account
      // component.mainFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Balance
      component.mainFormGroup.get('tgtbalanceControl').setValue(100);
      // Desp
      component.mainFormGroup.get('despControl').setValue('test');
      component.mainFormGroup.updateValueAndValidity();

      expect(component.mainFormGroup.valid).toBeFalsy();
    }));

    it('desp is manadatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      // Date - default
      // Account
      component.mainFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Balance
      component.mainFormGroup.get('tgtbalanceControl').setValue(100);
      // Desp
      // component.mainFormGroup.get('despControl').setValue('test');
      component.mainFormGroup.updateValueAndValidity();

      expect(component.mainFormGroup.valid).toBeFalsy();
    }));

    it('shall allow create if form is valid', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      // Date - default
      // Account
      component.mainFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Balance
      component.mainFormGroup.get('tgtbalanceControl').setValue(100);
      // Desp
      component.mainFormGroup.get('despControl').setValue('test');
      component.mainFormGroup.updateValueAndValidity();

      expect(component.mainFormGroup.valid).toBeTruthy();
    }));

    it('shall display a snackbar after create successfully', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      // Date - default
      // Account
      component.mainFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Balance
      component.mainFormGroup.get('tgtbalanceControl').setValue(100);
      // Desp
      component.mainFormGroup.get('despControl').setValue('test');
      component.mainFormGroup.updateValueAndValidity();

      expect(component.mainFormGroup.valid).toBeTruthy();
      component.onSubmit();
      expect(createPlanSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();
      tick(2000);
      fixture.detectChanges();

      expect(routerSpy.navigate).toHaveBeenCalled();
    }));

    it('shall display a dialog after create failed', fakeAsync(() => {
      let errmsg: string = 'server 500 error';
      createPlanSpy.and.returnValue(asyncError(errmsg));

      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      // Date - default
      // Account
      component.mainFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      // Balance
      component.mainFormGroup.get('tgtbalanceControl').setValue(100);
      // Desp
      component.mainFormGroup.get('despControl').setValue('test');
      component.mainFormGroup.updateValueAndValidity();

      expect(component.mainFormGroup.valid).toBeTruthy();
      component.onSubmit();
      expect(createPlanSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.message-dialog-content').textContent).toContain(errmsg,
        'Expected dialog to show the error message: ' + errmsg);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      fixture.detectChanges();
      flush();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
  });

  describe('3. Display mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let curPlan: Plan;

    beforeEach(() => {
      curPlan = new Plan();
      curPlan.TargetBalance = 100;
      curPlan.TargetDate = moment().add(1, 'M');
      curPlan.TranCurrency = 'CNY';
      curPlan.AccountID = fakeData.finAccounts[0].Id;
      curPlan.Description = 'test';
      curPlan.PlanType = PlanTypeEnum.Account;
      curPlan.StartDate = moment();
      curPlan.ID = 11;

      readPlanSpy.and.returnValue(asyncData(curPlan));

      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));

      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment(curPlan.ID.toString(), {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall load the default value', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      expect(readPlanSpy).toHaveBeenCalled();
      expect(component.mainFormGroup.get('despControl').value).toEqual(curPlan.Description);
      expect(component.mainFormGroup.get('tgtbalanceControl').value).toEqual(curPlan.TargetBalance);

      expect(component.isFieldChangable).toBeFalsy();
    }));
  });
});
