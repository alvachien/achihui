import { Component, OnInit }  from '@angular/core';
import { UIStatusService } from '../services/uistatus.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'hih-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
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

  constructor(
    private _authService: AuthService,
    private _uistatus: UIStatusService
  ) { 
    // Register the Auth service
    this._authService.authContent.subscribe(x => {

      this._uistatus.setIsLogin(x.isAuthorized);
      if (x.isAuthorized) {
        this.titleLogin = x.getUserName();
        this._uistatus.setTitleLogin(x.getUserName());
      }
    }, error => {
      // Error occurred
    }, () => {
      // Completed
    });

    // Register the UI status
    this._uistatus.obsIsLoggedIn.subscribe(x => {
      this.isLoggedIn = x;
    }, error => {
    }, () => {
    });

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
  }

  ngOnInit() {
  }

  public onLogin() : void {
    this._authService.doLogin();
  }
  public onLogout(): void {
    this._authService.doLogout();
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
