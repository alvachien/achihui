import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MdDialog } from '@angular/material';
import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, HomeMember, HomeDefJson, HomeMemberJson, UIMode } from '../model';
import { AuthService, HomeDefDetailService, FinCurrencyService } from '../services';

@Component({
  selector: 'app-home-def-detail',
  templateUrl: './home-def-detail.component.html',
  styleUrls: ['./home-def-detail.component.scss']
})
export class HomeDefDetailComponent implements OnInit {
  private routerID: number = -1; // Current object ID in routing
  public detailObject: HomeDef | null;
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;

  get IsCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(private _authService: AuthService,
    public _fincurrService: FinCurrencyService,
    private _homedefService: HomeDefDetailService,
    private _dialog: MdDialog,
    private _router: Router,
    private _activateRoute: ActivatedRoute) {

    this.detailObject = new HomeDef();
    this._fincurrService.fetchAllCurrencies();
    this._homedefService.listDataChange.subscribe((x) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering listDataChange of HomeDefDetailComponent... ${x}`);
      }
    });
  }

  ngOnInit() {
    // Distinguish current mode
    this._activateRoute.url.subscribe((x) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering HomeDefDetailComponent ngOnInit for activateRoute URL: ${x}`);
      }

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.currentMode = 'Common.Create';
          this.detailObject = new HomeDef();
          this.uiMode = UIMode.Create;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.currentMode = 'Common.Edit';
          this.uiMode = UIMode.Change;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.currentMode = 'Common.Display';
          this.uiMode = UIMode.Display;
        }

        if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
          this._homedefService.readHomeDefEvent.subscribe(x => {
            if (x !== null) {
              this.detailObject = x;
            } else {
              // Show error dialog!
            }
          });

          this._homedefService.readHomeDef(this.routerID);
        }
      }
    }, (error) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.log(`AC_HIH_UI [Error]: Entering ngOnInit in HomeDefDetailComponent with activateRoute URL : ${error}`);
      }
    }, () => {
    });

  }

  public canSubmit(): boolean {
    if (this.detailObject.Name === null || this.detailObject.Name === undefined
      || this.detailObject.Name.length <= 0) {
      return false;
    }

    if (this.detailObject.BaseCurrency === null || this.detailObject.BaseCurrency === undefined
      || this.detailObject.BaseCurrency.length <= 0) {
      return false;
    }

    return true;
  }

  public onSubmit(): void {
    // Submit to DB
    if (this.detailObject.ID === null || this.detailObject.ID === undefined) {
      this.detailObject.Host = this._authService.authSubject.value.getUserId();
      this._homedefService.createEvent.subscribe((x) => {
        if (x) {
          // Success!
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering onSubmit of HomeDefDetailComponent... ${x}`);
          }

          this._router.navigate(['/homedef']);
        } else {
          // Failed
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.log(`AC_HIH_UI [Error]: Entering onSubmit of HomeDefDetailComponent... ${x}`);
          }

          // Show error dialog!
        }
      });
      this._homedefService.createHomeDef(this.detailObject);
    } else {
    }
  }
}
