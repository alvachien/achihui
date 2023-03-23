import { waitForAsync, ComponentFixture, TestBed, inject, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { BehaviorSubject, of } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NzModalService } from 'ng-zorro-antd/modal';

import { FinanceUIModule } from '../../finance-ui.module';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { DocumentDetailComponent } from './document-detail.component';
import { getTranslocoModule, FakeDataHelper, ActivatedRouteUrlStub, asyncData } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, financeDocTypeNormal, Document, DocumentItem } from '../../../../model';
import * as moment from 'moment';
import { SafeAny } from 'src/common';

describe('DocumentDetailComponent', () => {
  let component: DocumentDetailComponent;
  let fixture: ComponentFixture<DocumentDetailComponent>;
  let activatedRouteStub: SafeAny;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService>;
  let fetchAllCurrenciesSpy: SafeAny;
  let fetchAllDocTypesSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let readDocumentSpy: SafeAny;
  let readAccountSpy: SafeAny;
  let isDocumentChangableSpy: SafeAny;
  let changeDocumentSpy: SafeAny;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllCurrencies',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccountCategories',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'readDocument',
      'readAccount',
      'isDocumentChangable',
      'changeDocument',
    ]);
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    readDocumentSpy = storageService.readDocument.and.returnValue(of({}));
    readAccountSpy = storageService.readAccount.and.returnValue(of({}));
    isDocumentChangableSpy = storageService.isDocumentChangable.and.returnValue(of({}));
    changeDocumentSpy = storageService.changeDocument.and.returnValue(of({}));

    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        getTranslocoModule(),
      ],
      declarations: [DocumentHeaderComponent, DocumentItemsComponent, DocumentDetailComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: Router, useValue: routerSpy },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    const btest = false;
    if (btest) {
      expect(fetchAllCurrenciesSpy).toHaveBeenCalled();
      expect(fetchAllDocTypesSpy).toHaveBeenCalled();
      expect(fetchAllTranTypesSpy).toHaveBeenCalled();
      expect(fetchAllAccountCategoriesSpy).toHaveBeenCalled();
      expect(fetchAllAccountsSpy).toHaveBeenCalled();
      expect(fetchAllOrdersSpy).toHaveBeenCalled();
      expect(readDocumentSpy).toHaveBeenCalled();
      expect(readAccountSpy).not.toHaveBeenCalled();
      expect(isDocumentChangableSpy).toHaveBeenCalled();
      expect(changeDocumentSpy).not.toHaveBeenCalled();
    }
  });

  describe('2. change mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let docobj: Document;

    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);
      docobj = new Document();
      docobj.Id = 122;
      docobj.Desp = 'test';
      docobj.TranCurr = 'CNY';
      docobj.DocType = financeDocTypeNormal;
      docobj.TranDate = moment();
      docobj.Items = [];
      const item1 = new DocumentItem();
      item1.ItemId = 1;
      item1.AccountId = fakeData.finAccounts[0].Id;
      item1.TranAmount = 100;
      item1.TranType = fakeData.finTranTypes[0].Id!;
      item1.Desp = 'test';
      docobj.Items.push(item1);

      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(asyncData(fakeData.currencies));
      fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(
        asyncData(fakeData.finAccountCategories)
      );
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(
        asyncData(fakeData.finControlCenters)
      );
      fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(asyncData(fakeData.finOrders));
      readDocumentSpy = storageService.readDocument.and.returnValue(asyncData(docobj));
      readAccountSpy = storageService.readAccount.and.returnValue(of({}));
      isDocumentChangableSpy = storageService.isDocumentChangable.and.returnValue(of({}));
      changeDocumentSpy = storageService.changeDocument.and.returnValue(of({}));
    });
    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('change mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      flush();
    }));
  });
});
