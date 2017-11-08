import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, Document, DocumentItem, UIMode, getUIModeString, FinanceDocType_Loan, COMMA, TemplateDocLoan, UIFinLoanDocument,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  FinanceAccountCategory_Loan } from '../../model';
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

  public onSync(): void {
    if (this.uiMode === UIMode.Create) {
      this.detailObject.TmpDocs = [];

      if (this.detailObject.LoanAccount.TotalMonths) {

      } else {
        // Calculate the 
      }

      // let rtype = this.detailObject.AdvPayAccount.RepeatType;
      // if (!this.detailObject.AdvPayAccount.EndDate.isValid || !this.detailObject.AdvPayAccount.StartDate.isValid) {
      //   return;
      // }

      // let arDays = [];

      // switch (rtype) {
      //   case RepeatFrequency.Month:
      //     let nmon = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'M');
      //     for (let i = 0; i < nmon; i++) {
      //       let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
      //       nstart.add(i, 'M');
      //       arDays.push(nstart);
      //     }
      //     break;

      //   case RepeatFrequency.Fortnight:
      //     let nfort = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'd') / 14;
      //     for (let i = 0; i < nfort; i++) {
      //       let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
      //       nstart.add(14 * i, 'd');
      //       arDays.push(nstart);
      //     }
      //     break;

      //   case RepeatFrequency.Week:
      //     let nweek = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'd') / 7;
      //     for (let i = 0; i < nweek; i++) {
      //       let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
      //       nstart.add(7 * i, 'd');
      //       arDays.push(nstart);
      //     }
      //     break;

      //   case RepeatFrequency.Day:
      //     let nday = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'd');
      //     for (let i = 0; i < nday; i++) {
      //       let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
      //       nstart.add(i, 'd');
      //       arDays.push(nstart);
      //     }
      //     break;

      //   case RepeatFrequency.Quarter:
      //     let nqrt = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'Q');
      //     for (let i = 0; i < nqrt; i++) {
      //       let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
      //       nstart.add(i, 'Q');
      //       arDays.push(nstart);
      //     }
      //     break;

      //   case RepeatFrequency.HalfYear:
      //     let nhalfyear = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'Q') / 2;
      //     for (let i = 0; i < nhalfyear; i++) {
      //       let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
      //       nstart.add(2 * i, 'Q');
      //       arDays.push(nstart);
      //     }
      //     break;

      //   case RepeatFrequency.Year:
      //     let nyear = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'y');
      //     for (let i = 0; i < nyear; i++) {
      //       let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
      //       nstart.add(i, 'y');
      //       arDays.push(nstart);
      //     }
      //     break;

      //   case RepeatFrequency.Manual:
      //     break;

      //   default:
      //     break;
      // }

      // let totalAmt: number = 0;
      // for (let i = 0; i < arDays.length; i++) {
      //   let item: TemplateDocADP = new TemplateDocADP();
      //   item.DocId = i + 1;
      //   item.TranType = this.detailObject.SourceTranType;
      //   item.TranDate = arDays[i];
      //   item.TranAmount = Number.parseFloat((this.detailObject.TranAmount / arDays.length).toFixed(2));
      //   totalAmt += item.TranAmount;
      //   this.detailObject.TmpDocs.push(item);
      // }
      // if (this.detailObject.TranAmount !== totalAmt) {
      //   this.detailObject.TmpDocs[0].TranAmount += (this.detailObject.TranAmount - totalAmt);

      //   this.detailObject.TmpDocs[0].TranAmount = Number.parseFloat(this.detailObject.TmpDocs[0].TranAmount.toFixed(2));
      // }

      // if (arDays.length === 0) {
      //   let item = new TemplateDocADP();
      //   item.DocId = 1;
      //   item.TranType = this.detailObject.SourceTranType;
      //   item.TranDate = this.detailObject.AdvPayAccount.StartDate.clone();
      //   item.TranAmount = this.detailObject.TranAmount;
      //   this.detailObject.TmpDocs.push(item);
      // }

      // // Update the template desp
      // if(this.detailObject.TmpDocs.length === 1) {
      //   this.detailObject.TmpDocs[0].Desp = this.detailObject.Desp;
      // } else {
      //   for(let i = 0; i < this.detailObject.TmpDocs.length; i ++) {
      //     this.detailObject.TmpDocs[i].Desp = this.detailObject.Desp + ' | ' + (i+1).toString() + '/' + this.detailObject.TmpDocs.length.toString();
      //   }
      // }

      this.tmpDocOperEvent.emit();
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
            //this._router.navigate(['/finance/document/createadp/']);
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
