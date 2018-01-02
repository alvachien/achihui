import { Component, OnInit, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { DateAdapter, MatIconRegistry } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { TranslateService } from '@ngx-translate/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { appNavItems, appLanguage, LogLevel, UIStatusEnum, HomeDef, Language_En, Language_Zh, Language_ZhCN } from './model';
import { AuthService, HomeDefDetailService, UIStatusService } from './services';
import * as moment from 'moment';
import 'moment/locale/zh-cn';
import { LanguageComponent } from './language';

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
    private _dateAdapter: DateAdapter<MomentDateAdapter>,
    private _iconRegistry: MatIconRegistry,
    private _http: HttpClient,
    private _sanitizer: DomSanitizer) {
    // Setup the translate
    this.userDisplayAs = '';
    this.curChosenHome = null;

    // Wakeup the API
    this._http.get(environment.ApiUrl + '/api/wakeup').subscribe(y => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC HIH UI [Debug]: Wakeup API in AppComponent' + y.toString());
      }
    });

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
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error('AC HIH UI [Error]: Failed in subscribe to User', error);
        }
      }, () => {
        // Completed
      });
    } else {
      this.isLoggedIn = false;
    }

    // ICON
    this._iconRegistry.addSvgIcon(
      'github',
      this._sanitizer.bypassSecurityTrustResourceUrl('../../assets/images/github-circle-white-transparent.svg'));
  }

  ngOnInit() {
    this._translate.setDefaultLang(Language_Zh);
    this._translate.use(Language_Zh).subscribe((x) => {
      this.SelectedLanguage = Language_Zh;
      this._uistatusService.CurrentLanguage = this.SelectedLanguage;
      this._dateAdapter.setLocale(Language_ZhCN);
      this.updateDocumentTitle();
    });
  }

  public onLogon(): void {
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

  public onLanguageChanged(sellang: string): void {
    this.SelectedLanguage = sellang;

    if (this._translate.currentLang !== this.SelectedLanguage &&
      this.SelectedLanguage !== undefined) {
      this._translate.use(this.SelectedLanguage);

      if (this.SelectedLanguage === Language_Zh) {
        moment.locale(Language_ZhCN);
        this._dateAdapter.setLocale(Language_ZhCN);
      } else if (this.SelectedLanguage === Language_En) {
        moment.locale(Language_En);
        this._dateAdapter.setLocale(Language_En);
      }

      this._uistatusService.CurrentLanguage = this.SelectedLanguage;

      this.updateDocumentTitle();
    }
  }

  public onOpenMathExcises(): void {
    window.open('http://118.178.58.187:5230', '_blank');
  }

  public onOpenPhotoGallery(): void {
    window.open('http://118.178.58.187:5210', '_blank');
  }

  public onOpenGithubRepo(): void {
    window.open('https://github.com/alvachien/achihui', '_blank');
  }

  private updateDocumentTitle(): void {
    // this._translate.get('Home.AppTitle').subscribe(x => {
    //   document.title = x;
    // });
  }
}
