import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public isLoggedIn: boolean = false;
  public titleLogin: string;

  constructor(private authService: AuthService,
    private translateService: TranslateService) {

    this.isLoggedIn = false;
    this.titleLogin = 'Login';

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
