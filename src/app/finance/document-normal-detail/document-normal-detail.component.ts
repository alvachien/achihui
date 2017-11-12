import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatChipInputEvent } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, FinanceDocType_Normal, COMMA,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { ENTER } from '@angular/cdk/keycodes';

/**
 * Data source of Normal Document Items
 */
export class NormalDocumentItemDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentNormalDetailComponent) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentItem[]> {
    const displayDataChanges = [
      this._parentComponent.itemOperEvent,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      return this._parentComponent.detailObject.Items;
    });
  }

  disconnect() { }
}

@Component({
  selector: 'app-document-normal-detail',
  templateUrl: './document-normal-detail.component.html',
  styleUrls: ['./document-normal-detail.component.scss'],
})
export class DocumentNormalDetailComponent implements OnInit {
  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: Document | null = null;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  public arUIAccount: UIAccountForSelection[] = [];
  public arUIOrder: UIOrderForSelection[] = [];
  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];
    
  displayedColumns = ['itemid', 'accountid', 'trantype', 'amount', 'desp', 'controlcenter', 'order', 'tag'];
  dataSource: NormalDocumentItemDataSource | null;
  itemOperEvent: EventEmitter<null> = new EventEmitter<null>(null);

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
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
    this.detailObject = new Document();
    this.detailObject.DocType = FinanceDocType_Normal;
    this.dataSource = new NormalDocumentItemDataSource(this);
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentNormalDetailComponent ngOnInit...');
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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentNormalDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories, true, true, true);
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      
      this._activateRoute.url.subscribe((x) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'createnormal') {
            this.onInitCreateMode();
          } else if (x[0].path === 'editnormal') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'displaynormal') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readDocumentEvent.subscribe((x2) => {
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
                this.detailObject.DocType = FinanceDocType_Normal;
              }
            });

            this._storageService.readDocument(this.routerID);
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

  public setStep(index: number) {
    this.step = index;
  }

  public nextStep() {
    this.step++;
  }

  public prevStep() {
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

  public onCreateDocItem() {
    let di: DocumentItem = new DocumentItem();
    di.ItemId = this.getNextItemID();
    this.detailObject.Items.push(di);
    this.itemOperEvent.emit();
  }

  public onDeleteDocItem(di) {
    let idx: number = -1;
    for (let i: number = 0; i < this.detailObject.Items.length; i ++) {
      if (this.detailObject.Items[i].ItemId === di.ItemId) {
        idx = i;
        break;
      }
    }

    if (idx !== -1) {
      this.detailObject.Items.splice(idx);
      this.itemOperEvent.emit();
    }
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

  public onSubmit() {
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
          console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentNormalDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof Document) {
          // Show the snackbar
          let snackbarRef = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), 
            this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 3000,
          });
          
          let isrecreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Entering DocumentNormalDetailComponent, Snackbar onAction()`);
            }

            isrecreate = true;
            // Re-initial the page for another create
            this.onInitCreateMode();
            this.setStep(0);            
            this.itemOperEvent.emit();
          });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Entering DocumentNormalDetailComponent, Snackbar afterDismissed with ${isrecreate}`);
            }
            
            if (!isrecreate) {
              this._router.navigate(['/finance/document/displaynormal/' + x.Id.toString()]);
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
          }).afterClosed().subscribe((x2) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Entering DocumentNormalDetailComponent, Message dialog result ${x2}`);
            }
          });
        }
      });

      this.detailObject.HID = this._homedefService.ChosedHome.ID;
      this.detailObject.DocType = FinanceDocType_Normal;
      this._storageService.createDocument(this.detailObject);
    }
  }

  public onCancel(): void {
    this._router.navigate(['/finance/document/']);
  }

  private onInitCreateMode() {
    this.detailObject = new Document();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
    this.detailObject.DocType = FinanceDocType_Normal;

    this.detailObject.TranCurr = this._homedefService.ChosedHome.BaseCurrency;
  }

  public addItemTag(row: DocumentItem, $event: MatChipInputEvent): void {
    let input = $event.input;
    let value = $event.value;

    // Add new Tag
    if ((value || '').trim()) {
      row.Tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public removeItemTag(row: DocumentItem, tag: any): void {
    let index = row.Tags.indexOf(tag);

    if (index >= 0) {
      row.Tags.splice(index, 1);
    }
  }  
}
