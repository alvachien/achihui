import { Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  NgModule,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  MatButtonModule,
  MatGridListModule,
  MatIconModule,
  MatMenuModule,
  MatTooltipModule,
} from '@angular/material';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { StyleManager } from '../style-manager/style-manager';
import { ThemeStorage, AppUITheme } from './theme-storage/theme-storage';
import { Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Component({
  selector: 'theme-picker',
  templateUrl: 'theme-picker.html',
  styleUrls: ['theme-picker.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { 'aria-hidden': 'true' },
})
export class ThemePicker implements OnInit, OnDestroy {
  private _queryParamSubscription: Subscription = Subscription.EMPTY;
  currentTheme: AppUITheme;

  themes: AppUITheme[] = [
    {
      primary: '#673AB7',
      accent: '#FFC107',
      name: 'deeppurple-amber',
      isDark: false,
    },
    {
      primary: '#3F51B5',
      accent: '#E91E63',
      name: 'indigo-pink',
      isDark: false,
      isDefault: true,
    },
    {
      primary: '#E91E63',
      accent: '#607D8B',
      name: 'pink-bluegrey',
      isDark: true,
    },
    {
      primary: '#9C27B0',
      accent: '#4CAF50',
      name: 'purple-green',
      isDark: true,
    },
    {
      primary: '#4CAF50', // Green
      accent: '#F5F5F5',
      name: 'ac1',
      isDark: false,
    },
    {
      primary: '#BCAAA4', // Brown
      accent: '#E0F2F1',
      name: 'ac2',
      isDark: false,
    },
  ];

  constructor(
    public styleManager: StyleManager,
    private _themeStorage: ThemeStorage,
    private _activatedRoute: ActivatedRoute) {
    let sthem: any = this._themeStorage.getStoredTheme();
    if (sthem !== null && sthem.name) {
      this.installTheme(sthem.name);
    }
  }

  ngOnInit(): void {
    this._queryParamSubscription = this._activatedRoute.queryParamMap
      .pipe(map((params: any) => params.get('theme')), filter(Boolean))
      .subscribe((themeName: any) => this.installTheme(themeName));
  }

  ngOnDestroy(): void {
    this._queryParamSubscription.unsubscribe();
  }

  installTheme(themeName: string): void {
    const theme: AppUITheme = this.themes.find((currentTheme: AppUITheme) => currentTheme.name === themeName);

    if (!theme) {
      return;
    }

    this.currentTheme = theme;

    if (theme.isDefault) {
      this.styleManager.removeStyle('theme');
    } else {
      this.styleManager.setStyle('theme', `assets/css/${theme.name}.css`);
    }

    if (this.currentTheme) {
      this._themeStorage.storeTheme(this.currentTheme);
    }
  }
}

@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatGridListModule,
    MatTooltipModule,
    CommonModule,
  ],
  exports: [ThemePicker],
  declarations: [ThemePicker],
  providers: [StyleManager, ThemeStorage],
})
export class ThemePickerModule { }
