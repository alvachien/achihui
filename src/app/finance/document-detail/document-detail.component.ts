import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { Observable, forkJoin, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, financeDocTypeNormal, UICommonLabelEnum,
  Currency, TranType, DocumentType, ControlCenter, Order, Account, financeDocTypeTransfer,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-finance-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss'],
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean>;
  public routerID: number = -1; // Current object ID in routing

  public currentMode: string;
  public uiMode: UIMode = UIMode.Display;
  public arCurrencies: Currency[] = [];
  public arTranTypes: TranType[] = [];
  public arDocTypes: DocumentType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arOrders: Order[] = [];
  // Form group
  public headerGroup: FormGroup = new FormGroup({
    headerControl: new FormControl('', Validators.required),
  });
  public itemGroup: FormGroup = new FormGroup({
    itemControl: new FormControl('', Validators.required),
  });
  curDocType: number;
  tranCurr: string;
  tranCurr2: string;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Change;
  }
  get isSubmitButtonDisabled(): boolean {
    if (this.isFieldChangable && (this.headerGroup.valid && (this.headerGroup.touched || this.headerGroup.dirty))
      || (this.itemGroup.valid && (this.itemGroup.touched || this.itemGroup.dirty))) {
      return false; // In this case, the submit button shall enable
    }

    return true;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentDetailComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit...');
    }

    this.destroyed$ = new ReplaySubject(1);

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe((rst: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
        }
        this.arDocTypes = rst[1];
        this.arTranTypes = rst[2];
        this.arAccounts = rst[3];
        this.arControlCenters = rst[4];
        this.arOrders = rst[5];
        this.arCurrencies = rst[6];

        this._activateRoute.url.subscribe((x: any) => {
          if (x instanceof Array && x.length > 0) {
            if (x[0].path === 'create') {
              // Create is not allowed!
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Error]: Entering DocumentDetailComponent, ngOninit, error in wrong create mode!`);
              }
              this.uiMode = UIMode.Invalid;
            } else if (x[0].path === 'edit') {
              this.routerID = +x[1].path;

              this.uiMode = UIMode.Change;
            } else if (x[0].path === 'display') {
              this.routerID = +x[1].path;

              this.uiMode = UIMode.Display;
            }
            this.currentMode = getUIModeString(this.uiMode);

            if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
              this._storageService.readDocument(this.routerID).pipe(takeUntil(this.destroyed$)).subscribe((x2: any) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.debug(`AC_HIH_UI [Debug]: Entering DocumentDetailComponent, ngOninit, readDocument`);
                }

                this.curDocType = x2.DocType;
                this.tranCurr = x2.tranCurr;
                this.tranCurr2 = x2.tranCurr2;
                this.headerGroup.get('headerControl').setValue(x2);
                this.itemGroup.get('itemControl').setValue(x2.Items);

                if (this.uiMode === UIMode.Display) {
                  this.headerGroup.disable();
                  this.itemGroup.disable();
                } else {
                  this.headerGroup.enable();
                  this.itemGroup.enable();
                }
                this.headerGroup.markAsPristine();
                this.headerGroup.markAsUntouched();
                this.itemGroup.markAsPristine();
                this.itemGroup.markAsUntouched();
              }, (error: any) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering DocumentDetailComponent, ngOninit, readDocument failed: ${error}`);
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
              });
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

  ngOnDestroy(): void {
    if (this.destroyed$) {
      this.destroyed$.next(true);
      this.destroyed$.complete();
    }
  }

  public onBackToList(): void {
    this._router.navigate(['/finance/document/']);
  }
  public onSubmit(): void {
    if (this.isSubmitButtonDisabled) {
      return;
    }

    switch (this.curDocType) {
      case financeDocTypeNormal:      this._updateNormalDoc();        break;
      case financeDocTypeTransfer:    this._updateTransferDoc();      break;

      default: break;
    }
  }
  private _updateNormalDoc(): void {
    // For normal document, just update the whole document.
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.DocType = financeDocTypeNormal;

    if (!doc.onVerify({ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranTypes,
      Currencies: this.arCurrencies,
      BaseCurrency: this._homedefService.ChosedHome.BaseCurrency,
    })) {
      // Show a error dialog
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: doc.VerifiedMsgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });
      return;
    }

    this._storageService.updateNormalDocument(doc).subscribe((rst: Document) => {
      // Switch to display mode
      this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.UpdatedSuccess), undefined, {
        duration: 2000,
      }).afterDismissed().subscribe(() => {
        this._router.navigate(['/finance/document/display/' + this.routerID.toString()]);
      });
    }, (error: any) => {
      // Show a error dialog
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
    });
  }
  private _updateTransferDoc(): void {
    // Do nothing.
  }
}
