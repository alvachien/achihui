import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import {
  createSpyObj,
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ActivatedRouteUrlStub,
} from '../../../../../testing';
import { AuthService, UIStatusService, LibraryStorageService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, Book } from '../../../../model';
import { BookDetailComponent } from './book-detail.component';
import { PersonSelectionDlgComponent } from '../../person-selection-dlg';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('BookDetailComponent', () => {
  let component: BookDetailComponent;
  let fixture: ComponentFixture<BookDetailComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let readBookSpy: SafeAny;
  let createBookSpy: SafeAny;
  let updateBookSpy: SafeAny;
  let _fetchAllPersonsSpy: SafeAny;
  let activatedRouteStub: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = createSpyObj('LibraryStorageService', ['readBook', 'fetchAllPersons', 'createBook', 'updateBook']);
    readBookSpy = storageService.readBook.and.returnValue(of({}));
    createBookSpy = storageService.createBook.and.returnValue(of({}));
    updateBookSpy = storageService.updateBook.and.returnValue(of({}));
    _fetchAllPersonsSpy = storageService.fetchAllPersons.and.returnValue(of([]));
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
        getTranslocoModule(),
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
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
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
      createBookSpy.mockClear();
      createBookSpy.and.returnValue(asyncData(nrole));
    });

    it('create mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeTruthy();
    });

    it('create mode with valid data: name and comment', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(true);

      // Submit
      component.onSave();

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(createBookSpy).toHaveBeenCalled();
    });

    it('form is invalid when required NativeName is empty', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(false);
    });

    it('onSave does not call createBook when form is invalid', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('');
      component.detailFormGroup.markAsDirty();

      component.onSave();

      expect(createBookSpy).not.toHaveBeenCalled();
    });

    it('form is invalid when NativeName exceeds 100 characters', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('x'.repeat(101));
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(false);
    });

    it('assign author', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();

      component.onAssignAuthor();
    });
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

    it('display mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBe(false);
      const nname = component.detailFormGroup.get('nnameControl')?.value;
      expect(nname).toEqual(nbook.NativeName);
    });
  });

  describe('edit mode', () => {
    let nbook: Book;
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('2', {})] as UrlSegment[]);

      // Loaded record carries fields the edit form does not expose; they must
      // survive an update save (backend PUT applies every column of the body).
      nbook = new Book();
      nbook.onSetData({
        Id: 2,
        NativeName: 'test',
        ISBN: '978-0-00-000000-0',
        PublishedYear: 2001,
        Detail: 'a book detail',
        OriginLangID: 5,
        BookLangID: 6,
        PageCount: 300,
      });

      readBookSpy.and.returnValue(asyncData(nbook));
      updateBookSpy.and.returnValue(asyncData(nbook));
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
      expect(nname).toEqual(nbook.NativeName);
    });

    it('edit mode with valid data calls updateBook', async () => {
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
      expect(routerstub.navigate).toHaveBeenCalledWith(['/library/book/display/2']);
      expect(updateBookSpy).toHaveBeenCalled();
    });

    it('edit save preserves fields the form does not expose (no wipe on PUT)', async () => {
      updateBookSpy.mockClear();
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Change only the name, as the form allows.
      component.detailFormGroup.get('nnameControl')?.setValue('Renamed');
      component.detailFormGroup.markAsDirty();

      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(updateBookSpy).toHaveBeenCalled();
      const saved: Book = updateBookSpy.mock.calls[0][0];
      expect(saved.NativeName).toEqual('Renamed');
      expect(saved.ID).toBe(2);
      expect(saved.ISBN).toEqual('978-0-00-000000-0');
      expect(saved.PublishedYear).toBe(2001);
      expect(saved.Detail).toEqual('a book detail');
      expect(saved.OriginLangID).toBe(5);
      expect(saved.BookLangID).toBe(6);
      expect(saved.PageCount).toBe(300);

      // The serialized PUT body must carry those columns, too.
      const json = saved.writeJSONObject();
      expect(json.ISBN).toEqual('978-0-00-000000-0');
      expect(json.PublishedYear).toBe(2001);
      expect(json.Detail).toEqual('a book detail');
      expect(json.OriginLangID).toBe(5);
      expect(json.BookLangID).toBe(6);
      expect(json.PageCount).toBe(300);
    });
  });

  describe('error cases', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();

      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);
      readBookSpy.and.returnValue(asyncError('Failed'));
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall display error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
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
    });
  });
});
