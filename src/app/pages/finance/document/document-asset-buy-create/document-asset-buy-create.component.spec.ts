import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flush,
  inject,
  discardPeriodicTasks,
} from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Router, UrlSegment, ActivatedRoute } from "@angular/router";
import { By } from "@angular/platform-browser";
import { NZ_I18N, en_US } from "ng-zorro-antd/i18n";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { BehaviorSubject, of } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";
import { OverlayContainer } from "@angular/cdk/overlay";
import * as moment from "moment";
import { NzModalService } from "ng-zorro-antd/modal";

import { FinanceUIModule } from "../../finance-ui.module";
import { AccountExtraAssetComponent } from "../../account/account-extra-asset";
import { DocumentHeaderComponent } from "../document-header";
import { DocumentItemsComponent } from "../document-items";
import { DocumentAssetBuyCreateComponent } from "./document-asset-buy-create.component";
import {
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
} from "../../../../../testing";
import {
  AuthService,
  UIStatusService,
  HomeDefOdataService,
  FinanceOdataService,
} from "../../../../services";
import {
  UserAuthInfo,
  financeAccountCategoryAsset,
  Document,
  DocumentItem,
  Account,
  AccountExtraAsset,
} from "../../../../model";
import { MessageDialogComponent } from "../../../message-dialog";

describe("DocumentAssetBuyCreateComponent", () => {
  let component: DocumentAssetBuyCreateComponent;
  let fixture: ComponentFixture<DocumentAssetBuyCreateComponent>;
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
  let createAssetBuyinDocumentSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService>;
  let assetAccount: any;
  const modalClassName = ".ant-modal-body";
  const nextButtonId = "#button_next_step";

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();
    assetAccount = fakeData.finAccounts.find((val) => {
      return val.CategoryId === financeAccountCategoryAsset;
    });

    storageService = jasmine.createSpyObj("FinanceOdataService", [
      "fetchAllAccountCategories",
      "fetchAllAssetCategories",
      "fetchAllDocTypes",
      "fetchAllTranTypes",
      "fetchAllAccounts",
      "fetchAllControlCenters",
      "fetchAllOrders",
      "createAssetBuyinDocument",
      "fetchAllCurrencies",
    ]);
    fetchAllAccountCategoriesSpy =
      storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAssetCategoriesSpy =
      storageService.fetchAllAssetCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(
      of([])
    );
    fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(
      of([])
    );
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(
      of([])
    );
    fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(of([]));
    fetchAllControlCentersSpy =
      storageService.fetchAllControlCenters.and.returnValue(of([]));
    createAssetBuyinDocumentSpy =
      storageService.createAssetBuyinDocument.and.returnValue(of({}));
    fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(
      of([])
    );
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        getTranslocoModule(),
        RouterTestingModule,
      ],
      declarations: [
        AccountExtraAssetComponent,
        DocumentHeaderComponent,
        DocumentItemsComponent,
        DocumentAssetBuyCreateComponent,
        MessageDialogComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [MessageDialogComponent],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAssetBuyCreateComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("working with data", () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy =
        storageService.fetchAllAccountCategories.and.returnValue(
          asyncData(fakeData.finAccountCategories)
        );
      fetchAllAssetCategoriesSpy =
        storageService.fetchAllAssetCategories.and.returnValue(
          asyncData(fakeData.finAssetCategories)
        );
      fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(
        asyncData(fakeData.finDocTypes)
      );
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(
        asyncData(fakeData.finTranTypes)
      );
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(
        asyncData(fakeData.finAccounts)
      );
      fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(
        asyncData(fakeData.finOrders)
      );
      fetchAllControlCentersSpy =
        storageService.fetchAllControlCenters.and.returnValue(
          asyncData(fakeData.finControlCenters)
        );
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(
        asyncData(fakeData.currencies)
      );
      createAssetBuyinDocumentSpy =
        storageService.createAssetBuyinDocument.and.returnValue(of({}));
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it("setp 0: initial status", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      flush();
    }));

    it("step 0: document header is manadatory", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update document header - missed desp
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      // dochead.Desp = 'test';
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Now add the desp back
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get("headerControl")?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();

      flush();
    }));

    it("step 0: asset account is manadatory", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get("headerControl")?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account - missing
      // Amount
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(
        component.firstFormGroup.get("assetAccountControl")?.valid
      ).toBeTruthy();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it("step 0: amount is manadatory", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get("headerControl")?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      // Amount - missing
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(
        component.firstFormGroup.get("assetAccountControl")?.valid
      ).toBeTruthy();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the missing part
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it("step 0: owner is manadatory", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get("headerControl")?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      // Amount
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner - missing
      tick();
      fixture.detectChanges();
      expect(
        component.firstFormGroup.get("assetAccountControl")?.valid
      ).toBeTruthy();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the missing part
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it("step 0: legacy flag is manadatory", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);
      expect(component.firstFormGroup.valid).toBeFalsy();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get("headerControl")?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      // Amount
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      // Legacy - missing
      component.firstFormGroup.get("legacyControl")?.setValue(undefined);
      component.firstFormGroup.get("legacyControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(
        component.firstFormGroup.get("assetAccountControl")?.valid
      ).toBeTruthy();
      expect(component.firstFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Add the missing part
      component.firstFormGroup.get("legacyControl")?.setValue(false);
      component.firstFormGroup.get("legacyControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it("step 0: shall go to step 1 with valid non-legacy case", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get("headerControl")?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      // Amount
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      // Legacy
      component.firstFormGroup.get("legacyControl")?.setValue(false);
      component.firstFormGroup.get("legacyControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Click the next button
      const nextButtonNativeEl: any = fixture.debugElement.queryAll(
        By.css(nextButtonId)
      )[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(1);
      expect(component.itemFormGroup.enabled).toBeTrue();

      // Shall go back to step 0
      component.pre();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(0);

      flush();
    }));

    it("step 1: item is manadatory with non-legacy case", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      // Amount
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      // Legacy
      component.firstFormGroup.get("legacyControl")?.setValue(false);
      component.firstFormGroup.get("legacyControl")?.markAsDirty();
      tick();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl: any = fixture.debugElement.queryAll(
        By.css(nextButtonId)
      )[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(1);
      expect(component.itemFormGroup.enabled).toBeTrue();

      // No items
      expect(component.itemFormGroup.valid).toBeFalse();
      expect(component.nextButtonEnabled).toBeFalsy();

      // Now add items
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = "Test 1";
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get("itemControl")?.setValue(aritems);
      component.itemFormGroup.get("itemControl")?.markAsDirty();
      component.itemFormGroup.updateValueAndValidity();
      tick();
      fixture.detectChanges();

      expect(component.itemFormGroup.valid).toBeTrue();
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    it("step 1: item amount shall equal to amount in step 0 with non-legacy case", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      // Amount
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      // Legacy
      component.firstFormGroup.get("legacyControl")?.setValue(false);
      component.firstFormGroup.get("legacyControl")?.markAsDirty();
      tick();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl: any = fixture.debugElement.queryAll(
        By.css(nextButtonId)
      )[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1.
      expect(component.currentStep).toEqual(1);
      expect(component.itemFormGroup.enabled).toBeTrue();

      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = "Test 1";
      aritem.TranAmount = 200;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get("itemControl")?.setValue(aritems);
      component.itemFormGroup.get("itemControl")?.markAsDirty();
      tick();
      fixture.detectChanges();

      expect(component.itemFormGroup.valid).toBeFalsy();
      expect(component.nextButtonEnabled).toBeFalsy();

      flush();
    }));

    it("step 2: go to review page with valid non-legacy case", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      // Amount
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      // Legacy
      component.firstFormGroup.get("legacyControl")?.setValue(false);
      component.firstFormGroup.get("legacyControl")?.markAsDirty();
      tick();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl: any = fixture.debugElement.queryAll(
        By.css(nextButtonId)
      )[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = "Test 1";
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get("itemControl")?.setValue(aritems);
      component.itemFormGroup.get("itemControl")?.markAsDirty();
      tick();
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      expect(component.currentStep).toBe(2);
      expect(component.nextButtonEnabled).toBeTruthy();

      flush();
    }));

    xit("step 3: popup dialog if generated document object failed in verification", fakeAsync(() => {
      createAssetBuyinDocumentSpy.and.returnValue(asyncData(1));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      // Amount
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      // Legacy
      component.firstFormGroup.get("legacyControl")?.setValue(false);
      component.firstFormGroup.get("legacyControl")?.markAsDirty();
      tick();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl: any = fixture.debugElement.queryAll(
        By.css(nextButtonId)
      )[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = "Test 1";
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get("itemControl")?.setValue(aritems);
      component.itemFormGroup.get("itemControl")?.markAsDirty();
      tick();
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      // Fake an error
      dochead.Desp = "";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.markAsDirty();
      fixture.detectChanges();
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 3.
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toBe(2);
      expect(component.isDocPosting).toBeFalsy();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ".ant-modal-close"
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(0);

      tick();
      fixture.detectChanges();

      flush();
    }));

    it("step 3: display success result page with valid non-legacy case", fakeAsync(() => {
      createAssetBuyinDocumentSpy.and.returnValue(
        asyncData({
          Id: 1,
        })
      );

      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      // Amount
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      // Legacy
      component.firstFormGroup.get("legacyControl")?.setValue(false);
      component.firstFormGroup.get("legacyControl")?.markAsDirty();
      tick();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl: any = fixture.debugElement.queryAll(
        By.css(nextButtonId)
      )[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = "Test 1";
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get("itemControl")?.setValue(aritems);
      component.itemFormGroup.get("itemControl")?.markAsDirty();
      tick();
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 3.
      expect(component.isDocPosting).toBeTruthy();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toBe(3);
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toEqual(1);
      tick();
      fixture.detectChanges();

      flush();
    }));

    it("step 3: display failed  result page with valid non-legacy case", fakeAsync(() => {
      createAssetBuyinDocumentSpy.and.returnValue(
        asyncError("doc failed to create")
      );

      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      // Step 0
      const dochead: Document = new Document();
      dochead.TranDate = moment();
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      // Asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      // Amount
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      // Legacy
      component.firstFormGroup.get("legacyControl")?.setValue(false);
      component.firstFormGroup.get("legacyControl")?.markAsDirty();
      tick();
      fixture.detectChanges();

      // Click the next button
      const nextButtonNativeEl: any = fixture.debugElement.queryAll(
        By.css(nextButtonId)
      )[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 1
      const aritems: DocumentItem[] = [];
      const aritem: DocumentItem = new DocumentItem();
      aritem.ItemId = 1;
      aritem.AccountId = fakeData.finAccounts[0].Id;
      aritem.Desp = "Test 1";
      aritem.TranAmount = 100.2;
      aritem.TranType = fakeData.finTranTypes.find((val) => {
        return val.Expense === true;
      })?.Id;
      aritem.ControlCenterId = fakeData.finControlCenters[0].Id;
      aritems.push(aritem);
      component.itemFormGroup.get("itemControl")?.setValue(aritems);
      component.itemFormGroup.get("itemControl")?.markAsDirty();
      tick();
      fixture.detectChanges();

      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 2.
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Step 3.
      expect(component.isDocPosting).toBeTruthy();
      tick();
      fixture.detectChanges();
      expect(component.currentStep).toBe(3);
      expect(component.isDocPosting).toBeFalsy();
      expect(component.docIdCreated).toBeUndefined();
      expect(component.docPostingFailed).toBeTruthy();
      tick();
      fixture.detectChanges();

      flush();
    }));

    it("setp 0: shall go to step 1 with valid legacy case", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0);

      // Update a valid document header
      const dochead: Document = new Document();
      dochead.TranDate = moment().subtract(1, "y");
      dochead.TranCurr = fakeData.chosedHome.BaseCurrency;
      dochead.Desp = "test";
      component.firstFormGroup.get("headerControl")?.setValue(dochead);
      component.firstFormGroup.get("headerControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.get("headerControl")?.valid).toBeTrue();
      expect(component.firstFormGroup.valid).toBeFalsy();
      // Asset account
      component.firstFormGroup
        .get("assetAccountControl")
        ?.setValue(assetAccount.ExtraInfo as AccountExtraAsset);
      component.firstFormGroup.get("assetAccountControl")?.markAsDirty();
      // Amount
      component.firstFormGroup.get("amountControl")?.setValue(100.2);
      component.firstFormGroup.get("amountControl")?.markAsDirty();
      // Control center
      component.firstFormGroup
        .get("ccControl")
        ?.setValue(fakeData.finControlCenters[0].Id);
      component.firstFormGroup.get("ccControl")?.markAsDirty();
      // Order - empty
      // Owner
      component.firstFormGroup
        .get("ownerControl")
        ?.setValue(fakeData.chosedHome.Members[0].User);
      component.firstFormGroup.get("ownerControl")?.markAsDirty();
      // Legacy
      component.firstFormGroup.get("legacyControl")?.setValue(true);
      component.firstFormGroup.get("legacyControl")?.markAsDirty();
      tick();
      fixture.detectChanges();
      expect(component.firstFormGroup.valid).toBeTruthy();
      expect(component.nextButtonEnabled).toBeTruthy();

      // Click the next button
      const nextButtonNativeEl: any = fixture.debugElement.queryAll(
        By.css(nextButtonId)
      )[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toEqual(1);
      expect(component.itemFormGroup.disabled).toBeTrue();

      // Shall go back to step 0
      component.pre();
      fixture.detectChanges();
      expect(component.currentStep).toEqual(0);

      flush();
    }));
  });

  describe("shall display error dialog when service failed", () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy =
        storageService.fetchAllAccountCategories.and.returnValue(
          asyncData(fakeData.finAccountCategories)
        );
      fetchAllAssetCategoriesSpy =
        storageService.fetchAllAssetCategories.and.returnValue(
          asyncData(fakeData.finAssetCategories)
        );
      fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(
        asyncData(fakeData.finDocTypes)
      );
      fetchAllTranTypesSpy = storageService.fetchAllTranTypes.and.returnValue(
        asyncData(fakeData.finTranTypes)
      );
      fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(
        asyncData(fakeData.finAccounts)
      );
      fetchAllOrdersSpy = storageService.fetchAllOrders.and.returnValue(
        asyncData(fakeData.finOrders)
      );
      fetchAllControlCentersSpy =
        storageService.fetchAllControlCenters.and.returnValue(
          asyncData(fakeData.finControlCenters)
        );
      fetchAllCurrenciesSpy = storageService.fetchAllCurrencies.and.returnValue(
        asyncData(fakeData.currencies)
      );
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it("should display error when Account Category fetched fails", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(
        asyncError<string>("Service failed")
      );

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ".ant-modal-close"
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(0);

      discardPeriodicTasks();
    }));

    it("should display error when Asset Category fetched fails", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAssetCategoriesSpy.and.returnValue(
        asyncError<string>("Service failed")
      );

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ".ant-modal-close"
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(0);

      flush();
    }));

    it("should display error when Doc type fetched fails", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>("Service failed"));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ".ant-modal-close"
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(0);

      flush();
    }));

    it("should display error when Tran. type fetched fails", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(
        asyncError<string>("Service failed")
      );

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ".ant-modal-close"
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(0);

      flush();
    }));

    it("should display error when currency fetched fails", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(
        asyncError<string>("Service failed")
      );

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ".ant-modal-close"
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(0);

      flush();
    }));

    it("should display error when account fetched fails", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>("Service failed"));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ".ant-modal-close"
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(0);

      flush();
    }));

    it("should display error when control center fetched fails", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(
        asyncError<string>("Service failed")
      );

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ".ant-modal-close"
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(0);

      flush();
    }));

    it("should display error when order fetched fails", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>("Service failed"));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(
        ".ant-modal-close"
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(
        overlayContainerElement.querySelectorAll(".ant-modal-body").length
      ).toBe(0);

      flush();
    }));
  });
});
