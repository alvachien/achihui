import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, UIMode, getUIModeString, FinanceAccountCategory_Asset, 
  FinanceAccountCategory_AdvancePayment, FinanceAccountCategory_Loan, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-finance-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: Account = undefined;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService) {
    this.detailObject = new Account();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngOnInit of AccountDetailComponent ...');
    }

    Observable.forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAssetCategories(),
    ]).subscribe((rst: any) => {
      // Distinguish current mode
      this._activateRoute.url.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering AccountDetailComponent ngOnInit for activateRoute URL: ${x}`);
        }

        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'create') {
            this.onInitCreateMode();
          } else if (x[0].path === 'edit') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'display') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readAccountEvent.subscribe((x3: any) => {
              if (x3 instanceof Account) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngOninit, succeed to readAccount : ${x3}`);
                }
                this.detailObject = x3;

                if (this.uiMode === UIMode.Change) {
                  if (this.detailObject.CategoryId === FinanceAccountCategory_Asset
                  || this.detailObject.CategoryId === FinanceAccountCategory_AdvancePayment
                  || this.detailObject.CategoryId === FinanceAccountCategory_Loan) {
                    this.uiMode = UIMode.Display; // Not support for those accounts yet
                  }
                }
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.log(`AC_HIH_UI [Error]: Entering ngOninit, failed to readAccount : ${x3}`);
                }
                this.detailObject = new Account();
              }
            });

            this._storageService.readAccount(this.routerID);
          }
        }
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Entering ngOnInit in AccountDetailComponent with activateRoute URL : ${error}`);
        }
      }, () => {
        // Empty
      });
    });
  }

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isAssetAccount(): boolean {
    if (this.detailObject !== null && (this.detailObject.CategoryId === FinanceAccountCategory_Asset)) {
      return true;
    }

    return false;
  }
  get isADPAccount(): boolean {
    if (this.detailObject !== null && (this.detailObject.CategoryId === FinanceAccountCategory_AdvancePayment)) {
      return true;
    }

    return false;
  }
  get isLoanAccount(): boolean {
    if (this.detailObject !== null && (this.detailObject.CategoryId === FinanceAccountCategory_Loan)) {
      return true;
    }

    return false;
  }

  public setStep(index: number): void {
    this.step = index;
  }

  public nextStep(): void {
    this.step++;
  }

  public prevStep(): void {
    this.step--;
  }

  public canSubmit(): boolean {
    return true;
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      this.onCreateImpl();
    } else if (this.uiMode === UIMode.Change) {
      this.onUpdateImpl();
    }
  }

  private onInitCreateMode(): void {
    this.detailObject = new Account();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }

  private onCreateImpl(): void {
    this._storageService.createAccountEvent.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Receiving createAccountEvent in AccountDetailComponent with : ${x}`);
      }

      // Navigate back to list view
      if (x instanceof Account) {
        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess),
          this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 3000,
        });

        let recreate: boolean = false;
        snackbarRef.onAction().subscribe(() => {
          recreate = true;

          this.onInitCreateMode();
          this.setStep(0);
        });

        snackbarRef.afterDismissed().subscribe(() => {
          // Navigate to display
          if (!recreate) {
            this._router.navigate(['/finance/account/display/' + x.Id.toString()]);
          }
        });
      } else {
        // Show error message
        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: x.toString(),
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        }).afterClosed().subscribe((x2: any) => {
          // Do nothing!
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
          }
        });
      }
    });

    this._storageService.createAccount(this.detailObject);
  }

  private onUpdateImpl(): void {
    this._storageService.changeAccountEvent.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Receiving changeAccountEvent in AccountDetailComponent with : ${x}`);
      }

      // Navigate back to list view
      if (x instanceof Account) {
        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.UpdatedSuccess),
          'OK', {
          duration: 3000,
        });

        snackbarRef.onAction().subscribe(() => {
          this.onInitCreateMode();
          this.setStep(0);
        });

        snackbarRef.afterDismissed().subscribe(() => {
          // Navigate to display
          this._router.navigate(['/finance/account/display/' + x.Id.toString()]);
        });
      } else {
        // Show error message
        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: x.toString(),
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        }).afterClosed().subscribe((x2: any) => {
          // Do nothing!
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
          }
        });
      }
    });

    this._storageService.changeAccount(this.detailObject);
  }
}
