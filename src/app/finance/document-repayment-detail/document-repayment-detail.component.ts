import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatChipInputEvent, MatTableDataSource } from '@angular/material';
import { Observable, forkJoin, merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, Document, DocumentItem, UIMode, getUIModeString, financeDocTypeNormal,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  UICommonLabelEnum, IAccountCategoryFilter, financeDocTypeRepay, financeTranTypeRepaymentOut, financeTranTypeInterestOut,
  financeAccountCategoryBorrowFrom, financeTranTypeRepaymentIn, financeTranTypeInterestIn, AccountExtraLoan } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'hih-document-repayment-detail',
  templateUrl: './document-repayment-detail.component.html',
  styleUrls: ['./document-repayment-detail.component.scss'],
})
export class DocumentRepaymentDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: Document | undefined = undefined;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Enter, comma
  separatorKeysCodes: any[] = [ENTER, COMMA];

  displayedColumns: string[] = ['itemid', 'accountid', 'trantype', 'amount', 'desp', 'controlcenter', 'order', 'tag'];
  dataSource: MatTableDataSource<DocumentItem>;
  loanAccount: Account;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isForeignCurrency(): boolean {
    if (this.detailObject && this.detailObject.TranCurr && this.detailObject.TranCurr !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent constructor...');
    }
    this.detailObject = new Document();
    this.detailObject.DocType = financeDocTypeRepay;
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent ngOnInit...');
    }

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      this.uiOrderFilter = undefined;

      this._activateRoute.url.subscribe((x: any) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'createrepay') {
            this.onInitCreateMode();
          } else if (x[0].path === 'editrepay') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'displayrepay') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readDocumentEvent.subscribe((x2: any) => {
              if (x2 instanceof Document) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngOninit, succeed to readDocument : ${x2}`);
                }

                this.detailObject = x2;
                // TBD.
                // this.itemOperEvent.emit(); // Show the items
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to readDocument : ${x2}`);
                }

                this.detailObject = new Document();
                this.detailObject.DocType = financeDocTypeRepay;
              }
            });

            this._storageService.readDocument(this.routerID);
          }
        } else {
          this.uiMode = UIMode.Invalid;
        }
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to load depended objects : ${error}`);
      }

      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Content: error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      this.uiMode = UIMode.Invalid;
    });
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
    if (!this.isFieldChangable) {
      return false;
    }

    // Check name
    if (this.detailObject.Desp.trim().length <= 0) {
      return false;
    }

    return true;
  }

  public onCreateDocItem(): void {
    let di: DocumentItem = new DocumentItem();
    di.ItemId = this.getNextItemID();

    let aritems: any[] = this.dataSource.data.slice();
    aritems.push(di);
    this.dataSource.data = aritems;
  }

  public onDeleteDocItem(di: any): void {
    let idx: number = -1;
    let aritems: any[] = this.dataSource.data.slice();
    for (let i: number = 0; i < aritems.length; i ++) {
      if (aritems[i].ItemId === di.ItemId) {
        idx = i;
        break;
      }
    }

    if (idx !== -1) {
      aritems.splice(idx);

      this.dataSource.data = aritems;
    }
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create || this.uiMode === UIMode.Change) {
      this.detailObject.Items = this.dataSource.data;

      if (this.uiMode === UIMode.Create) {
        this.onCreationImpl();
      } else if (this.uiMode === UIMode.Change) {
        this.onUpdateImpl();
      }
    }
  }

  public onBackToList(): void {
    this._router.navigate(['/finance/document/']);
  }

  public addItemTag(row: DocumentItem, $event: MatChipInputEvent): void {
    let input: any = $event.input;
    let value: any = $event.value;

    // Add new Tag
    if ((value || '').trim()) {
      row.Tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public removeItemTag(row: DocumentItem, tag: any): void {
    let index: number = row.Tags.indexOf(tag);

    if (index >= 0) {
      row.Tags.splice(index, 1);
    }
  }

  private getNextItemID(): number {
    if (this.dataSource.data.length <= 0) {
      return 1;
    }

    let nMax: number = 0;
    for (let item of this.dataSource.data) {
      if (item.ItemId > nMax) {
        nMax = item.ItemId;
      }
    }

    return nMax + 1;
  }

  private onInitCreateMode(): void {
    this.detailObject = new Document();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
    this.detailObject.DocType = financeDocTypeRepay;
    this.uiAccountStatusFilter = undefined;
    this.uiAccountCtgyFilter = undefined;
    this.uiOrderFilter = true;

    this.detailObject.TranCurr = this._homedefService.ChosedHome.BaseCurrency;

    // Load current loan doc
    if (this._uiStatusService.currentTemplateLoanDoc) {
      this.detailObject.Desp = this._uiStatusService.currentTemplateLoanDoc.Desp;

      this._storageService.readAccountEvent.subscribe((x: Account) => {
        this.loanAccount = x;
        let loanacntext: AccountExtraLoan = <AccountExtraLoan>this.loanAccount.ExtraInfo;

        // Add two items: repay-in and repay-out
        let di: DocumentItem = new DocumentItem();
        di.ItemId = 1;
        di.AccountId = this._uiStatusService.currentTemplateLoanDoc.AccountId;
        di.TranAmount = this._uiStatusService.currentTemplateLoanDoc.TranAmount;
        if (this.loanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
          di.TranType = financeTranTypeRepaymentIn;
        } else {
          di.TranType = financeTranTypeRepaymentOut;
        }
        di.ControlCenterId = this._uiStatusService.currentTemplateLoanDoc.ControlCenterId;
        di.OrderId = this._uiStatusService.currentTemplateLoanDoc.OrderId;
        di.Desp = this._uiStatusService.currentTemplateLoanDoc.Desp;

        let aritems: any[] = this.dataSource.data.slice();
        aritems.push(di);

        di = new DocumentItem();
        di.ItemId = 2;
        di.TranAmount = this._uiStatusService.currentTemplateLoanDoc.TranAmount;
        if (this.loanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
          di.TranType = financeTranTypeRepaymentOut;
        } else {
          di.TranType = financeTranTypeRepaymentIn;
        }
        if (loanacntext.PayingAccount) {
          di.AccountId = loanacntext.PayingAccount;
        }
        di.ControlCenterId = this._uiStatusService.currentTemplateLoanDoc.ControlCenterId;
        di.OrderId = this._uiStatusService.currentTemplateLoanDoc.OrderId;
        di.Desp = this._uiStatusService.currentTemplateLoanDoc.Desp;
        aritems.push(di);

        if (this._uiStatusService.currentTemplateLoanDoc.InterestAmount > 0) {
          di = new DocumentItem();
          di.ItemId = 3;
          di.TranAmount = this._uiStatusService.currentTemplateLoanDoc.InterestAmount;
          if (this.loanAccount.CategoryId === financeAccountCategoryBorrowFrom) {
            di.TranType = financeTranTypeInterestOut;
          } else {
            di.TranType = financeTranTypeInterestIn;
          }
          if (loanacntext.PayingAccount) {
            di.AccountId = loanacntext.PayingAccount;
          }
          di.ControlCenterId = this._uiStatusService.currentTemplateLoanDoc.ControlCenterId;
          di.OrderId = this._uiStatusService.currentTemplateLoanDoc.OrderId;
          di.Desp = this._uiStatusService.currentTemplateLoanDoc.Desp;
          aritems.push(di);
        }
        this.dataSource.data = aritems;
      });
      this._storageService.readAccount(this._uiStatusService.currentTemplateLoanDoc.AccountId);
    } else {
      // Show error?
    }
  }

  private onCreationImpl(): void {
    // Check!
    if (!this.detailObject.onVerify({
      ControlCenters: this._storageService.ControlCenters,
      Orders: this._storageService.Orders,
      Accounts: this._storageService.Accounts,
      DocumentTypes: this._storageService.DocumentTypes,
      TransactionTypes: this._storageService.TranTypes,
      Currencies: this._currService.Currencies,
      BaseCurrency: this._homedefService.ChosedHome.BaseCurrency,
    })) {
      // Show a dialog for error details
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: this.detailObject.VerifiedMsgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }

    this.detailObject.HID = this._homedefService.ChosedHome.ID;
    this.detailObject.DocType = financeDocTypeRepay;
    this._storageService.createLoanRepayDoc(this.detailObject, this.loanAccount.Id, this._uiStatusService.currentTemplateLoanDoc.DocId)
      .subscribe((x: Document) => {
          // Show the snackbar
          let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
            this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 3000,
          });

          let isrecreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent, Snackbar onAction()`);
            }

            isrecreate = true;
            // Re-initial the page for another create
            this.onInitCreateMode();
            this.setStep(0);
            // this.itemOperEvent.emit();
          });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent, Snackbar afterDismissed with ${isrecreate}`);
            }

            if (!isrecreate) {
              this._router.navigate(['/finance/document/displaynormal/' + x.Id.toString()]);
            }
          });
        }, (error: HttpErrorResponse) => {
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
          }).afterClosed().subscribe((x2: any) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent, Message dialog result ${x2}`);
            }
          });
        });
  }

  private onUpdateImpl(): void {
    // Check!
    if (!this.detailObject.onVerify({
      ControlCenters: this._storageService.ControlCenters,
      Orders: this._storageService.Orders,
      Accounts: this._storageService.Accounts,
      DocumentTypes: this._storageService.DocumentTypes,
      TransactionTypes: this._storageService.TranTypes,
      Currencies: this._currService.Currencies,
      BaseCurrency: this._homedefService.ChosedHome.BaseCurrency,
    })) {
      // Show a dialog for error details
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: this.detailObject.VerifiedMsgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }

    this._storageService.changeDocumentEvent.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Receiving changeDocumentEvent in DocumentRepaymentDetailComponent with : ${x}`);
      }

      // Navigate back to list view
      if (x instanceof Document) {
        // Show the snackbar
        let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
          this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 3000,
        });

        let isrecreate: boolean = false;
        snackbarRef.onAction().subscribe(() => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent, Snackbar onAction()`);
          }

          isrecreate = true;
          // Re-initial the page for another create
          this.onInitCreateMode();
          this.setStep(0);
          // this.itemOperEvent.emit();
        });

        snackbarRef.afterDismissed().subscribe(() => {
          // Navigate to display
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent, Snackbar afterDismissed with ${isrecreate}`);
          }

          if (!isrecreate) {
            this._router.navigate(['/finance/document/displayrepay/' + x.Id.toString()]);
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
            console.log(`AC_HIH_UI [Debug]: Entering DocumentRepaymentDetailComponent, Message dialog result ${x2}`);
          }
        });
      }
    });

    this.detailObject.HID = this._homedefService.ChosedHome.ID;
    this.detailObject.DocType = financeDocTypeRepay;
    this._storageService.updateNormalDocument(this.detailObject);
  }
}
