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
import { Document, BaseListModel } from '../../model';

describe('DocumentListComponent', () => {
  let component: DocumentListComponent;
  let fixture: ComponentFixture<DocumentListComponent>;
  let fakeData: FakeDataHelper;
  let routerSpy: any;
  let fetchAllDocumentsSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllDocuments',
    ]);
    fetchAllDocumentsSpy = stroageService.fetchAllDocuments.and.returnValue(of([]));

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
    fixture.detectChanges();
  });

  it('1. should be created without data', () => {
    expect(component).toBeTruthy();
  });

  describe('shall load the document', () => {
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
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(fetchAllDocumentsSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();
      expect(component.totalDocumentCount).toEqual(5);
      expect(component.dataSource.data.length).toEqual(2);
    }));
  });
});
