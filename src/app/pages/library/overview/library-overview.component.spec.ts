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
    expect(fresh.topCategories()).toEqual([]);
  });

  it('scales ranking bars to the leading entry', () => {
    const lead: LibraryRankingItem = { key: 'x', name: 'x', count: 2 };
    expect(component.rankingPercent({ key: 'a', name: 'a', count: 2 }, [lead])).toEqual(100);
    expect(component.rankingPercent({ key: 'a', name: 'a', count: 1 }, [lead])).toEqual(50);
    expect(component.rankingPercent({ key: 'a', name: 'a', count: 0 }, [])).toEqual(0);
  });
});
