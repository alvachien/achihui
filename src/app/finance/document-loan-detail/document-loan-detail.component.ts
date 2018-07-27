import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { Observable, forkJoin, merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, Document, DocumentItem, UIMode, getUIModeString, financeDocTypeBorrowFrom,
  financeAccountCategoryBorrowFrom, financeAccountCategoryLendTo, financeDocTypeLendTo, TemplateDocLoan, UIFinLoanDocument,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  FinanceLoanCalAPIInput, FinanceLoanCalAPIOutput, IAccountCategoryFilter } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'hih-finance-document-loan-detail',
  templateUrl: './document-loan-detail.component.html',
  styleUrls: ['./document-loan-detail.component.scss'],
})
export class DocumentLoanDetailComponent implements OnInit {
  private routerID: number = -1; // Current object ID in routing
  private loanType: number;
  public isLendTo: boolean;
  public documentTitle: string;

  public currentMode: string;
  public detailObject: UIFinLoanDocument | undefined = undefined;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Enter, comma
  separatorKeysCodes: any[] = [ENTER, COMMA];
  // tmpDocOperEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
  displayedColumns: string[] = ['TranDate', 'RefDoc', 'TranAmount', 'InterestAmount', 'Desp'];
  dataSource: MatTableDataSource<TemplateDocLoan> = new MatTableDataSource<TemplateDocLoan>();

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
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
    this.detailObject = new UIFinLoanDocument();
    // this.dataSource = new TemplateDocLoanDataSource(this);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentLoanDetailComponent ngOnInit...');
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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentLoanDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
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
          if (x[0].path === 'createbrwfrm') {
            this.onInitCreateMode();
            this.loanType = financeDocTypeBorrowFrom;
            this.isLendTo = false;
          } else if (x[0].path === 'createlendto') {
            this.onInitCreateMode();
            this.loanType = financeDocTypeLendTo;
            this.isLendTo = true;
          } else if (x[0].path === 'editbrwfrm') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
            this.loanType = financeDocTypeBorrowFrom;
            this.isLendTo = false;
          } else if (x[0].path === 'editlendto') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
            this.loanType = financeDocTypeLendTo;
            this.isLendTo = true;
          } else if (x[0].path === 'displaybrwfrm') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Display;
            this.loanType = financeDocTypeBorrowFrom;
            this.isLendTo = false;
          } else if (x[0].path === 'displaylendto') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Display;
            this.loanType = financeDocTypeLendTo;
            this.isLendTo = true;
          }
          this.currentMode = getUIModeString(this.uiMode);
          if (this.loanType === financeDocTypeBorrowFrom) {
            this.documentTitle = 'Sys.DocTy.BorrowFrom';
          } else if (this.loanType === financeDocTypeLendTo) {
            this.documentTitle = 'Sys.DocTy.LendTo';
          }

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readLoanDocument(this.routerID).subscribe((x2: any) => {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.log(`AC_HIH_UI [Debug]: Entering DocumentLoanDetailComponent ngOnInit for activateRoute URL: ${x2}`);
              }

              this.detailObject.parseDocument(x2);
              // this.tmpDocOperEvent.emit();
            }, (error2: any) => {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to readLoanDocument : ${error2}`);
              }
            });
          }
        } else {
          this.uiMode = UIMode.Invalid;
        }
      });
    }, (error: HttpErrorResponse) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to load depended objects : ${error}`);
      }

      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        Content: error ? error.message : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
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

  public onGenerateTmpDocs(): void {
    if (this.uiMode === UIMode.Create) {
      this.detailObject.TmpDocs = [];

      // Do some basic check
      if (!this.detailObject.TranAmount) {
        return;
      }

      if (!this.detailObject.LoanAccount.RepayMethod) {
        return;
      }

      // Call the API for Loan template docs.
      let di: FinanceLoanCalAPIInput = {
        TotalAmount: this.detailObject.TranAmount,
        TotalMonths: this.detailObject.LoanAccount.TotalMonths,
        InterestRate: this.detailObject.LoanAccount.annualRate / 100,
        StartDate: this.detailObject.LoanAccount.startDate.clone(),
        InterestFreeLoan: this.detailObject.LoanAccount.InterestFree ? true : false,
        RepaymentMethod: this.detailObject.LoanAccount.RepayMethod,
      };
      if (this.detailObject.LoanAccount.endDate) {
        di.EndDate = this.detailObject.LoanAccount.endDate.clone();
      }

      this._storageService.calcLoanTmpDocs(di).subscribe((x: any) => {
        for (let rst of x) {
          let tmpdoc: TemplateDocLoan = new TemplateDocLoan();
          tmpdoc.InterestAmount = rst.InterestAmount;
          tmpdoc.TranAmount = rst.TranAmount;
          tmpdoc.TranDate = rst.TranDate;
          tmpdoc.TranType = this.detailObject.SourceTranType;
          tmpdoc.Desp = this.detailObject.LoanAccount.Comment + ' | ' + (this.detailObject.TmpDocs.length + 1).toString()
            + ' / ' + x.length.toString();
          this.detailObject.TmpDocs.push(tmpdoc);
        }

        // this.tmpDocOperEvent.emit();
      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering onSync, failed to calculate the template docs : ${error}`);
        }

        const dlginfo: MessageDialogInfo = {
          Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          Content: error ? error.message : this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
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

  public canSubmit(): boolean {
    if (!this.isFieldChangable) {
      return false;
    }

    // Check name
    if (!this.detailObject) {
      return false;
    }

    if (!this.detailObject.Desp) {
      return false;
    }

    this.detailObject.Desp = this.detailObject.Desp.trim();
    if (this.detailObject.Desp.length <= 0) {
      return false;
    }

    if (this.detailObject.TmpDocs.length <= 0) {
      return false;
    }

    return true;
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      let docObj: any = this.detailObject.generateDocument();

      if (this.detailObject.TmpDocs.length <= 0) {
        this.showErrorDialog('Finance.NoTmpDocGenerated');
        return;
      }

      // Check on template docs
      if (!this.detailObject.LoanAccount.RepayMethod) {
        this.showErrorDialog('No repayment method!');
        return;
      }

      for (let tdoc of this.detailObject.TmpDocs) {
        if (!tdoc.TranAmount) {
          this.showErrorDialog('NO tran. amount');
          return;
        }

        if (!tdoc.TranType) {
          this.showErrorDialog('No tran. type');
          return;
        }
      }

      // Check!
      if (!docObj.onVerify({
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
          ContentTable: docObj.VerifiedMsgs,
          Button: MessageDialogButtonEnum.onlyok,
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo,
        });

        return;
      }

      this._storageService.createDocumentEvent.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentAdvancepaymentDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof Document) {
          // Show the snackbar
          let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
            this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 3000,
          });

          let recreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            recreate = true;

            this.onInitCreateMode();
            this.setStep(0);
            // this.tmpDocOperEvent.emit();
          });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            if (!recreate) {
              if (this.loanType === financeDocTypeBorrowFrom) {
                this._router.navigate(['/finance/document/displaybrwfrm/' + x.Id.toString()]);
              } else if (this.loanType === financeDocTypeLendTo) {
                this._router.navigate(['/finance/document/displaylendto/' + x.Id.toString()]);
              }
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

      docObj.HID = this._homedefService.ChosedHome.ID;

      // Build the JSON file to API
      let sobj: any = docObj.writeJSONObject(); // Document first
      let acntobj: Account = new Account();
      acntobj.HID = this._homedefService.ChosedHome.ID;
      acntobj.CategoryId = this.loanType;
      acntobj.Name = docObj.Desp;
      acntobj.Comment = docObj.Desp;
      acntobj.ExtraInfo = this.detailObject.LoanAccount;
      sobj.accountVM = acntobj.writeJSONObject();

      sobj.TmpDocs = [];
      for (let td of this.detailObject.TmpDocs) {
        td.HID = acntobj.HID;
        td.ControlCenterId = this.detailObject.SourceControlCenterId;
        td.OrderId = this.detailObject.SourceOrderId;
        if (td.Desp.length > 45) {
          td.Desp = td.Desp.substring(0, 44);
        }

        sobj.TmpDocs.push(td.writeJSONObject());
      }

      this._storageService.createLoanDocument(sobj);
    }
  }

  public onBackToList(): void {
    this._router.navigate(['/finance/document/']);
  }

  private onInitCreateMode(): void {
    this.detailObject = new UIFinLoanDocument();
    this.uiMode = UIMode.Create;
    this.uiAccountStatusFilter = 'Normal';
    this.uiAccountCtgyFilter = {
      skipADP: true,
      skipLoan: true,
      skipAsset: true,
    };
    this.uiOrderFilter = true;

    this.detailObject.TranCurr = this._homedefService.ChosedHome.BaseCurrency;
  }

  private showErrorDialog(errormsg: string): void {
    // Show a dialog for error details
    const dlginfo: MessageDialogInfo = {
      Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
      Content: errormsg,
      Button: MessageDialogButtonEnum.onlyok,
    };

    this._dialog.open(MessageDialogComponent, {
      disableClose: false,
      width: '500px',
      data: dlginfo,
    });

    return;
  }
}
