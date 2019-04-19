import { Component, OnInit, OnDestroy, QueryList, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
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
  financeAccountCategoryInsurance, AccountExtra, IAccountVerifyContext, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';
import { popupDialog } from '../../message-dialog';

@Component({
  selector: 'hih-finance-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  public routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  arrayStatus: UIDisplayString[] = [];
  extObject: AccountExtra;
  arAccountCategories: AccountCategory[] = [];

  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Extra
  get extraStepCompleted(): boolean {
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
    return this.firstFormGroup && this.firstFormGroup.get('ctgyControl').value;
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
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService) {
    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.firstFormGroup = new FormGroup({
      nameControl: new FormControl('', Validators.required),
      ctgyControl: new FormControl('', Validators.required),
      ownerControl: new FormControl(''),
      cmtControl: new FormControl(''),
    }, this._categoryValidator);
    this.extraADPFormGroup = new FormGroup({
      extADPControl: new FormControl(''),
    });
    this.extraAssetFormGroup = new FormGroup({
      extAssetControl: new FormControl(''),
    });
    this.extraLoanFormGroup = new FormGroup({
      extLoanControl: new FormControl(''),
    });
    this.statusFormGroup = new FormGroup({
      statusControl: new FormControl({value: AccountStatusEnum.Normal, disable: true}, Validators.required),
    });
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAssetCategories(),
    ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe((rst: any) => {
      this.arAccountCategories = rst[0];

      // Distinguish current mode
      this._activateRoute.url.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering AccountDetailComponent ngOnInit for activateRoute URL: ${x}`);
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
                  console.debug(`AC_HIH_UI [Debug]: Entering AccountDetailComponent ngOninit, readAccount: ${x3}`);
                }
                this._displayAccountContent(x3);
                this.firstFormGroup.markAsPristine();
                this.extraADPFormGroup.markAsPristine();
                this.extraAssetFormGroup.markAsPristine();
                this.extraLoanFormGroup.markAsPristine();
                this.statusFormGroup.markAsPristine();
              }, (error: any) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering Entering AccountDetailComponent ngOninit, readAccount failed: ${error}`);
                }

                this._snackbar.open(error.toString(), undefined, {
                  duration: 2000,
                });
                this.uiMode = UIMode.Invalid;
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

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public isCategoryDisabled(ctgyid: number): boolean {
    if (this.uiMode === UIMode.Create && (ctgyid === financeAccountCategoryAsset
        || ctgyid === financeAccountCategoryBorrowFrom
        || ctgyid === financeAccountCategoryLendTo
        || ctgyid === financeAccountCategoryAdvancePayment
        || ctgyid === financeAccountCategoryAdvanceReceived
        || ctgyid === financeAccountCategoryInsurance) ) {
      return true;
    }

    return false;
  }

  public onCloseAccount(): void {
    // TBD.
    // Popup a warning dialog?!

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
    this.firstFormGroup.reset();
    this.statusFormGroup.get('statusControl').setValue(AccountStatusEnum.Normal);
  }

  private onCreateImpl(): void {
    let acntObj: Account = this._generateAccount();
    if (!acntObj.onVerify({
      Categories: this.arAccountCategories,
    } as IAccountVerifyContext)) {
      // TBD.
      // Popup dialog
      return;
    }

    this._storageService.createAccount(acntObj)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: Account) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering AccountDetailComponent createAccount succeed`);
      }

      // Show the snackbar
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess),
        this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 2000,
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
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString());
    });
  }

  private onUpdateImpl(): void {
    let acntObj: Account = this._generateAccount();
    if (!acntObj.onVerify({
      Categories: this.arAccountCategories,
    } as IAccountVerifyContext)) {
      // TBD.
      // Popup dialog!
      return;
    }

    this._storageService.changeAccount(acntObj)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering AccountDetailComponent, onUpdateImpl, changeAccountEvent with : ${x}`);
      }
      // Show the snackbar
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.UpdatedSuccess),
        undefined, {
          duration: 2000,
        });

      snackbarRef.afterDismissed().subscribe(() => {
        // Navigate to display
        this._router.navigate(['/finance/account/display/' + x.Id.toString()]);
      });
    }, (error: any) => {
      // Show error message
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString());
    });
  }

  private _displayAccountContent(objAcnt: Account): void {
    // Step 0.
    this.firstFormGroup.reset();
    this.firstFormGroup.get('nameControl').setValue(objAcnt.Name);
    this.firstFormGroup.get('ctgyControl').setValue(objAcnt.CategoryId);
    if (objAcnt.OwnerId) {
      this.firstFormGroup.get('ownerControl').setValue(objAcnt.OwnerId);
    }
    if (objAcnt.Comment) {
      this.firstFormGroup.get('cmtControl').setValue(objAcnt.Comment);
    }
    if (!this.isFieldChangable) {
      this.firstFormGroup.disable();
    } else {
      this.firstFormGroup.enable();
    }
    // Step 1.
    if (this.isADPAccount) {
      this.extraADPFormGroup.get('extADPControl').setValue(objAcnt.ExtraInfo as AccountExtraAdvancePayment);
      if (!this.isFieldChangable) {
        this.extraADPFormGroup.disable();
      } else {
        this.extraADPFormGroup.enable();
      }
    } else if (this.isAssetAccount) {
      this.extraAssetFormGroup.get('extAssetControl').setValue(objAcnt.ExtraInfo as AccountExtraAsset);
      if (!this.isFieldChangable) {
        this.extraAssetFormGroup.disable();
      } else {
        this.extraAssetFormGroup.enable();
      }
    } else if (this.isLoanAccount) {
      this.extraLoanFormGroup.get('extLoanControl').setValue(objAcnt.ExtraInfo as AccountExtraLoan);
      if (!this.isFieldChangable) {
        this.extraLoanFormGroup.disable();
      } else {
        this.extraLoanFormGroup.enable();
      }
    }
    // Step 2.
    this.statusFormGroup.get('statusControl').setValue(objAcnt.Status);
  }

  private _generateAccount(): Account {
    let acntObj: Account = new Account();
    acntObj.HID = this._homedefService.ChosedHome.ID;

    acntObj.Name = this.firstFormGroup.get('nameControl').value;
    acntObj.CategoryId = this.currentCategory;
    acntObj.OwnerId = this.firstFormGroup.get('ownerControl').value;
    acntObj.Comment = this.firstFormGroup.get('cmtControl').value;
    if (this.isADPAccount) {
      // ADP
      acntObj.ExtraInfo = this.extraADPFormGroup.get('extADPControl').value;
    } else if (this.isAssetAccount) {
      // Asset
      acntObj.ExtraInfo = this.extraAssetFormGroup.get('extAssetControl').value;
    } else if (this.isLoanAccount) {
      // Loan
      acntObj.ExtraInfo = this.extraLoanFormGroup.get('extLoanControl').value;
    }
    acntObj.Status = this.statusFormGroup.get('statusControl').value;

    return acntObj;
  }
  private _categoryValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    const ctgy: any = group.get('ctgyControl').value;
    if (ctgy && this.isFieldChangable) {
      if (this.isCategoryDisabled(ctgy)) {
        return { invalidcategory: true };
      }
    } else {
      return { invalidcategory: true };
    }
    return null;
  }
}
