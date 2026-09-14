import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';

import { getTranslocoModule, FakeDataHelper } from '../../../testing';
import { AuthService, HomeDefOdataService } from '../../services';
import { UserAuthInfo } from '../../model';
import { icons } from '../../icons-provider';
import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
  });

  beforeEach(async () => {
    const authServiceStub: Partial<AuthService> = { authSubject: signal(new UserAuthInfo()) };
    const homeServiceStub: Partial<HomeDefOdataService> = { ChosedHome: fakeData.chosedHome };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, getTranslocoModule()],
      providers: [
        // The tiles render real nz-icon glyphs; without the app's static icon set
        // registered, @ant-design/icons-angular throws IconNotFoundError per icon.
        provideNzIcons(icons),
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
  });

  it('should create with hero band and icon tiles', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.today instanceof Date).toBe(true);

    const el: HTMLElement = fixture.nativeElement;
    // Greeting resolves to one of the three time-of-day strings (never a raw key).
    const greeting = el.querySelector('.hero-greeting')?.textContent?.trim() ?? '';
    expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(greeting);

    // Home chip shows the chosen home; the date chip is always present.
    expect(el.querySelector('.hero-chip')?.textContent).toContain('Home for UT');
    expect(el.querySelectorAll('.hero-chip').length).toBe(2);

    // 13 visible tiles (1 home + 7 finance + 5 library); the hidden Borrow Records and
    // library Search cards live in comments, so they never render.
    expect(el.querySelectorAll('.tile').length).toBe(13);
    // Every tile has its icon badge; the big-image blocks are gone for good.
    expect(el.querySelectorAll('.tile-badge').length).toBe(13);
    expect(el.querySelectorAll('.components-overview-img').length).toBe(0);
  });

  it('greetingKey follows the local hour bucket', () => {
    // Vitest fake timers patch the global Date, so `new Date()` inside the
    // getter observes the pinned time.
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(2026, 8, 14, 9, 0));
      expect(component.greetingKey).toBe('Welcome.GoodMorning');
      vi.setSystemTime(new Date(2026, 8, 14, 15, 0));
      expect(component.greetingKey).toBe('Welcome.GoodAfternoon');
      vi.setSystemTime(new Date(2026, 8, 14, 21, 0));
      expect(component.greetingKey).toBe('Welcome.GoodEvening');
    } finally {
      vi.useRealTimers();
    }
  });

  it('currentHomeName is empty when no home is chosen', () => {
    const homeService = TestBed.inject(HomeDefOdataService) as Partial<HomeDefOdataService>;
    homeService.ChosedHome = undefined as unknown as HomeDefOdataService['ChosedHome'];
    expect(component.currentHomeName).toBe('');
    fixture.detectChanges();
    // Hero degrades to just the greeting + date chip - no dangling accent chip.
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.hero-chip').length).toBe(1);
    homeService.ChosedHome = fakeData.chosedHome;
  });

  it('navigation to overview', () => {
    const routerstub = TestBed.inject(Router);
    vi.spyOn(routerstub, 'navigate');

    component.onNavigateToOverview();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'overview']);
  });

  it('navigation to account', () => {
    const routerstub = TestBed.inject(Router);
    vi.spyOn(routerstub, 'navigate');

    component.onNavigateToAccount();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'account']);
  });

  it('navigation to document', () => {
    const routerstub = TestBed.inject(Router);
    vi.spyOn(routerstub, 'navigate');

    component.onNavigateToDocument();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'document']);
  });

  it('navigation to report', () => {
    const routerstub = TestBed.inject(Router);
    vi.spyOn(routerstub, 'navigate');

    component.onNavigateToReport();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'report']);
  });

  it('navigation to plan', () => {
    const routerstub = TestBed.inject(Router);
    vi.spyOn(routerstub, 'navigate');

    component.onNavigateToPlan();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'plan']);
  });
});
