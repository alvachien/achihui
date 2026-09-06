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

import {
  createSpyObj,
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ActivatedRouteUrlStub,
} from '../../../../../testing';
import { AuthService, UIStatusService, LibraryStorageService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, Location } from '../../../../model';
import { LocationDetailComponent } from './location-detail.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('LocationDetailComponent', () => {
  let component: LocationDetailComponent;
  let fixture: ComponentFixture<LocationDetailComponent>;
  let fakeData: FakeDataHelper;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let readLocationSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let createLocationSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updateLocationSpy: any;
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

    storageService = createSpyObj('LibraryStorageService', ['readLocation', 'createLocation', 'updateLocation']);
    readLocationSpy = storageService.readLocation.and.returnValue(of({}));
    createLocationSpy = storageService.createLocation.and.returnValue(of({}));
    updateLocationSpy = storageService.updateLocation.and.returnValue(of({}));
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
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, getTranslocoModule(), LocationDetailComponent],
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
    fixture = TestBed.createComponent(LocationDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('create mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('create', {})] as UrlSegment[]);
      createLocationSpy.mockClear();
      createLocationSpy.and.returnValue(asyncData(new Location()));
    });

    it('create mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.isEditable).toBe(true);
    });

    it('create mode with valid data calls createLocation', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nameControl')?.setValue('Test Location');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(true);

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      // Submit
      component.onSave();

      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(createLocationSpy).toHaveBeenCalled();
    });

    it('form is invalid when required Name is empty', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nameControl')?.setValue('');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(false);
    });

    it('onSave does not call createLocation when form is invalid', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nameControl')?.setValue('');
      component.detailFormGroup.markAsDirty();

      component.onSave();

      expect(createLocationSpy).not.toHaveBeenCalled();
    });

    it('form is invalid when Name exceeds 100 characters', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nameControl')?.setValue('x'.repeat(101));
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(false);
    });
  });

  describe('display mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('2', {})] as UrlSegment[]);

      const nloc = new Location();
      nloc.ID = 2;
      nloc.Name = 'test';
      readLocationSpy.and.returnValue(asyncData(nloc));
    });

    it('display mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.isEditable).toBe(false);
      const nname = component.detailFormGroup.get('nameControl')?.value;
      expect(nname).toEqual('test');
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('2', {})] as UrlSegment[]);

      const nloc = new Location();
      nloc.ID = 2;
      nloc.Name = 'test';
      readLocationSpy.and.returnValue(asyncData(nloc));
      updateLocationSpy.and.returnValue(asyncData(nloc));
    });

    it('edit mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBe(true);
      const nname = component.detailFormGroup.get('nameControl')?.value;
      expect(nname).toEqual('test');
    });

    it('edit mode with valid data calls updateLocation', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(true);

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      // Submit
      component.onSave();

      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/library/location/display/2']);
      expect(updateLocationSpy).toHaveBeenCalled();
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
      readLocationSpy.and.returnValue(asyncError('Failed'));
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error modal when readLocation fails', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
    });
  });
});
