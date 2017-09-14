import { Component, OnInit, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { appNavItems, appLanguage, LogLevel, UIStatusEnum, HomeDef } from './model';
import { AuthService, HomeDefDetailService } from './services';

@Component({
  selector: 'hih-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public navItems: appNavItems[] = [];
  public navLearnItems: appNavItems[] = [];
  public navFinItems: appNavItems[] = [];
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
    private _router: Router) {
    // Setup the translate
    this.userDisplayAs = '';
    this.curChosenHome = null;

    this.navItems = [
      { name: 'Nav.Home', route: '' },
      { name: 'Common.Languages', route: 'language' },
      { name: 'Nav.HomeList', route: 'homedef' },
      //{ name: 'Nav.HomeDetail', route: 'homedetail' },
      { name: 'Finance.Currency', route: 'currency' },
    ];
    this.navLearnItems = [
      { name: 'Learning.LearningCategory', route: 'learn/category' },
      { name: 'Learning.LearningObjects', route: 'learn/object' },
      { name: 'Learning.LearningHistories', route: 'learn/history' },
    ];
    this.navFinItems = [
      { name: 'Finance.AccountCategories', route: 'finance/acntctgy' },
      { name: 'Finance.DocumentTypes', route: 'finance/doctype' },
      { name: 'Finance.TransactionTypes', route: 'finance/trantype' },
      { name: 'Finance.Accounts', route: 'finance/account' },
      { name: 'Finance.ControlCenters', route: 'finance/controlcenter' },
      { name: 'Finance.Orders', route: 'finance/order' },
      { name: 'Finance.Documents', route: 'finance/document' },
      { name: 'Finance.Reports', route: 'finance/report' },
    ];

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
    this._translate.setDefaultLang('zh');
    this._translate.use('zh').subscribe(x => {
      this.SelectedLanguage = 'zh';
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

      this.updateDocumentTitle();
    }
  }

  private updateDocumentTitle() {
    // this._translate.get('Home.AppTitle').subscribe(x => {
    //   document.title = x;
    // });
  }
}
