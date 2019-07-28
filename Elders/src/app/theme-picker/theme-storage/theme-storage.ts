import { Injectable, EventEmitter } from '@angular/core';

export interface AppUITheme {
  name: string;
  accent: string;
  primary: string;
  isDark?: boolean;
  isDefault?: boolean;
}

@Injectable()
export class ThemeStorage {
  static storageKey: any = 'achih-theme-storage-current';

  public onThemeUpdate: EventEmitter<AppUITheme> = new EventEmitter<AppUITheme>();

  public storeTheme(theme: AppUITheme): void {
    try {
      window.localStorage[ThemeStorage.storageKey] = JSON.stringify(theme);
    } catch {
      // Emtpy
    }

    this.onThemeUpdate.emit(theme);
  }

  public getStoredTheme(): AppUITheme | null {
    try {
      return JSON.parse(window.localStorage[ThemeStorage.storageKey] || null);
    } catch {
      return null;
    }
  }

  public getStoredThemeName(): string | null {
    let them: any = this.getStoredTheme();
    if (them !== null) {
      return them.name;
    }

    return null;
  }

  public clearStorage(): void {
    try {
      window.localStorage.removeItem(ThemeStorage.storageKey);
    } catch {
      // Empty
    }
  }
}
