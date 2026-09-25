import { Component, OnInit, DestroyRef, inject, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd/i18n';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Router, RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';

import { environment } from '../environments/environment';
import { ModelUtility, ConsoleLogTypeEnum } from './model';
import { AuthService, UIStatusService, HomeDefOdataService, ThemeService, UserPreferencesService } from './services';

@Component({
  selector: 'hih-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, NzLayoutModule, NzMenuModule, NzIconModule, NzDropdownModule, RouterModule],
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  currentYear = 0;
  searchContent?: string;
  public userDisplayAs?: string;

  private readonly i18n = inject(NzI18nService);
  private readonly translocoService = inject(TranslocoService);
  private readonly _authService = inject(AuthService);
  private readonly _homeService = inject(HomeDefOdataService);
  private readonly uiService = inject(UIStatusService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly prefs = inject(UserPreferencesService);

  // Auth state read directly from AuthService.authSubject (now a signal, route b).
  private readonly authContentSig = this._authService.authSubject;
  public readonly isLoggedIn = computed(() => this.authContentSig().isAuthorized);
  public readonly titleLogin = computed(() => this.authContentSig().getUserName());
  // Selected home state (read directly from HomeDefOdataService.curHomeSelected signal)
  public readonly selectedHomeName = computed(() => this._homeService.curHomeSelected()?.Name ?? null);

  constructor() {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent constructor', ConsoleLogTypeEnum.debug);

    this.currentYear = new Date().getFullYear();
    // No startup theme randomizer anymore: ThemeService now seeds itself from the
    // persisted preference (UserPreferencesService -> localStorage) and applies it
    // via APP_INITIALIZER's loadTheme(true). The old coin-flip would fight the
    // user's stored choice on every load.

    // DB-version probe follows the AUTH STATE, not AppComponent's init. The old
    // one-shot `if (isAuthorized)` check in ngOnInit silently never fired: the
    // auth signal only flips after the async OIDC checkAuth() resolves, which is
    // always later than ngOnInit - even on a reload with a live session. Result:
    // versionResult stayed null and the About page rendered the API/DB versions
    // as blank. The effect (re-)probes on every logged-out -> logged-in edge.
    effect(() => {
      if (!this.isLoggedIn()) {
        return;
      }
      this._homeService
        .checkDBVersion()
        .pipe(takeUntilDestroyed(this.destroyedRef))
        .subscribe({
          next: (val) => {
            this.uiService.versionResult = val;
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(`AC HIH UI [Error]: checkDBVersion failed: ${err}`, ConsoleLogTypeEnum.error);
          },
        });
    });
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent ngOnInit', ConsoleLogTypeEnum.debug);
  }

  switchLanguage(lang: string) {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent switchLanguage', ConsoleLogTypeEnum.debug);

    // Load the target language BEFORE activating it: setActiveLang only fires
    // langChanges$ (which re-runs the imperative-translate computeds), while
    // the JSON arrives later — leaving raw keys on screen until another event.
    const translocoLang = lang === 'en_US' ? 'en' : 'zh';
    this.translocoService.load(translocoLang).subscribe(() => {
      if (lang === 'en_US') {
        this.i18n.setLocale(en_US);
        this.translocoService.setActiveLang('en');
      } else {
        this.i18n.setLocale(zh_CN);
        this.translocoService.setActiveLang('zh');
      }
      // Persist the choice: app.config.ts reads it at module-eval time, so the
      // next boot starts with matching LOCALE_ID / nz-i18n / transloco language.
      this.prefs.setLang(translocoLang);
    });
  }
  toggleTheme(): void {
    // ThemeService flips its state AND persists the new theme to preferences.
    this.themeService.toggleTheme().then();
  }
  public onLogon(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent onLogon', ConsoleLogTypeEnum.debug);

    if (environment.LoginRequired) {
      this._authService.doLogin();
    }
  }
  public onLogout(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent onLogout', ConsoleLogTypeEnum.debug);

    if (environment.LoginRequired) {
      this._authService.doLogout();
    }
  }

  public onOpenMathExcises(): void {
    window.open(environment.AppMathExercise, '_blank');
  }

  public onOpenPhotoGallery(): void {
    window.open(environment.AppGallery, '_blank');
  }

  public onGoToUserDetail(): void {
    this.router.navigate(['/userdetail']);
  }
  public onGoToSelectedHome(): void {
    // Go to selected home
    if (this._homeService.ChosedHome) {
      this.router.navigate(['/homedef/display/', this._homeService.ChosedHome.ID]);
    }
  }
}
