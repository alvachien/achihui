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
  public learnRoutes: any;
  public learnMenuToggled: boolean = false;
  public financeRoutes: any;
  public financeMenuToggled: boolean = false;
  public libraryRoutes: any;
  public libraryMenuToggled: boolean = false;

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
  }

  ngOnInit() {
  }

  public onLogin() : void {
    this._authService.doLogin();
  }
  public onLogout(): void {
    this._authService.doLogout();
  }

  toggleLearnMenu() : void {
    this.learnMenuToggled = !this.learnMenuToggled;
  }
  toggleFinanceMenu(): void {
    this.financeMenuToggled = !this.financeMenuToggled;
  }
  toggleLibraryMenu(): void {
    this.libraryMenuToggled = !this.libraryMenuToggled;
  }
}
