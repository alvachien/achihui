import { Component, OnInit, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { appNavItems, appLanguage, LogLevel, UIStatusEnum, HomeDef } from './model';
import { AuthService, HomeDefDetailService } from './services';

@Component({
  selector: 'hih-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public navItems: appNavItems[] = [];
  public navLearnItems: appNavItems[] = [];
  public navFinItems: appNavItems[] = [];
  public availableLanguages: appLanguage[] = [
    { displayas: 'Nav.English', value: 'en' },
    { displayas: 'Nav.SimplifiedChinese', value: 'zh' }
  ];
  public isLoggedIn: boolean;
  public titleLogin: string;
  public userDisplayAs: string;
  public curChosenHome: HomeDef;

  private _curStatus: UIStatusEnum;
  get CurrentStatus(): UIStatusEnum {
    return this._curStatus;
  }

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
    this._curStatus = UIStatusEnum.NotLogin;
    this.curChosenHome = null;

    this.navItems = [
      { name: 'Nav.Home', route: '' },
      { name: 'Nav.HomeList', route: 'homelist' },
      //{ name: 'Nav.HomeDetail', route: 'homedetail' },
      { name: 'Finance.Currency', route: 'currency' },
    ];
    this.navLearnItems = [
      { name: 'Learning.LearningCategory', route: 'learn/category' },
    ];
    this.navFinItems = [
      { name: 'Finance.AccountCategories', route: 'finance/acntctgy' },
      { name: 'Finance.DocumentTypes', route: 'finance/doctype' },
      { name: 'Finance.TransactionTypes', route: 'finance/trantype' },
    ];

    // Register the Auth service
    if (environment.LoginRequired) {
      this._homeDefService.curHomeSelected.subscribe(x => {
        this.curChosenHome = x;
      });

      this._authService.authContent.subscribe(x => {
        this._zone.run(() => {
          this._curStatus = UIStatusEnum.LoggedinNoHomeChosen;
          this.isLoggedIn = x.isAuthorized;
          if (this.isLoggedIn) {
            this.titleLogin = x.getUserName();

            this._homeDefService.fetchAllHomeDef();
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

  public onChosenHomeDetail(): void {
    this._router.navigate(['/homedetail']);
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
    // this._translate.get('Home.AppTitle').subscribe(x => {
    //   document.title = x;
    // });
  }
}
