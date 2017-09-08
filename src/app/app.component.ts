import { Component, OnInit, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { appNavItems, appLanguage, LogLevel } from './model';
import { AuthService, HomeDefDetailService } from './services';

@Component({
  selector: 'hih-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public navItems: appNavItems[] = [];
  public availableLanguages: appLanguage[] = [
    { displayas: 'Nav.English', value: 'en' },
    { displayas: 'Nav.SimplifiedChinese', value: 'zh' }
  ];
  public isLoggedIn: boolean;
  public titleLogin: string;
  public userDisplayAs: string;

  private _selLanguage: string;
  get selectedLanguage(): string {
    return this._selLanguage;
  }
  set selectedLanguage(lang: string) {
    if (this._selLanguage !== lang && lang !== undefined && lang !== null) {
      this._selLanguage = lang;

      this.onLanguageChange();
    }
  }

  constructor(private _element: ElementRef,
    private _translate: TranslateService,
    private _authService: AuthService,
    private _homeDefService: HomeDefDetailService,
    private _zone: NgZone,
    private _router: Router) {
    // Setup the translate
    this._selLanguage = 'zh';
    this._translate.setDefaultLang(this._selLanguage);
    this._translate.use(this._selLanguage);
    this.userDisplayAs = '';

    this.navItems = [
      { name: 'Nav.Home', route: '' },
      { name: 'Nav.HomeList', route: 'homelist' },
      { name: 'Nav.HomeDetail', route: 'homedetail' },
    ];

    // Register the Auth service
    if (environment.LoginRequired) {
      this._authService.authContent.subscribe(x => {
        this._zone.run(() => {
          this.isLoggedIn = x.isAuthorized;
          if (this.isLoggedIn) {
            this.titleLogin = x.getUserName();

            this._homeDefService.fetchAllHomeDef().subscribe((x2) => {
            });
          }
        });
      }, error => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error('AC Math Exercise: Log [Error]: Failed in subscribe to User', error);
        }
      }, () => {
        // Completed
      });
    } else {
      this.isLoggedIn = false;
    }
  }

  ngOnInit() {
    this.updateDocumentTitle();
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

  private onLanguageChange() {
    if (this._translate.currentLang !== this._selLanguage &&
      this._selLanguage !== undefined) {
      this._translate.use(this._selLanguage);

      this.updateDocumentTitle();
    }
  }

  private updateDocumentTitle() {
    this._translate.get('Home.AppTitle').subscribe(x => {
      document.title = x;
    });
  }
}
