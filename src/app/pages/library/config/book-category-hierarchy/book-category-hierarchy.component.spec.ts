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
import { UserAuthInfo, BookCategory } from '../../../../model';
import { BookCategoryHierarchyComponent } from './book-category-hierarchy.component';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('BookCategoryHierarchyComponent', () => {
  let component: BookCategoryHierarchyComponent;
  let fixture: ComponentFixture<BookCategoryHierarchyComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllBookCategoriesSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = createSpyObj('LibraryStorageService', ['fetchAllBookCategories']);
    fetchAllBookCategoriesSpy = storageService.fetchAllBookCategories.and.returnValue(of([]));
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
    fixture = TestBed.createComponent(BookCategoryHierarchyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not show tree nodes before OnInit', () => {
    expect(component.bcTreeNodes().length).toEqual(0);
  });

  it('builds a tree from fetched book categories', async () => {
    const root = new BookCategory();
    root.ID = 1;
    root.Name = 'Fiction';
    root.ParentID = null;
    const child = new BookCategory();
    child.ID = 2;
    child.Name = 'Sci-Fi';
    child.ParentID = 1;
    fetchAllBookCategoriesSpy.and.returnValue(asyncData([root, child]));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0)); // resolve the observable
    fixture.detectChanges();

    const nodes = component.bcTreeNodes();
    expect(nodes.length).toBe(1);
    expect(nodes[0].key).toEqual('1');
    expect(nodes[0].children?.length).toBe(1);
    expect(nodes[0].children?.[0].key).toEqual('2');
  });

  it('surfaces orphans (missing parent / cycle) under an unassigned bucket instead of hiding them', async () => {
    const root = new BookCategory();
    root.ID = 1;
    root.Name = 'Fiction';
    root.ParentID = null;
    // ParentID 3 no longer exists (deleted category).
    const orphan = new BookCategory();
    orphan.ID = 7;
    orphan.Name = 'Lost';
    orphan.ParentID = 3;
    // A <-> B parent cycle: neither has a null root ancestor.
    const cycA = new BookCategory();
    cycA.ID = 8;
    cycA.Name = 'CycleA';
    cycA.ParentID = 9;
    const cycB = new BookCategory();
    cycB.ID = 9;
    cycB.Name = 'CycleB';
    cycB.ParentID = 8;
    fetchAllBookCategoriesSpy.and.returnValue(asyncData([root, orphan, cycA, cycB]));

    fixture.detectChanges(); // ngOnInit
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    const nodes = component.bcTreeNodes();
    // Root stays a root; the three unreachable nodes are NOT silently dropped.
    expect(nodes.length).toBe(2);
    expect(nodes[0].key).toEqual('1');
    const bucket = nodes[1];
    expect(bucket.key).toEqual('unassigned');
    const bucketKeys = (bucket.children ?? []).map((c) => c.key);
    expect(bucketKeys.sort()).toEqual(['7', '8', '9']);
  });

  it('does not add an unassigned bucket when every node is reachable', async () => {
    const root = new BookCategory();
    root.ID = 1;
    root.Name = 'Fiction';
    root.ParentID = null;
    const child = new BookCategory();
    child.ID = 2;
    child.Name = 'Sci-Fi';
    child.ParentID = 1;
    fetchAllBookCategoriesSpy.and.returnValue(asyncData([root, child]));

    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();

    expect(component.bcTreeNodes().length).toBe(1);
    expect(component.bcTreeNodes()[0].key).toEqual('1');
  });

  describe('fetch error', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
      fetchAllBookCategoriesSpy.and.returnValue(asyncError('Failed'));
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
