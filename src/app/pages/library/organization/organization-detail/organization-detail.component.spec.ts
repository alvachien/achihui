import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';

import {
  createSpyObj,
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ActivatedRouteUrlStub,
} from '../../../../../testing';
import { AuthService, UIStatusService, LibraryStorageService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, Organization, OrganizationType } from '../../../../model';
import { OrganizationDetailComponent } from './organization-detail.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('OrganizationDetailComponent', () => {
  let component: OrganizationDetailComponent;
  let fixture: ComponentFixture<OrganizationDetailComponent>;
  let fakeData: FakeDataHelper;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let readOrganizationSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let createOrganizationSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updateOrganizationSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activatedRouteStub: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = createSpyObj('LibraryStorageService', [
      'readOrganization',
      'fetchAllOrganizationTypes',
      'createOrganization',
      'updateOrganization',
    ]);
    readOrganizationSpy = storageService.readOrganization.and.returnValue(of({}));
    storageService.fetchAllOrganizationTypes.and.returnValue(of([]));
    createOrganizationSpy = storageService.createOrganization.and.returnValue(of({}));
    updateOrganizationSpy = storageService.updateOrganization.and.returnValue(of({}));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    authServiceStub.authSubject = signal(new UserAuthInfo());
  });

  beforeEach(async () => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    await TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [
        FormsModule,

        ReactiveFormsModule,
        RouterTestingModule,
        NzInputModule,
        NzCheckboxModule,
        NzSelectModule,
        getTranslocoModule(),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: LibraryStorageService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('create mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('create', {})] as UrlSegment[]);
      createOrganizationSpy.mockClear();
      createOrganizationSpy.and.returnValue(asyncData(new Organization()));
    });

    it('create mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.isEditable).toBe(true);
    });

    it('create mode with valid data calls createOrganization', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test Org');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(true);

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      // Submit
      component.onSave();

      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(createOrganizationSpy).toHaveBeenCalled();
    });

    it('form is invalid when required NativeName is empty', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(false);
    });

    it('onSave does not call createOrganization when form is invalid', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('');
      component.detailFormGroup.markAsDirty();

      component.onSave();

      expect(createOrganizationSpy).not.toHaveBeenCalled();
    });

    it('form is invalid when NativeName exceeds 100 characters', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('x'.repeat(101));
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(false);
    });
  });

  describe('display mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('2', {})] as UrlSegment[]);

      const norg = new Organization();
      norg.ID = 2;
      norg.NativeName = 'test';
      storageService.fetchAllOrganizationTypes.and.returnValue(asyncData([]));
      readOrganizationSpy.and.returnValue(asyncData(norg));
    });

    it('display mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.isEditable).toBe(false);
      const nname = component.detailFormGroup.get('nnameControl')?.value;
      expect(nname).toEqual('test');
    });
  });

  describe('edit mode', () => {
    let norg: Organization;
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('2', {})] as UrlSegment[]);

      // Detail is not exposed by the edit form; it must survive an update save
      // (backend PUT applies every column of the body).
      norg = new Organization();
      norg.ID = 2;
      norg.NativeName = 'test';
      norg.Detail = 'org detail';
      storageService.fetchAllOrganizationTypes.and.returnValue(asyncData([]));
      readOrganizationSpy.and.returnValue(asyncData(norg));
      updateOrganizationSpy.and.returnValue(asyncData(norg));
    });

    it('edit mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBe(true);
      const nname = component.detailFormGroup.get('nnameControl')?.value;
      expect(nname).toEqual('test');
    });

    it('edit mode with valid data calls updateOrganization', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(true);

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      // Submit
      component.onSave();

      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/library/organization/display/2']);
      expect(updateOrganizationSpy).toHaveBeenCalled();
    });

    it('edit save preserves Detail the form does not expose (no wipe on PUT)', async () => {
      updateOrganizationSpy.mockClear();
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Renamed Org');
      component.detailFormGroup.markAsDirty();

      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(updateOrganizationSpy).toHaveBeenCalled();
      const saved: Organization = updateOrganizationSpy.mock.calls[0][0];
      expect(saved.NativeName).toEqual('Renamed Org');
      expect(saved.Detail).toEqual('org detail');

      const json = saved.writeJSONObject();
      expect(json.Detail).toEqual('org detail');
    });
  });

  describe('type rows', () => {
    let types: OrganizationType[];
    const mkType = (id: number): OrganizationType => {
      const t = new OrganizationType();
      t.ID = id;
      t.Name = 'Type ' + id;
      t.Comment = 'Comment ' + id;
      return t;
    };

    beforeEach(() => {
      types = [mkType(1), mkType(2), mkType(3)];
      activatedRouteStub.setURL([new UrlSegment('create', {})] as UrlSegment[]);
      storageService.fetchAllOrganizationTypes.and.returnValue(asyncData(types));
    });

    it('onTypeModeChanged stores a copy and leaves the cached dictionary untouched', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.onAssignType();
      const row = component.listTypes()[0];
      const cached = types[0];

      component.onTypeModeChanged(cached.ID, row);
      const stored = component.listTypes()[0];
      expect(stored).not.toBe(cached); // never the shared dictionary instance
      expect(stored.ID).toBe(1);
      expect(stored.Name).toEqual('Type 1');

      // Simulate the template's [(ngModel)]="data.ID" writing into the row when
      // the user switches the dropdown to another type, then the sync handler.
      stored.ID = 2;
      component.onTypeModeChanged(2, stored);

      expect(types[0].ID).toBe(1); // cached entry NOT corrupted
      expect(types[1].ID).toBe(2);
      expect(component.listTypes()[0]).not.toBe(types[1]);
      expect(component.listTypes()[0].Name).toEqual('Type 2');
    });

    it('onTypeModeChanged with an unknown id leaves the row untouched', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.onAssignType();
      const row = component.listTypes()[0];
      component.onTypeModeChanged(999, row);
      expect(component.listTypes()[0]).toBe(row);
    });

    it('onRemoveTypeAssignment removes exactly the given row object', () => {
      const a = mkType(1);
      const b = mkType(2);
      const c = mkType(3);
      component.listTypes.set([a, b, c]);

      component.onRemoveTypeAssignment(b);

      expect(component.listTypes()).toEqual([a, c]);
    });
  });

  describe('error cases', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('2', {})] as UrlSegment[]);
      storageService.fetchAllOrganizationTypes.and.returnValue(asyncData([]));
      readOrganizationSpy.and.returnValue(asyncError('Failed'));
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error modal when readOrganization fails', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
    });
  });
});
