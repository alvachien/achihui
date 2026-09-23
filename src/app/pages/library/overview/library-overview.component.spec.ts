import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';

import { createSpyObj, getTranslocoModule, FakeDataHelper } from '../../../../testing';
import { AuthService, HomeDefOdataService, LibraryStorageService } from '../../../services';
import { LibraryOverviewStats, LibraryRankingItem } from '../../../services/library-storage.service';
import { UserAuthInfo } from '../../../model';
import { LibraryOverviewComponent } from './library-overview.component';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

// The component is now a thin mirror of ONE server aggregate
// (LibraryBooks/GetLibraryOverviewKeyFigure): the month-window math, the
// distinct-book completion counts and the ranking dedupe/ordering moved to the
// API and are covered by TestCase_GetLibraryOverviewKeyFigure there. What is
// left to pin here is the fetch lifecycle and the faithful pass-through.
const STATS: LibraryOverviewStats = {
  totalBooks: 4,
  // Deliberately different from totalBooks: the two share a data source but are
  // separate figures, and an accidental repeat of one in the other's card is the
  // mistake worth catching (asserted against the DOM below).
  totalCopies: 6,
  addedThisMonth: 2,
  addedLastMonth: 1,
  completedThisMonth: 1,
  completedLastMonth: 1,
  topCategories: [
    { key: '1', name: 'C1', count: 2 },
    { key: '2', name: 'C2', count: 2 },
  ],
  topAuthors: [{ key: '1', name: 'A1', count: 2 }],
  topPresses: [{ key: '1', name: 'P1', count: 2 }],
};

describe('LibraryOverviewComponent', () => {
  let fixture: ComponentFixture<LibraryOverviewComponent>;
  let component: LibraryOverviewComponent;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchKeyfigureSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
  });

  beforeEach(async () => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = signal(new UserAuthInfo());

    storageService = createSpyObj('LibraryStorageService', ['fetchLibraryOverviewKeyFigure']);
    fetchKeyfigureSpy = storageService.fetchLibraryOverviewKeyFigure.and.returnValue(of(STATS));

    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, getTranslocoModule()],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: LibraryStorageService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the key figures on init', () => {
    expect(fetchKeyfigureSpy).toHaveBeenCalledTimes(1);
    expect(component.isLoadingResults(), 'spinner cleared after finalize').toBe(false);
  });

  it('ignores Refresh while a fetch is already in flight', () => {
    // Hold the request open: the second fetchData() must not fire another
    // overlapping fetch (last-writer-wins race, spinner would clear early).
    fetchKeyfigureSpy.and.returnValue(new Subject<LibraryOverviewStats>());

    component.fetchData();
    expect(component.isLoadingResults()).toBe(true);
    component.fetchData();

    expect(fetchKeyfigureSpy).toHaveBeenCalledTimes(2); // one from init + one here
    expect(component.isLoadingResults(), 'spinner stays until the open fetch settles').toBe(true);
  });

  it('mirrors the server aggregate into the display computeds', () => {
    expect(component.totalBooks()).toEqual(4);
    expect(component.totalCopies()).toEqual(6);
    expect(component.addedThisMonth()).toEqual(2);
    expect(component.addedLastMonth()).toEqual(1);
    expect(component.completedThisMonth()).toEqual(1);
    expect(component.completedLastMonth()).toEqual(1);
    expect(component.topCategories()).toEqual(STATS.topCategories);
    expect(component.topAuthors()).toEqual(STATS.topAuthors);
    expect(component.topPresses()).toEqual(STATS.topPresses);
  });

  it('starts from zeroed computeds before any payload arrives', () => {
    fetchKeyfigureSpy.and.returnValue(new Subject<LibraryOverviewStats>());
    // No detectChanges -> ngOnInit never runs, so this instance has no payload.
    const fresh = TestBed.createComponent(LibraryOverviewComponent).componentInstance;
    expect(fresh.totalBooks()).toEqual(0);
    expect(fresh.totalCopies()).toEqual(0);
    expect(fresh.topCategories()).toEqual([]);
  });

  it('shows the shelf figure in its own card rather than repeating the catalogue figure', () => {
    // 4 titles holding 6 copies: the cards are located by their badge class (the
    // teal copy badge exists only on the shelf card) and read by text, so a card
    // wired to the wrong computed - the copy-paste this addition invites - fails
    // here even though every computed test above would still pass.
    const copyCard = (fixture.nativeElement.querySelector('.stat-badge-copy') as HTMLElement)?.closest(
      '.stat-card',
    ) as HTMLElement;
    expect(copyCard).toBeTruthy();
    expect(copyCard.textContent).toContain('6');
    expect(copyCard.textContent).not.toContain('4');

    const bookCard = (fixture.nativeElement.querySelector('.stat-badge-book') as HTMLElement)?.closest(
      '.stat-card',
    ) as HTMLElement;
    expect(bookCard.textContent).toContain('4');
    expect(bookCard.textContent).not.toContain('6');
  });

  it('translates the category rank and never leaks the raw Sys.BkCtgy.* key', () => {
    // A system category stores a transloco KEY as its Name (the seeder's
    // Sys.BkCtgy.* rows), so the ranking has to run it through the pipe - the
    // same thing the category list's Name cell does. Author/press ranks hold
    // real names and stay untouched.
    fetchKeyfigureSpy.and.returnValue(
      of({
        ...STATS,
        topCategories: [{ key: '21', name: 'Sys.BkCtgy.Computer', count: 3 }],
      }),
    );

    component.fetchData();
    fixture.detectChanges();

    // The categories card is the first of the three rank cards.
    const card = fixture.nativeElement.querySelector('.rank-card') as HTMLElement;
    const name = card.querySelector('.rank-name') as HTMLElement;
    expect(name.textContent).toContain('Computers & Technology');
    expect(name.getAttribute('title')).toEqual('Computers & Technology');
    expect(card.textContent).not.toContain('Sys.BkCtgy');
  });

  it('leaves a home-created category name alone (not a transloco key)', () => {
    fetchKeyfigureSpy.and.returnValue(
      of({
        ...STATS,
        topCategories: [{ key: '1001', name: 'My Own Shelf', count: 1 }],
      }),
    );

    component.fetchData();
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.rank-card') as HTMLElement;
    expect(card.querySelector('.rank-name')?.textContent).toContain('My Own Shelf');
  });

  it('scales ranking bars to the leading entry', () => {
    const lead: LibraryRankingItem = { key: 'x', name: 'x', count: 2 };
    expect(component.rankingPercent({ key: 'a', name: 'a', count: 2 }, [lead])).toEqual(100);
    expect(component.rankingPercent({ key: 'a', name: 'a', count: 1 }, [lead])).toEqual(50);
    expect(component.rankingPercent({ key: 'a', name: 'a', count: 0 }, [])).toEqual(0);
  });
});
