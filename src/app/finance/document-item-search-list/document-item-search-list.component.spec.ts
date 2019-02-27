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

import { HttpLoaderTestFactory, RouterLinkDirectiveStub, FakeDataHelper, asyncData, asyncError, } from '../../../testing';
import { DocumentItemSearchListComponent } from './document-item-search-list.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { DocumentItem, DocumentItemWithBalance, GeneralFilterValueType } from '../../model';

describe('DocumentItemSearchListComponent', () => {
  let component: DocumentItemSearchListComponent;
  let fixture: ComponentFixture<DocumentItemSearchListComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let routerSpy: any;
  let searchDocItemSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'searchDocItem',
    ]);
    fetchAllAccountCategoriesSpy = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = stroageService.fetchAllAccounts.and.returnValue(of([]));
    searchDocItemSpy = stroageService.searchDocItem.and.returnValue(of([]));

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
        RouterLinkDirectiveStub,
        DocumentItemSearchListComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: Router, useValue: routerSpy },
        { provide: FinanceStorageService, useValue: stroageService },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemSearchListComponent);
    component = fixture.componentInstance;
  });

  it('0. should create without data', () => {
    expect(component).toBeTruthy();
  });

  describe('search out the document items', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let listFIDocItems: DocumentItemWithBalance[];

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));

      listFIDocItems = [];
      let item: DocumentItemWithBalance = new DocumentItemWithBalance();
      item.DocId = 111;
      item.ItemId = 1;
      item.AccountId = fakeData.finAccounts[0].Id;
      item.TranAmount = 100;
      item.TranAmount_LC = 100;
      item.TranAmount_Org = 100;
      item.TranCurr = fakeData.chosedHome.BaseCurrency;
      item.ControlCenterId = 11;
      item.Desp = 'Item 1';
      listFIDocItems.push(item);
      let rst: any = {
        totalCount: 2,
        items: listFIDocItems,
      };
      searchDocItemSpy.and.returnValue(asyncData(rst));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should show one filter by default', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.filters.length).toEqual(1);
    }));
    it('should ensure there are at least one filter', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.filters.length).toEqual(1);
      // Remove the filter
      component.onRemoveFilter(0);
      expect(component.filters.length).toEqual(1);
    }));
    it('should popup dialog for error if fetchAllAccountCategories failed', fakeAsync(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError('server 500'));

      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      // Expect there is a pop-up dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button.message-dialog-button-ok') as HTMLElement).click();
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
      flush();
    }));
    it('should popup dialog for error if fetchAllAccounts failed', fakeAsync(() => {
      fetchAllAccountsSpy.and.returnValue(asyncError('server 500'));

      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      // Expect there is a pop-up dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button.message-dialog-button-ok') as HTMLElement).click();
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
      flush();
    }));
    it('should popup dialog for error if fetchAllTranTypes failed', fakeAsync(() => {
      fetchAllTranTypesSpy.and.returnValue(asyncError('server 500'));

      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      // Expect there is a pop-up dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button.message-dialog-button-ok') as HTMLElement).click();
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
      flush();
    }));
    it('should change the operators dynamically', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.filters.length).toEqual(1);

      // Change the field name - number
      component.filters[0].fieldName = component.allFields.find((val: any) => {
        return val.valueType === 1; // number;
      }).value;
      component.onFieldSelectionChanged(component.filters[0]);
      expect(component.filters[0].valueType).toEqual(1);

      // Change the field name - string
      component.filters[0].fieldName = component.allFields.find((val: any) => {
        return val.valueType === 2; // string;
      }).value;
      component.onFieldSelectionChanged(component.filters[0]);
      expect(component.filters[0].valueType).toEqual(2);

      // Change the field name - date
      component.filters[0].fieldName = component.allFields.find((val: any) => {
        return val.valueType === 3; // date
      }).value;
      component.onFieldSelectionChanged(component.filters[0]);
      expect(component.filters[0].valueType).toEqual(3);

      // Change the field name - boolean
      component.filters[0].fieldName = component.allFields.find((val: any) => {
        return val.valueType === 4; // boolean
      }).value;
      component.onFieldSelectionChanged(component.filters[0]);
      expect(component.filters[0].valueType).toEqual(4);
    }));
    it('should display the doc item if search successfully', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.filters.length).toEqual(1);

      // Change the field name - number
      component.filters[0].fieldName = component.allFields.find((val: any) => {
        return val.valueType === 1; // number;
      }).value;
      component.onFieldSelectionChanged(component.filters[0]);
      component.filters[0].lowValue = 1;

      component.onAddFilter();
      component.filters[1].fieldName = component.allFields.find((val: any) => {
        return val.valueType === GeneralFilterValueType.string; // string;
      }).value;
      component.onFieldSelectionChanged(component.filters[1]);
      component.filters[1].lowValue = 'aaa';

      component.onAddFilter();
      component.filters[2].fieldName = component.allFields.find((val: any) => {
        return val.valueType === GeneralFilterValueType.date; // date;
      }).value;
      component.onFieldSelectionChanged(component.filters[2]);
      component.filters[2].lowValue = '2019-02-28';

      component.onAddFilter();
      component.filters[3].fieldName = component.allFields.find((val: any) => {
        return val.valueType === GeneralFilterValueType.boolean; // boolean;
      }).value;
      component.onFieldSelectionChanged(component.filters[3]);
      component.filters[3].lowValue = true;

      component.onSearch();
      expect(searchDocItemSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);
    }));
    it('should display nothing if search failed', fakeAsync(() => {
      searchDocItemSpy.and.returnValue(asyncError('500 error'));

      fixture.detectChanges(); // ngOnInit
      tick(); // complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.filters.length).toEqual(1);

      // Change the field name - number
      component.filters[0].fieldName = component.allFields.find((val: any) => {
        return val.valueType === 1; // number;
      }).value;
      component.onFieldSelectionChanged(component.filters[0]);
      component.filters[0].lowValue = 1;

      component.onSearch();
      expect(searchDocItemSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);
    }));
  });
});
