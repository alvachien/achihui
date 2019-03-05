import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush, } from '@angular/core/testing';
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

import { HttpLoaderTestFactory, RouterLinkDirectiveStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { DocumentItemByAccountCategoryComponent } from './document-item-by-account-category.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { BaseListModel, DocumentItemWithBalance, OverviewScopeEnum, } from '../../model';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';

describe('DocumentItemByAccountCategoryComponent', () => {
  let component: DocumentItemByAccountCategoryComponent;
  let fixture: ComponentFixture<DocumentItemByAccountCategoryComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let getDocumentItemByAccountSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinAccounts();
    fakeData.buildFinConfigData();
  });

  beforeEach(async(() => {
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'getDocumentItemByAccount',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    getDocumentItemByAccountSpy = storageService.getDocumentItemByAccount.and.returnValue(of([]));

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
        DocumentItemByAccountCategoryComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: Router, useValue: routerSpy },
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
    fixture = TestBed.createComponent(DocumentItemByAccountCategoryComponent);
    component = fixture.componentInstance;
  });

  it('should create without data', () => {
    expect(component).toBeTruthy();
  });

  describe('should work properly with data', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));

      component.selectedCategory = fakeData.finAccountCategories[0].ID;
      component.selectedAccounts = [fakeData.finAccounts[0].Id];
      component.selectedScope = OverviewScopeEnum.CurrentMonth;

      let rst: BaseListModel<DocumentItemWithBalance> = new BaseListModel<DocumentItemWithBalance>();
      rst.totalCount = 5;
      rst.contentList = [];
      let balitem: DocumentItemWithBalance = new DocumentItemWithBalance();
      balitem.AccountId = 21;
      balitem.Balance = 200;
      balitem.Desp = 'test';
      balitem.DocDesp = 'test';
      balitem.DocId = 101;
      balitem.ItemId = 1;
      balitem.TranAmount = 100;
      balitem.TranAmount_Org = 100;
      balitem.TranCurr = 'CNY';
      rst.contentList.push(balitem);
      getDocumentItemByAccountSpy.and.returnValue(asyncData(rst));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall load the data', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(getDocumentItemByAccountSpy).toHaveBeenCalled();
      expect(component.resultsLength).toEqual(5);
      expect(component.dataSource.data.length).toEqual(1);
    }));

    it('should popup dialog if failted to load tran type', fakeAsync(() => {
      fetchAllTranTypesSpy.and.returnValue(asyncError('error'));

      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      flush();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
    }));

    it('should popup dialog if failted to load account categories', fakeAsync(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError('error'));

      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      flush();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
    }));

    it('should popup dialog if failted to load accounts', fakeAsync(() => {
      fetchAllAccountsSpy.and.returnValue(asyncError('error'));

      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      flush();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
    }));

    it('should popup dialog if failted to load data', fakeAsync(() => {
      getDocumentItemByAccountSpy.and.returnValue(asyncError('error'));

      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      flush();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
    }));
  });
});
