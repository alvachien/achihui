import { ComponentFixture, TestBed, fakeAsync, tick, inject, flush, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { LibraryUIModule } from '../../library-ui.module';
import {
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ActivatedRouteUrlStub,
} from '../../../../../testing';
import { AuthService, UIStatusService, LibraryStorageService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, Book } from '../../../../model';
import { BookDetailComponent } from './book-detail.component';
import { PersonSelectionDlgComponent } from '../../person/person-selection-dlg';
import { OrganizationSelectionDlgComponent } from '../../organization/organization-selection-dlg';
import { BookCategorySelectionDlgComponent } from '../../config/book-category-selection-dlg';
import { LocationSelectionDlgComponent } from '../../location/location-selection-dlg';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('BookDetailComponent', () => {
  let component: BookDetailComponent;
  let fixture: ComponentFixture<BookDetailComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let readBookSpy: any;
  let createBookSpy: any;
  let fetchAllPersonsSpy: any;
  let activatedRouteStub: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = jasmine.createSpyObj('LibraryStorageService', ['readBook', 'fetchAllPersons', 'createBook']);
    readBookSpy = storageService.readBook.and.returnValue(of({}));
    createBookSpy = storageService.createBook.and.returnValue(of({}));
    fetchAllPersonsSpy = storageService.fetchAllPersons.and.returnValue(of([]));
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
      declarations: [
        BookDetailComponent,
        PersonSelectionDlgComponent,
        OrganizationSelectionDlgComponent,
        BookCategorySelectionDlgComponent,
        LocationSelectionDlgComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: LibraryStorageService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        {
          provide: NzModalRef,
          useFactory: (modalSvc: NzModalService) =>
            modalSvc.create({
              nzClosable: true,
              nzContent: PersonSelectionDlgComponent,
            }),
          deps: [NzModalService],
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('create mode', () => {
    beforeEach(() => {
      const nrole = new Book();
      nrole.ID = 2;
      createBookSpy.and.returnValue(asyncData(nrole));
    });

    it('create mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeTruthy();

      discardPeriodicTasks();
    }));

    it('create mode with valid data: name and comment', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBeTrue();

      // Submit
      component.onSave();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      tick();
      fixture.detectChanges();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(createBookSpy).toHaveBeenCalled();

      discardPeriodicTasks();
    }));

    it('assign author', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();

      component.onAssignAuthor();

      discardPeriodicTasks();
    }));
  });

  describe('display mode', () => {
    let nbook: Book;
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);

      nbook = new Book();
      nbook.ID = 2;
      nbook.NativeName = 'test';

      readBookSpy.and.returnValue(asyncData(nbook));
    });

    it('display mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeFalse();
      const nname = component.detailFormGroup.get('nnameControl')?.value;
      expect(nname).toEqual(nbook.NativeName);

      discardPeriodicTasks();
    }));
  });

  describe('error cases', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();

      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);
      readBookSpy.and.returnValue(asyncError('Failed'));
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall display error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      discardPeriodicTasks();
    }));
  });
});
