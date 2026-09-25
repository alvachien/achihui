import { Injectable, signal } from '@angular/core';

import { environment } from '@environments/environment';

// Browser-persistent user preferences. localStorage (not sessionStorage, which
// is per-tab and dies on close - that store is used for the OIDC redirect URL):
// theme/language choices survive closing the tab, the browser, a reboot.
//
// Every access is try/catch-wrapped: some private-browsing modes throw on mere
// *access* of the storage object, not just on writes. And readers validate the
// stored value before trusting it - a corrupt or hand-edited entry must never
// wedge startup, it just falls back to the built-in default.

export type ThemePref = 'default' | 'dark';
export type LangPref = 'en' | 'zh';

const THEME_KEY = 'hih.pref.theme';
const LANG_KEY = 'hih.pref.lang';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode / quota): the preference still applies
    // for this visit, it just will not survive the next reload.
  }
}

/** First-run language fallback: environment.DefaultLanguage ('en' | 'zh'). */
export function envDefaultLang(): LangPref {
  return environment.DefaultLanguage === 'zh' ? 'zh' : 'en';
}

/**
 * DI-free readers, usable at module-eval time. app.config.ts derives the static
 * LOCALE_ID / provideNzI18n / transloco config from the same resolved value the
 * service signals will later expose, so the whole app agrees before first render.
 */
export function storedTheme(fallback: ThemePref = 'default'): ThemePref {
  const value = safeGet(THEME_KEY);
  return value === 'dark' || value === 'default' ? value : fallback;
}
export function storedLang(fallback: LangPref = envDefaultLang()): LangPref {
  const value = safeGet(LANG_KEY);
  return value === 'en' || value === 'zh' ? value : fallback;
}

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  // Read reactively through these signals; write only via the setters below so
  // the in-memory state and localStorage can never drift apart.
  readonly theme = signal<ThemePref>(storedTheme());
  readonly lang = signal<LangPref>(storedLang());

  setTheme(theme: ThemePref): void {
    this.theme.set(theme);
    safeSet(THEME_KEY, theme);
  }
  setLang(lang: LangPref): void {
    this.lang.set(lang);
    safeSet(LANG_KEY, lang);
  }
}
