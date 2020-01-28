import { Component, OnInit, OnDestroy, QueryList, ViewChild, ChangeDetectorRef, } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, Subscription, ReplaySubject, } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LogLevel, Account, UIMode, getUIModeString, financeAccountCategoryAsset,
  financeAccountCategoryAdvancePayment, financeAccountCategoryBorrowFrom,
  financeAccountCategoryLendTo, UICommonLabelEnum,
  UIDisplayString, UIDisplayStringUtil, AccountStatusEnum, financeAccountCategoryAdvanceReceived,
  AccountExtraAsset, AccountExtraAdvancePayment, AccountExtraLoan, AccountCategory,
  financeAccountCategoryInsurance, AccountExtra, IAccountVerifyContext, } from '../../../../model';
import { HomeDefOdataService, FinanceOdataService, UIStatusService } from '../../../../services';

@Component({
  selector: 'hih-fin-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.less'],
})
export class AccountDetailComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  public routerID = -1; // Current object ID in routing
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  arrayStatus: UIDisplayString[] = [];
  extObject: AccountExtra;
  arAccountCategories: AccountCategory[] = [];

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(
    public odataService: FinanceOdataService,
    public activateRoute: ActivatedRoute,
    public homeSevice: HomeDefOdataService,
  ) { }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAssetCategories(),
    ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe((rst: any) => {
      this.arAccountCategories = rst[0];

      // Distinguish current mode
      this.activateRoute.url.subscribe((x: any) => {
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
            this.odataService.readAccount(this.routerID)
              .pipe(takeUntil(this._destroyed$))
              .subscribe((x3: Account) => {
                this._displayAccountContent(x3);
                this.firstFormGroup.markAsPristine();
                this.extraADPFormGroup.markAsPristine();
                this.extraAssetFormGroup.markAsPristine();
                this.extraLoanFormGroup.markAsPristine();
                this.statusFormGroup.markAsPristine();

                // this._changeDetector.detectChanges();
              }, (error: any) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering Entering AccountDetailComponent ngOninit, readAccount failed: ${error}`);
                }

                // popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString());
                this.uiMode = UIMode.Invalid;
              });
          } else {
            // this._changeDetector.detectChanges();
          }
        }
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering AccountDetailComponent ngOnInit, failed with activateRoute: ${error.toString()}`);
      }

      // popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString());
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

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      // this.onCreateImpl();
    } else if (this.uiMode === UIMode.Change) {
      // this.onUpdateImpl();
    }
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
    const acntObj: Account = new Account();
    acntObj.HID = this.homeSevice.ChosedHome.ID;

    acntObj.Name = this.headerFormGroup.get('nameControl').value;
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
