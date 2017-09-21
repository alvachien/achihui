import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MdDialog, MdSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import {
  LogLevel, Document, DocumentItem, UIMode, getUIModeString,
  UIFinAdvPayDocument, TemplateDocADP, UIRepeatFrequency, AccountExtraAdvancePayment, RepeatFrequency
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';
//import 'moment/locale/zh-cn';

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
  selector: 'app-document-advancepayment-detail',
  templateUrl: './document-advancepayment-detail.component.html',
  styleUrls: ['./document-advancepayment-detail.component.scss']
})
export class DocumentAdvancepaymentDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: UIFinAdvPayDocument | null = null;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;

  displayedColumns = ['TranDate', 'TranAmount', 'Desp'];
  dataSource: TemplateDocADPDataSource | null;
  tmpDocOperEvent: EventEmitter<null> = new EventEmitter<null>(null);
  arFrequencies = UIRepeatFrequency.getRepeatFrequencies();

  private _advacntSnapshot: AccountExtraAdvancePayment = null;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(private _dialog: MdDialog,
    private _snackbar: MdSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
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

      this._activateRoute.url.subscribe(x => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'createtransfer') {
            this.detailObject = new UIFinAdvPayDocument();
            this.uiMode = UIMode.Create;
          } else if (x[0].path === 'edittransfer') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'displaytransfer') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readDocumentEvent.subscribe(x2 => {
              if (x2 instanceof Document) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngOninit, succeed to readDocument : ${x2}`);
                }

                this.detailObject.parseDocument(x2);

                if (this.uiMode === UIMode.Change) {
                  this._advacntSnapshot = this.detailObject.AdvPayAccount.clone();
                }
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to readDocument : ${x2}`);
                }

                this.detailObject = new UIFinAdvPayDocument();
                this.uiMode = UIMode.Invalid;
              }
            });

            this._storageService.readDocument(this.routerID);
          } else {
            // Create mode!
            this.detailObject.TranCurr = this._homedefService.ChosedHome.BaseCurrency;
          }
        } else {
          this.uiMode = UIMode.Invalid;
        }
      });
    }, error => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to load depended objects : ${error}`);
      }

      const dlginfo: MessageDialogInfo = {
        Header: 'Common.Error',
        Content: error ? error.toString() : 'Common.Error',
        Button: MessageDialogButtonEnum.onlyok
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo
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
    this.detailObject.TmpDocs = [];

    let rtype = this.detailObject.AdvPayAccount.RepeatType;
    if (this.detailObject.AdvPayAccount.EndDate.isValid || this.detailObject.AdvPayAccount.StartDate.isValid) {
      return;
    }
    
    let ndays: number = this.detailObject.AdvPayAccount.EndDate.diff(this.detailObject.AdvPayAccount.StartDate, 'days');
    let ntimes: number = 0;
    let i: number = 0;
    let arDays = [];

    switch (rtype) {
      case RepeatFrequency.Month:
        ntimes = Math.floor(ndays / 30);
        for (i = 0; i < ntimes; i++) {
          let nDate = this.detailObject.AdvPayAccount.StartDate.add(i, 'M');
          arDays.push(nDate);
        }
        break;

      case RepeatFrequency.Fortnight:
        ntimes = Math.floor(ndays / 14);
        for (i = 0; i < ntimes; i++) {
          let nDate = this.detailObject.AdvPayAccount.StartDate.add(14 * i, 'd');
          arDays.push(nDate);
        }
        break;

      case RepeatFrequency.Week:
        ntimes = Math.floor(ndays / 7);
        for (i = 0; i < ntimes; i++) {
          let nDate = this.detailObject.AdvPayAccount.StartDate.add(7 * i, 'd');
          arDays.push(nDate);
        }
        break;

      case RepeatFrequency.Day:
        ntimes = ndays;
        for (i = 0; i < ntimes; i++) {
          let nDate = this.detailObject.AdvPayAccount.StartDate.add(i, 'd');
          arDays.push(nDate);
        }
        break;

      case RepeatFrequency.Quarter:
        ntimes = Math.floor(ndays / 91);
        for (i = 0; i < ntimes; i++) {
          let nDate = this.detailObject.AdvPayAccount.StartDate.add(i, 'Q');
          arDays.push(nDate);
        }
        break;

      case RepeatFrequency.HalfYear:
        ntimes = Math.floor(ndays / 182);
        for (i = 0; i < ntimes; i++) {
          let nDate = this.detailObject.AdvPayAccount.StartDate.add(6 * i, 'M');
          arDays.push(nDate);
        }
        break;

      case RepeatFrequency.Year:
        ntimes = Math.floor(ndays / 365);
        for (i = 0; i < ntimes; i++) {
          let nDate = this.detailObject.AdvPayAccount.StartDate.add(i, 'y');
          arDays.push(nDate);
        }
        break;

      case RepeatFrequency.Manual:
        ntimes = 0;
        break;

      default:
        break;
    }

    let totalAmt: number = 0;
    for (i = 0; i < ntimes; i++) {
      let item: TemplateDocADP = new TemplateDocADP();
      item.DocId = i + 1;
      item.TranType = this.detailObject.SourceTranType;
      item.TranDate = arDays[i];
      item.TranAmount = Number.parseFloat((this.detailObject.TranAmount / ntimes).toFixed(2));
      totalAmt += item.TranAmount;
      this.detailObject.TmpDocs.push(item);
    }
    if (this.detailObject.TranAmount !== totalAmt) {
      this.detailObject.TmpDocs[0].TranAmount += (this.detailObject.TranAmount - totalAmt);
    }

    if (ntimes === 0) {
      let item = new TemplateDocADP();
      item.DocId = 1;
      item.TranType = this.detailObject.SourceTranType;
      item.TranDate = this.detailObject.AdvPayAccount.StartDate;
      item.TranAmount = this.detailObject.TranAmount;
      this.detailObject.TmpDocs.push(item);
    }

    this.tmpDocOperEvent.emit();
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
        Currencies: this._currService.Currencies
      })) {
        // Show a dialog for error details
        const dlginfo: MessageDialogInfo = {
          Header: 'Common.Error',
          ContentTable: docObj.VerifiedMsgs,
          Button: MessageDialogButtonEnum.onlyok
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo
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
          this._snackbar.open('Message archived', 'OK', {
            duration: 3000
          }).afterDismissed().subscribe(() => {
            // Navigate to display
            this._router.navigate(['/finance/document/displayadp/' + x.Id.toString()]);
          });
        } else {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: 'Common.Error',
            Content: x.toString(),
            Button: MessageDialogButtonEnum.onlyok
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo
          }).afterClosed().subscribe(x2 => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
          });
        }
      });

      docObj.HID = this._homedefService.ChosedHome.ID;
      this._storageService.createDocument(docObj);
    }
  }

  public onCancel(): void {

  }
}
