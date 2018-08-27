import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef, ViewChild, ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAdvancePayment,
  UIFinAdvPayDocument, TemplateDocADP, AccountExtraAdvancePayment, RepeatFrequencyEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  UIDisplayStringUtil, IAccountCategoryFilter,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService, AuthService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { AccountExtADPComponent } from '../account-ext-adp';

@Component({
  selector: 'hih-fin-document-advancepayment-detail',
  templateUrl: './document-advancepayment-detail.component.html',
  styleUrls: ['./document-advancepayment-detail.component.scss'],
})
export class DocumentAdvancepaymentDetailComponent implements OnInit, AfterViewInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: UIFinAdvPayDocument | undefined = undefined;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Enter, comma
  separatorKeysCodes: any[] = [ENTER, COMMA];

  arFrequencies: any = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();

  @ViewChild(AccountExtADPComponent) ctrlAccount: AccountExtADPComponent;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get isChangeMode(): boolean {
    return this.uiMode === UIMode.Change;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _cdr: ChangeDetectorRef,
    private _authService: AuthService,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent constructor...');
    }
    this.detailObject = new UIFinAdvPayDocument();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent ngOnInit...');
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent ngAfterViewInit...');
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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent ngAfterViewInit for activateRoute URL: ${rst.length}`);
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
            this._storageService.readADPDocument(this.routerID).subscribe((x2: any) => {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.log(`AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent ngAfterViewInit for activateRoute URL: ${x2}`);
              }

              this.detailObject.parseDocument(x2);
              this.ctrlAccount.tmpDocs = this.detailObject.TmpDocs;
              // this.tmpDocOperEvent.emit();
            }, (error2: any) => {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Error]: Entering ngAfterViewInit, failed to readADPDocument : ${error2}`);
              }
            });
          }

          this._cdr.detectChanges();
        } else {
          this.uiMode = UIMode.Invalid;
        }
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngAfterViewInit, failed to load depended objects : ${error}`);
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

    this.detailObject.TmpDocs = this.ctrlAccount.tmpDocs;
    if (this.detailObject.TmpDocs.length <= 0) {
      return false;
    }

    return true;
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      this.onCreateADPDoc();
    } else if (this.uiMode === UIMode.Change) {
      this.onUpdateADPDoc();
    }
  }

  public onBackToPreviousPage(): void {
    this._router.navigate(['/finance/document/']);
  }

  public onTerminate(): void {
    // Terminate current advance payment account
  }

  private onInitCreateMode(): void {
    this.detailObject = new UIFinAdvPayDocument();
    this.uiMode = UIMode.Create;
    this.uiAccountStatusFilter = 'Normal';
    this.uiAccountCtgyFilter = {
      skipADP: true,
      skipLoan: true,
      skipAsset: true,
    };
    this.uiOrderFilter = true;
    this.detailObject.TmpDocs = [];
    this.ctrlAccount.tmpDocs = [];

    this.detailObject.TranCurr = this._homedefService.ChosedHome.BaseCurrency;
  }

  private onCreateADPDoc(): void {
    let docObj: any = this.detailObject.generateDocument();

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
          // this._router.navigate(['/finance/document/createadp/']);
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
    acntobj.CategoryId = financeAccountCategoryAdvancePayment;
    acntobj.Name = docObj.Desp;
    acntobj.Comment = docObj.Desp;
    acntobj.OwnerId = this._authService.authSubject.getValue().getUserId();
    acntobj.ExtraInfo = this.detailObject.AdvPayAccount;
    sobj.accountVM = acntobj.writeJSONObject();

    sobj.TmpDocs = [];
    this.detailObject.TmpDocs = this.ctrlAccount.tmpDocs;
    for (let td of this.detailObject.TmpDocs) {
      td.HID = acntobj.HID;
      td.ControlCenterId = this.detailObject.SourceControlCenterId;
      td.OrderId = this.detailObject.SourceOrderId;
      if (td.Desp.length > 45) {
        td.Desp = td.Desp.substring(0, 44);
      }

      sobj.TmpDocs.push(td.writeJSONObject());
    }

    this._storageService.createADPDocument(sobj);
  }

  private onUpdateADPDoc(): void {
    // TBD.
  }
}
