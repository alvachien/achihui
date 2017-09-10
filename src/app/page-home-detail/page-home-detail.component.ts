import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, HomeMember, HomeDefJson, HomeMemberJson } from '../model';
import { AuthService, HomeDefDetailService, FinCurrencyService } from '../services';

@Component({
  selector: 'app-page-home-detail',
  templateUrl: './page-home-detail.component.html',
  styleUrls: ['./page-home-detail.component.scss'],
})
export class PageHomeDetailComponent implements OnInit {
  currentHomeDef: HomeDef | null;

  constructor(private _authService: AuthService,
    public _fincurrService: FinCurrencyService,
    private _homedefService: HomeDefDetailService,
    private _router: Router) {
    this.currentHomeDef = new HomeDef();
    this._fincurrService.fetchAllCurrencies();
    this._homedefService.listDataChange.subscribe((x) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering listDataChange of PageHomeDetailComponent... ${x}`);
      }
    });
  }

  ngOnInit() {
  }

  public canSubmit(): boolean {
    if (this.currentHomeDef.Name === null || this.currentHomeDef.Name === undefined
      || this.currentHomeDef.Name.length <= 0) {
        return false;
    }

    if (this.currentHomeDef.BaseCurrency === null || this.currentHomeDef.BaseCurrency === undefined
      || this.currentHomeDef.BaseCurrency.length <= 0) {
        return false;
      }

    return true;
  }

  public onSubmit(): void {
    // Submit to DB
    if (this.currentHomeDef.ID === null || this.currentHomeDef.ID === undefined) {
      this.currentHomeDef.Host = this._authService.authSubject.value.getUserId();
      this._homedefService.createEvent.subscribe((x) => {
        if (x) {
          // Success!
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering onSubmit of PageHomeDetailComponent... ${x}`);
          }

          this._router.navigate(['/homelist']);
        } else {
          // Failed
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Entering onSubmit of PageHomeDetailComponent... ${x}`);
          }

          // Show error dialog!
        }
      });
      this._homedefService.createHomeDef(this.currentHomeDef);
    } else {
    }
  }
}
