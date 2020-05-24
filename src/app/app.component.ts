import { Component, OnInit, ElementRef, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd';
import { TranslocoService } from '@ngneat/transloco';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';
import { appNavItems, appLanguage, UIStatusEnum, HomeDef, ModelUtility, ConsoleLogTypeEnum } from './model';
import { AuthService, UIStatusService, HomeDefOdataService } from './services';

@Component({
  selector: 'hih-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  isCollapsed = false;
  searchContent: string;
  public isLoggedIn: boolean;
  public titleLogin: string;
  public userDisplayAs: string;
  public curChosenHome: HomeDef;

  constructor(
    private i18n: NzI18nService,
    private translocoService: TranslocoService,
    private _authService: AuthService,
    public _homeService: HomeDefOdataService,
    private uiService: UIStatusService,
    private router: Router,
    private _zone: NgZone) {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent constructor',
      ConsoleLogTypeEnum.debug);

    this._authService.authContent.subscribe((x: any) => {
      this._zone.run(() => {
        this.isLoggedIn = x.isAuthorized;
        if (this.isLoggedIn) {
          this.titleLogin = x.getUserName();
        }
      });
    });
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent ngOnInit',
      ConsoleLogTypeEnum.log);
    this._homeService.checkDBVersion().subscribe({
      next: val => {
        this.uiService.versionResult = val;
      },
      error: err => {
        // Jump to error page
        this.uiService.latestError = err;
        this.uiService.fatalError = true;
        this.router.navigate(['/fatalerror']);
      },
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent ngOnDestroy',
      ConsoleLogTypeEnum.log);
  }

  switchLanguage(lang: string) {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent switchLanguage',
      ConsoleLogTypeEnum.debug);

    if (lang === 'en_US') {
      this.i18n.setLocale(en_US);
      this.translocoService.setActiveLang('en');
    } else {
      this.i18n.setLocale(zh_CN);
      this.translocoService.setActiveLang('zh');
    }
  }

  public onLogon(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent onLogon',
      ConsoleLogTypeEnum.log);

    if (environment.LoginRequired) {
      this._authService.doLogin();
    }
  }
  public onLogout(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent onLogout',
      ConsoleLogTypeEnum.log);

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
  }
}
