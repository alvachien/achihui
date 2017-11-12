import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, Document, DocumentItem, UIMode, getUIModeString, FinanceDocType_Loan, COMMA, TemplateDocLoan, UIFinLoanDocument,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  FinanceAccountCategory_Loan, FinanceLoanCalAPIInput, FinanceLoanCalAPIOutput } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { ENTER } from '@angular/cdk/keycodes';

/**
 * Data source of ADP Template Document
 */
export class TemplateDocLoanDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentLoanDetailComponent) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<TemplateDocLoan[]> {
    const displayDataChanges = [
      this._parentComponent.tmpDocOperEvent,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      return this._parentComponent.detailObject.TmpDocs;
    });
  }

  disconnect() { }
}

@Component({
  selector: 'app-document-loan-detail',
  templateUrl: './document-loan-detail.component.html',
  styleUrls: ['./document-loan-detail.component.scss']
})
export class DocumentLoanDetailComponent implements OnInit {
  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: UIFinLoanDocument | null = null;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  public arUIAccount: UIAccountForSelection[] = [];
  public arUIOrder: UIOrderForSelection[] = [];
  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];
  tmpDocOperEvent: EventEmitter<null> = new EventEmitter<null>(null);
  displayedColumns = ['TranDate', 'RefDoc', 'TranAmount', 'InterestAmount', 'Desp'];
  dataSource: TemplateDocLoanDataSource | null;
  
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
    this.dataSource = new TemplateDocLoanDataSource(this);
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentLoanDetailComponent ngOnInit...');
    }

    Observable.forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).subscribe((rst) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentLoanDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories, true, true, true);
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      
      this._activateRoute.url.subscribe((x) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'createloan') {
            this.onInitCreateMode();
          } else if (x[0].path === 'editloan') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'displayloan') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readLoanDocument(this.routerID).subscribe((x2) => {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.log(`AC_HIH_UI [Debug]: Entering DocumentLoanDetailComponent ngOnInit for activateRoute URL: ${x2}`);
              }

              this.detailObject.parseDocument(x2);
              this.tmpDocOperEvent.emit();
            }, (error2) => {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to readLoanDocument : ${error2}`);
              }
            });
          }
        } else {
          this.uiMode = UIMode.Invalid;
        }
      });
    }, (error) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to load depended objects : ${error}`);
      }

      const dlginfo: MessageDialogInfo = {
        Header: 'Common.Error',
        Content: error ? error.toString() : 'Common.Error',
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

  public setStep(index: number) {
    this.step = index;
  }

  public nextStep() {
    this.step++;
  }

  public prevStep() {
    this.step--;
  }

  public onGenerateTmpDocs(): void {
    if (this.uiMode === UIMode.Create) {
      this.detailObject.TmpDocs = [];

      // Call the API for Loan template docs.
      let di: FinanceLoanCalAPIInput = {
        TotalAmount: this.detailObject.TranAmount,
        TotalMonths: this.detailObject.LoanAccount.TotalMonths,
        InterestRate: this.detailObject.LoanAccount.AnnualRate / 100,
        StartDate: this.detailObject.LoanAccount.StartDate.clone(),
        InterestFreeLoan: this.detailObject.LoanAccount.InterestFree,
        RepaymentMethod: this.detailObject.LoanAccount.RepayMethod      
      };
      
      this._storageService.calcLoanTmpDocs(di).subscribe(x => {
        for(let rst of x) {
          let tmpdoc: TemplateDocLoan = new TemplateDocLoan();
          tmpdoc.InterestAmount = rst.InterestAmount;
          tmpdoc.TranAmount = rst.TranAmount;
          tmpdoc.TranDate = rst.TranDate;
          tmpdoc.Desp = this.detailObject.LoanAccount.Comment + ' | ' + (this.detailObject.TmpDocs.length + 1).toString() + ' / ' + x.length.toString();
          this.detailObject.TmpDocs.push(tmpdoc);
        }

        this.tmpDocOperEvent.emit();
      }, error => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering onSync, failed to calculate the template docs : ${error}`);
        }        

        const dlginfo: MessageDialogInfo = {
          Header: 'Common.Error',
          Content: error ? error.toString() : 'Common.Error',
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
  
  public onSubmit() {
    if (this.uiMode === UIMode.Create) {
      let docObj = this.detailObject.generateDocument();

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
          Header: 'Common.Error',
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

      this._storageService.createDocumentEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentAdvancepaymentDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof Document) {
          // Show the snackbar
          let snackbarRef = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), 
            this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 3000,
          });
          
          let recreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            recreate = true;

            this.onInitCreateMode();
            this.setStep(0);
            this.tmpDocOperEvent.emit();
          });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            if (!recreate) {
              this._router.navigate(['/finance/document/displayloan/' + x.Id.toString()]);
            }            
          });
        } else {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: 'Common.Error',
            Content: x.toString(),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          }).afterClosed().subscribe((x2) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
          });
        }
      });

      docObj.HID = this._homedefService.ChosedHome.ID;

      // Build the JSON file to API
      let sobj = docObj.writeJSONObject(); // Document first
      let acntobj: Account = new Account();
      acntobj.HID = this._homedefService.ChosedHome.ID;
      acntobj.CategoryId = FinanceAccountCategory_Loan;
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

      let dataJSON = JSON.stringify(sobj);
      this._storageService.createLoanDocument(sobj);
    }
  }

  public onCancel(): void {
    this._router.navigate(['/finance/document/']);
  }
  
  private onInitCreateMode() {
    this.detailObject = new UIFinLoanDocument();
    this.uiMode = UIMode.Create;

    this.detailObject.TranCurr = this._homedefService.ChosedHome.BaseCurrency;
  }
}
