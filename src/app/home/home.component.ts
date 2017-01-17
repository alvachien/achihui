import { Component, OnInit }  from '@angular/core';
import { UIStatusService } from '../services/uistatus.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public isLoggedIn: boolean = false;
  public titleLogin: string;
  public routes: any;

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

    this._uistatus.obsRouteList.subscribe(x => {
      this.routes = x;
    }, error => {

    }, () => {

    });
  }

  ngOnInit() {
  }

  public onLogin() : void {
    this._authService.doLogin();
  }
}
