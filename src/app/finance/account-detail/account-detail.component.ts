import { Component, OnInit, OnDestroy, AfterViewInit, QueryList, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatSelectChange, MatHorizontalStepper } from '@angular/material';
import { Observable, forkJoin, Subscription, ReplaySubject, } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Account, UIMode, getUIModeString, financeAccountCategoryAsset,
  financeAccountCategoryAdvancePayment, financeAccountCategoryBorrowFrom,
  financeAccountCategoryLendTo, UICommonLabelEnum,
  UIDisplayString, UIDisplayStringUtil, AccountStatusEnum, financeAccountCategoryAdvanceReceived,
  AccountExtraAsset, AccountExtraAdvancePayment, AccountExtraLoan, AccountCategory,
  financeAccountCategoryInsurance, AccountExtra, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-finance-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private routerID: number = -1; // Current object ID in routing

  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  arrayStatus: UIDisplayString[] = [];
  extObject: AccountExtra;

  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  get firstStepCompleted(): boolean {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountDetailComponent firstStepCompleted...');
    }
    if (this.isFieldChangable) {
      if (!(this.firstFormGroup && this.firstFormGroup.valid)) {
        return false;
      }

      if (this.isCategoryDisabled(this.currentCategory)) {
        return false;
      }
    }

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountDetailComponent firstStepCompleted: !!!NOW TRUE!!!');
    }
    return true;
  }
  // Step: Extra
  get extraStepCompleted(): boolean {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountDetailComponent extraStepCompleted...');
    }
    if (this.isFieldChangable) {
      // Check the extra part
      if (this.isADPAccount) {
        if (!(this.extraADPFormGroup && this.extraADPFormGroup.valid)) {
          return false;
        }
      } else if (this.isLoanAccount) {
        if (!(this.extraLoanFormGroup && this.extraLoanFormGroup.valid)) {
          return false;
        }
      } else if (this.isAssetAccount) {
        if (!(this.extraAssetFormGroup && this.extraAssetFormGroup.valid)) {
          return false;
        }
      }
    }

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountDetailComponent extraStepCompleted: !!!NOW TRUE!!!');
    }
    return true;
  }
  public extraADPFormGroup: FormGroup;
  public extraAssetFormGroup: FormGroup;
  public extraLoanFormGroup: FormGroup;
  // Step: Status
  public statusFormGroup: FormGroup;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get currentCategory(): number {
    return this.firstFormGroup.get('ctgyControl').value;
  }
  get isAssetAccount(): boolean {
    if (this.currentCategory === financeAccountCategoryAsset) {
      return true;
    }

    return false;
  }
  get isADPAccount(): boolean {
    if (this.currentCategory === financeAccountCategoryAdvancePayment
      || this.currentCategory === financeAccountCategoryAdvanceReceived) {
      return true;
    }

    return false;
  }
  get isLoanAccount(): boolean {
    if (this.currentCategory === financeAccountCategoryBorrowFrom
      || this.currentCategory === financeAccountCategoryLendTo) {
      return true;
    }

    return false;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountDetailComponent constructor...');
    }

    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    // Create controls
    this.firstFormGroup = this._formBuilder.group({
      nameControl: ['', Validators.required],
      ctgyControl: ['', Validators.required],
      ownerControl: '',
      cmtControl: '',
    });
    this.extraADPFormGroup = this._formBuilder.group({
      extADPControl: '',
    });
    this.extraAssetFormGroup = this._formBuilder.group({
      extAssetControl: '',
    });
    this.extraLoanFormGroup = this._formBuilder.group({
      extLoanControl: '',
    });
    this.statusFormGroup = this._formBuilder.group({
      statusControl: [{value: AccountStatusEnum.Normal, disable: true}, Validators.required],
    });

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAssetCategories(),
    ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe((rst: any) => {
      // Distinguish current mode
      this._activateRoute.url.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering AccountDetailComponent ngOnInit for activateRoute URL: ${x}`);
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
            this._storageService.readAccount(this.routerID)
              .pipe(takeUntil(this._destroyed$))
              .subscribe((x3: Account) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering AccountDetailComponent ngOninit, readAccount: ${x3}`);
                }
                this._displayAccountContent(x3);
              }, (error: any) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering Entering AccountDetailComponent ngOninit, readAccount failed: ${error}`);
                }

                this._snackbar.open(error.toString(), undefined, {
                  duration: 2000,
                });
                this.uiMode = UIMode.Invalid;
              }, () => {
                // Nothing
              });
          }
        }
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering AccountDetailComponent ngOnInit, failed with activateRoute: ${error.toString()}`);
      }

      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountDetailComponent ngAfterViewInit...');
    }
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public isCategoryDisabled(ctgyid: number): boolean {
    if (this.uiMode === UIMode.Create) {
      if (ctgyid === financeAccountCategoryAsset
        || ctgyid === financeAccountCategoryBorrowFrom
        || ctgyid === financeAccountCategoryLendTo
        || ctgyid === financeAccountCategoryAdvancePayment
        || ctgyid === financeAccountCategoryAdvanceReceived
        || ctgyid === financeAccountCategoryInsurance) {
        return true;
      }

      return false;
    }

    return false;
  }

  public onCategorySelectionChange($event: MatSelectChange): void {
    let newctgy: number = +$event.value;
    if (newctgy === financeAccountCategoryAsset) {
      this.extObject = new AccountExtraAsset();
    } else if (newctgy === financeAccountCategoryAdvancePayment || newctgy === financeAccountCategoryAdvanceReceived) {
      this.extObject = new AccountExtraAdvancePayment();
    } else if (newctgy === financeAccountCategoryBorrowFrom || newctgy === financeAccountCategoryLendTo) {
      this.extObject = new AccountExtraLoan();
    }
  }

  public onCloseAccount(): void {
    // Close the account
    this._storageService.updateAccountStatus(this.routerID, AccountStatusEnum.Closed).subscribe((x: any) => {
      // It has been updated successfully, then navigate to current account again
        this._router.navigate(['/finance/account/display/' + x.Id.toString()]);
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering AccountDetailComponent onCloseAccount, updateAccountStatus failed: ${error.message}`);
      }

      // Show the snabckbar
      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      this.onCreateImpl();
    } else if (this.uiMode === UIMode.Change) {
      this.onUpdateImpl();
    }
  }

  public onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
  }

  private onCreateImpl(): void {
    let acntObj: Account = this._generateAccount();

    this._storageService.createAccount(acntObj)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: Account) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering AccountDetailComponent createAccount succeed`);
      }

      // Show the snackbar
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess),
        this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 3000,
        });

      let recreate: boolean = false;
      snackbarRef.onAction().subscribe(() => {
        recreate = true;

        this.onReset();
      });

      snackbarRef.afterDismissed().subscribe(() => {
        // Navigate to display
        if (!recreate) {
          this._router.navigate(['/finance/account/display/' + x.Id.toString()]);
        }
      });
    }, (error: any) => {
      // Show error message
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
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

  private onUpdateImpl(): void {
    let acntObj: Account = this._generateAccount();
    this._storageService.changeAccount(acntObj)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering AccountDetailComponent, onUpdateImpl, changeAccountEvent with : ${x}`);
      }

      // Navigate back to display
      if (x instanceof Account) {
        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.UpdatedSuccess),
          undefined, {
            duration: 2000,
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
        });
      }
    });
  }

  private _displayAccountContent(objAcnt: Account): void {
    this.firstFormGroup.get('nameControl').setValue(objAcnt.Name);
    this.firstFormGroup.get('ctgyControl').setValue(objAcnt.CategoryId);
    if (objAcnt.OwnerId) {
      this.firstFormGroup.get('ownerControl').setValue(objAcnt.OwnerId);
    }
    if (objAcnt.Comment) {
      this.firstFormGroup.get('cmtControl').setValue(objAcnt.Comment);
    }
    this.statusFormGroup.get('statusControl').setValue(objAcnt.Status);

    if (!this.isFieldChangable) {
      this.firstFormGroup.disable();
    } else {
      this.firstFormGroup.enable();
    }
  }

  private _generateAccount(): Account {
    let acntObj: Account = new Account();
    acntObj.Name = this.firstFormGroup.get('nameControl').value;
    acntObj.CategoryId = this.currentCategory;
    acntObj.OwnerId = this.firstFormGroup.get('ownerControl').value;
    acntObj.Comment = this.firstFormGroup.get('cmtControl').value;
    acntObj.Status = this.statusFormGroup.get('statusControl').value;

    return acntObj;
  }
}
