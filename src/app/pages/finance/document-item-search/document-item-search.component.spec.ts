import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, inject, flush, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NZ_I18N, en_US, } from 'ng-zorro-antd/i18n';
import { BehaviorSubject, of, } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';

import { FinanceUIModule } from '../finance-ui.module';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError, ElementClass_DialogCloseButton, ElementClass_DialogContent } from '../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService, } from '../../../services';
import { UserAuthInfo, Document, DocumentItem, financeDocTypeNormal, BaseListModel, } from '../../../model';
import { MessageDialogComponent } from '../../message-dialog';
import { DocumentItemViewComponent } from '../document-item-view/document-item-view.component';
import { DocumentItemSearchComponent } from './document-item-search.component';
import { ReusableComponentsModule } from '../../reusable-components/reusable-components.module';

describe('DocumentItemSearchComponent', () => {
  let component: DocumentItemSearchComponent;
  let fixture: ComponentFixture<DocumentItemSearchComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllCurrenciesSpy: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllOrdersSpy: any;
  let fetchAllDocumentsSpy: any;
  let searchDocItemSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllDocTypes',
      'fetchAllCurrencies',
      'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'fetchAllDocuments',
      'searchDocItem',
    ]);
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllDocumentsSpy = storageService.fetchAllDocuments.and.returnValue(of([]));
    searchDocItemSpy = storageService.searchDocItem.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());

    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        ReusableComponentsModule,
        getTranslocoModule(),
      ],
      declarations: [
        MessageDialogComponent,
        DocumentItemViewComponent,
        DocumentItemSearchComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: NZ_I18N, useValue: en_US },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemSearchComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('working with data', () => {
    beforeEach(() => {
      fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(asyncData(fakeData.finOrders));
      // fetchAllDocumentsSpy = storageService.fetchAllDocuments.and.returnValue(asyncData(fakeData.finDoc));
    });

    it('1. shall initialize the data', fakeAsync(() => {
      fixture.detectChanges(); // ngOninit
      tick();
      fixture.detectChanges();

      expect(component.filters.length).toBe(1); // Default 1
    }));
  });
});
