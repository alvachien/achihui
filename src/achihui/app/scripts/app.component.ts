import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService }                  from './services/auth.service';
import { TranslateService }             from 'ng2-translate/ng2-translate';
import { environment, DebugLogging }    from './app.setting';
import { UserService }                  from './services/user.service';

@Component({
    selector: 'hih-app',
    templateUrl: 'app/views/main.html'
})
export class AppComponent implements OnInit, OnDestroy {

    public isLoggedIn: boolean;
    public titleLogin: string;

    constructor(private authService: AuthService,
        private userService: UserService,
        private translateService: TranslateService) {

        if (DebugLogging) {
            console.log("Entering constructor of AppComponent");
        }

        this.isLoggedIn = false;
        this.titleLogin = 'Login';
        this.authService.authContent.subscribe(x => {
            this.isLoggedIn = x.isAuthorized;
            if (this.isLoggedIn) {
                this.titleLogin = x.getUserName();

                // Get the user detail out
                this.userService.loadUserDetail();
            } else {
                this.titleLogin = "";
            }

            if (!this.titleLogin)
                this.titleLogin = 'Login';
        });

        translateService.addLangs(["en", "zh"]);
        translateService.setDefaultLang('zh');

        if (environment !== "Development") {
            let browserLang = translateService.getBrowserLang();
            translateService.use(browserLang.match(/en|zh/) ? browserLang : 'zh');
        } else {
            translateService.use('zh');
        }
    }

    ngOnInit() {        
        if (DebugLogging) {
            console.log("Entering ngOnInit of AppComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of AppComponent");
        }
    }

    public onLogin() {
        if (DebugLogging) {
            console.log("Entering onLogin of AppComponent");
        }

        if (!this.isLoggedIn) {
            this.doLogin();
        }
    }

    public onLogout() {
        if (DebugLogging) {
            console.log("Entering onLogout of AppComponent");
        }

        if (this.isLoggedIn) {
            this.doLogout();
        }
    }

    private doLogin() {
        if (DebugLogging) {
            console.log("Entering doLogin of AppComponent");
        }
        this.authService.doLogin();
    }

    private doLogout() {
        if (DebugLogging) {
            console.log("Entering doLogout of AppComponent");
        }
        //this.loginService.Logoff();
        //this.authService.doLogout();
    }
}

