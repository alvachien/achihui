import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, Currency, UICommonLabelEnum, UIMode, getUIModeString, HomeMember } from '../model';
import { AuthService, HomeDefDetailService, FinCurrencyService, UIStatusService } from '../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../message-dialog';

@Component({
  selector: 'hih-home-def-detail',
  templateUrl: './home-def-detail.component.html',
  styleUrls: ['./home-def-detail.component.scss'],
})
export class HomeDefDetailComponent implements OnInit, OnDestroy {
  private routerID: number = -1; // Current object ID in routing
  private _destroyed$: ReplaySubject<boolean>;

  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  public isLoadingResults: boolean;
  public arCurrencies: Currency[] = [];
  public detailForm: FormGroup;
  public arMembers: HomeMember[] = [];

  get IsCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(private _authService: AuthService,
    private _fincurrService: FinCurrencyService,
    private _homedefService: HomeDefDetailService,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _uiService: UIStatusService,
    private _router: Router,
    private _activateRoute: ActivatedRoute) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering HomeDefDetailComponent constructor`);
    }

    this.detailForm = new FormGroup({
      nameControl: new FormControl('', Validators.required),
      creatorDisplayAsControl: new FormControl('', Validators.required),
      baseCurrControl: new FormControl('', Validators.required),
      hostControl: new FormControl({value: this._authService.authSubject.getValue().getUserId(), disable: true }, Validators.required),
      detailControl: new FormControl(''),
    });
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering HomeDefDetailComponent ngOnInit`);
    }

    this._destroyed$ = new ReplaySubject(1);

    this._fincurrService.fetchAllCurrencies()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((curries: Currency[]) => {
      this.arCurrencies = curries;

      // Distinguish current mode
      this._activateRoute.url.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering HomeDefDetailComponent ngOnInit for activateRoute URL`);
        }

        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'create') {
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

            this._homedefService.readHomeDef(this.routerID)
              .pipe(takeUntil(this._destroyed$))
              .subscribe((dtl: HomeDef) => {

              this.isLoadingResults = false;
              this.detailForm.get('nameControl').setValue(dtl.Name);
              this.detailForm.get('creatorDisplayAsControl').setValue(dtl.CreatorDisplayAs);
              this.detailForm.get('baseCurrControl').setValue(dtl.BaseCurrency);
              this.detailForm.get('hostControl').setValue(dtl.Host);
              this.detailForm.get('detailControl').setValue(dtl.Details);
              this.detailForm.markAsUntouched();
              this.detailForm.markAsPristine();

              this.arMembers = dtl.Members.slice();
            }, (error: any) => {
              this.isLoadingResults = false;

              // Show error dialog
              const dlginfo: MessageDialogInfo = {
                Header: this._uiService.getUILabel(UICommonLabelEnum.Error),
                Content: error.toString(),
                Button: MessageDialogButtonEnum.onlyok,
              };

              this._dialog.open(MessageDialogComponent, {
                disableClose: false,
                width: '500px',
                data: dlginfo,
              });
            });
          }
        }
      });
    }, (error: any) => {
      // Show error dialog
      const dlginfo: MessageDialogInfo = {
        Header: this._uiService.getUILabel(UICommonLabelEnum.Error),
        Content: error.toString(),
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering FinanceCurrencyComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onSubmit(): void {
    // Submit to DB
    let dtobj: HomeDef = this._generateHomeDefObject();
    if (!dtobj.isValid) {
      // Shall not call here!
      return;
    }

    if (this.uiMode === UIMode.Create) {
      this._homedefService.createHomeDef(dtobj).subscribe((x: HomeDef) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering HomeDefDetailComponent, createHomeDef, succeed...`);
        }

        this._snackbar.open(this._uiService.getUILabel(UICommonLabelEnum.CreatedSuccess), undefined, {
          duration: 2000,
        }).afterDismissed().subscribe(() => {
          this._router.navigate(['/homedef/' + x.ID.toString()]);
        });
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering HomeDefDetailComponent, onSubmit, createHomeDef, failed: ${error}`);
        }

        // Show error dialog
        const dlginfo: MessageDialogInfo = {
          Header: this._uiService.getUILabel(UICommonLabelEnum.Error),
          Content: error.toString(),
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        });
      });
    }
  }

  public onCancel(): void {
    this._router.navigate(['/']);
  }

  private _generateHomeDefObject(): HomeDef {
    let hdobj: HomeDef = new HomeDef();
    hdobj.Name = this.detailForm.get('nameControl').value;
    hdobj.CreatorDisplayAs = this.detailForm.get('creatorDisplayAsControl').value;
    hdobj.BaseCurrency = this.detailForm.get('baseCurrControl').value;
    hdobj.Host = this.detailForm.get('hostControl').value;
    hdobj.Details = this.detailForm.get('detailControl').value;

    return hdobj;
  }
}
