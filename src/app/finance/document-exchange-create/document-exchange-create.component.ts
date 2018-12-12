import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef, ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatHorizontalStepper } from '@angular/material';
import { Observable, Subject, BehaviorSubject, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import {
  LogLevel, Document, DocumentItem, UIFinCurrencyExchangeDocument,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  UIMode, getUIModeString, financeDocTypeCurrencyExchange, DocumentWithPlanExgRate, DocumentWithPlanExgRateForUpdate,
  IAccountCategoryFilter, momentDateFormat, financeTranTypeTransferIn, financeTranTypeTransferOut,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'hih-document-exchange-create',
  templateUrl: './document-exchange-create.component.html',
  styleUrls: ['./document-exchange-create.component.scss'],
})
export class DocumentExchangeCreateComponent implements OnInit {
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Stepper
  @ViewChild(MatHorizontalStepper) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: From
  public fromFormGroup: FormGroup;
  // Step: To
  public toFormGroup: FormGroup;
  // Step: Prev. doc items
  separatorKeysCodes: any[] = [ENTER, COMMA];
  dataSource: MatTableDataSource<DocumentWithPlanExgRate> = new MatTableDataSource<DocumentWithPlanExgRate>();
  displayedColumns: string[] = ['select', 'DocID', 'DocType', 'TranDate', 'Desp', 'Currency',
    'ExchangeRate', 'PropExchangeRate', 'Currency2', 'ExchangeRate2', 'PropExchangeRate2',
  ];
  selection: any = new SelectionModel<DocumentWithPlanExgRate>(true, []);

  get tranDateString(): string {
    let datctrl: any = this.firstFormGroup.get('dateControl');
    if (datctrl && datctrl.value && datctrl.value.format) {
      return datctrl.value.format(momentDateFormat);
    }

    return '';
  }
  get sourceCurrency(): string {
    let currctrl: any = this.fromFormGroup.get('currControl');
    if (currctrl) {
      return currctrl.value;
    }
  }
  get isForeignSourceCurrency(): boolean {
    if (this.sourceCurrency && this.sourceCurrency !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }

  get targetCurrency(): string {
    let currctrl: any = this.toFormGroup.get('currControl');
    if (currctrl) {
      return currctrl.value;
    }
  }
  get isForeignTargetCurrency(): boolean {
    if (this.targetCurrency && this.targetCurrency !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent ngOnInit...');
    }

    this.firstFormGroup = this._formBuilder.group({
      dateControl: [{ value: moment(), disabled: false }, Validators.required],
      despControl: ['', Validators.required],
    });

    this.fromFormGroup = this._formBuilder.group({
      accountControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      currControl: ['', Validators.required],
      exgControl: [''],
      ccControl: [''],
      orderControl: [''],
    });

    this.toFormGroup = this._formBuilder.group({
      accountControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      currControl: ['', Validators.required],
      exgControl: [''],
      ccControl: [''],
      orderControl: [''],
    });
    this.dataSource.data = [];

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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentExchangeCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      this.uiOrderFilter = undefined;
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected: number = this.selection.selected.length;
    const numRows: number = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach((row: any) => this.selection.select(row));
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering onStepSelectionChange in DocumentExchangeCreateComponent: ${event.selectedIndex}`);
    }

    // Perform checks
    if (event.selectedIndex === 3) {
      let arrqt: any[] = [];
      let arprvdocs: any[] = [];
      if (this.isForeignSourceCurrency) {
        arrqt.push(this._storageService.fetchPreviousDocWithPlanExgRate(this.sourceCurrency));
      } else if (this.isForeignTargetCurrency) {
        arrqt.push(this._storageService.fetchPreviousDocWithPlanExgRate(this.targetCurrency));
      }

      forkJoin(arrqt).subscribe((x: any) => {
        if (x instanceof Array && x.length > 0) {
          for (let it of x) {
            if (it && it instanceof Array && it.length > 0) {
              for (let itdtl of it) {
                if (itdtl) {
                  let pvdoc: DocumentWithPlanExgRate = new DocumentWithPlanExgRate();
                  pvdoc.onSetData(itdtl);
                  arprvdocs.push(pvdoc);
                }
              }
            }
          }

          this.dataSource.data = arprvdocs;
        }
      });
    }
  }

  // Reset button
  onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
  }

  onSubmit(): void {
    let docObj: Document = this._generateDocument();

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
        console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentExchangeCreateComponent with : ${x}`);
      }

      // Navigate back to list view
      if (x instanceof Document) {
        let cobj: DocumentWithPlanExgRateForUpdate = new DocumentWithPlanExgRateForUpdate();
        cobj.hid = this._homedefService.ChosedHome.ID;
        if (this.selection.length > 0) {
          for (let pd of this.selection) {
            if (pd) {
              cobj.docIDs.push(pd.DocID);
            }
          }
        }

        if (cobj.docIDs.length > 0) {
          if (this.isForeignSourceCurrency) {
            cobj.targetCurrency = this.sourceCurrency;
            cobj.exchangeRate = this.fromFormGroup.get('exgControl').value;
          } else if (this.isForeignTargetCurrency) {
            cobj.targetCurrency = this.targetCurrency;
            cobj.exchangeRate = this.toFormGroup.get('exgControl').value;
          }

          this._storageService.updatePreviousDocWithPlanExgRate(cobj).subscribe((rst: any) => {
            let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
              this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
              duration: 3000,
            });

            let recreate: boolean = false;
            snackbarRef.onAction().subscribe(() => {
              this.onReset();
            });

            snackbarRef.afterDismissed().subscribe(() => {
              // Navigate to display
              if (!recreate) {
                this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
              }
            });
          }, (error: any) => {
            if (environment.LoggingLevel >= LogLevel.Error) {
              console.error(`AC_HIH_UI [Debug]: Message dialog result ${error}`);
            }

            // Show something?
            this._snackbar.open('Document Posted but previous doc failed to update', 'OK', {
              duration: 3000,
            }).afterDismissed().subscribe(() => {
              // Navigate to display
              this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
            });
          });
        } else {
          // Show the snackbar
          this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), 'OK', {
            duration: 3000,
          }).afterDismissed().subscribe(() => {
            // Navigate to display
            this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
          });
        }
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
    this._storageService.createDocument(docObj);
  }

  private _generateDocument(): Document {
    let doc: Document = new Document();
    doc.DocType = financeDocTypeCurrencyExchange;
    doc.Desp = this.firstFormGroup.get('despControl').value;
    doc.TranCurr = this.sourceCurrency;
    doc.TranCurr2 = this.targetCurrency;
    doc.ExgRate = this.fromFormGroup.get('exgControl').value;
    doc.ExgRate2 = this.toFormGroup.get('exgControl').value;

    let docitem: DocumentItem = new DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.fromFormGroup.get('accountControl').value;
    docitem.ControlCenterId = this.fromFormGroup.get('ccControl').value;
    docitem.OrderId = this.fromFormGroup.get('orderControl').value;
    docitem.TranType = financeTranTypeTransferOut;
    docitem.TranAmount = this.fromFormGroup.get('amountControl').value;
    docitem.Desp = doc.Desp;
    doc.Items.push(docitem);

    docitem = new DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.toFormGroup.get('accountControl').value;
    docitem.TranType = financeTranTypeTransferIn;
    docitem.ControlCenterId = this.toFormGroup.get('ccControl').value;
    docitem.OrderId = this.toFormGroup.get('orderControl').value;
    docitem.TranAmount = this.toFormGroup.get('amountControl').value;
    docitem.UseCurr2 = true;
    docitem.Desp = doc.Desp;
    doc.Items.push(docitem);

    return doc;
  }
}
