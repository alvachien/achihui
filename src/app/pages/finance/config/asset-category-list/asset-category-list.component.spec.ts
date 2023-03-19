import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  inject,
  flush,
} from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { BehaviorSubject, of } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { OverlayContainer } from "@angular/cdk/overlay";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NzModalService } from "ng-zorro-antd/modal";

import { FinanceUIModule } from "../../finance-ui.module";
import { AssetCategoryListComponent } from "./asset-category-list.component";
import {
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
} from "../../../../../testing";
import {
  AuthService,
  UIStatusService,
  FinanceOdataService,
} from "../../../../services";
import { UserAuthInfo } from "../../../../model";
import { MessageDialogComponent } from "../../../message-dialog";

describe("AssetCategoryListComponent", () => {
  let component: AssetCategoryListComponent;
  let fixture: ComponentFixture<AssetCategoryListComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllAssetCategoriesSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();

    storageService = jasmine.createSpyObj("FinanceOdataService", [
      "fetchAllAssetCategories",
    ]);
    fetchAllAssetCategoriesSpy =
      storageService.fetchAllAssetCategories.and.returnValue(of([]));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
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
        getTranslocoModule(),
      ],
      declarations: [MessageDialogComponent, AssetCategoryListComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
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
    fixture = TestBed.createComponent(AssetCategoryListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("2. shall work with data", () => {
    beforeEach(() => {
      fetchAllAssetCategoriesSpy.and.returnValue(
        asyncData(fakeData.finAssetCategories)
      );
    });

    it("should not show data before OnInit", () => {
      expect(component.dataSet.length).toEqual(0);
    });

    it("should show data after OnInit", fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();

      expect(component.dataSet.length).toBeGreaterThan(0);
      expect(component.dataSet.length).toEqual(
        fakeData.finAssetCategories.length
      );

      flush();
    }));
  });

  describe("3. shall display error dialog for exception", () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAssetCategoriesSpy.and.returnValue(
        asyncData(fakeData.finAssetCategories)
      );
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it("should display error when Service fails", fakeAsync(() => {
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
  });
});
