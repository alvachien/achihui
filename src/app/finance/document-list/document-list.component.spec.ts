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

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { DocumentListComponent } from './document-list.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { Document, BaseListModel, financeDocTypeNormal, financeDocTypeCurrencyExchange,
  financeDocTypeTransfer, financeDocTypeAdvancePayment,
  financeDocTypeAssetBuyIn, financeDocTypeAssetSoldOut,
  financeDocTypeBorrowFrom,
  financeDocTypeAdvanceReceived,
  financeDocTypeAssetValChg,
  financeDocTypeLendTo, } from '../../model';

describe('DocumentListComponent', () => {
  let component: DocumentListComponent;
  let fixture: ComponentFixture<DocumentListComponent>;
  let fakeData: FakeDataHelper;
  let routerSpy: any;
  let fetchAllDocumentsSpy: any;
  let deleteDocumentSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllDocuments',
      'deleteDocument',
    ]);
    fetchAllDocumentsSpy = stroageService.fetchAllDocuments.and.returnValue(of([]));
    deleteDocumentSpy = stroageService.deleteDocument.and.returnValue({});

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
        DocumentListComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinanceStorageService, useValue: stroageService },
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
    fixture = TestBed.createComponent(DocumentListComponent);
    component = fixture.componentInstance;
 });

  it('1. should be created without data', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let rstdoc: BaseListModel<Document>;

    beforeEach(() => {
      let doc: Document = new Document();
      let docs: Document[] = [];
      doc.onSetData({'items': [], 'docTypeName': 'Sys.DocTy.Normal', 'id': 94, 'hid': 1, 'docType': 1, 'tranDate': '2019-04-12', 'tranCurr': 'CNY',
      'desp': 'Test New ADP Doc | 5 / 12', 'exgRate': 0.0, 'exgRate_Plan': false, 'tranCurr2': null, 'exgRate2': 0.0, 'exgRate_Plan2': false,
      'tranAmount': -166.67, 'createdBy': 'a6319719-2f73-426d-9548-8dbcc25fe7a4',
      'createdAt': '2019-01-03', 'updatedBy': null, 'updatedAt': '0001-01-01'});
      docs.push(doc);
      doc = new Document();
      doc.onSetData({'items': [], 'docTypeName': 'Sys.DocTy.Normal', 'id': 92, 'hid': 1, 'docType': 1, 'tranDate': '2019-01-12', 'tranCurr': 'CNY',
      'desp': 'Test New ADP Doc | 2 / 12', 'exgRate': 0.0, 'exgRate_Plan': false, 'tranCurr2': null, 'exgRate2': 0.0, 'exgRate_Plan2': false,
      'tranAmount': -166.67, 'createdBy': 'a6319719-2f73-426d-9548-8dbcc25fe7a4',
      'createdAt': '2019-01-03', 'updatedBy': null, 'updatedAt': '0001-01-01'});
      docs.push(doc);
      rstdoc = new BaseListModel<Document>();
      rstdoc.contentList = docs.slice();
      rstdoc.totalCount = 5;

      fetchAllDocumentsSpy.and.returnValue(asyncData(rstdoc));
      deleteDocumentSpy.and.returnValue(asyncData(''));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should load the data automatically', fakeAsync(() => {
      expect(fetchAllDocumentsSpy).not.toHaveBeenCalled();
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(1);
      tick();
      fixture.detectChanges();
      expect(component.totalDocumentCount).toEqual(5);
      expect(component.dataSource.data.length).toEqual(2);
    }));

    it('should display an error if data fetch failed', fakeAsync(() => {
      fetchAllDocumentsSpy.and.returnValue(asyncError('server 500 error'));

      expect(fetchAllDocumentsSpy).not.toHaveBeenCalled();
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(1);
      tick();
      fixture.detectChanges();

      // Expect a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(component.dataSource.data.length).toEqual(0);
    }));

    it('should re-load the data after the refresh', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(1);
      tick();
      fixture.detectChanges();

      component.onRefreshList();
      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(2);
      tick();
      fixture.detectChanges();

      expect(component.totalDocumentCount).toEqual(5);
      expect(component.dataSource.data.length).toEqual(2);
    }));

    it('should re-load the data after the scope changed', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(1);
      tick();
      fixture.detectChanges();

      component.onDocScopeChanged();
      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(2);
      tick();
      fixture.detectChanges();

      expect(component.totalDocumentCount).toEqual(5);
      expect(component.dataSource.data.length).toEqual(2);
    }));

    it('should navigate to target views for document creating', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(1);

      component.onCreateADPDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createadp']);
      component.onCreateADRDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createadr']);
      component.onCreateAssetBuyInDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createassetbuy']);
      component.onCreateAssetSoldOutDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createassetsold']);
      component.onCreateAssetValChgDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createassetvalchg']);
      component.onCreateBorrowFromDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createbrwfrm']);
      component.onCreateExgDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createexg']);
      component.onCreateLendToDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createlendto']);
      component.onCreateNormalDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createnormal']);
      component.onCreateRepayDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createrepayex']);
      component.onCreateTransferDocument();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/createtransfer']);
    }));

    it('should navigate to target views for document changing', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(1);

      let doc: Document = new Document();
      doc.Id = 101;
      doc.DocType = financeDocTypeNormal;
      component.onChangeDocument(doc);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/edit', doc.Id]);

      doc.DocType = financeDocTypeTransfer;
      component.onChangeDocument(doc);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/edit', doc.Id]);

      doc.DocType = financeDocTypeCurrencyExchange;
      component.onChangeDocument(doc);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/edit', doc.Id]);

      doc.DocType = financeDocTypeAdvancePayment;
      component.onChangeDocument(doc);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/edit', doc.Id]);

      doc.DocType = financeDocTypeAdvanceReceived;
      component.onChangeDocument(doc);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/edit', doc.Id]);

      doc.DocType = financeDocTypeAssetBuyIn;
      component.onChangeDocument(doc);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/edit', doc.Id]);

      doc.DocType = financeDocTypeAssetSoldOut;
      component.onChangeDocument(doc);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/edit', doc.Id]);

      doc.DocType = financeDocTypeAssetValChg;
      component.onChangeDocument(doc);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/edit', doc.Id]);

      doc.DocType = financeDocTypeBorrowFrom;
      component.onChangeDocument(doc);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/edit', doc.Id]);

      doc.DocType = financeDocTypeLendTo;
      component.onChangeDocument(doc);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/document/edit', doc.Id]);
    }));

    it('should delete document successful', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(1);

      let doc: Document = new Document();
      doc.Id = 2;
      component.onDeleteDocument(doc);
      tick();
      fixture.detectChanges();

      // Expect the confirm dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Click the Yes button!
      (overlayContainerElement.querySelector('.message-dialog-button-yes') as HTMLElement).click();
      fixture.detectChanges();
      flush();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      expect(deleteDocumentSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();
      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(2);

      flush();
    }));

    it('should handle delete failed case', fakeAsync(() => {
      deleteDocumentSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(1);

      let doc: Document = new Document();
      doc.Id = 2;
      component.onDeleteDocument(doc);
      tick();
      fixture.detectChanges();

      // Expect the confirm dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Click the Yes button!
      (overlayContainerElement.querySelector('.message-dialog-button-yes') as HTMLElement).click();
      fixture.detectChanges();
      flush();
      // expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      expect(deleteDocumentSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect the error dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Click the Yes button!
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      fixture.detectChanges();
      flush();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      expect(fetchAllDocumentsSpy).toHaveBeenCalledTimes(1);

      flush();
    }));
  });
});
