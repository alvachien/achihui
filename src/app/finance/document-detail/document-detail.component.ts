import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { Observable, forkJoin, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, financeDocTypeNormal, UICommonLabelEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilter, Currency, TranType, DocumentType, ControlCenter } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { ENTER, COMMA, } from '@angular/cdk/keycodes';

@Component({
  selector: 'hih-finance-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  private routerID: number = -1; // Current object ID in routing
  private destroyed$: ReplaySubject<boolean>;

  public currentMode: string;
  public detailObject: Document | undefined = undefined;
  public uiMode: UIMode = UIMode.Display;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public arCurrencies: Currency[] = [];
  public arTranTypes: TranType[] = [];
  public arDocTypes: DocumentType[] = [];
  public arControlCenters: ControlCenter[] = [];
  // Enter, comma
  separatorKeysCodes: any[] = [ENTER, COMMA];

  dataSource: MatTableDataSource<DocumentItem> = new MatTableDataSource<DocumentItem>();
  displayedColumns: string[] = ['ItemId', 'AccountId', 'TranType', 'TranAmount', 'Desp', 'ControlCenterId', 'OrderId'];
  expandedItem: DocumentItem;

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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentDetailComponent constructor...');
    }
    this.detailObject = new Document();
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
      this.arControlCenters = rst[4];
      this.arCurrencies = rst[6];

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(rst[3], rst[0]);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(rst[5]);
      this.uiOrderFilter = undefined;

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

            this.uiMode = UIMode.Display;
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

              this.detailObject = x2;
              this.dataSource.data = this.detailObject.Items;
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

  public getHeaderDisplayString(hdr: string): string {
    switch (hdr) {
      case 'ItemId':
      return '#';

      case 'AccountId':
      return 'Finance.Account';

      case 'TranType':
      return 'Finance.TransactionType';

      case 'TranAmount':
      return 'Finance.Amount';

      case 'Desp':
      return 'Common.Comment';

      case 'ControlCenterId':
      return 'Finance.ControlCenter';

      case 'OrderId':
      return 'Finance.Order';

      default:
      return '';
    }
  }

  public onBackToList(): void {
    this._router.navigate(['/finance/document/']);
  }
}
