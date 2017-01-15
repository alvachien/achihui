import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';
import { TranslateService } from 'ng2-translate';
import { DomSanitizer } from '@angular/platform-browser';
import { MdIconRegistry } from '@angular/material';
import { TdLoadingService, LoadingType, ILoadingOptions } from '@covalent/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public isLoggedIn: boolean = false;
  public titleLogin: string;

  constructor(private authService: AuthService,
    private translateService: TranslateService,
    private _loadingService: TdLoadingService,
    private _iconRegistry: MdIconRegistry,
    private _domSanitizer: DomSanitizer,
    viewContainerRef: ViewContainerRef) {

    translateService.addLangs(["en", "zh"]);
    translateService.setDefaultLang('en');

    this.authService.authContent.subscribe(x => {
      this.isLoggedIn = x.isAuthorized;
      if (this.isLoggedIn)
        this.titleLogin = x.getUserName();
      else
        this.titleLogin = "";

      if (!this.titleLogin)
        this.titleLogin = 'Login';
    });

    // let options: ILoadingOptions = {
    //   name: 'main',
    //   type: LoadingType.Circular,
    // };
    // this._loadingService.createOverlayComponent(options, viewContainerRef);

    // this._iconRegistry.addSvgIconInNamespace('assets', 'teradata',
    //   this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/teradata.svg'));
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
    this._iconRegistry.addSvgIconInNamespace('assets', 'teradata-ux',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/teradata-ux.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'appcenter',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/appcenter.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'listener',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/listener.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'querygrid',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/querygrid.svg'));
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of AppComponent");
    }
  }

  public onLogin(): void {
    if (environment.DebugLogging) {
      console.log("Entering onLogin of AppComponent");
    }

    if (!this.isLoggedIn) {
      this.authService.doLogin();
    }
  }

  public onLogout(): void {
    if (environment.DebugLogging) {
      console.log("Entering onLogout of AppComponent");
    }

    if (this.isLoggedIn) {
      this.authService.doLogout();
    }
  }
}
