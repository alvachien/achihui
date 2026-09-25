import { Injectable, inject } from '@angular/core';

import { UserPreferencesService } from './user-preferences.service';

enum ThemeType {
  dark = 'dark',
  default = 'default',
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly prefs = inject(UserPreferencesService);
  // Seeded from the persisted preference; APP_INITIALIZER's loadTheme(true)
  // applies whatever the user last chose (fallback: 'default').
  currentTheme: ThemeType = this.prefs.theme() === 'dark' ? ThemeType.dark : ThemeType.default;

  private reverseTheme(theme: string): ThemeType {
    return theme === ThemeType.dark ? ThemeType.default : ThemeType.dark;
  }

  private removeUnusedTheme(theme: ThemeType): void {
    document.documentElement.classList.remove(theme);
    const removedThemeStyle = document.getElementById(theme);
    if (removedThemeStyle) {
      document.head.removeChild(removedThemeStyle);
    }
  }

  private loadCss(href: string, id: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = href;
      style.id = id;
      style.onload = resolve;
      style.onerror = reject;
      document.head.append(style);
    });
  }

  public loadTheme(firstLoad = true): Promise<Event> {
    console.debug(`Entering loadTheme with ${firstLoad}`);
    const theme = this.currentTheme;
    if (firstLoad) {
      document.documentElement.classList.add(theme);
    }

    return new Promise<Event>((resolve, reject) => {
      this.loadCss(`${theme}.css`, theme).then(
        (e) => {
          console.debug(`Got CSS file for ${theme}`);

          if (!firstLoad) {
            document.documentElement.classList.add(theme);
            document.documentElement.classList.remove(this.reverseTheme(theme));
          }
          this.removeUnusedTheme(this.reverseTheme(theme));
          resolve(e);
        },
        (e) => reject(e),
      );
    });
  }

  public toggleTheme(): Promise<Event> {
    this.currentTheme = this.reverseTheme(this.currentTheme);
    this.prefs.setTheme(this.currentTheme === ThemeType.dark ? 'dark' : 'default');
    return this.loadTheme(false);
  }
}
