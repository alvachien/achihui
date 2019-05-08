import { async, ComponentFixture, TestBed, fakeAsync, inject, tick, flush, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
  MatChipInputEvent, } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIOrderValidFilterExPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { DocumentItemsComponent } from './document-items.component';
import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { Document, DocumentType, DocumentItem, financeDocTypeNormal, financeDocTypeCurrencyExchange } from '../../model';

describe('DocumentItemsComponent', () => {
  let component: DocumentItemsComponent;
  let fixture: ComponentFixture<DocumentItemsComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllOrdersSpy: any;

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
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllDocTypes',
      'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
    ]);
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));

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
        DocumentItemsComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinCurrencyService, useValue: currService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: FinanceStorageService, useValue: storageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemsComponent);
    component = fixture.componentInstance;
  });

  it('1. should create without data', () => {
    expect(component).toBeTruthy();
  });

  describe('2. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
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

    it('1. should display error when tran type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError('tran type service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      // fixture.detectChanges();

      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('tran type service failed',
        'Expected snack bar to show the error message: tran type service failed');

      flush();
    }));
    it('2. should display error when account category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError('account category service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      // fixture.detectChanges();

      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('account category service failed',
        'Expected snack bar to show the error message: account category service failed');

      flush();
    }));
    it('3. should display error when account service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError('account service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      // fixture.detectChanges();

      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('account service failed',
        'Expected snack bar to show the error message: account service failed');

      flush();
    }));
    it('4. should display error when control center service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError('control center service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      // fixture.detectChanges();

      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('control center service failed',
        'Expected snack bar to show the error message: control center service failed');

      flush();
    }));
    it('5. should display error when order service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError('order service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      // fixture.detectChanges();

      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('order service failed',
        'Expected snack bar to show the error message: order service failed');

      flush();
    }));
  });

  describe('3. Enable mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
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

    it('shall be invalid if no items', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      let err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.noitems).toBeTruthy();
    }));
    it('shall be invalid if items without account', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      component.onChange();

      let err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithoutaccount).toBeTruthy('Expect itemwithoutaccount is true');
    }));
    it('shall be invalid if items without tran type', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      // ditem.TranType = 2;
      ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      component.onChange();

      let err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithouttrantype).toBeTruthy('Expect itemwithouttrantype is true');
    }));
    it('shall be invalid if items without amount', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      // ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      component.onChange();

      let err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithoutamount).toBeTruthy('Expect itemwithoutamount is true');
    }));
    it('shall be invalid if items without cost object', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      // ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      component.onChange();

      let err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithwrongcostobject).toBeTruthy('Expect itemwithwrongcostobject is true');
    }));
    it('shall be invalid if items have cost center and order both', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.OrderId = fakeData.finOrders[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      component.onChange();

      let err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithwrongcostobject).toBeTruthy('Expect itemwithwrongcostobject is true');
    }));
    it('shall be invalid if items without desp', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      // ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      component.onChange();

      let err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithoutdesp).toBeTruthy('Expect itemwithoutdesp is true');
    }));
    it('shall remove item on deletion', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      component.onChange();

      component.onDeleteDocItem(component.dataSource.data[0]);
      fixture.detectChanges();

      expect(component.dataSource.data.length).toEqual(0);
    }));
    it('shall be valid in valid case', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      let ditem: DocumentItem = component.dataSource.data[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.dataSource.data = [ditem];
      component.onChange();

      let err: any = component.validate(undefined);
      expect(err).toBeNull();
    }));
  });
});
