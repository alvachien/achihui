import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, FinanceDocType_Normal, UICommonLabelEnum, COMMA,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { ENTER } from '@angular/cdk/keycodes';

/**
 * Data source of Document Items
 */
export class DocumentItemDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentDetailComponent) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentItem[]> {
    const displayDataChanges: any[] = [
      this._parentComponent.itemOperEvent,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      return this._parentComponent.detailObject.Items;
    });
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-finance-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss'],
})
export class DocumentDetailComponent implements OnInit {
  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: Document | undefined = undefined;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  public arUIAccount: UIAccountForSelection[] = [];
  public arUIOrder: UIOrderForSelection[] = [];
  // Enter, comma
  separatorKeysCodes: any[] = [ENTER, COMMA];

  displayedColumns: string[] = ['ItemId', 'AccountId', 'TranType', 'Amount', 'Desp', 'ControlCenter', 'Order'];
  dataSource: DocumentItemDataSource | null;
  itemOperEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isForeignCurrency(): boolean {
    if (this.detailObject && this.detailObject.TranCurr !== this._homedefService.ChosedHome.BaseCurrency) {
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
    public _currService: FinCurrencyService) {
    this.detailObject = new Document();
    this.dataSource = new DocumentItemDataSource(this);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit...');
    }

    Observable.forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories, true);
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);

      this._activateRoute.url.subscribe((x: any) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'create') {
            this.onInitCreateMode();
          } else if (x[0].path === 'edit') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'display') {
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

                this.detailObject = x2;
                this.itemOperEvent.emit(); // Show the items
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to readDocument : ${x2}`);
                }

                this.detailObject = new Document();
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
    this.detailObject.Desp = this.detailObject.Desp.trim();
    if (this.detailObject.Desp.length <= 0) {
      return false;
    }

    return true;
  }

  public onCreateDocItem(): void {
    let di: DocumentItem = new DocumentItem();
    di.ItemId = this.getNextItemID();
    this.detailObject.Items.push(di);
    this.itemOperEvent.emit();
  }

  public onDeleteDocItem(di: any): void {
    let idx: number = 0;
    for (let i: number = 0; i < this.detailObject.Items.length; i ++) {
      if (this.detailObject.Items[i].ItemId === di.ItemId) {
        idx = i;
        break;
      }
    }

    this.detailObject.Items.splice(idx);
    this.itemOperEvent.emit();
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      // Check!
      if (!this.detailObject.onVerify({
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
          ContentTable: this.detailObject.VerifiedMsgs,
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
          console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof Document) {
          let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), 
            this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 3000,
          });

          let recreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            recreate = true;

            this.onInitCreateMode();
            this.setStep(0);
            this.itemOperEvent.emit();
            // this._router.navigate(['/finance/document/create/']);
          });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            if (!recreate) {
              this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
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

      this.detailObject.HID = this._homedefService.ChosedHome.ID;
      this._storageService.createDocument(this.detailObject);
    }
  }

  public onBackToList(): void {
    this._router.navigate(['/finance/document/']);
  }

  private getNextItemID(): number {
    if (this.detailObject.Items.length <= 0) {
      return 1;
    }

    let nMax: number = 0;
    for (let item of this.detailObject.Items) {
      if (item.ItemId > nMax) {
        nMax = item.ItemId;
      }
    }

    return nMax + 1;
  }

  private onInitCreateMode(): void {
    this.detailObject = new Document();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
    this.detailObject.TranCurr = this._homedefService.ChosedHome.BaseCurrency;
  }
}
