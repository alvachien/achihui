import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ThemeService } from './theme.service';
import { UserPreferencesService } from './user-preferences.service';

describe('ThemeService preference wiring', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('seeds currentTheme from the stored preference', () => {
    localStorage.setItem('hih.pref.theme', 'dark');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(ThemeService).currentTheme).toBe('dark');
  });

  it('defaults when nothing is stored', () => {
    expect(TestBed.inject(ThemeService).currentTheme).toBe('default');
  });

  // toggleTheme() returns loadTheme()'s promise, which in jsdom never settles
  // (the theme .css <link> loads are not fetched) - so assert the preference
  // write, which happens synchronously before the stylesheet swap.
  it('persists the toggled theme to preferences', () => {
    const svc = TestBed.inject(UserPreferencesService);
    const theme = TestBed.inject(ThemeService);
    theme.toggleTheme().catch(() => undefined);

    expect(svc.theme()).toBe('dark');
    expect(localStorage.getItem('hih.pref.theme')).toBe('dark');
  });
});
