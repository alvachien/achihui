import { Component, OnInit, OnDestroy, QueryList, ViewChild, ChangeDetectorRef, } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, Subscription, ReplaySubject, } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { Account, UIMode, getUIModeString, financeAccountCategoryAsset,
  financeAccountCategoryAdvancePayment, financeAccountCategoryBorrowFrom,
  financeAccountCategoryLendTo, UICommonLabelEnum, ModelUtility,
  UIDisplayString, UIDisplayStringUtil, AccountStatusEnum, financeAccountCategoryAdvanceReceived,
  AccountExtraAsset, AccountExtraAdvancePayment, AccountExtraLoan, AccountCategory,
  financeAccountCategoryInsurance, AccountExtra, IAccountVerifyContext, ConsoleLogTypeEnum, AssetCategory,
  UIAccountForSelection, TranType, HomeMember,
} from '../../../../model';
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
  arStatusDisplayStrings: UIDisplayString[] = [];
  arMembers: HomeMember[] = [];
  arAccountCategories: AccountCategory[] = [];
  arAssetCategories: AssetCategory[] = [];
  // Header forum
  public headerFormGroup: FormGroup;
  // Extra form group
  public extraADPFormGroup: FormGroup;
  public extraAssetFormGroup: FormGroup;
  public extraLoanFormGroup: FormGroup;
  // Additional binding info.
  public tranAmount: number;
  public controlCenterID?: number;
  public orderID?: number;
  public arUIAccount: UIAccountForSelection[] = [];
  public arTranTypes: TranType[] = [];
  public tranType: number;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get currentCategory(): number {
    return this.headerFormGroup.get('ctgyControl').value;
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

  constructor(
    public odataService: FinanceOdataService,
    public activateRoute: ActivatedRoute,
    public homeSevice: HomeDefOdataService,
    public uiStatusService: UIStatusService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountDetailComponent constructor`,
      ConsoleLogTypeEnum.debug);

    this.arStatusDisplayStrings = UIDisplayStringUtil.getAccountStatusStrings();
    this.arMembers = this.homeSevice.ChosedHome.Members;

    this.headerFormGroup = new FormGroup({
      idControl: new FormControl(),
      nameControl: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      ctgyControl: new FormControl(undefined, [Validators.required]),
      cmtControl: new FormControl('', Validators.maxLength(45)),
      statusControl: new FormControl(),
      ownerControl: new FormControl(),
    });

    this.extraADPFormGroup = new FormGroup({
      extADPControl: new FormControl()
    });
    this.extraAssetFormGroup = new FormGroup({
      extAssetControl: new FormControl()
    });
    this.extraLoanFormGroup = new FormGroup({
      extLoanControl: new FormControl()
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountDetailComponent ngOnInit`,
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

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
      }

      switch (this.uiMode) {
        case UIMode.Change:
        case UIMode.Display: {
          forkJoin([
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllAssetCategories(),
            this.odataService.fetchAllTranTypes(),
            this.odataService.readAccount(this.routerID)
          ])
          .pipe(takeUntil(this._destroyed$))
          .subscribe((rst: any[]) => {
            this.arAccountCategories = rst[0];
            this.arAssetCategories = rst[1];
            this.arTranTypes = rst[2];
            this._displayAccountContent(rst[3]);
            this.headerFormGroup.markAsPristine();
            this.extraADPFormGroup.markAsPristine();
            this.extraAssetFormGroup.markAsPristine();
            this.extraLoanFormGroup.markAsPristine();

            if (this.uiMode === UIMode.Display) {
              this.headerFormGroup.disable();
              this.extraADPFormGroup.disable();
              this.extraAssetFormGroup.disable();
              this.extraLoanFormGroup.disable();
            }
          }, (error: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountDetailComponent ngOninit, readAccount failed: ${error}`,
              ConsoleLogTypeEnum.error);

            this.uiMode = UIMode.Invalid;
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: error,
              nzClosable: true,
            });
          });
          break;
        }

        case UIMode.Create:
        default: {
          this.odataService.fetchAllAccountCategories()
            .pipe(takeUntil(this._destroyed$))
            .subscribe((rst: any) => {
            this.arAccountCategories = rst;
          }, (error: any) => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountDetailComponent ngOnInit, failed with activateRoute: ${error.toString()}`,
              ConsoleLogTypeEnum.error);

            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: error,
              nzClosable: true,
            });
          });
          break;
        }
      }
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountDetailComponent ngOnDestroy`,
      ConsoleLogTypeEnum.debug);

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
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountDetailComponent onSubmit`,
      ConsoleLogTypeEnum.debug);
    if (this.uiMode === UIMode.Create) {
      // this.onCreateImpl();
    } else if (this.uiMode === UIMode.Change) {
      // this.onUpdateImpl();
    }
  }

  private _displayAccountContent(objAcnt: Account): void {
    // Step 0.
    this.headerFormGroup.reset();
    this.headerFormGroup.get('idControl').setValue(objAcnt.Id);
    this.headerFormGroup.get('nameControl').setValue(objAcnt.Name);
    this.headerFormGroup.get('ctgyControl').setValue(objAcnt.CategoryId);
    if (objAcnt.OwnerId) {
      this.headerFormGroup.get('ownerControl').setValue(objAcnt.OwnerId);
    }
    if (objAcnt.Comment) {
      this.headerFormGroup.get('cmtControl').setValue(objAcnt.Comment);
    }
    this.headerFormGroup.get('statusControl').setValue(objAcnt.Status);
    // Step 1.
    if (this.isADPAccount) {
      this.extraADPFormGroup.get('extADPControl').setValue(objAcnt.ExtraInfo as AccountExtraAdvancePayment);
    } else if (this.isAssetAccount) {
      this.extraAssetFormGroup.get('extAssetControl').setValue(objAcnt.ExtraInfo as AccountExtraAsset);
    } else if (this.isLoanAccount) {
      this.extraLoanFormGroup.get('extLoanControl').setValue(objAcnt.ExtraInfo as AccountExtraLoan);
    }
  }

  private _generateAccount(): Account {
    const acntObj: Account = new Account();
    acntObj.HID = this.homeSevice.ChosedHome.ID;

    acntObj.Name = this.headerFormGroup.get('nameControl').value;
    acntObj.CategoryId = this.currentCategory;
    acntObj.OwnerId = this.headerFormGroup.get('ownerControl').value;
    acntObj.Comment = this.headerFormGroup.get('cmtControl').value;
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
    // acntObj.Status = this.statusFormGroup.get('statusControl').value;

    return acntObj;
  }
  private categoryValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
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
