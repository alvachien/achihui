import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  inject,
  flush,
} from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRoute, Router, UrlSegment } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { OverlayContainer } from "@angular/cdk/overlay";
import { BehaviorSubject, of } from "rxjs";
import { NzModalService } from "ng-zorro-antd/modal";

import { LibraryUIModule } from "../../library-ui.module";
import {
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ActivatedRouteUrlStub,
} from "../../../../../testing";
import {
  AuthService,
  UIStatusService,
  HomeDefOdataService,
  LibraryStorageService,
} from "../../../../services";
import {
  UserAuthInfo,
  financeAccountCategoryCash,
  Account,
  AccountStatusEnum,
  PersonRole,
  Person,
} from "../../../../model";
import { MessageDialogComponent } from "../../../message-dialog";
import { PersonDetailComponent } from "./person-detail.component";

describe("PersonDetailComponent", () => {
  let component: PersonDetailComponent;
  let fixture: ComponentFixture<PersonDetailComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllPersonRolesSpy: any;
  let readPersonSpy: any;
  let createPersonSpy: any;
  let activatedRouteStub: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildPersonRoles();

    storageService = jasmine.createSpyObj("LibraryStorageService", [
      "fetchAllPersonRoles",
      "readPerson",
      "createPerson",
    ]);
    fetchAllPersonRolesSpy = storageService.fetchAllPersonRoles.and.returnValue(
      of([])
    );
    readPersonSpy = storageService.readPerson.and.returnValue(of({}));
    createPersonSpy = storageService.createPerson.and.returnValue(of({}));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    activatedRouteStub = new ActivatedRouteUrlStub([
      new UrlSegment("create", {}),
    ] as UrlSegment[]);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        LibraryUIModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [PersonDetailComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: LibraryStorageService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("create mode", () => {
    beforeEach(() => {
      const nrole = new Person();
      nrole.ID = 2;
      fetchAllPersonRolesSpy.and.returnValue(asyncData(fakeData.personRoles));
      createPersonSpy.and.returnValue(asyncData(nrole));
    });

    it("create mode init without error", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeTruthy();

      flush();
    }));

    it("create mode with valid data: name and comment", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.detailFormGroup.get("nnameControl")?.setValue("Test 1");
      component.detailFormGroup
        .get("detailControl")
        ?.setValue("Test 1 Comment");
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBeTrue();

      // Submit
      component.onSave();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, "navigate");

      tick();
      fixture.detectChanges();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(createPersonSpy).toHaveBeenCalled();

      flush();
    }));
  });

  describe("display mode", () => {
    let nperson: Person;
    beforeEach(() => {
      activatedRouteStub.setURL([
        new UrlSegment("display", {}),
        new UrlSegment("122", {}),
      ] as UrlSegment[]);

      nperson = new Person();
      nperson.ID = 2;
      nperson.NativeName = "test";

      fetchAllPersonRolesSpy.and.returnValue(asyncData(fakeData.personRoles));
      readPersonSpy.and.returnValue(asyncData(nperson));
    });

    it("display mode init without error", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeFalse();
      const nname = component.detailFormGroup.get("nnameControl")?.value;
      expect(nname).toEqual(nperson.NativeName);

      flush();
    }));
  });

  describe("edit mode", () => {
    beforeEach(() => {
      activatedRouteStub.setURL([
        new UrlSegment("edit", {}),
        new UrlSegment("122", {}),
      ] as UrlSegment[]);

      const nrole: Person = new Person();
      nrole.ID = 2;
      fetchAllPersonRolesSpy.and.returnValue(asyncData(fakeData.personRoles));
      readPersonSpy.and.returnValue(asyncData(nrole));
    });

    it("display mode init without error", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeTruthy();

      flush();
    }));
  });

  describe("4. shall display error dialog for exception", () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      const nrole = new Person();
      nrole.ID = 2;
      fetchAllPersonRolesSpy.and.returnValue(asyncData(fakeData.personRoles));
      createPersonSpy.and.returnValue(asyncData(nrole));
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it("should display error when Service fails on fetch all roles", fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllPersonRolesSpy.and.returnValue(
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

    it("should display error when create failed", fakeAsync(() => {
      // tell spy to return an async error observable
      createPersonSpy.and.returnValue(asyncError<string>("Service failed"));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.detailFormGroup.get("nnameControl")?.setValue("Test 1");
      component.detailFormGroup
        .get("detailControl")
        ?.setValue("Test 1 Comment");
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBeTrue();

      // Submit
      component.onSave();
      expect(createPersonSpy).toHaveBeenCalled();

      // // Expect there is a dialog
      // expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      // flush();

      // // OK button
      // const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      // expect(closeBtn).toBeTruthy();
      // closeBtn.click();
      // flush();
      // tick();
      // fixture.detectChanges();
      // expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));
  });
});
