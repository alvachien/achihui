import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd/i18n';
import { TranslocoService } from '@ngneat/transloco';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';
import { ModelUtility, ConsoleLogTypeEnum } from './model';
import { AuthService, UIStatusService, HomeDefOdataService, ThemeService } from './services';

@Component({
  selector: 'hih-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  searchContent?: string;
  public isLoggedIn?: boolean;
  public titleLogin?: string;
  public userDisplayAs?: string;

  constructor(
    private i18n: NzI18nService,
    private translocoService: TranslocoService,
    private _authService: AuthService,
    public _homeService: HomeDefOdataService,
    private uiService: UIStatusService,
    private router: Router,
    private themeService: ThemeService,
    private _zone: NgZone
  ) {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent constructor', ConsoleLogTypeEnum.debug);

    // Randomize the theme
    if (Math.random() > 0.5) {
      this.toggleTheme();
    }
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent ngOnInit', ConsoleLogTypeEnum.debug);

    this._authService.authContent.subscribe((x) => {
      ModelUtility.writeConsoleLog(
        'AC HIH UI [Debug]: Entering AppComponent authService.authContent subscribe',
        ConsoleLogTypeEnum.debug
      );
      this._zone.run(() => {
        this.isLoggedIn = x.isAuthorized;
        if (this.isLoggedIn) {
          this.titleLogin = x.getUserName();
        }
      });
    });

    this._homeService.checkDBVersion().subscribe({
      next: (val) => {
        this.uiService.versionResult = val;
      },
      error: (err) => {
        // Jump to error page
        this.uiService.latestError = err;
        this.uiService.fatalError = true;
        this.router.navigate(['/fatalerror']);
      },
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent ngOnDestroy', ConsoleLogTypeEnum.debug);
  }

  switchLanguage(lang: string) {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent switchLanguage', ConsoleLogTypeEnum.debug);

    if (lang === 'en_US') {
      this.i18n.setLocale(en_US);
      this.translocoService.setActiveLang('en');
    } else {
      this.i18n.setLocale(zh_CN);
      this.translocoService.setActiveLang('zh');
    }
  }
  toggleTheme(): void {
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
