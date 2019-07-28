import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, HomeDefDetailService } from '../services';
import { Router } from '@angular/router';

@Component({
  selector: 'hih-page-initial',
  templateUrl: './page-initial.component.html',
  styleUrls: ['./page-initial.component.scss'],
})
export class PageInitialComponent implements OnInit {

  get IsUserLoggedIn(): boolean {
    return this._authService.authSubject.value.isAuthorized;
  }
  get IsHomeChosed(): boolean {
    return this._homeDefService.ChosedHome !== undefined;
  }

  constructor(private _authService: AuthService,
    public _homeDefService: HomeDefDetailService,
    private _router: Router) {
  }

  ngOnInit(): void {
    // Do nothing
  }

  public onGoHomeList(): void {
    this._router.navigate(['/homedef']);
  }

  public onGoLogin(): void {
    this._authService.doLogin();
  }
}
