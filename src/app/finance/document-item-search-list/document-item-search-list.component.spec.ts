import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { HttpLoaderTestFactory, RouterLinkDirectiveStub, } from '../../../testing';
import { DocumentItemSearchListComponent } from './document-item-search-list.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';

describe('DocumentItemSearchListComponent', () => {
  let component: DocumentItemSearchListComponent;
  let fixture: ComponentFixture<DocumentItemSearchListComponent>;

  beforeEach(async(() => {
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'fetchAllAssetCategories',
      'searchDocItem',
    ]);
    const fetchAllAccountCategoriesSpy: any = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    const fetchAllAssetCategoriesSpy: any = stroageService.fetchAllAssetCategories.and.returnValue(of([]));
    const fetchAllDocTypesSpy: any = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    const fetchAllTranTypesSpy: any = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    const fetchAllAccountsSpy: any = stroageService.fetchAllAccounts.and.returnValue(of([]));
    const fetchAllOrdersSpy: any = stroageService.fetchAllOrders.and.returnValue(of([]));
    const fetchAllControlCentersSpy: any = stroageService.fetchAllControlCenters.and.returnValue(of([]));
    const searchDocItemSpy: any = stroageService.searchDocItem.and.returnValue(of([]));

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
        RouterLinkDirectiveStub,
        DocumentItemSearchListComponent,
      ],
      providers: [
        TranslateService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: Router, useValue: routerSpy },
        { provide: FinanceStorageService, useValue: stroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemSearchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
