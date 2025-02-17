import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, inject, flush } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';

import { FinanceUIModule } from '../../finance-ui.module';
import { AccountHierarchyComponent } from './account-hierarchy.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AccountHierarchyComponent', () => {
  let component: AccountHierarchyComponent;
  let fixture: ComponentFixture<AccountHierarchyComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllAccountCategoriesSpy: SafeAny;
  let fetchAllAccountsSpy: SafeAny;
  let fetchAllTranTypesSpy: SafeAny;
  let fetchAllControlCentersSpy: SafeAny;
  let fetchAllOrdersSpy: SafeAny;
  let searchDocItemSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllAccountCategories',
      'fetchAllAccounts',
      'fetchAllTranTypes',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'searchDocItem',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    searchDocItemSpy = storageService.searchDocItem.and.returnValue(of({}));
    storageService.AccountCategories = [];
    storageService.Accounts = [];
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [AccountHierarchyComponent, MessageDialogComponent],
    imports: [FinanceUIModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule()],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    // TestBed.overrideModule(BrowserDynamicTestingModule, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountHierarchyComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
      searchDocItemSpy.and.returnValue(asyncData({ totalCount: 0, contentList: [] }));
      storageService.AccountCategories = fakeData.finAccountCategories;
      storageService.Accounts = fakeData.finAccounts;
    });

    it('should not show data before OnInit', () => {
      expect(component.availableCategories.length).toEqual(0);
      expect(component.availableAccounts.length).toEqual(0);
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.availableCategories.length).toBeGreaterThan(0);
      expect(component.availableCategories.length).toEqual(fakeData.finAccountCategories.length);

      expect(component.availableAccounts.length).toBeGreaterThan(0);
      // expect(component.availableAccounts.length).toEqual(fakeData.finAccounts.length);

      flush();
    }));
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
      searchDocItemSpy.and.returnValue(asyncData({ totalCount: 0, contentList: [] }));
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails on Account Category', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));

    it('should display error when Service fails on Account', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
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
