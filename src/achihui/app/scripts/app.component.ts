import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'my-app',
    templateUrl: 'app/views/main.html'
})
export class AppComponent implements OnInit {

    public isLoggedIn: boolean;
    public titleLogin: string;

    constructor(public authService: AuthService) {
        this.isLoggedIn = false;
        this.titleLogin = 'Login';
    }

    ngOnInit() {
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

    public onLogin() {
        if (this.isLoggedIn) {
            this.doLogout();
        } else {
            this.doLogin();
        }
    }

    private doLogin() {
        console.log("Perform login logic");
        //this.loginService.Login();
        this.authService.doLogin();
    }

    private doLogout() {
        console.log("Perform logout logic");
        //this.loginService.Logoff();
        //this.authService.doLogout();
    }
}

