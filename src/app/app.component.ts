import { Component, OnInit, ElementRef, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd';
import { TranslocoService } from '@ngneat/transloco';

import { environment } from '../environments/environment';
import { appNavItems, appLanguage, LogLevel, UIStatusEnum, HomeDef, languageEn, languageZh, languageZhCN } from './model';
import { AuthService, UIStatusService, HomeDefOdataService } from './services';

@Component({
  selector: 'hih-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
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
    private _zone: NgZone,
    private _changeDetectorRef: ChangeDetectorRef,) {
      this._authService.authContent.subscribe((x: any) => {
        this._zone.run(() => {
          this.isLoggedIn = x.isAuthorized;
          if (this.isLoggedIn) {
            this.titleLogin = x.getUserName();
          }
        });
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error('AC HIH UI [Error]: Failed in subscribe to User', error);
        }
      });
   }

  switchLanguage(lang: string) {
    if (lang === 'en_US') {
      this.i18n.setLocale(en_US);
      this.translocoService.setActiveLang('en');
    } else {
      this.i18n.setLocale(zh_CN);
      this.translocoService.setActiveLang('zh');
    }
  }

  public onLogon(): void {
    if (environment.LoginRequired) {
      this._authService.doLogin();
    } else {
      console.log('No logon is required!');
    }
  }
  public onLogout(): void {
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

  public onOpenGithubRepo(): void {
    window.open('https://github.com/alvachien/achihui', '_blank');
  }
}
