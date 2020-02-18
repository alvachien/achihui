import { async, ComponentFixture, TestBed, inject, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NgZorroAntdModule, NZ_I18N, en_US, } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';

import { AccountDetailComponent } from './account-detail.component';
import { getTranslocoModule, FakeDataHelper, FormGroupHelper, ActivatedRouteUrlStub, asyncData, asyncError } from '../../../../../testing';
import { AccountExtraAssetComponent } from '../account-extra-asset';
import { AccountExtraDownpaymentComponent } from '../account-extra-downpayment';
import { AccountExtraLoanComponent } from '../account-extra-loan';
import { AuthService, UIStatusService, FinanceOdataService, } from '../../../../services';
import { UserAuthInfo, AccountStatusEnum, financeAccountCategoryCash } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';

describe('AccountDetailComponent', () => {
  let component: AccountDetailComponent;
  let fixture: ComponentFixture<AccountDetailComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllAccountCategoriesSpy: any;
  let readAccountSpy: any;
  let fetchAllAssetCategoriesSpy: any;
  let fetchAllTranTypesSpy: any;
  let activatedRouteStub: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllAccountCategories',
      'readAccount',
      'fetchAllAssetCategories',
      'fetchAllTranTypes',
    ]);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    readAccountSpy = storageService.readAccount.and.returnValue(of({}));
    fetchAllAssetCategoriesSpy = storageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(of([]));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    uiServiceStub.getUILabel = (le: any) => '';
  });

  beforeEach(async(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        AccountDetailComponent,
        AccountExtraAssetComponent,
        AccountExtraDownpaymentComponent,
        AccountExtraLoanComponent,
        MessageDialogComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
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
    fixture = TestBed.createComponent(AccountDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('1. create mode', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
    });

    it('create mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.isCreateMode).toBeTruthy();
    }));

    it('category is a must', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.headerFormGroup.get('nameControl').setValue('test');
      component.headerFormGroup.get('nameControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeFalsy();

      component.headerFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      component.headerFormGroup.get('ctgyControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();

      flush();
    }));

    it('name is a must', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.headerFormGroup.get('ctgyControl').setValue(financeAccountCategoryCash);
      component.headerFormGroup.get('ctgyControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeFalsy();

      component.headerFormGroup.get('nameControl').setValue('test');
      component.headerFormGroup.get('nameControl').markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.headerFormGroup.valid).toBeTruthy();

      flush();
    }));
  });

  describe('2. change mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);

      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      readAccountSpy.and.returnValue(asyncData(fakeData.finAccounts[0]));
      fetchAllAssetCategoriesSpy.and.returnValue(asyncData(fakeData.finAssetCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
    });

    it('change mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.isCreateMode).toBeFalsy();

      flush();
    }));
  });

  describe('3. display mode', () => {
    beforeEach(() => {      
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);

      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      readAccountSpy.and.returnValue(asyncData(fakeData.finAccounts[0]));
      fetchAllAssetCategoriesSpy.and.returnValue(asyncData(fakeData.finAssetCategories));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
    });

    it('display mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeFalsy();
      expect(component.isCreateMode).toBeFalsy();

      flush();
    }));
  });

  describe('4. shall display error dialog for exception', () => {
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
