import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { Observable, forkJoin, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, financeDocTypeNormal, UICommonLabelEnum,
  Currency, TranType, DocumentType, ControlCenter, Order, Account, financeDocTypeTransfer,
  financeDocTypeCurrencyExchange, financeDocTypeAdvancePayment, financeDocTypeAdvanceReceived,
  financeDocTypeAssetBuyIn, financeDocTypeAssetSoldOut, financeDocTypeAssetValChg, financeDocTypeLendTo,
  financeDocTypeBorrowFrom, financeDocTypeRepay,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent, popupDialog, } from '../../message-dialog';

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
    private _homedefService: HomeDefDetailService,
    private _storageService: FinanceStorageService,
    private _currService: FinCurrencyService,
    private _chgDetector: ChangeDetectorRef) {
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
              this._storageService.readDocument(this.routerID).pipe(takeUntil(this.destroyed$))
              .subscribe((x2: Document) => {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.debug(`AC_HIH_UI [Debug]: Entering DocumentDetailComponent, ngOninit, readDocument`);
                }

                // Check whether we need additional fetch for account
                let addreqs: any[] = [];
                x2.Items.forEach((docitem: DocumentItem) => {
                  if (this._storageService.Accounts.findIndex((acnt: Account) => {
                    return acnt.Id === docitem.AccountId;
                  }) === -1) {
                    addreqs.push(this._storageService.readAccount(docitem.AccountId));
                  }

                  if (docitem.OrderId) {
                    if (this._storageService.Orders.findIndex((ord: Order) => {
                      return ord.Id === docitem.AccountId;
                    }) === -1) {
                      addreqs.push(this._storageService.readOrder(docitem.OrderId));
                    }
                  }
                });
                if (addreqs.length > 0) {
                  forkJoin(addreqs).subscribe(() => {
                    this.arAccounts = this._storageService.Accounts.slice();
                    this.arOrders = this._storageService.Orders.slice();

                    this._setDocumentContent(x2);
                  });
                } else {
                  this._setDocumentContent(x2);
                }
              }, (error: any) => {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering DocumentDetailComponent, ngOninit, readDocument failed: ${error}`);
                }

                popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
                  error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
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

        popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));

        this.uiMode = UIMode.Invalid;
      });
  }

  ngOnDestroy(): void {
    if (this.destroyed$) {
      this.destroyed$.next(true);
      this.destroyed$.complete();
    }
  }

  public onHeaderCurrencyChanged(curr: string): void {
    this.tranCurr = curr;
  }
  public onHeaderCurrency2Changed(curr: string): void {
    this.tranCurr2 = curr;
  }
  public onBackToList(): void {
    this._router.navigate(['/finance/document/']);
  }
  public onSubmit(): void {
    if (this.isSubmitButtonDisabled) {
      return;
    }

    switch (this.curDocType) {
      case financeDocTypeNormal:            this._updateNormalDoc();        break;
      case financeDocTypeTransfer:          this._updateTransferDoc();      break;
      case financeDocTypeCurrencyExchange:  this._updateCurrExgDoc();       break;
      case financeDocTypeAdvancePayment:    this._updateADPDoc();           break;
      case financeDocTypeAdvanceReceived:   this._updateADRDoc();           break;
      case financeDocTypeAssetBuyIn:        this._updateAssetBuyDoc();      break;
      case financeDocTypeAssetSoldOut:      this._updateAssetSoldDoc();     break;
      case financeDocTypeAssetValChg:       this._updateAssetValChgDoc();   break;
      case financeDocTypeLendTo:            this._updateLendToDoc();        break;
      case financeDocTypeBorrowFrom:        this._updateBorrowFromDoc();    break;
      case financeDocTypeRepay:             this._updateRepayDoc();         break;

      default: break;
    }
  }
  private _updateDoc(doc: Document): void {
    if (!doc.onVerify({ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranTypes,
      Currencies: this.arCurrencies,
      BaseCurrency: this._homedefService.ChosedHome.BaseCurrency,
    })) {
      // Show a error dialog
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, doc.VerifiedMsgs);
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
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }
  private _updateNormalDoc(): void {
    // For normal document, just update the whole document.
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.Items.forEach((val: DocumentItem) => {
      val.DocId = this.routerID;
    });
    doc.DocType = financeDocTypeNormal;

    this._updateDoc(doc);
  }
  private _updateTransferDoc(): void {
    // For transfer document, just update the whole document.
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.Items.forEach((val: DocumentItem) => {
      val.DocId = this.routerID;
    });
    doc.DocType = financeDocTypeTransfer;

    this._updateDoc(doc);
  }
  private _updateCurrExgDoc(): void {
    // For transfer document, just update the whole document.
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.Items.forEach((val: DocumentItem) => {
      val.DocId = this.routerID;
    });
    doc.DocType = financeDocTypeCurrencyExchange;

    this._updateDoc(doc);
  }
  private _updateADPDoc(): void {
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.Items.forEach((val: DocumentItem) => {
      val.DocId = this.routerID;
    });
    doc.DocType = financeDocTypeAdvancePayment;

    this._updateDoc(doc);

  }
  private _updateADRDoc(): void {
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.Items.forEach((val: DocumentItem) => {
      val.DocId = this.routerID;
    });
    doc.DocType = financeDocTypeAdvanceReceived;

    this._updateDoc(doc);
  }
  private _updateAssetBuyDoc(): void {
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.Items.forEach((val: DocumentItem) => {
      val.DocId = this.routerID;
    });
    doc.DocType = financeDocTypeAssetBuyIn;

    this._updateDoc(doc);
  }
  private _updateAssetSoldDoc(): void {
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.Items.forEach((val: DocumentItem) => {
      val.DocId = this.routerID;
    });
    doc.DocType = financeDocTypeAssetSoldOut;

    this._updateDoc(doc);
  }
  private _updateAssetValChgDoc(): void {
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.Items.forEach((val: DocumentItem) => {
      val.DocId = this.routerID;
    });
    doc.DocType = financeDocTypeAssetValChg;

    this._updateDoc(doc);
  }
  private _updateLendToDoc(): void {
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.Items.forEach((val: DocumentItem) => {
      val.DocId = this.routerID;
    });
    doc.DocType = financeDocTypeLendTo;

    this._updateDoc(doc);
  }
  private _updateBorrowFromDoc(): void {
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.Items.forEach((val: DocumentItem) => {
      val.DocId = this.routerID;
    });
    doc.DocType = financeDocTypeBorrowFrom;

    this._updateDoc(doc);
  }
  private _updateRepayDoc(): void {
    let doc: Document = this.headerGroup.get('headerControl').value;
    doc.Items = this.itemGroup.get('itemControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.Id = this.routerID;
    doc.Items.forEach((val: DocumentItem) => {
      val.DocId = this.routerID;
    });
    doc.DocType = financeDocTypeRepay;

    this._updateDoc(doc);
  }
  private _setDocumentContent(x2: Document): void{
    this.curDocType = x2.DocType;
    this.tranCurr = x2.TranCurr;
    this.tranCurr2 = x2.TranCurr2;
    this.headerGroup.get('headerControl').setValue(x2);
    this.itemGroup.get('itemControl').setValue(x2.Items);
    this.headerGroup.markAsPristine();
    this.headerGroup.markAsUntouched();
    this.itemGroup.markAsPristine();
    this.itemGroup.markAsUntouched();
  }
}
