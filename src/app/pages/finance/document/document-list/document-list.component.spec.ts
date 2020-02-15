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

import { DocumentListComponent } from './document-list.component';
import { getTranslocoModule, RouterLinkDirectiveStub, FakeDataHelper, asyncData, asyncError, } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
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
    uiServiceStub.getUILabel = (le: any) => '';
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
    });

    it('should not show data before OnInit', () => {
      expect(component.listOfDocs.length).toEqual(0);
    });

    // it('should show data after OnInit', fakeAsync(() => {
    //   fixture.detectChanges(); // ngOnInit()
    //   tick(); // Complete the observables in ngOnInit
    //   fixture.detectChanges();

    //   expect(component.dataSet.length).toBeGreaterThan(0);
    //   expect(component.dataSet.length).toEqual(fakeData.finAccountCategories.length);

    //   flush();
    // }));

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

  xdescribe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));
  });
});
