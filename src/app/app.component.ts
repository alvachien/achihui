import { Component, OnInit, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { appNavItems, appLanguage, LogLevel, UIStatusEnum, HomeDef } from './model';
import { AuthService, HomeDefDetailService, UIStatusService } from './services';
import * as moment from 'moment';
import 'moment/locale/zh-cn';
import { DateAdapter } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

@Component({
  selector: 'hih-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public availableLanguages: appLanguage[] = [
    { displayas: 'Nav.English', value: 'en' },
    { displayas: 'Nav.SimplifiedChinese', value: 'zh' },
  ];
  public isLoggedIn: boolean;
  public titleLogin: string;
  public userDisplayAs: string;
  public curChosenHome: HomeDef;
  public SelectedLanguage: string;

  constructor(private _element: ElementRef,
    private _translate: TranslateService,
    private _authService: AuthService,
    private _homeDefService: HomeDefDetailService,
    private _zone: NgZone,
    private _router: Router,
    private _uistatusService: UIStatusService,
    private _dateAdapter: DateAdapter<MomentDateAdapter>) {
    // Setup the translate
    this.userDisplayAs = '';
    this.curChosenHome = null;

    // Register the Auth service
    if (environment.LoginRequired) {
      this._homeDefService.curHomeSelected.subscribe((x) => {
        this.curChosenHome = x;
      });

      this._authService.authContent.subscribe((x) => {
        this._zone.run(() => {
          this.isLoggedIn = x.isAuthorized;
          if (this.isLoggedIn) {
            this.titleLogin = x.getUserName();

            this._homeDefService.fetchAllHomeDef();
          }
        });
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error('AC HIH UI [Error]: Failed in subscribe to User', error);
        }
      }, () => {
        // Completed
      });
    } else {
      this.isLoggedIn = false;
    }
  }

  ngOnInit() {
    this._translate.setDefaultLang('zh');
    this._translate.use('zh').subscribe((x) => {
      this.SelectedLanguage = 'zh';
      this._uistatusService.CurrentLanguage = this.SelectedLanguage;
      this._dateAdapter.setLocale('zh-cn');
      this.updateDocumentTitle();
    });
  }

  public onLogon() {
    if (environment.LoginRequired) {
      this._authService.doLogin();
    } else {
      console.log('No logon is required!');
    }
  }

  public onUserDetail(): void {
    this._router.navigate(['/user-detail']);
  }

  public onChosenHomeDetail(): void {
    this._router.navigate(['/homedef/display/' + this.curChosenHome.ID.toString()]);
  }

  public onLogout(): void {
    if (environment.LoginRequired) {
      this._authService.doLogout();
    }
  }

  public toggleFullscreen(): void {
    const elem = this._element.nativeElement.querySelector('.hih-content');
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullScreen) {
      elem.msRequestFullScreen();
    }
  }

  public onLanguageChanged() {
    if (this._translate.currentLang !== this.SelectedLanguage &&
      this.SelectedLanguage !== undefined) {
      this._translate.use(this.SelectedLanguage);

      if (this.SelectedLanguage === 'zh') {
        moment.locale('zh-cn');
        this._dateAdapter.setLocale('zh-cn');
      } else if (this.SelectedLanguage === 'en') {
        moment.locale('en');
        this._dateAdapter.setLocale('en');
      }

      this._uistatusService.CurrentLanguage = this.SelectedLanguage;

      this.updateDocumentTitle();
    }
  }

  private updateDocumentTitle() {
    // this._translate.get('Home.AppTitle').subscribe(x => {
    //   document.title = x;
    // });
  }

  public onOpenMathExcises() {
    window.open("http://118.178.58.187:5230", "blank");
  }

  public onOpenPhotoGallery() {
    //window.open("http://118.178.58.187:5230", "blank");
  }
}
