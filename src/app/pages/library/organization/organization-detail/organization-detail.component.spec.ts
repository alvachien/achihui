import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { BehaviorSubject, of } from "rxjs";
import { NzModalService } from "ng-zorro-antd/modal";

import { LibraryUIModule } from "../../library-ui.module";
import { getTranslocoModule, FakeDataHelper } from "../../../../../testing";
import {
  AuthService,
  UIStatusService,
  LibraryStorageService,
  HomeDefOdataService,
} from "../../../../services";
import { UserAuthInfo } from "../../../../model";
import { OrganizationDetailComponent } from "./organization-detail.component";

describe("OrganizationDetailComponent", () => {
  let component: OrganizationDetailComponent;
  let fixture: ComponentFixture<OrganizationDetailComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let readOrganizationSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = jasmine.createSpyObj("LibraryStorageService", [
      "readOrganization",
    ]);
    readOrganizationSpy = storageService.readOrganization.and.returnValue(
      of([])
    );
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });
  beforeEach(async () => {
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
      declarations: [OrganizationDetailComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: LibraryStorageService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
