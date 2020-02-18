import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, UrlSegment, ActivatedRoute } from '@angular/router';
import { NgZorroAntdModule, NZ_I18N, en_US, } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';

import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { AccountExtraDownpaymentComponent } from '../../account/account-extra-downpayment';
import { DocumentDownpaymentCreateComponent } from './document-downpayment-create.component';
import { getTranslocoModule, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';

describe('DocumentDownpaymentCreateComponent', () => {
  let component: DocumentDownpaymentCreateComponent;
  let fixture: ComponentFixture<DocumentDownpaymentCreateComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllAssetCategoriesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllOrdersSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllCurrenciesSpy: any;
  let createDocSpy: any;
  let activatedRouteStub: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService>;

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
      'fetchAllAccountCategories',
      'fetchAllAssetCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'createADPDocument',
      'fetchAllCurrencies',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    createDocSpy = storageService.createADPDocument.and.returnValue(of({}));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(of([]));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    uiServiceStub.getUILabel = (le: any) => '';
  });

  beforeEach(async(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('createadp', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [
        AccountExtraDownpaymentComponent,
        DocumentHeaderComponent,
        DocumentItemsComponent,
        DocumentDownpaymentCreateComponent,
        MessageDialogComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: NZ_I18N, useValue: en_US },
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
    fixture = TestBed.createComponent(DocumentDownpaymentCreateComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('working with data', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(asyncData(fakeData.finAssetCategories));
      fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(asyncData(fakeData.finOrders));
      fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(asyncData(fakeData.currencies));  
    });

    it('setp 0: initial status', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.current).toEqual(0);
      expect(component.headerFormGroup.valid).toBeFalsy();

      flush();
    }));
  });

  it('1a. should create with adr', fakeAsync(() => {
    activatedRouteStub.setURL([new UrlSegment('createadr', {})] as UrlSegment[]);

    expect(component).toBeTruthy();

    // fixture.detectChanges(); // ngOnInit

    // tick(); // Complete the Observables in ngOnInit
    // fixture.detectChanges();

    // expect(component._stepper.selectedIndex).toEqual(0); // At first page
  }));

  describe('shall display error dialog when service failed', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(asyncData(fakeData.finAssetCategories));
      fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(asyncData(fakeData.finOrders));
      fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(asyncData(fakeData.currencies));  
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Account Category fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when Doc type fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when Tran. type fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when currency fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when account fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when control center fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when order fetched fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
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
