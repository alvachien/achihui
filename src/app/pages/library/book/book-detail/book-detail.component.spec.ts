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
import { UserAuthInfo, Book, BookCategory } from '../../../../model';
import { TranslocoService } from '@jsverse/transloco';
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
  let checkBookDuplicateSpy: SafeAny;
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
    fakeData.buildLibBookCategories();

    storageService = createSpyObj('LibraryStorageService', [
      'readBook',
      'fetchAllPersons',
      'fetchAllBookCategories',
      'checkBookDuplicate',
      'createBook',
      'updateBook',
    ]);
    readBookSpy = storageService.readBook.and.returnValue(of({}));
    createBookSpy = storageService.createBook.and.returnValue(of({}));
    updateBookSpy = storageService.updateBook.and.returnValue(of({}));
    // Duplicate pre-check: default to "no duplicate" so unrelated saves pass.
    checkBookDuplicateSpy = storageService.checkBookDuplicate.and.returnValue(of(false));
    _fetchAllPersonsSpy = storageService.fetchAllPersons.and.returnValue(of([]));
    // Categories are loaded up-front for the inline tree-select rows, and the
    // cached dictionary is read back whenever a row picks a category.
    storageService.fetchAllBookCategories.and.returnValue(of(fakeData.libBookCategories));
    storageService.BookCategories = fakeData.libBookCategories;
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

    it('create mode saves the bibliographic fields', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.get('isbnControl')?.setValue('978-0-00-000000-0');
      component.detailFormGroup.get('pyearControl')?.setValue(2001);
      component.detailFormGroup.get('pgcntControl')?.setValue(300);
      component.detailFormGroup.get('ccntControl')?.setValue(0);
      component.detailFormGroup.get('detailControl')?.setValue('a book detail');
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid, 'bibliographic fields stay optional').toBe(true);

      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(createBookSpy).toHaveBeenCalled();
      const saved: Book = createBookSpy.mock.calls[0][0];
      expect(saved.ISBN).toEqual('978-0-00-000000-0');
      expect(saved.PublishedYear).toBe(2001);
      expect(saved.PageCount).toBe(300);
      expect(saved.Detail).toEqual('a book detail');
      // Creating an already-retired record is legitimate (adding a book that was
      // given away but has reading history), so 0 must reach the wire here too.
      expect(saved.CopyCount).toBe(0);

      const json = saved.writeJSONObject();
      expect(json.ISBN).toEqual('978-0-00-000000-0');
      expect(json.PublishedYear).toBe(2001);
      expect(json.PageCount).toBe(300);
      expect(json.Detail).toEqual('a book detail');
      expect(json.CopyCount).toEqual(0);
    });

    // Defaulting to 1 (not 0) is what keeps "retired" a deliberate act: a blank
    // create form must never read as "the library has no copies of this".
    it('create mode defaults the copy count to one', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.detailFormGroup.get('ccntControl')?.value).toBe(1);

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();
      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      const saved: Book = createBookSpy.mock.calls[0][0];
      expect(saved.CopyCount).toBe(1);
      expect(saved.writeJSONObject().CopyCount).toEqual(1);
    });

    it('a blank bibliographic field is submittable and travels as null-ish', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      // Cleared copy count: blank is NOT the same as 0 - the count is simply
      // unrecorded, so it must travel as nothing at all.
      component.detailFormGroup.get('ccntControl')?.setValue(null);
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(true);

      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      const saved: Book = createBookSpy.mock.calls[0][0];
      expect(saved.ISBN).toBeFalsy();
      expect(saved.PublishedYear).toBeNull();
      expect(saved.PageCount).toBeNull();
      expect(saved.Detail).toBeFalsy();
      expect(saved.CopyCount).toBeNull();
      expect(saved.writeJSONObject().CopyCount).toBeUndefined();
    });

    it('form is invalid when Detail exceeds 200 characters', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.get('detailControl')?.setValue('x'.repeat(201));
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(false);
    });

    it('form is invalid when ISBN exceeds 50 characters', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.get('isbnControl')?.setValue('x'.repeat(51));
      component.detailFormGroup.markAsDirty();

      expect(component.detailFormGroup.valid).toBe(false);
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

    it('onAssignCategory appends a blank inline row (no dialog)', () => {
      component.onAssignCategory();

      expect(component.listCategories().length).toBe(1);
      expect(component.listCategories()[0].ID).toBe(0);
    });

    // A pick is resolved against the snapshot the tree itself was built from, not
    // against the service's cached dictionary - so the tree has to exist first.
    // ngOnInit builds it from fetchAllBookCategories() (the stub answers with `of`,
    // so one detectChanges is enough).
    const initCategoryTree = () => fixture.detectChanges();

    it('onCategoryPicked replaces the row with a copy of the dictionary entry', () => {
      initCategoryTree();
      component.onAssignCategory();
      const blank = component.listCategories()[0];
      component.onCategoryPicked({ key: '1', row: blank });

      const rows = component.listCategories();
      expect(rows.length).toBe(1);
      expect(rows[0]).not.toBe(blank);
      expect(rows[0].ID).toBe(1);
      expect(rows[0].Name).toEqual('Category 1');
    });

    // The service only writes its cache back when the requested home is still the
    // current one, so the dictionary can belong to another home by the time a row is
    // picked. Resolving against it dropped the pick while the tree-select kept
    // showing the picked node - the user saw a category the record did not carry.
    it('resolves a pick from the tree snapshot when the service cache has moved on', () => {
      initCategoryTree();
      const cached = storageService.BookCategories;
      storageService.BookCategories = [];
      try {
        component.onAssignCategory();
        const blank = component.listCategories()[0];
        component.onCategoryPicked({ key: '1', row: blank });

        const rows = component.listCategories();
        expect(rows.length).toBe(1);
        expect(rows[0].ID).toBe(1);
        expect(rows[0].Name).toEqual('Category 1');
      } finally {
        storageService.BookCategories = cached;
      }
    });

    // The other half of the same contract: when nothing can resolve the pick, the row
    // must not keep displaying it. Revert the row and say so, instead of letting
    // onSave drop the category the user believes is assigned.
    it('reverts the row and reports it when a pick cannot be resolved at all', async () => {
      initCategoryTree();
      const overlay = TestBed.inject(OverlayContainer);
      const overlayElement = overlay.getContainerElement();

      try {
        component.onAssignCategory();
        const blank = component.listCategories()[0];
        // An id the built tree never carried: the tree and this handler's snapshot
        // come from one array, so this is the "tree rebuilt under the row" case.
        component.onCategoryPicked({ key: '9999', row: blank });

        const rows = component.listCategories();
        expect(rows.length).toBe(1);
        expect(rows[0].ID).toBe(0);

        await new Promise<void>((r) => setTimeout(r, 0));
        fixture.detectChanges();
        expect(overlayElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      } finally {
        overlay.ngOnDestroy();
      }
    });

    it('clearing a row select (null key) resets the row to blank, no stale assignment', () => {
      initCategoryTree();
      component.onAssignCategory();
      component.onCategoryPicked({ key: '1', row: component.listCategories()[0] });
      // The tree-select's built-in clear button emits null: the row must go back
      // to a blank BookCategory, otherwise the old id would still be saved while
      // the select displays nothing.
      component.onCategoryPicked({ key: null, row: component.listCategories()[0] });

      const rows = component.listCategories();
      expect(rows.length).toBe(1);
      expect(rows[0].ID).toBe(0);
    });

    it('picking a category another row carries moves it - never two identical rows', () => {
      initCategoryTree();
      component.onAssignCategory();
      component.onAssignCategory();
      const [first, second] = component.listCategories();
      component.onCategoryPicked({ key: '2', row: first });
      component.onCategoryPicked({ key: '2', row: second });

      const rows = component.listCategories();
      expect(rows.length).toBe(1);
      expect(rows[0].ID).toBe(2);
    });

    it('onRemoveCategory removes by row identity, so blank rows are untouched', () => {
      component.onAssignCategory();
      component.onAssignCategory();
      const kept = component.listCategories()[0];
      component.onRemoveCategory(component.listCategories()[1]);

      expect(component.listCategories()).toEqual([kept]);
    });

    it('onSave drops unpicked blank rows before submitting', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();

      component.onAssignCategory();
      const pickedRow = component.listCategories()[0];
      component.onCategoryPicked({ key: '2', row: pickedRow });
      component.onAssignCategory(); // second row stays blank

      createBookSpy.mockClear();
      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(createBookSpy).toHaveBeenCalled();
      const saved: Book = createBookSpy.mock.calls[0][0];
      expect(saved.Categories.length).toBe(1);
      expect(saved.Categories[0].ID).toBe(2);
    });

    // Node titles come from the imperative translate(), which carries no implicit
    // active-language dependency - so the tree is DERIVED from the loaded categories
    // plus a language tick, and a runtime switch rebuilds it. Storing the built nodes
    // once (the old signal.set) left the tree, and the dropdown it feeds, showing the
    // previous language until the page was reloaded.
    it('rebuilds the category tree when the language changes at runtime', () => {
      const transloco = TestBed.inject(TranslocoService);
      // A real i18n key, so the two languages' titles genuinely differ ('Books' /
      // '书籍'), on a FRESH array - the shared fake dictionary must not be mutated.
      const ctgies = fakeData.libBookCategories.map((c) => {
        const copy = new BookCategory();
        copy.ID = c.ID;
        copy.Name = 'Library.Books';
        return copy;
      });
      storageService.fetchAllBookCategories.and.returnValue(of(ctgies));

      try {
        fixture.detectChanges();
        expect(component.categoryTree()[0].title).toEqual('Books(1)');

        transloco.setActiveLang('zh');
        expect(component.categoryTree()[0].title).toEqual('书籍(1)');
      } finally {
        transloco.setActiveLang('en'); // leave the global service as others expect it
        storageService.fetchAllBookCategories.and.returnValue(of(fakeData.libBookCategories));
      }
    });

    it('ngOnInit loads the category tree for the inline tree-selects', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(storageService.fetchAllBookCategories).toHaveBeenCalled();
      // fakeData categories have no ParentID -> both are roots.
      expect(component.categoryTree().map((n) => n.key)).toEqual(['1', '2']);
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

      // Full loaded record, including the two fields the edit form still does
      // not expose (OriginLangID/BookLangID); those must survive an update save
      // because the backend PUT applies every column of the body.
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
        CopyCount: 2,
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

    it('edit init seeds the bibliographic fields into the form', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.detailFormGroup.get('isbnControl')?.value).toEqual('978-0-00-000000-0');
      expect(component.detailFormGroup.get('pyearControl')?.value).toBe(2001);
      expect(component.detailFormGroup.get('pgcntControl')?.value).toBe(300);
      expect(component.detailFormGroup.get('ccntControl')?.value).toBe(2);
      expect(component.detailFormGroup.get('detailControl')?.value).toEqual('a book detail');
    });

    it('edit save sends the edited bibliographic values, keeping the untouched ones', async () => {
      updateBookSpy.mockClear();
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('isbnControl')?.setValue('978-1-11-111111-1');
      component.detailFormGroup.get('pgcntControl')?.setValue(420);
      component.detailFormGroup.markAsDirty();

      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(updateBookSpy).toHaveBeenCalled();
      const saved: Book = updateBookSpy.mock.calls[0][0];
      expect(saved.ISBN).toEqual('978-1-11-111111-1');
      expect(saved.PageCount).toBe(420);
      // Untouched in the form, so it keeps the loaded value.
      expect(saved.PublishedYear).toBe(2001);
      expect(saved.Detail).toEqual('a book detail');
      expect(saved.CopyCount).toBe(2);
    });

    // The retire path: dropping the count to 0 is how a book that is gone is kept
    // in the catalogue for its reading history. 0 is the one value the model must
    // not swallow, so the assertion runs on the serialized body - a `> 0` guard
    // would omit the field and the server would keep the old count.
    it('edit save retires a book by sending a zero copy count', async () => {
      updateBookSpy.mockClear();
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('ccntControl')?.setValue(0);
      component.detailFormGroup.markAsDirty();

      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      const saved: Book = updateBookSpy.mock.calls[0][0];
      expect(saved.CopyCount).toBe(0);
      expect(saved.writeJSONObject().CopyCount).toEqual(0);
    });

    it('edit save preserves the fields the form still does not expose (no wipe on PUT)', async () => {
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
      // The two language FKs are the only fields left with no input on the form.
      expect(saved.OriginLangID).toBe(5);
      expect(saved.BookLangID).toBe(6);

      // The serialized PUT body must carry those columns, too.
      const json = saved.writeJSONObject();
      expect(json.OriginLangID).toBe(5);
      expect(json.BookLangID).toBe(6);
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

  describe('duplicate pre-check', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
      // Spies are built in the shared beforeAll and keep their call records across
      // describes - clear so the assertions below only see this test's calls.
      createBookSpy.mockClear();
      updateBookSpy.mockClear();
      checkBookDuplicateSpy.mockClear();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('blocks create when the service reports a duplicate', async () => {
      checkBookDuplicateSpy.and.returnValue(of(true));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();
      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(createBookSpy).not.toHaveBeenCalled();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
    });

    it('submits create when no duplicate is reported', async () => {
      checkBookDuplicateSpy.and.returnValue(of(false));
      createBookSpy.and.returnValue(asyncData({ ID: 9 }));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();
      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));

      expect(createBookSpy).toHaveBeenCalled();
    });

    it('still submits when the pre-check fetch fails (API guard is authoritative)', async () => {
      checkBookDuplicateSpy.and.returnValue(asyncError('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Test 1');
      component.detailFormGroup.markAsDirty();
      component.onSave();

      // asyncError rejects on a macrotask; the error handler must fall through to submit.
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(createBookSpy).toHaveBeenCalled();
    });

    it('edit mode passes the edited record id as the exclusion', async () => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('2', {})] as UrlSegment[]);
      const nbook = new Book();
      nbook.ID = 2;
      nbook.NativeName = 'Test 1';
      readBookSpy.and.returnValue(asyncData(nbook));
      updateBookSpy.and.returnValue(asyncData(nbook));
      checkBookDuplicateSpy.and.returnValue(of(false));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.markAsDirty();
      component.onSave();
      await new Promise<void>((r) => setTimeout(r, 0));

      expect(updateBookSpy).toHaveBeenCalled();
      expect(checkBookDuplicateSpy).toHaveBeenCalled();
      expect(checkBookDuplicateSpy.mock.calls[0][2]).toBe(2);
    });
  });
});
