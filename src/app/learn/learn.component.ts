import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MdIconRegistry } from '@angular/material';
import { TdLoadingService, LoadingType, ILoadingOptions } from '@covalent/core';
import { UIStatusService } from '../services/uistatus.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-learn',
  templateUrl: `./learn.component.html`,
  styleUrls: ['./learn.component.css']
})
export class LearnComponent implements OnInit {
  public isLoggedIn: boolean = false;
  public titleLogin: string;
  public routes: any;
  public currentObject: string;

  constructor(private _iconRegistry: MdIconRegistry,
    private _loadingService: TdLoadingService,
    private _domSanitizer: DomSanitizer,
    private _authService: AuthService,
    private _uistatus: UIStatusService,
    viewContainerRef: ViewContainerRef) { 
    if (environment.DebugLogging) {
      console.log("Entering constructor of LearnComponent");
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

    this._uistatus.obsRouteList.subscribe(x => {
      this.routes = x;
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
}
