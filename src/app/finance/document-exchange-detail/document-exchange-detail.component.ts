import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable, Subject, BehaviorSubject, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIFinCurrencyExchangeDocument,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  UIMode, getUIModeString, financeDocTypeCurrencyExchange, DocumentWithPlanExgRate, DocumentWithPlanExgRateForUpdate,
  IAccountCategoryFilter } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'hih-finance-document-exchange-detail',
  templateUrl: './document-exchange-detail.component.html',
  styleUrls: ['./document-exchange-detail.component.scss'],
})
export class DocumentExchangeDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: UIFinCurrencyExchangeDocument | undefined = undefined;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Enter, comma
  separatorKeysCodes: any[] = [ENTER, COMMA];

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isForeignSourceCurrency(): boolean {
    if (this.detailObject && this.detailObject.SourceTranCurr && this.detailObject.SourceTranCurr !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }
  get isForeignTargetCurrency(): boolean {
    if (this.detailObject && this.detailObject.TargetTranCurr && this.detailObject.TargetTranCurr !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }

  // headerFormGroup: FormGroup;
  // sourceFormGroup: FormGroup;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService,
    private _formBuilder: FormBuilder) {
    this.detailObject = new UIFinCurrencyExchangeDocument();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentExchangeDetailComponent ngOnInit...');
    }

    // this.headerFormGroup = this._formBuilder.group({
    //   hdrDateCtrl: ['', Validators.required],
    //   hdrDespCtrl: ['', Validators.required],
    // });
    // this.sourceFormGroup = this._formBuilder.group({
    //   srcAccountCtrl: ['', Validators.required],
    //   srcCurrCtrl: ['', Validators.required],
    //   srcAmountCtrl: ['', Validators.required],
    // });

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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentExchangeDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
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
          if (x[0].path === 'createexg') {
            this.onInitCreateMode();
          } else if (x[0].path === 'editexg') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'displayexg') {
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

                this.detailObject.parseDocument(x2);
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to readDocument : ${x2}`);
                }

                this.detailObject = new UIFinCurrencyExchangeDocument();
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

  public onFetchPreviousDoc(): void {
    this.detailObject.prvdocs = [];
    if (this.isForeignSourceCurrency) {
      this._storageService.fetchPreviousDocWithPlanExgRate(this.detailObject.SourceTranCurr)
      .subscribe((x: any) => {
        if (x instanceof Array && x.length > 0) {
          for (let it of x) {
            let pvdoc: DocumentWithPlanExgRate = new DocumentWithPlanExgRate();
            pvdoc.onSetData(it);
            this.detailObject.prvdocs.push(pvdoc);
          }
        }
      });
    }

    if (this.isForeignTargetCurrency) {
      this._storageService.fetchPreviousDocWithPlanExgRate(this.detailObject.TargetTranCurr)
        .subscribe((x: any) => {
        if (x instanceof Array && x.length > 0) {
          for (let it of x) {
            let pvdoc: DocumentWithPlanExgRate = new DocumentWithPlanExgRate();
            pvdoc.onSetData(it);
            this.detailObject.prvdocs.push(pvdoc);
         }
        }
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

    return true;
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
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
          console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentExchangeDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof Document) {
          let cobj: DocumentWithPlanExgRateForUpdate = new DocumentWithPlanExgRateForUpdate();
          cobj.hid = this._homedefService.ChosedHome.ID;
          if (this.detailObject.prvdocs.length > 0) {
            for (let pd of this.detailObject.prvdocs) {
              if (pd.Selected) {
                cobj.docIDs.push(pd.DocID);
              }
            }
          }

          if (cobj.docIDs.length > 0) {
            if (this.isForeignSourceCurrency) {
              cobj.targetCurrency = this.detailObject.SourceTranCurr;
              cobj.exchangeRate = this.detailObject.SourceExchangeRate;
            } else if (this.isForeignTargetCurrency) {
              cobj.targetCurrency = this.detailObject.TargetTranCurr;
              cobj.exchangeRate = this.detailObject.TargetExchangeRate;
            }

            this._storageService.updatePreviousDocWithPlanExgRate(cobj).subscribe((rst: any) => {
              let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
                this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
                duration: 3000,
              });

              let recreate: boolean = false;
              snackbarRef.onAction().subscribe(() => {
                recreate = true;

                this.onInitCreateMode();
                // this._router.navigate(['/finance/document/create/']);
              });

              snackbarRef.afterDismissed().subscribe(() => {
                // Navigate to display
                if (!recreate) {
                  this._router.navigate(['/finance/document/displayexg/' + x.Id.toString()]);
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
                this._router.navigate(['/finance/document/displayexg/' + x.Id.toString()]);
              });
            });
          } else {
            // Show the snackbar
            this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), 'OK', {
              duration: 3000,
            }).afterDismissed().subscribe(() => {
              // Navigate to display
              this._router.navigate(['/finance/document/displayexg/' + x.Id.toString()]);
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
    } else if (this.uiMode === UIMode.Change) {
      // Empty
    }
  }

  public onBackToList(): void {
    this._router.navigate(['/finance/document/']);
  }

  private onInitCreateMode(): void {
    this.detailObject = new UIFinCurrencyExchangeDocument();
    this.uiMode = UIMode.Create;
    this.uiAccountStatusFilter = 'Normal';
    this.uiAccountCtgyFilter = {
      skipADP: true,
      skipLoan: true,
      skipAsset: true,
    };
    this.uiOrderFilter = true;

    this.detailObject.SourceTranCurr = this._homedefService.ChosedHome.BaseCurrency;
    this.detailObject.TargetTranCurr = this._homedefService.ChosedHome.BaseCurrency;
  }
}
