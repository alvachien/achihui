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

  constructor(private _authService: AuthService,
    private _uistatus: UIStatusService,
    private _translateService: TranslateService,
    private _loadingService: TdLoadingService,
    private _iconRegistry: MdIconRegistry,
    private _domSanitizer: DomSanitizer,
    viewContainerRef: ViewContainerRef) {
    if (environment.DebugLogging) {
      console.log("Entering constructor of AppComponent");
    }

    this._translateService.addLangs(["en", "zh"]);
    this._translateService.setDefaultLang('en');

    this._authService.authContent.subscribe(x => {
      this._uistatus.setIsLogin(x.isAuthorized);
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
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of AppComponent");
    }
  }
}
