import { Component, OnInit, ElementRef, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { DateAdapter, MatIconRegistry } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { TranslateService } from '@ngx-translate/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { appNavItems, appLanguage, LogLevel, UIStatusEnum, HomeDef, languageEn, languageZh, languageZhCN } from './model';
import { AuthService, HomeDefDetailService, UIStatusService } from './services';
import { MediaMatcher } from '@angular/cdk/layout';
import { slideInAnimation } from './utility';

@Component({
  selector: 'hih-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    slideInAnimation,
    // animation triggers go here
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private _mobileQueryListener: () => void;

  public availableLanguages: appLanguage[] = [
    { displayas: 'Nav.English', value: 'en' },
    { displayas: 'Nav.SimplifiedChinese', value: 'zh' },
  ];
  public isLoggedIn: boolean;
  public isFatalError: boolean;
  public titleLogin: string;
  public userDisplayAs: string;
  public curChosenHome: HomeDef;
  public selectedLanguage: string;
  mobileQuery: MediaQueryList;
  currVersion: string;

  constructor(private _element: ElementRef,
    private _translate: TranslateService,
    private _authService: AuthService,
    public _homeDefService: HomeDefDetailService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _media: MediaMatcher,
    private _zone: NgZone,
    private _router: Router,
    private _uistatusService: UIStatusService,
    private _iconRegistry: MatIconRegistry,
    private _http: HttpClient,
    private _sanitizer: DomSanitizer) {
    this.mobileQuery = this._media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this._changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    // Setup the translate
    this.userDisplayAs = '';
    this.curChosenHome = undefined;
    this.isFatalError = false;
    // ICON
    this._iconRegistry.addSvgIcon(
      'github',
    this._sanitizer.bypassSecurityTrustResourceUrl('../../assets/images/github-circle-white-transparent.svg'));
    // Version
    this.currVersion = environment.CurrentVersion;

    // Let's check the DB version
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json');

    this._http.post(environment.ApiUrl + '/DBVersionCheck', '', {
        headers: headers,
      }).subscribe((y: any) => {
        // Register the Auth service
        if (environment.LoginRequired) {
          this._homeDefService.curHomeSelected.subscribe((x: any) => {
            this.curChosenHome = x;
          });

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
        } else {
          this.isLoggedIn = false;
        }
      }, (error: HttpErrorResponse) => {
        this.isFatalError = true;
        this._uistatusService.latestError = error.message;
        this._router.navigate(['/fatalerror']);
      });
  }

  ngOnInit(): void {
    this._translate.setDefaultLang(languageZh);
    this._translate.use(languageZh).subscribe((x: any) => {
      this.selectedLanguage = languageZh;
      this._uistatusService.CurrentLanguage = this.selectedLanguage;

      this.updateDocumentTitle();
    });

    if (this.isFatalError) {
      this._router.navigate(['/fatalerror']);
    }
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  public onLogon(): void {
    if (environment.LoginRequired) {
      this._authService.doLogin();
    } else {
      console.log('No logon is required!');
    }
  }

  public onUserDetail(): void {
    this._router.navigate(['/userdetail']);
  }

  public onCheckMessages(): void {
    this._router.navigate(['/homemsg']);
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
    const elem: any = this._element.nativeElement.querySelector('.hih-content');
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
    this.selectedLanguage = sellang;

    if (this._translate.currentLang !== this.selectedLanguage &&
      this.selectedLanguage !== undefined) {
      this._translate.use(this.selectedLanguage);

      this._uistatusService.CurrentLanguage = this.selectedLanguage;

      this.updateDocumentTitle();
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
  public prepareRoute(outlet: RouterOutlet): any {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  private updateDocumentTitle(): void {
    // this._translate.get('Home.AppTitle').subscribe(x => {
    //   document.title = x;
    // });
  }
}
