import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MdIconRegistry } from '@angular/material';
import { TdLoadingService, LoadingType, ILoadingOptions } from '@covalent/core';
import { UIStatusService } from '../services/uistatus.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'hih-learn',
  templateUrl: `./learn.component.html`,
  styleUrls: ['./learn.component.css']
})
export class LearnComponent implements OnInit {
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

  constructor(private _iconRegistry: MdIconRegistry,
    private _loadingService: TdLoadingService,
    private _domSanitizer: DomSanitizer,
    private _authService: AuthService,
    private _uistatus: UIStatusService,
    private _translateService: TranslateService,
    viewContainerRef: ViewContainerRef) { 
    if (environment.DebugLogging) {
      console.log("Entering constructor of LearnComponent");
    }

    let arlang: string[] = [];
    for(let ap of this._uistatus.arLang)
      arlang.push(ap.IsoName);
    this._translateService.addLangs(arlang);
    this._translateService.setDefaultLang(this._uistatus.curLang);
    this._uistatus.obsCurLanguage.subscribe(x => {
      this._translateService.setDefaultLang(x);
    }, error => {
    }, () => {
    });

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

    this._authService.authContent.subscribe(x => {
      this.isLoggedIn = x.isAuthorized;
      if (this.isLoggedIn)
        this.titleLogin = x.getUserName();
      else
        this.titleLogin = "";

      if (!this.titleLogin)
        this.titleLogin = 'Login';
    });

    // Register the UI status
    this._uistatus.obsTitleLogin.subscribe(x => {
      this.titleLogin = x;
    }, error => {
    }, () => {
    });

    this._uistatus.obsAppRouteList.subscribe(x => {
      this.appRoutes = x;
    }, error => {

    }, () => {

    });
    this._uistatus.obsLearnRouteList.subscribe(x => {
      this.learnRoutes = x;
    }, error => {

    }, () => {

    });
    this._uistatus.obsFinanceRouteList.subscribe(x => {
      this.financeRoutes = x;
    }, error => {

    }, () => {

    });
    this._uistatus.obsLibraryRouteList.subscribe(x => {
      this.libraryRoutes = x;
    }, error => {

    }, () => {

    });
    this._uistatus.obsUserRouteList.subscribe(x => {
      this.userRoutes = x;
    }, error => {

    }, () => {

    });

    this._uistatus.obsLearnSubModule.subscribe(x => {
      this.currentObject = x;
    }, error => {
    }, () => {
    });    
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of LearnComponent");
    }
  }

  public onLogin(): void {
    if (environment.DebugLogging) {
      console.log("Entering onLogin of LearnComponent");
    }

    if (!this.isLoggedIn) {
      this._authService.doLogin();
    }
  }

  public onLogout(): void {
    if (environment.DebugLogging) {
      console.log("Entering onLogout of LearnComponent");
    }

    if (this.isLoggedIn) {
      this._authService.doLogout();
    }
  }

  public toggleLearnMenu() : void {
    this.learnMenuToggled = !this.learnMenuToggled;
  }
  public toggleFinanceMenu() : void {
    this.financeMenuToggled = !this.financeMenuToggled;
  }
  public toggleLibraryMenu() : void {
    this.libraryMenuToggled = !this.libraryMenuToggled;
  }
}
