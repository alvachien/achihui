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
import { DocumentDetailComponent } from './document-detail.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { Document, DocumentType, DocumentItem, financeDocTypeTransfer, financeTranTypeTransferOut,
  financeTranTypeTransferIn,
  financeDocTypeCurrencyExchange, } from '../../model';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';

describe('DocumentDetailComponent', () => {
  let component: DocumentDetailComponent;
  let fixture: ComponentFixture<DocumentDetailComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllOrdersSpy: any;
  let readDocumentSpy: any;
  let updateNormalDocumentSpy: any;
  let fetchAllCurrenciesSpy: any;
  let activatedRouteStub: any;
  let routerSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();
  });

  beforeEach(async(() => {
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'readDocument',
      'updateNormalDocument',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    readDocumentSpy = storageService.readDocument.and.returnValue(of({}));
    updateNormalDocumentSpy = storageService.updateNormalDocument.and.returnValue(of({}));
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

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
        DocumentDetailComponent,
        DocumentHeaderComponent,
        DocumentItemsComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinCurrencyService, useValue: currService },
        { provide: FinanceStorageService, useValue: storageService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentDetailComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('shall handle the exception case', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));

      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('11', {})] as UrlSegment[]);
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

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
      flush();
    }));
  });

  describe('2.1 edit normal document', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
      let rstdoc: Document = fakeData.buildFinNormalDocument();
      readDocumentSpy.and.returnValue(asyncData(rstdoc));
      updateNormalDocumentSpy.and.returnValue(asyncData(rstdoc));

      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('11', {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall read out the document', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();

      expect(readDocumentSpy).toHaveBeenCalled();
      expect(component.isFieldChangable).toEqual(true);
      expect(component.headerGroup.enabled).toBeTruthy();
      expect(component.itemGroup.enabled).toBeTruthy();
    }));
    it('shall disable submit button if header is invalid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      expect(readDocumentSpy).toHaveBeenCalled();
      expect(component.isFieldChangable).toEqual(true);
      expect(component.headerGroup.enabled).toBeTruthy();
      expect(component.itemGroup.enabled).toBeTruthy();
      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      // Header: change the desp.
      let doc: any = component.headerGroup.get('headerControl').value;
      doc.Desp = undefined;
      component.headerGroup.get('headerControl').setValue(doc);
      component.headerGroup.get('headerControl').markAsDirty();
      fixture.detectChanges();
      expect(component.headerGroup.valid).toBeFalsy('Desp is a must');
      // Expect the button is disabled
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled since desp in Header is missing');
    }));
    it('shall disable submit button if item is invalid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      expect(readDocumentSpy).toHaveBeenCalled();
      expect(component.isFieldChangable).toEqual(true);
      expect(component.headerGroup.enabled).toBeTruthy();
      expect(component.itemGroup.enabled).toBeTruthy();
      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      let items: any[] = component.itemGroup.get('itemControl').value;
      component.itemGroup.get('itemControl').setValue([]);
      component.itemGroup.get('itemControl').markAsDirty();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled since items are empty');
    }));
    it('shall enable submit button is enable if document header was changed and valid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      // Header: change the desp.
      let doc: any = component.headerGroup.get('headerControl').value;
      doc.Desp = 'Test2';
      component.headerGroup.get('headerControl').setValue(doc);
      component.headerGroup.get('headerControl').markAsDirty();
      fixture.detectChanges();
      expect(component.headerGroup.valid).toBeTruthy();
      expect(submitButton.disabled).toBeFalsy('Submit button shall be enabled as desp in Header has been changed');
    }));
    it('shall enable submit button if desp in item was changed and valid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      // Item: change the desp.
      let items: any[] = component.itemGroup.get('itemControl').value;
      expect(items.length).toBeGreaterThan(0);
      items[0].Desp = 'Desp changed';
      component.itemGroup.get('itemControl').setValue(items);
      component.itemGroup.get('itemControl').markAsDirty();
      fixture.detectChanges();
      expect(component.itemGroup.valid).toBeTruthy();
      expect(submitButton.disabled).toBeFalsy('Submit button shall be enabled as items has been changed');
    }));
    it('shall enable submit button if a new item was added and valid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      // Item: change the desp.
      let items: any[] = component.itemGroup.get('itemControl').value;
      let item2: DocumentItem = new DocumentItem();
      item2.ItemId = 2;
      item2.AccountId = fakeData.finAccounts[1].Id;
      item2.ControlCenterId = fakeData.finControlCenters[0].Id;
      item2.Desp = 'item2';
      item2.TranAmount = 200;
      item2.TranType = fakeData.finTranTypes[5].Id;
      items.push(item2);
      component.itemGroup.get('itemControl').setValue(items);
      component.itemGroup.get('itemControl').markAsDirty();
      fixture.detectChanges();
      expect(component.itemGroup.valid).toBeTruthy();
      expect(submitButton.disabled).toBeFalsy('Submit button shall be enabled as items has been changed');
    }));
    it('shall handle submit succee case in valid case', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      // Header: change the desp.
      let doc: any = component.headerGroup.get('headerControl').value;
      doc.Desp = 'Test2';
      component.headerGroup.get('headerControl').setValue(doc);
      component.headerGroup.get('headerControl').markAsDirty();
      fixture.detectChanges();
      expect(component.headerGroup.valid).toBeTruthy();
      expect(submitButton.disabled).toBeFalsy('Submit button shall be enabled as desp in Header has been changed');

      component.onSubmit();
      expect(updateNormalDocumentSpy).toHaveBeenCalled();

      tick();
      fixture.detectChanges();

      // Expect a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull('Expected snack bar to show the error message: text');

      tick(2000);
      fixture.detectChanges();

      // Expect a navigator
      expect(routerSpy.navigate).toHaveBeenCalled();
      flush();
    }));
    it('shall popup a dialog if submit failed', fakeAsync(() => {
      updateNormalDocumentSpy.and.returnValue(asyncError('server 500 error'));

      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      // Header: change the desp.
      let doc: any = component.headerGroup.get('headerControl').value;
      doc.Desp = 'Test2';
      component.headerGroup.get('headerControl').setValue(doc);
      component.headerGroup.get('headerControl').markAsDirty();
      fixture.detectChanges();
      expect(component.headerGroup.valid).toBeTruthy();
      expect(submitButton.disabled).toBeFalsy('Submit button shall be enabled as desp in Header has been changed');

      component.onSubmit();
      expect(updateNormalDocumentSpy).toHaveBeenCalled();

      tick();
      fixture.detectChanges();

      // Expect a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
  });
  describe('2.2 edit transfer document', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
      let doc: Document = new Document();
      doc.Id = 11;
      doc.DocType = financeDocTypeTransfer;
      doc.Desp = 'Transfer test';
      doc.TranCurr = fakeData.chosedHome.BaseCurrency;
      doc.TranDate = moment();
      let ditem1: DocumentItem = new DocumentItem();
      ditem1.DocId = 11;
      ditem1.ItemId = 1;
      ditem1.AccountId = fakeData.finAccounts[0].Id;
      ditem1.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem1.TranType = financeTranTypeTransferOut;
      ditem1.Desp = 'From';
      ditem1.TranAmount = 220;
      let ditem2: DocumentItem = new DocumentItem();
      ditem1.DocId = 11;
      ditem2.ItemId = 2;
      ditem2.AccountId = fakeData.finAccounts[1].Id;
      ditem2.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem2.TranType = financeTranTypeTransferIn;
      ditem2.Desp = 'To';
      ditem2.TranAmount = 220;
      doc.Items = [ditem1, ditem2];
      fakeData.setFinTransferDocumentForCreate(doc);

      // let rstdoc: Document = fakeData.buildFinTr();
      readDocumentSpy.and.returnValue(asyncData(fakeData.finTransferDocumentForCreate));
      updateNormalDocumentSpy.and.returnValue(asyncData(fakeData.finTransferDocumentForCreate));

      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('11', {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall read out the document', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();

      expect(readDocumentSpy).toHaveBeenCalled();
      expect(component.isFieldChangable).toEqual(true);
      expect(component.headerGroup.enabled).toBeTruthy();
      expect(component.itemGroup.enabled).toBeTruthy();
    }));
    it('shall disable submit button if header is invalid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      expect(readDocumentSpy).toHaveBeenCalled();
      expect(component.isFieldChangable).toEqual(true);
      expect(component.headerGroup.enabled).toBeTruthy();
      expect(component.itemGroup.enabled).toBeTruthy();
      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      // Header: change the desp.
      let doc: any = component.headerGroup.get('headerControl').value;
      doc.Desp = undefined;
      component.headerGroup.get('headerControl').setValue(doc);
      component.headerGroup.get('headerControl').markAsDirty();
      fixture.detectChanges();
      expect(component.headerGroup.valid).toBeFalsy('Desp is a must');
      // Expect the button is disabled
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled since desp in Header is missing');
    }));
    it('shall disable submit button if item is invalid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      expect(readDocumentSpy).toHaveBeenCalled();
      expect(component.isFieldChangable).toEqual(true);
      expect(component.headerGroup.enabled).toBeTruthy();
      expect(component.itemGroup.enabled).toBeTruthy();
      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      let items: any[] = component.itemGroup.get('itemControl').value;
      component.itemGroup.get('itemControl').setValue([]);
      component.itemGroup.get('itemControl').markAsDirty();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled since items are empty');
    }));
    it('shall enable submit button is enable if document header was changed and valid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      // Header: change the desp.
      let doc: any = component.headerGroup.get('headerControl').value;
      doc.Desp = 'Test2';
      component.headerGroup.get('headerControl').setValue(doc);
      component.headerGroup.get('headerControl').markAsDirty();
      fixture.detectChanges();
      expect(component.headerGroup.valid).toBeTruthy();
      expect(submitButton.disabled).toBeFalsy('Submit button shall be enabled as desp in Header has been changed');
    }));
    it('shall enable submit button if desp in item was changed and valid', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      // Item: change the desp.
      let items: any[] = component.itemGroup.get('itemControl').value;
      expect(items.length).toBeGreaterThan(0);
      items[0].Desp = 'Desp changed';
      component.itemGroup.get('itemControl').setValue(items);
      component.itemGroup.get('itemControl').markAsDirty();
      fixture.detectChanges();
      expect(component.itemGroup.valid).toBeTruthy();
      expect(submitButton.disabled).toBeFalsy('Submit button shall be enabled as items has been changed');
    }));
    it('shall handle submit succee case in valid case', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      // Header: change the desp.
      let doc: any = component.headerGroup.get('headerControl').value;
      doc.Desp = 'Test2';
      component.headerGroup.get('headerControl').setValue(doc);
      component.headerGroup.get('headerControl').markAsDirty();
      fixture.detectChanges();
      expect(component.headerGroup.valid).toBeTruthy();
      expect(submitButton.disabled).toBeFalsy('Submit button shall be enabled as desp in Header has been changed');

      component.onSubmit();
      expect(updateNormalDocumentSpy).toHaveBeenCalled();

      tick();
      fixture.detectChanges();

      // Expect a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull('Expected snack bar to show the error message: text');

      tick(2000);
      fixture.detectChanges();

      // Expect a navigator
      expect(routerSpy.navigate).toHaveBeenCalled();
      flush();
    }));
    it('shall popup a dialog if submit failed', fakeAsync(() => {
      updateNormalDocumentSpy.and.returnValue(asyncError('server 500 error'));

      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();
      let submitButton: HTMLButtonElement = fixture.debugElement.query(By.css('.docdetail-button-submit'))!.nativeElement;

      fixture.detectChanges();
      expect(submitButton.disabled).toBeTruthy('Submit button shall be disabled as no change performed');

      // Header: change the desp.
      let doc: any = component.headerGroup.get('headerControl').value;
      doc.Desp = 'Test2';
      component.headerGroup.get('headerControl').setValue(doc);
      component.headerGroup.get('headerControl').markAsDirty();
      fixture.detectChanges();
      expect(component.headerGroup.valid).toBeTruthy();
      expect(submitButton.disabled).toBeFalsy('Submit button shall be enabled as desp in Header has been changed');

      component.onSubmit();
      expect(updateNormalDocumentSpy).toHaveBeenCalled();

      tick();
      fixture.detectChanges();

      // Expect a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
  });
  describe('2.3 edit currency exchange document', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
      let doc: Document = new Document();
      doc.Id = 11;
      doc.DocType = financeDocTypeCurrencyExchange;
      doc.Desp = 'Transfer test';
      doc.TranCurr = fakeData.chosedHome.BaseCurrency;
      doc.TranDate = moment();
      let ditem1: DocumentItem = new DocumentItem();
      ditem1.DocId = 11;
      ditem1.ItemId = 1;
      ditem1.AccountId = fakeData.finAccounts[0].Id;
      ditem1.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem1.TranType = financeTranTypeTransferOut;
      ditem1.Desp = 'From';
      ditem1.TranAmount = 220;
      let ditem2: DocumentItem = new DocumentItem();
      ditem1.DocId = 11;
      ditem2.ItemId = 2;
      ditem2.AccountId = fakeData.finAccounts[1].Id;
      ditem2.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem2.TranType = financeTranTypeTransferIn;
      ditem2.Desp = 'To';
      ditem2.TranAmount = 220;
      doc.Items = [ditem1, ditem2];
      fakeData.setFinTransferDocumentForCreate(doc);

      // let rstdoc: Document = fakeData.buildFinTr();
      readDocumentSpy.and.returnValue(asyncData(fakeData.finTransferDocumentForCreate));
      updateNormalDocumentSpy.and.returnValue(asyncData(fakeData.finTransferDocumentForCreate));

      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('11', {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall read out the document', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();

      expect(readDocumentSpy).toHaveBeenCalled();
      expect(component.isFieldChangable).toEqual(true);
      expect(component.headerGroup.enabled).toBeTruthy();
      expect(component.itemGroup.enabled).toBeTruthy();
    }));
  });

  describe('3. display mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));

      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('11', {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall display the normal doc', fakeAsync(() => {
      readDocumentSpy.and.returnValue(asyncData(fakeData.buildFinNormalDocument()));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(readDocumentSpy).toHaveBeenCalled();

      // Not disable the form directly but disable the controls
      // expect(component.headerGroup.disabled).toBeTruthy();
      // expect(component.itemGroup.disabled).toBeTruthy();
    }));
    it('shall popup an error dialog if failed to read doc', fakeAsync(() => {
      readDocumentSpy.and.returnValue(asyncError('server 500 failure'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(readDocumentSpy).toHaveBeenCalled();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
      flush();
    }));
  });

  // Exchange rate document!
  // Transfer document
});
