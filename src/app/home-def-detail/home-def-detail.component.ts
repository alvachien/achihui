import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, HomeMember, HomeDefJson, IHomeMemberJson, UIMode, getUIModeString } from '../model';
import { AuthService, HomeDefDetailService, FinCurrencyService } from '../services';

@Component({
  selector: 'hih-home-def-detail',
  templateUrl: './home-def-detail.component.html',
  styleUrls: ['./home-def-detail.component.scss'],
})
export class HomeDefDetailComponent implements OnInit {
  private routerID: number = -1; // Current object ID in routing
  public detailObject: HomeDef | undefined;
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  isLoadingResults: boolean;

  get IsCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(private _authService: AuthService,
    public _fincurrService: FinCurrencyService,
    private _homedefService: HomeDefDetailService,
    private _dialog: MatDialog,
    private _router: Router,
    private _activateRoute: ActivatedRoute) {

    this.isLoadingResults = false;
    this.detailObject = new HomeDef();
    this._fincurrService.fetchAllCurrencies().subscribe((x: any) => {
      // Ensure the GET is fired
    });
    this._homedefService.listDataChange.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering listDataChange of HomeDefDetailComponent... ${x}`);
      }
    });
  }

  ngOnInit(): void {
    // Distinguish current mode
    this._activateRoute.url.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering HomeDefDetailComponent ngOnInit for activateRoute URL: ${x}`);
      }

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.detailObject = new HomeDef();
          this.uiMode = UIMode.Create;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Change;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);

        if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
          this.isLoadingResults = true;
          this._homedefService.readHomeDefEvent.subscribe((dtl: any) => {
            this.isLoadingResults = false;
            if (dtl !== undefined) {
              this.detailObject = dtl;
            } else {
              // Show error dialog!
            }
          });

          this._homedefService.readHomeDef(this.routerID);
        }
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOnInit in HomeDefDetailComponent with activateRoute URL : ${error}`);
      }
    }, () => {
      // Empty
    });
  }

  public canSubmit(): boolean {
    if (this.detailObject.Name === undefined || this.detailObject.Name === undefined
      || this.detailObject.Name.length <= 0) {
      return false;
    }

    if (this.detailObject.BaseCurrency === undefined || this.detailObject.BaseCurrency === undefined
      || this.detailObject.BaseCurrency.length <= 0) {
      return false;
    }

    return true;
  }

  public onSubmit(): void {
    // Submit to DB
    if (this.detailObject.ID === undefined || this.detailObject.ID === undefined) {
      this.detailObject.Host = this._authService.authSubject.value.getUserId();

      this._homedefService.createEvent.subscribe((x: any) => {
        if (x) {
          // Success!
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering onSubmit of HomeDefDetailComponent... ${x}`);
          }

          this._router.navigate(['/homedef']);
        } else {
          // Failed
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in onSubmit of HomeDefDetailComponent... ${x}`);
          }

          // Show error dialog!
        }
      });

      this._homedefService.createHomeDef(this.detailObject);
    } else {
      // Empty
    }
  }

  public onCancel(): void {
    this._router.navigate(['/']);
  }
}
