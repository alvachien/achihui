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
import { AuthService, UIStatusService, HomeDefOdataService, LibraryStorageService } from '../../../../services';
import { UserAuthInfo, Person, PersonRole } from '../../../../model';
import { PersonDetailComponent } from './person-detail.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('PersonDetailComponent', () => {
  let component: PersonDetailComponent;
  let fixture: ComponentFixture<PersonDetailComponent>;
  let fakeData: FakeDataHelper;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchAllPersonRolesSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchAllPersonsSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let readPersonSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let createPersonSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updatePersonSpy: any;
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
    fakeData.buildPersonRoles();

    storageService = createSpyObj('LibraryStorageService', [
      'fetchAllPersonRoles',
      'fetchAllPersons',
      'readPerson',
      'createPerson',
      'updatePerson',
    ]);
    fetchAllPersonRolesSpy = storageService.fetchAllPersonRoles.and.returnValue(of([]));
    // Duplicate pre-check: default to an empty home list so unrelated saves pass.
    fetchAllPersonsSpy = storageService.fetchAllPersons.and.returnValue(of([]));
    readPersonSpy = storageService.readPerson.and.returnValue(of({}));
    createPersonSpy = storageService.createPerson.and.returnValue(of({}));
    updatePersonSpy = storageService.updatePerson.and.returnValue(of({}));
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
    fixture = TestBed.createComponent(PersonDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('create mode', () => {
    beforeEach(() => {
      const nrole = new Person();
      nrole.ID = 2;
      fetchAllPersonRolesSpy.and.returnValue(asyncData(fakeData.personRoles));
      createPersonSpy.mockClear();
      createPersonSpy.and.returnValue(asyncData(nrole));
    });

    it('create mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeTruthy();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('create mode with valid data: name and comment', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.get('detailControl')?.setValue('Test 1 Comment');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(true);

      // Submit
      component.onSave();

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(createPersonSpy).toHaveBeenCalled();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('form is invalid when required NativeName is empty', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(false);
    });

    it('onSave does not call createPerson when form is invalid', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('');
      component.detailFormGroup.markAsDirty();

      component.onSave();

      expect(createPersonSpy).not.toHaveBeenCalled();
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
    let nperson: Person;
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);

      nperson = new Person();
      nperson.ID = 2;
      nperson.NativeName = 'test';

      fetchAllPersonRolesSpy.and.returnValue(asyncData(fakeData.personRoles));
      readPersonSpy.and.returnValue(asyncData(nperson));
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
      expect(nname).toEqual(nperson.NativeName);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);

      const nrole: Person = new Person();
      nrole.ID = 2;
      fetchAllPersonRolesSpy.and.returnValue(asyncData(fakeData.personRoles));
      readPersonSpy.and.returnValue(asyncData(nrole));
      updatePersonSpy.and.returnValue(asyncData(nrole));
    });

    it('edit mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeTruthy();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('edit mode with valid data calls updatePerson', async () => {
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
      expect(routerstub.navigate).toHaveBeenCalledWith(['/library/person/display/2']);
      expect(updatePersonSpy).toHaveBeenCalled();
    });
  });

  describe('role rows', () => {
    let roles: PersonRole[];
    const mkRole = (id: number): PersonRole => {
      const r = new PersonRole();
      r.ID = id;
      r.Name = 'Role ' + id;
      r.Comment = 'Comment ' + id;
      return r;
    };

    beforeEach(() => {
      roles = [mkRole(1), mkRole(2), mkRole(3)];
      activatedRouteStub.setURL([new UrlSegment('create', {})] as UrlSegment[]);
      fetchAllPersonRolesSpy.and.returnValue(asyncData(roles));
    });

    it('onRoleModeChanged stores a copy and leaves the cached dictionary untouched', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.onAssignRole();
      const row = component.listRoles()[0];
      const cached = roles[0];

      component.onRoleModeChanged(cached.ID, row);
      const stored = component.listRoles()[0];
      expect(stored).not.toBe(cached); // never the shared dictionary instance
      expect(stored.ID).toBe(1);
      expect(stored.Name).toEqual('Role 1');

      // Simulate the template's [(ngModel)]="data.ID" writing into the row when
      // the user switches the dropdown to another role, then the sync handler.
      stored.ID = 2;
      component.onRoleModeChanged(2, stored);

      expect(roles[0].ID).toBe(1); // cached Author entry NOT corrupted
      expect(roles[1].ID).toBe(2); // cached Translator entry unchanged
      expect(component.listRoles()[0]).not.toBe(roles[1]);
      expect(component.listRoles()[0].Name).toEqual('Role 2');
      // Duplicate track keys would break the option list; IDs stay unique.
      expect(new Set(roles.map((r) => r.ID)).size).toBe(3);
    });

    it('onRoleModeChanged with an unknown id leaves the row untouched', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.onAssignRole();
      const row = component.listRoles()[0];
      component.onRoleModeChanged(999, row);
      expect(component.listRoles()[0]).toBe(row);
    });

    it('onRemoveRoleAssignment removes exactly the given row object', () => {
      const a = mkRole(1);
      const b = mkRole(2);
      const c = mkRole(3);
      component.listRoles.set([a, b, c]);

      component.onRemoveRoleAssignment(b);

      expect(component.listRoles()).toEqual([a, c]);
    });

    it('onRemoveRoleAssignment by identity is immune to page-slice $index confusion', () => {
      // Regression guard: with >10 rows the table paginates client-side, so the
      // template's $index addresses the current PAGE. Identity removal must hit
      // the exact object no matter its position in the full list.
      const rows: PersonRole[] = [];
      for (let i = 1; i <= 12; i++) {
        rows.push(mkRole(i));
      }
      const target = rows[11]; // would sit on page 2 with $index 1
      component.listRoles.set(rows);

      component.onRemoveRoleAssignment(target);

      expect(component.listRoles().length).toBe(11);
      expect(component.listRoles()).not.toContain(target);
      expect(component.listRoles()[0]).toBe(rows[0]); // page-1 row 1 intact
    });
  });

  describe('4. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      const nrole = new Person();
      nrole.ID = 2;
      fetchAllPersonRolesSpy.and.returnValue(asyncData(fakeData.personRoles));
      createPersonSpy.and.returnValue(asyncData(nrole));
    });

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails on fetch all roles', async () => {
      // tell spy to return an async error observable
      fetchAllPersonRolesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should display error when create failed', async () => {
      // tell spy to return an async error observable
      createPersonSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.get('detailControl')?.setValue('Test 1 Comment');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(true);

      // Submit
      component.onSave();
      expect(createPersonSpy).toHaveBeenCalled();

      // // Expect there is a dialog
      // expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      // await new Promise<void>(r => setTimeout(r, 0));

      // // OK button
      // const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      // expect(closeBtn).toBeTruthy();
      // closeBtn.click();
      // await new Promise<void>(r => setTimeout(r, 0));
      // await new Promise<void>(r => setTimeout(r, 0));
      // fixture.detectChanges();
      // expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('duplicate pre-check', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    const mkPerson = (id: number, nn: string, cn = ''): Person => {
      const p = new Person();
      p.ID = id;
      p.NativeName = nn;
      p.ChineseName = cn;
      return p;
    };

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
      // Spies are built in the shared beforeAll and keep their call records across
      // describes - clear so not.toHaveBeenCalled()/toHaveBeenCalled() are meaningful
      // here (mockClear keeps the configured return values).
      createPersonSpy.mockClear();
      updatePersonSpy.mockClear();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('blocks create when a cached person has the same NativeName', async () => {
      fetchAllPersonsSpy.and.returnValue(of([mkPerson(5, 'Test 1')]));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();
      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(createPersonSpy).not.toHaveBeenCalled();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
    });

    it('blocks create when the input NativeName hits a cached ChineseName (cross-match)', async () => {
      fetchAllPersonsSpy.and.returnValue(of([mkPerson(5, 'Other', 'Test 1')]));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();
      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(createPersonSpy).not.toHaveBeenCalled();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
    });

    it('blocks create on case and whitespace variation of a cached name', async () => {
      fetchAllPersonsSpy.and.returnValue(of([mkPerson(5, '  test 1 ')]));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();
      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(createPersonSpy).not.toHaveBeenCalled();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
    });

    it('allows create when ChineseNames are both empty and NativeNames differ', async () => {
      fetchAllPersonsSpy.and.returnValue(of([mkPerson(5, 'Other', '')]));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();
      component.onSave();

      expect(createPersonSpy).toHaveBeenCalled();
    });

    it('still submits when the pre-check fetch fails (API guard is authoritative)', async () => {
      fetchAllPersonsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();
      component.onSave();

      // asyncError rejects on a macrotask; the error handler must fall through to submit.
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(createPersonSpy).toHaveBeenCalled();
    });

    it('edit mode: saving the record with its own name unchanged is not blocked', async () => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);
      const self = mkPerson(122, 'Test 1');
      readPersonSpy.and.returnValue(asyncData(self));
      updatePersonSpy.and.returnValue(asyncData(self));
      // The home list contains the edited record itself - self-exclusion must kick in.
      fetchAllPersonsSpy.and.returnValue(of([self]));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.markAsDirty();
      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(updatePersonSpy).toHaveBeenCalled();
    });
  });
});
