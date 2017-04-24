import { Component, OnInit, NgZone, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MdIconRegistry } from '@angular/material';
import { TdLoadingService, LoadingType } from '@covalent/core';
import { AuthService } from '../services/auth.service';
import { UIStatusService } from '../services/uistatus.service';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { AppLanguage } from '../model/common';

@Component({
  selector: 'hih-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.css']
})
export class FinanceComponent implements OnInit {
  public isLoggedIn: boolean = false;
  public titleLogin: string;
  public appRoutes: any;
  public learnRoutes: any;
  public financeRoutes: any;
  public libraryRoutes: any;
  public userRoutes: any;
  public learnMenuToggled: boolean = true;
  public financeMenuToggled: boolean = true;
  public libraryMenuToggled: boolean = true;
  public currentObject: string;
  public arLanguages: Array<AppLanguage>;
  //private isAuthInitial: boolean;

  constructor(private _iconRegistry: MdIconRegistry,
    private _loadingService: TdLoadingService,
    private _domSanitizer: DomSanitizer,
    private _zone: NgZone,
    private _authService: AuthService,
    private _uistatus: UIStatusService,
    private _translateService: TranslateService,
    viewContainerRef: ViewContainerRef) {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering constructor of FinanceComponent");
    }
    this.arLanguages = new Array<AppLanguage>();
    // this.isAuthInitial = true;

    this._authService.authContent.subscribe(x => {
      if (environment.DebugLogging) {
        console.log("ACHIHUI Log: Entering AuthService subscribition in FinanceComponent's constructor: ");
        console.log(x);
      }

      // if (this.isAuthInitial) {
      //   this.isAuthInitial = false;
      // } else {
        this._zone.run(() => {
          this.isLoggedIn = x.isAuthorized;
          if (this.isLoggedIn)
            this.titleLogin = x.getUserName();
          else
            this.titleLogin = "";

          if (!this.titleLogin)
            this.titleLogin = 'Login.Login';
        });
      //}
    });

    let arlang: string[] = [];
    for (let ap of this._uistatus.arLang) {
      this.arLanguages.push(ap);
      arlang.push(ap.IsoName);
    }

    this._iconRegistry.addSvgIconInNamespace('assets', 'github',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/github.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'angular',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/angular.ico'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'covalent',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/covalent.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'covalent-mark',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/covalent-mark.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'hihlogo',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/hihapplogo.svg'));

    // Register the UI status
    this._uistatus.obsTitleLogin.subscribe(x => {
      this._zone.run(() => {
        this.titleLogin = x;
      });
    }, error => {
    }, () => {
    });

    this._uistatus.obsAppRouteList.subscribe(x => {
      this._zone.run(() => {
        this.appRoutes = x;
      });
    }, error => {
    }, () => {
    });
    this._uistatus.obsLearnRouteList.subscribe(x => {
      this._zone.run(() => {
        this.learnRoutes = x;
      });
    }, error => {
    }, () => {
    });
    this._uistatus.obsFinanceRouteList.subscribe(x => {
      this._zone.run(() => {
        this.financeRoutes = x;
      });
    }, error => {
    }, () => {
    });
    this._uistatus.obsLibraryRouteList.subscribe(x => {
      this._zone.run(() => {
        this.libraryRoutes = x;
      });
    }, error => {
    }, () => {
    });
    this._uistatus.obsUserRouteList.subscribe(x => {
      this._zone.run(() => {
        this.userRoutes = x;
      });
    }, error => {
    }, () => {
    });
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceComponent");
    }
  }

  public onLogin(): void {
    if (environment.DebugLogging) {
      console.log("Entering onLogin of FinanceComponent");
    }

    if (!this.isLoggedIn) {
      this._authService.doLogin();
    }
  }

  public onLogout(): void {
    if (environment.DebugLogging) {
      console.log("Entering onLogout of FinanceComponent");
    }

    if (this.isLoggedIn) {
      this._authService.doLogout();
    }
  }

  public toggleLearnMenu(): void {
    this.learnMenuToggled = !this.learnMenuToggled;
  }
  public toggleFinanceMenu(): void {
    this.financeMenuToggled = !this.financeMenuToggled;
  }
  public toggleLibraryMenu(): void {
    this.libraryMenuToggled = !this.libraryMenuToggled;
  }
  public onLanguageClick(lang: AppLanguage) : void {
    if (lang.IsoName !== this._uistatus.curLang) {
      this._uistatus.setCurrentLanguage(lang.IsoName);
    }
  }
}
