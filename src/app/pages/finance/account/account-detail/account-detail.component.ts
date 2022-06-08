import { Component, OnInit, OnDestroy, QueryList, ViewChild, ChangeDetectorRef, AfterViewInit, } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl, } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, Subscription, ReplaySubject, } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { UIMode, isUIEditable } from 'actslib';
import * as moment from 'moment';

import { Account, getUIModeString, financeAccountCategoryAsset,
  financeAccountCategoryAdvancePayment, financeAccountCategoryBorrowFrom,
  financeAccountCategoryLendTo, UICommonLabelEnum, ModelUtility,
  UIDisplayString, UIDisplayStringUtil, AccountStatusEnum, financeAccountCategoryAdvanceReceived,
  AccountExtraAsset, AccountExtraAdvancePayment, AccountExtraLoan, AccountCategory,
  financeAccountCategoryInsurance, AccountExtra, IAccountVerifyContext, ConsoleLogTypeEnum, AssetCategory,
  UIAccountForSelection, TranType, HomeMember, financeAccountCategoryCash, financeAccountCategoryDeposit, 
  financeAccountCategoryCreditCard, financeAccountCategoryAccountPayable, financeAccountCategoryAccountReceivable,
  financeAccountCategoryVirtual, Document, financeDocTypeNormal, DocumentItem, ControlCenter, UIOrderForSelection, 
  BuildupOrderForSelection,
  financeTranTypeOpeningAsset,
  financeTranTypeOpeningLiability,
} from '../../../../model';
import { HomeDefOdataService, FinanceOdataService, UIStatusService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';
import { AccountExtraDownpaymentComponent } from '../account-extra-downpayment';
import { AccountExtraLoanComponent } from '../account-extra-loan';
import { AccountExtraAssetComponent } from '../account-extra-asset';
import { costObjectValidator } from 'src/app/uimodel';

@Component({
  selector: 'hih-fin-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.less'],
})
export class AccountDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean = false;
  public routerID = -1; // Current object ID in routing
  public currentMode: string = '';
  public uiMode: UIMode = UIMode.Create;
  arStatusDisplayStrings: UIDisplayString[] = [];
  arMembers: HomeMember[] = [];
  arAccountCategories: AccountCategory[] = [];
  arAssetCategories: AssetCategory[] = [];
  // Header forum
  public headerFormGroup: FormGroup;
  // Amount form
  public isInitAmountRequired: boolean = false;
  public amountFormGroup: FormGroup;
  private _arControlCenters: ControlCenter[] = [];
  private _arUIOrders: UIOrderForSelection[] = [];
  // Extra form group
  public extraADPFormGroup: FormGroup;
  public extraAssetFormGroup: FormGroup;
  public extraLoanFormGroup: FormGroup;
  // Additional binding info.
  public tranAmount: number = 0;
  public controlCenterID?: number;
  public orderID?: number;
  public arUIAccount: UIAccountForSelection[] = [];
  public arTranTypes: TranType[] = [];
  public tranType?: number;

  @ViewChild('extraADP', { static: false })
  compExtraADP?: AccountExtraDownpaymentComponent;
  @ViewChild('extraLoan', { static: false })
  compExtraLoan?: AccountExtraLoanComponent;
  @ViewChild('extraAsset', { static: false })
  compExtraAsset?: AccountExtraAssetComponent;

  get isFieldChangable(): boolean {
    return isUIEditable(this.uiMode);
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get currentCategory(): number {
    return this.headerFormGroup.get('ctgyControl')?.value;
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
  get arControlCenters(): ControlCenter[] {
    return this._arControlCenters;
  }
  get arUIOrders(): UIOrderForSelection[] {
    return this._arUIOrders;
  }

  constructor(private odataService: FinanceOdataService,
    private activateRoute: ActivatedRoute,
    private homeSevice: HomeDefOdataService,
    private modalService: NzModalService,
    private router: Router,
    private changeDetectRef: ChangeDetectorRef) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountDetailComponent constructor`,
      ConsoleLogTypeEnum.debug);

    this.arStatusDisplayStrings = UIDisplayStringUtil.getAccountStatusStrings();
    this.arMembers = this.homeSevice.ChosedHome!.Members;

    this.headerFormGroup = new FormGroup({
      idControl: new FormControl(),
      nameControl: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      ctgyControl: new FormControl(financeAccountCategoryCash, [Validators.required], // this.categoryValidator],
      ),
      cmtControl: new FormControl('', Validators.maxLength(45)),
      statusControl: new FormControl(AccountStatusEnum.Normal),
      ownerControl: new FormControl()
    });
    this.amountFormGroup = new FormGroup({
      dateControl: new FormControl(new Date(), Validators.required),
      amountControl: new FormControl(undefined, Validators.required),
      ccControl: new FormControl(),
      orderControl: new FormControl(),
    }, [costObjectValidator]);

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

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountDetailComponent ngOnInit`,
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);
    this.headerFormGroup.get('idControl')?.disable();
  }

  ngAfterViewInit(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountDetailComponent ngAfterViewInit`,
      ConsoleLogTypeEnum.debug);

    this.activateRoute.url.subscribe((x: any) => {
      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.uiMode = UIMode.Create;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Update;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);
        this.changeDetectRef.detectChanges();
      }

      switch (this.uiMode) {
        case UIMode.Update:
        case UIMode.Display: {
          forkJoin([
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllAssetCategories(),
            this.odataService.fetchAllTranTypes(),
            this.odataService.readAccount(this.routerID),
          ])
          .pipe(takeUntil(this._destroyed$!))
          .subscribe({
            next: (rst: any[]) => {
              this.arAccountCategories = rst[0];
              this.arAssetCategories = rst[1];
              this.arTranTypes = rst[2];
              let acnt = rst[3] as Account;

              if (acnt.CategoryId === financeAccountCategoryAdvancePayment) {
                this.odataService.fetchAllDPTmpDocs({ AccountID: this.routerID }).subscribe({
                  next: val => {
                    (acnt.ExtraInfo as AccountExtraAdvancePayment).dpTmpDocs = val;
                    this._displayAccountContent(acnt);

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
                  },
                  error: err => {
                    this.modalService.error({
                      nzTitle: translate('Common.Error'),
                      nzContent: err,
                      nzClosable: true,
                    });      
                  }
                });
              } else if (acnt.CategoryId === financeAccountCategoryBorrowFrom) {
                this.odataService.fetchAllLoanTmpDocs({ AccountID: this.routerID }).subscribe({
                  next: val => {
                    (acnt.ExtraInfo as AccountExtraLoan).loanTmpDocs = val;
                    this._displayAccountContent(acnt);

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
                  },
                  error: err => {
                    this.modalService.error({
                      nzTitle: translate('Common.Error'),
                      nzContent: err,
                      nzClosable: true,
                    });      
                  }
                });
              } else if (acnt.CategoryId === financeAccountCategoryAsset) {
                this._displayAccountContent(acnt);
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
              } else {
                this._displayAccountContent(acnt);
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
              }  
            },
            error: err => {
              ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountDetailComponent ngOninit, readAccount failed: ${err}`,
                ConsoleLogTypeEnum.error);

              this.uiMode = UIMode.Invalid;
              this.modalService.error({
                nzTitle: translate('Common.Error'),
                nzContent: err,
                nzClosable: true,
              });
            }
          });
          break;
        }

        case UIMode.Create:
        default: {
          forkJoin([
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllControlCenters(),
            this.odataService.fetchAllOrders(),
          ]).pipe(takeUntil(this._destroyed$!))
            .subscribe({
              next: rst => {
                this.arAccountCategories = rst[0];
                this._arControlCenters = rst[1];
                this._arUIOrders = BuildupOrderForSelection(rst[2]);
              },
              error: err => {
                ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountDetailComponent ngOnInit, failed with activateRoute: ${err.toString()}`,
                ConsoleLogTypeEnum.error);
  
                this.modalService.error({
                  nzTitle: translate('Common.Error'),
                  nzContent: err,
                  nzClosable: true,
                });  
              }
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
  get canEnterInitialAmount(): boolean {
    let ctgyid = this.currentCategory;
    if (this.uiMode === UIMode.Create && (
      ctgyid === financeAccountCategoryCash
      || ctgyid === financeAccountCategoryDeposit
      || ctgyid === financeAccountCategoryCreditCard
      || ctgyid === financeAccountCategoryAccountPayable
      || ctgyid === financeAccountCategoryAccountReceivable
      || ctgyid === financeAccountCategoryVirtual) ) {
      return true;
    }
    return false;
  }
  get isSaveEnabled(): boolean {
    if (this.canEnterInitialAmount) {
      if (!this.headerFormGroup.valid) {
        return false;
      }
      if (this.isInitAmountRequired) {
        return this.amountFormGroup.valid;
      }
    }
    return false;
  }
  public onSave(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountDetailComponent onSave`,
      ConsoleLogTypeEnum.debug);
    if (this.uiMode === UIMode.Create) {
      this.onCreateImpl();
    } else if (this.uiMode === UIMode.Update) {
      this.onUpdateImpl();
    }
  }
  private onCreateImpl() {
    const acntobj = this._generateAccount();
    if (!acntobj) {
      return;
    }

    if (!acntobj.onVerify({
      Categories: this.arAccountCategories
    })) {
      popupDialog(this.modalService, 'Common.Error', acntobj.VerifiedMsgs);
      return;
    }

    // Save it
    this.odataService.createAccount(acntobj)
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: val => {
          let nacntid = val.Id;
          if (this.isInitAmountRequired) {
            // Create a document for initial amount.
            let doc: Document = new Document();
            doc.Desp = val.Name!;
            doc.DocType = financeDocTypeNormal;
            doc.HID = this.homeSevice.ChosedHome?.ID;
            doc.TranCurr = this.homeSevice.ChosedHome?.BaseCurrency!;
            doc.TranDate = moment(this.amountFormGroup.get('dateControl')?.value as Date);
            let docitem: DocumentItem = new DocumentItem();
            docitem.AccountId = nacntid;
            docitem.Desp = doc.Desp;
            docitem.ItemId = 1;
            docitem.TranAmount = this.amountFormGroup.get('amountControl')?.value;
            let assetflag = false;
            this.arAccountCategories.find(ctgy => {
              if (ctgy.ID === val.CategoryId) {
                assetflag = ctgy.AssetFlag;
              }
            });
            if (assetflag) {
              docitem.TranType = financeTranTypeOpeningAsset;
            } else {
              docitem.TranType = financeTranTypeOpeningLiability;
            }            
            docitem.ControlCenterId = this.amountFormGroup.get('ccControl')?.value;
            docitem.OrderId = this.amountFormGroup.get('orderControl')?.value;
            doc.Items.push(docitem);

            this.odataService.createDocument(doc)
              .subscribe({
                next: crtdoc => {
                  // Navigate to display mode
                  this.router.navigate(['/finance/document/display', crtdoc.Id]);
                },
                error: err2 => {
                  this.modalService.error({
                    nzTitle: translate('Common.Error'),
                    nzContent: err2,
                    nzClosable: true
                  });        
                }
              });
          } else {
            // Navigate to display mode
            this.router.navigate(['/finance/account/display', val.Id]);
          }
        },
        error: err => {
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true
          });
        }
      });
  }
  private onUpdateImpl() {
    const acntobj = this._generateAccount();
    if (!acntobj) {
      return;
    }

    if (!acntobj.onVerify({
      Categories: this.arAccountCategories
    })) {
      popupDialog(this.modalService, 'Common.Error', acntobj.VerifiedMsgs);
      return;
    }

    // Check the dirty control
    const arcontent: any = {};
    // ctgyControl: new FormControl(undefined, [
    //   Validators.required,
    //   // this.categoryValidator,
    // ]),
    // cmtControl: new FormControl('', Validators.maxLength(45)),
    // statusControl: new FormControl(),
    // ownerControl: new FormControl(),

    if (this.headerFormGroup.get('nameControl')?.dirty) {
      arcontent.Name = acntobj.Name;
    }
    if (this.headerFormGroup.get('cmtControl')?.dirty) {
      arcontent.Comment = acntobj.Comment;
    }
    if (this.headerFormGroup.get('statusControl')?.dirty) {
      arcontent.Status = AccountStatusEnum[acntobj.Status];
    }
    if (this.headerFormGroup.get('ownerControl')?.dirty) {
      arcontent.OwnerId = acntobj.OwnerId;
    }

    // Save it
    this.odataService.changeAccountByPatch(acntobj.Id!, arcontent)
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: val => {
          // Navigate to display mode
          this.router.navigate(['/finance/account/display', val.Id]);
        },
        error: err => {
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true
          });
        }
      });
  }

  private _displayAccountContent(objAcnt: Account): void {
    // Step 0.
    this.headerFormGroup.reset();
    this.headerFormGroup.get('idControl')?.setValue(objAcnt.Id);
    this.headerFormGroup.get('nameControl')?.setValue(objAcnt.Name);
    this.headerFormGroup.get('ctgyControl')?.setValue(objAcnt.CategoryId);
    if (objAcnt.OwnerId) {
      this.headerFormGroup.get('ownerControl')?.setValue(objAcnt.OwnerId);
    }
    if (objAcnt.Comment) {
      this.headerFormGroup.get('cmtControl')?.setValue(objAcnt.Comment);
    }
    this.headerFormGroup.get('statusControl')?.setValue(objAcnt.Status);
    // Step 1.
    if (this.isADPAccount) {
      this.extraADPFormGroup.get('extADPControl')?.setValue(objAcnt.ExtraInfo as AccountExtraAdvancePayment);
    } else if (this.isAssetAccount) {
      this.extraAssetFormGroup.get('extAssetControl')?.setValue(objAcnt.ExtraInfo as AccountExtraAsset);
    } else if (this.isLoanAccount) {
      this.extraLoanFormGroup.get('extLoanControl')?.setValue(objAcnt.ExtraInfo as AccountExtraLoan);
    }
  }

  private _generateAccount(): Account {
    const acntObj: Account = new Account();
    acntObj.HID = this.homeSevice.ChosedHome!.ID;
    if (this.uiMode === UIMode.Update) {
      acntObj.Id = this.routerID;
    }

    acntObj.Name = this.headerFormGroup.get('nameControl')?.value;
    acntObj.CategoryId = this.currentCategory;
    acntObj.OwnerId = this.headerFormGroup.get('ownerControl')?.value;
    acntObj.Comment = this.headerFormGroup.get('cmtControl')?.value;
    acntObj.Status = this.headerFormGroup.get('statusControl')?.value;

    if (this.isADPAccount) {
      // ADP
      acntObj.ExtraInfo = this.extraADPFormGroup.get('extADPControl')?.value;
    } else if (this.isAssetAccount) {
      // Asset
      acntObj.ExtraInfo = this.extraAssetFormGroup.get('extAssetControl')?.value;
    } else if (this.isLoanAccount) {
      // Loan
      acntObj.ExtraInfo = this.extraLoanFormGroup.get('extLoanControl')?.value;
    }

    return acntObj;
  }
  // private categoryValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  //   const ctgy: any = group.get('ctgyControl');
  //   if (ctgy && this.isFieldChangable) {
  //     if (this.isCategoryDisabled(ctgy.value)) {
  //       return { invalidcategory: true };
  //     }
  //   } else {
  //     return { invalidcategory: true };
  //   }
  //   return null;
  // }
}
