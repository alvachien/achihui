import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject, of, } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import * as moment from 'moment';

import { DocumentListComponent } from './document-list.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError, ElementClass_DialogCloseButton, ElementClass_DialogContent } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, } from '../../../../services';
import { UserAuthInfo, Document, DocumentItem, financeDocTypeNormal, BaseListModel, } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';

describe('DocumentListComponent', () => {
  let component: DocumentListComponent;
  let fixture: ComponentFixture<DocumentListComponent>;
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
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  const ardocs: BaseListModel<Document> = {
    totalCount: 0,
    contentList: [],
  };

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
    ]);
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllDocumentsSpy = storageService.fetchAllDocuments.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        MessageDialogComponent,
        DocumentListComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
      ]
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          MessageDialogComponent,
        ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));

      // Delete all docs
      ardocs.totalCount = 2;
      ardocs.contentList.push({
        Id: 1,
        HID: fakeData.chosedHome.ID,
        DocType: financeDocTypeNormal,
        TranCurr: fakeData.chosedHome.BaseCurrency,
        Desp: 'test',
        TranDate: moment(),
        Items: [{
            DocId: 1,
            ItemId: 1,
            AccountId: fakeData.finAccounts[0].Id,
            TranType: fakeData.finTranTypes[0].Id,
            TranAmount: 100,
          } as DocumentItem, {
            DocId: 1,
            ItemId: 2,
            AccountId: fakeData.finAccounts[0].Id,
            TranType: fakeData.finTranTypes[2].Id,
            TranAmount: 300,
          } as DocumentItem,
        ]
      } as Document);
      ardocs.contentList.push({
        Id: 2,
        HID: fakeData.chosedHome.ID,
        DocType: financeDocTypeNormal,
        TranCurr: fakeData.chosedHome.BaseCurrency,
        Desp: 'test',
        TranDate: moment(),
        Items: [{
            DocId: 2,
            ItemId: 1,
            AccountId: fakeData.finAccounts[0].Id,
            TranType: fakeData.finTranTypes[0].Id,
            TranAmount: 200,
          } as DocumentItem, {
            DocId: 2,
            ItemId: 2,
            AccountId: fakeData.finAccounts[0].Id,
            TranType: fakeData.finTranTypes[2].Id,
            TranAmount: 400,
          } as DocumentItem,
        ]
      } as Document);

      fetchAllDocumentsSpy.and.returnValue(asyncData(ardocs));
    });

    it('should not show data before OnInit', () => {
      expect(component.listOfDocs.length).toEqual(0);
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.listOfDocs.length).toBeGreaterThan(0);
      // expect(component.listOfDocs.length).toEqual(ardocs.totalCount);

      flush();
    }));

    it('shall trigger navigation on menus for document creating', () => {
      const routerstub = TestBed.get(Router);
      spyOn(routerstub, 'navigate');
  
      component.onCreateNormalDocument();;
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createnormal']);
  
      component.onCreateTransferDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createtransfer']);

      component.onCreateADPDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createadp']);

      component.onCreateADRDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createadr']);

      component.onCreateExgDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createexg']);

      component.onCreateAssetBuyInDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createassetbuy']);

      component.onCreateAssetSoldOutDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createassetsold']);

      component.onCreateBorrowFromDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createbrwfrm']);

      component.onCreateLendToDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createlendto']);

      component.onCreateAssetValChgDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createassetvalchg']);

      component.onCreateRepayDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createrepayex']);

      // component.onDisplayDocument(doc: Document): void {
      //   expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/display', doc.Id]);
      // }

      component.onMassCreateNormalDocument();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/masscreatenormal']);

      component.onMassCreateNormalDocument2();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/masscreatenormal2']);
    });
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
      fetchAllDocumentsSpy.and.returnValue(asyncData(ardocs));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when account category fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when currencies fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when doc type fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when tran type fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when account fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when control center fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when order fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when docs fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocumentsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));
  });
});
