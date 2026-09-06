import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';

import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { AuthService, UIStatusService, LibraryStorageService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, OrganizationType } from '../../../../model';
import { OrganizationTypeListComponent } from './organization-type-list.component';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('OrganizationTypeListComponent', () => {
  let component: OrganizationTypeListComponent;
  let fixture: ComponentFixture<OrganizationTypeListComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllOrganizationTypesSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = createSpyObj('LibraryStorageService', ['fetchAllOrganizationTypes']);
    fetchAllOrganizationTypesSpy = storageService.fetchAllOrganizationTypes.and.returnValue(of([]));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    authServiceStub.authSubject = signal(new UserAuthInfo());
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, getTranslocoModule()],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: LibraryStorageService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTypeListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('calls fetchAllOrganizationTypes on init', () => {
    fetchAllOrganizationTypesSpy.and.returnValue(asyncData([]));
    fixture.detectChanges(); // ngOnInit
    expect(fetchAllOrganizationTypesSpy).toHaveBeenCalled();
  });

  it('renders fetched organization types into the table', async () => {
    const t1 = new OrganizationType();
    t1.ID = 1;
    t1.Name = 'Press';
    const t2 = new OrganizationType();
    t2.ID = 2;
    t2.Name = 'Library';
    fetchAllOrganizationTypesSpy.and.returnValue(asyncData([t1, t2]));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0)); // resolve the observable
    fixture.detectChanges();

    expect(component.dataSet().length).toBe(2);
    expect(component.dataSet()[0].Name).toEqual('Press');
  });

  describe('fetch error', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
      fetchAllOrganizationTypesSpy.and.returnValue(asyncError('Failed'));
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shows an error modal when the fetch fails', async () => {
      fixture.detectChanges(); // ngOnInit
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
    });
  });
});
