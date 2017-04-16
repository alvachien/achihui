import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UIStatusService } from './services/uistatus.service';
import { environment } from '../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MdIconRegistry } from '@angular/material';
import { TdLoadingService, LoadingType, ILoadingOptions } from '@covalent/core';


@Component({
  selector: 'hih-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  //private isAuthInitial: boolean;

  constructor(private _authService: AuthService,
    private _uistatus: UIStatusService,
    private _translateService: TranslateService,
    private _loadingService: TdLoadingService,
    private _iconRegistry: MdIconRegistry,
    private _domSanitizer: DomSanitizer,
    viewContainerRef: ViewContainerRef) {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering constructor of AppComponent");
    }

    let arlang: string[] = [];
    for(let ap of this._uistatus.arLang)
      arlang.push(ap.IsoName);
    this._translateService.addLangs(arlang);
    this._translateService.setDefaultLang(this._uistatus.curLang ? this._uistatus.curLang : "en");

    this._uistatus.obsCurLanguage.subscribe(x => {
      if (environment.DebugLogging) {
        console.log("ACHIHUI Log: Entering current language change in AppComponent: " + x);
      }
      if (x) {
        this._translateService.use(x);
      }      
    }, error => {
    }, () => {
    });

    this._authService.authContent.subscribe(x => {
      // if (this.isAuthInitial) {
      //   this.isAuthInitial = false;
      // } else {
        if (environment.DebugLogging) {
          console.log("ACHIHUI Log: Entering subscribe of authContent in AppComponent");
        }

        this._uistatus.setIsLogin(x.isAuthorized);
      //}
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
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering ngOnInit of AppComponent");
    }
  }
}
