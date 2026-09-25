import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '@environments/environment';
import { storedLang, storedTheme, UserPreferencesService } from './user-preferences.service';

const expectedEnvLang = environment.DefaultLanguage === 'zh' ? 'zh' : 'en';

describe('UserPreferencesService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('falls back to built-in defaults when nothing is stored', () => {
    const svc = TestBed.inject(UserPreferencesService);
    expect(svc.theme()).toBe('default');
    expect(svc.lang()).toBe(expectedEnvLang);
    expect(storedTheme()).toBe('default');
    expect(storedLang()).toBe(expectedEnvLang);
  });

  it('round-trips through localStorage across instances (simulates a reload)', () => {
    const svc = TestBed.inject(UserPreferencesService);
    svc.setTheme('dark');
    svc.setLang('zh');

    expect(localStorage.getItem('hih.pref.theme')).toBe('dark');
    expect(localStorage.getItem('hih.pref.lang')).toBe('zh');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(UserPreferencesService);
    expect(reloaded.theme()).toBe('dark');
    expect(reloaded.lang()).toBe('zh');
  });

  it('ignores corrupt stored values and uses the fallback', () => {
    localStorage.setItem('hih.pref.theme', 'chartreuse');
    localStorage.setItem('hih.pref.lang', 'klingon');

    expect(storedTheme()).toBe('default');
    expect(storedLang()).toBe(expectedEnvLang);
    const svc = TestBed.inject(UserPreferencesService);
    expect(svc.theme()).toBe('default');
    expect(svc.lang()).toBe(expectedEnvLang);
  });

  it('survives localStorage access throwing (private-browsing simulation)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage denied');
    });

    const svc = TestBed.inject(UserPreferencesService);
    expect(svc.theme()).toBe('default');
    expect(svc.lang()).toBe(expectedEnvLang);
  });

  it('still applies preferences in memory when writes are denied', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    const svc = TestBed.inject(UserPreferencesService);
    expect(() => svc.setTheme('dark')).not.toThrow();
    expect(() => svc.setLang('zh')).not.toThrow();
    expect(svc.theme()).toBe('dark');
    expect(svc.lang()).toBe('zh');
  });
});
