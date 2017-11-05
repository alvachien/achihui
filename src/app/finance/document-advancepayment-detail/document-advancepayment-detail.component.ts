import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import {
  LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, FinanceAccountCategory_AdvancePayment,
  UIFinAdvPayDocument, TemplateDocADP, UIRepeatFrequency, AccountExtraAdvancePayment, RepeatFrequency, COMMA,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';
//import 'moment/locale/zh-cn';
import { ENTER } from '@angular/cdk/keycodes';

/**
 * Data source of Document Items
 */
export class TemplateDocADPDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentAdvancepaymentDetailComponent) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<TemplateDocADP[]> {
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
  selector: 'hih-fin-document-advancepayment-detail',
  templateUrl: './document-advancepayment-detail.component.html',
  styleUrls: ['./document-advancepayment-detail.component.scss'],
})
export class DocumentAdvancepaymentDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: UIFinAdvPayDocument | null = null;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  public arUIAccount: UIAccountForSelection[] = [];
  public arUIOrder: UIOrderForSelection[] = [];
  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];
  
  displayedColumns = ['TranDate', 'RefDoc', 'TranAmount', 'Desp'];
  dataSource: TemplateDocADPDataSource | null;
  tmpDocOperEvent: EventEmitter<null> = new EventEmitter<null>(null);
  arFrequencies = UIRepeatFrequency.getRepeatFrequencies();

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
    this.detailObject = new UIFinAdvPayDocument();
    this.dataSource = new TemplateDocADPDataSource(this);
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent ngOnInit...');
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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      
      this._activateRoute.url.subscribe((x) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'createadp') {
            this.onInitCreateMode();
          } else if (x[0].path === 'editadp') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'displayadp') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readADPDocument(this.routerID).subscribe((x2) => {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.log(`AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent ngOnInit for activateRoute URL: ${x2}`);
              }

              this.detailObject.parseDocument(x2);
              this.tmpDocOperEvent.emit();
            }, (error2) => {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to readADPDocument : ${error2}`);
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

      let rtype = this.detailObject.AdvPayAccount.RepeatType;
      if (!this.detailObject.AdvPayAccount.EndDate.isValid || !this.detailObject.AdvPayAccount.StartDate.isValid) {
        return;
      }

      let arDays = [];

      switch (rtype) {
        case RepeatFrequency.Month:
          let nmon = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'M');
          for (let i = 0; i < nmon; i++) {
            let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
            nstart.add(i, 'M');
            arDays.push(nstart);
          }
          break;

        case RepeatFrequency.Fortnight:
          let nfort = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'd') / 14;
          for (let i = 0; i < nfort; i++) {
            let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
            nstart.add(14 * i, 'd');
            arDays.push(nstart);
          }
          break;

        case RepeatFrequency.Week:
          let nweek = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'd') / 7;
          for (let i = 0; i < nweek; i++) {
            let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
            nstart.add(7 * i, 'd');
            arDays.push(nstart);
          }
          break;

        case RepeatFrequency.Day:
          let nday = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'd');
          for (let i = 0; i < nday; i++) {
            let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
            nstart.add(i, 'd');
            arDays.push(nstart);
          }
          break;

        case RepeatFrequency.Quarter:
          let nqrt = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'Q');
          for (let i = 0; i < nqrt; i++) {
            let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
            nstart.add(i, 'Q');
            arDays.push(nstart);
          }
          break;

        case RepeatFrequency.HalfYear:
          let nhalfyear = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'Q') / 2;
          for (let i = 0; i < nhalfyear; i++) {
            let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
            nstart.add(2 * i, 'Q');
            arDays.push(nstart);
          }
          break;

        case RepeatFrequency.Year:
          let nyear = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'y');
          for (let i = 0; i < nyear; i++) {
            let nstart = this.detailObject.AdvPayAccount.StartDate.clone();
            nstart.add(i, 'y');
            arDays.push(nstart);
          }
          break;

        case RepeatFrequency.Manual:
          break;

        default:
          break;
      }

      let totalAmt: number = 0;
      for (let i = 0; i < arDays.length; i++) {
        let item: TemplateDocADP = new TemplateDocADP();
        item.DocId = i + 1;
        item.TranType = this.detailObject.SourceTranType;
        item.TranDate = arDays[i];
        item.TranAmount = Number.parseFloat((this.detailObject.TranAmount / arDays.length).toFixed(2));
        totalAmt += item.TranAmount;
        this.detailObject.TmpDocs.push(item);
      }
      if (this.detailObject.TranAmount !== totalAmt) {
        this.detailObject.TmpDocs[0].TranAmount += (this.detailObject.TranAmount - totalAmt);

        this.detailObject.TmpDocs[0].TranAmount = Number.parseFloat(this.detailObject.TmpDocs[0].TranAmount.toFixed(2));
      }

      if (arDays.length === 0) {
        let item = new TemplateDocADP();
        item.DocId = 1;
        item.TranType = this.detailObject.SourceTranType;
        item.TranDate = this.detailObject.AdvPayAccount.StartDate.clone();
        item.TranAmount = this.detailObject.TranAmount;
        this.detailObject.TmpDocs.push(item);
      }

      // Update the template desp
      if(this.detailObject.TmpDocs.length === 1) {
        this.detailObject.TmpDocs[0].Desp = this.detailObject.Desp;
      } else {
        for(let i = 0; i < this.detailObject.TmpDocs.length; i ++) {
          this.detailObject.TmpDocs[i].Desp = this.detailObject.Desp + ' | ' + (i+1).toString() + '/' + this.detailObject.TmpDocs.length.toString();
        }
      }

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
              this._router.navigate(['/finance/document/displayadp/' + x.Id.toString()]);
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
      acntobj.CategoryId = FinanceAccountCategory_AdvancePayment;
      acntobj.Name = docObj.Desp;
      acntobj.Comment = docObj.Desp;
      acntobj.ExtraInfo = this.detailObject.AdvPayAccount;
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
      this._storageService.createADPDocument(sobj);
    }
  }

  public onCancel(): void {
    this._router.navigate(['/finance/document/']);
  }

  private onInitCreateMode() {
    this.detailObject = new UIFinAdvPayDocument();
    this.uiMode = UIMode.Create;

    this.detailObject.TranCurr = this._homedefService.ChosedHome.BaseCurrency;
  }
}
