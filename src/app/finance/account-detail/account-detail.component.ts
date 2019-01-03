import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, ViewChildren,
  Input, Output, ViewContainerRef, QueryList, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatSelectChange } from '@angular/material';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, UIMode, getUIModeString, financeAccountCategoryAsset,
  financeAccountCategoryAdvancePayment, financeAccountCategoryBorrowFrom,
  financeAccountCategoryLendTo, UICommonLabelEnum,
  UIDisplayString, UIDisplayStringUtil, AccountStatusEnum, financeAccountCategoryAdvanceReceived,
  AccountExtraAsset, AccountExtraAdvancePayment, AccountExtraLoan, AccountCategory, financeAccountCategoryInsurance } from '../../model';
import { HomeDefDetailService, FinanceStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { AccountExtLoanComponent } from '../account-ext-loan';
import { AccountExtADPComponent } from '../account-ext-adp';
import { AccountExtAssetComponent } from '../account-ext-asset';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'hih-finance-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  private _readStub: Subscription;
  private _createStub: Subscription;
  private _changeStub: Subscription;
  private routerID: number = -1; // Current object ID in routing
  private _compLoan: AccountExtLoanComponent;
  private _compADP: AccountExtADPComponent;
  private _compAsset: AccountExtAssetComponent;

  public currentMode: string;
  public detailObject: Account = undefined;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  arrayStatus: UIDisplayString[] = [];

  // Solution coming from: https://expertcodeblog.wordpress.com/2018/01/12/angular-resolve-error-viewchild-annotation-returns-undefined/
  @ViewChildren(AccountExtLoanComponent) childrenLoan: QueryList<AccountExtLoanComponent>;
  @ViewChildren(AccountExtADPComponent) childrenADP: QueryList<AccountExtADPComponent>;
  @ViewChildren(AccountExtAssetComponent) childrenAsset: QueryList<AccountExtAssetComponent>;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isChangeMode(): boolean {
    return this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get isAssetAccount(): boolean {
    if (this.detailObject !== undefined && (this.detailObject.CategoryId === financeAccountCategoryAsset)) {
      return true;
    }

    return false;
  }
  get isADPAccount(): boolean {
    if (this.detailObject !== undefined && (this.detailObject.CategoryId === financeAccountCategoryAdvancePayment
      || this.detailObject.CategoryId === financeAccountCategoryAdvanceReceived)) {
      return true;
    }

    return false;
  }
  get isLoanAccount(): boolean {
    if (this.detailObject !== undefined && (this.detailObject.CategoryId === financeAccountCategoryBorrowFrom
    || this.detailObject.CategoryId === financeAccountCategoryLendTo)) {
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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering constructor of AccountDetailComponent ...');
    }
    this.detailObject = new Account();

    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngOnInit of AccountDetailComponent ...');
    }

    forkJoin([
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
            this._readStub = this._storageService.readAccountEvent.subscribe((x3: any) => {
              if (x3 instanceof Account) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngOninit, succeed to readAccount : ${x3}`);
                }
                this.detailObject = x3;

                // if (this.uiMode === UIMode.Change) {
                //   if (this.detailObject.CategoryId === financeAccountCategoryAsset
                //   || this.detailObject.CategoryId === financeAccountCategoryAdvancePayment
                //   || this.detailObject.CategoryId === financeAccountCategoryBorrowFrom
                //   || this.detailObject.CategoryId === financeAccountCategoryLendTo) {
                //     this.uiMode = UIMode.Display; // Not support for those accounts yet
                //   }
                // }
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering ngOninit in AccountDetailComponent, failed to readAccount : ${x3}`);
                }
                this.detailObject = new Account();
              }
            });

            this._storageService.readAccount(this.routerID);
          }
        }
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering ngOnInit in AccountDetailComponent, failed with activateRoute: ${error.message}`);
        }
      }, () => {
        // Empty
      });
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngAfterViewInit of AccountDetailComponent ...');
    }

    this.childrenLoan.changes.subscribe((comps: QueryList<AccountExtLoanComponent>) => {
      // Now you can access to the child component
      this._compLoan = comps.first;
    });
    this.childrenADP.changes.subscribe((comps: QueryList<AccountExtADPComponent>) => {
      // Now you can access to the child component
      this._compADP = comps.first;
    });
    this.childrenAsset.changes.subscribe((comps: QueryList<AccountExtAssetComponent>) => {
      // Now you can access to the child component
      this._compAsset = comps.first;
    });
  }

  ngOnDestroy(): void {
    if (this._readStub) {
      this._readStub.unsubscribe();
    }
    if (this._createStub) {
      this._createStub.unsubscribe();
    }
    if (this._changeStub) {
      this._changeStub.unsubscribe();
    }
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

  public isCategoryDisabled(ctgy: AccountCategory): boolean {
    if (this.uiMode === UIMode.Create) {
      if (ctgy.ID === financeAccountCategoryAsset
        || ctgy.ID === financeAccountCategoryBorrowFrom
        || ctgy.ID === financeAccountCategoryLendTo
        || ctgy.ID === financeAccountCategoryAdvancePayment
        || ctgy.ID === financeAccountCategoryAdvanceReceived
        || ctgy.ID === financeAccountCategoryInsurance) {
        return true;
      }

      return false;
    }

    return false;
  }
  public canSubmit(): boolean {
    return true;
  }

  public canCloseAccount(): boolean {
    if (this.detailObject === undefined
    || this.detailObject.Status !== AccountStatusEnum.Normal) {
      return false;
    }
    return true;
  }

  public onCategorySelectionChange($event: MatSelectChange): void {
    let newctgy: number = +$event.value;
    if (newctgy === financeAccountCategoryAsset) {
      this.detailObject.ExtraInfo = new AccountExtraAsset();
    } else if (newctgy === financeAccountCategoryAdvancePayment || newctgy === financeAccountCategoryAdvanceReceived) {
      this.detailObject.ExtraInfo = new AccountExtraAdvancePayment();
    } else if (newctgy === financeAccountCategoryBorrowFrom || newctgy === financeAccountCategoryLendTo) {
      this.detailObject.ExtraInfo = new AccountExtraLoan();
    }
  }

  public onCloseAccount(): void {
    // Close the account
    this._storageService.updateAccountStatus(this.detailObject.Id, AccountStatusEnum.Closed).subscribe((x: any) => {
      // It has been updated successfully
      this._storageService.fetchAllAccounts(true).subscribe(() => {
        // Navigate to current account again
        this._router.navigate(['/finance/account/display/' + x.Id.toString()]);
      });
    }, (error: HttpErrorResponse) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering onCloseAccount in AccountDetailComponent, failed: ${error.message}`);
      }
      // Show the snabckbar
    }, () => {
      // Do nothing
    });
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
    if (!this._createStub) {
      this._createStub = this._storageService.createAccountEvent.subscribe((x: any) => {
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
  
      if (this.detailObject.CategoryId === financeAccountCategoryAsset) {
        if (this._compAsset) {
          this._compAsset.generateAccountInfoForSave();
        }
      }
    }

    this._storageService.createAccount(this.detailObject);
  }

  private onUpdateImpl(): void {
    if (!this._changeStub) {
      this._changeStub = this._storageService.changeAccountEvent.subscribe((x: any) => {
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
  
      if (this.detailObject.CategoryId === financeAccountCategoryLendTo
        || this.detailObject.CategoryId === financeAccountCategoryBorrowFrom) {
        if (this._compLoan) {
          this._compLoan.generateAccountInfoForSave();
        }
      }
      if (this.detailObject.CategoryId === financeAccountCategoryAdvancePayment
        || this.detailObject.CategoryId === financeAccountCategoryAdvanceReceived) {
        if (this._compADP) {
          this._compADP.generateAccountInfoForSave();
        }
      }
      if (this.detailObject.CategoryId === financeAccountCategoryAsset) {
        if (this._compAsset) {
          this._compAsset.generateAccountInfoForSave();
        }
      }  
    }

    this._storageService.changeAccount(this.detailObject);
  }
}
