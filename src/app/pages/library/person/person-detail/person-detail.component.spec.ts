import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';

import {createSpyObj, getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ActivatedRouteUrlStub,} from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, LibraryStorageService } from '../../../../services';
import { UserAuthInfo, Person } from '../../../../model';
import { PersonDetailComponent } from './person-detail.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PersonDetailComponent', () => {
  let component: PersonDetailComponent;
  let fixture: ComponentFixture<PersonDetailComponent>;
  let fakeData: FakeDataHelper;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchAllPersonRolesSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let readPersonSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let createPersonSpy: any;
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
      'readPerson',
      'createPerson',
    ]);
    fetchAllPersonRolesSpy = storageService.fetchAllPersonRoles.and.returnValue(of([]));
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
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    await TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [FormsModule,

        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        NzInputModule,
        NzCheckboxModule,
        NzSelectModule,
        getTranslocoModule()],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: LibraryStorageService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
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
      createPersonSpy.and.returnValue(asyncData(nrole));
    });

    it('create mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('create mode with valid data: name and comment', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.get('detailControl')?.setValue('Test 1 Comment');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(true);

      // Submit
      component.onSave();

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(createPersonSpy).toHaveBeenCalled();

      await new Promise<void>(r => setTimeout(r, 0));
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
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBe(false);
      const nname = component.detailFormGroup.get('nnameControl')?.value;
      expect(nname).toEqual(nperson.NativeName);

      await new Promise<void>(r => setTimeout(r, 0));
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);

      const nrole: Person = new Person();
      nrole.ID = 2;
      fetchAllPersonRolesSpy.and.returnValue(asyncData(fakeData.personRoles));
      readPersonSpy.and.returnValue(asyncData(nrole));
    });

    it('display mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeTruthy();

      await new Promise<void>(r => setTimeout(r, 0));
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
      await new Promise<void>(r => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>(r => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>(r => setTimeout(r, 0));
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('should display error when create failed', async () => {
      // tell spy to return an async error observable
      createPersonSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
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

      await new Promise<void>(r => setTimeout(r, 0));
    });
  });
});
