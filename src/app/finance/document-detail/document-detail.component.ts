import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MdDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

/**
 * Data source of Document Items
 */
export class DocumentItemDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentDetailComponent) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentItem[]> {
    return Observable.of(this._parentComponent.detailObject.Items);
  }

  disconnect() { }
}

@Component({
  selector: 'app-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss'],
})
export class DocumentDetailComponent implements OnInit {
  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: Document | null = null;
  public curItemObject: DocumentItem | null = null;
  public uiMode: UIMode = UIMode.Create;
  public itemUIMode: UIMode = UIMode.Invalid;
  public step: number = 0;

  displayedColumns = ['ItemId', 'AccountID', 'TranType', 'Amount', 'Desp'];
  dataSource: DocumentItemDataSource | null;

  get IsItemDetailView(): boolean {
    return this.itemUIMode === UIMode.Create || this.itemUIMode === UIMode.Change;
  }
  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isItemFieldChangable(): boolean {
    return this.itemUIMode === UIMode.Create || this.itemUIMode === UIMode.Change;
  }

  constructor(private _dialog: MdDialog,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
    this.detailObject = new Document();
    this.curItemObject = new DocumentItem();
    this.dataSource = new DocumentItemDataSource(this);
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit...');
    }

    Observable.forkJoin([
      this._storageService.listDocTypeChange,
      this._storageService.listControlCenterChange,
      this._storageService.listAccountChange,
      this._storageService.listOrderChange,
      this._storageService.listTranTypeChange,
      this._currService.listDataChange
    ]).subscribe(() => {
      // Distinguish current mode
      this._activateRoute.url.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit for activateRoute URL: ${x}`);
        }

        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'create') {
            this.currentMode = 'Common.Create';
            this.detailObject = new Document();
            this.uiMode = UIMode.Create;
            this.detailObject.HID = this._homedefService.ChosedHome.ID;
          } else if (x[0].path === 'edit') {
            this.routerID = +x[1].path;

            this.currentMode = 'Common.Edit';
            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'display') {
            this.routerID = +x[1].path;

            this.currentMode = 'Common.Display';
            this.uiMode = UIMode.Display;
          }

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readOrderEvent.subscribe(x2 => {
              if (x2 instanceof Document) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngOninit, succeed to readOrder : ${x2}`);
                }

                this.detailObject = x2;
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.log(`AC_HIH_UI [Error]: Entering ngOninit, failed to readOrder : ${x2}`);
                }

                this.detailObject = new Document();
              }
            });

            this._storageService.readAccount(this.routerID);
          }
        }
      }, (error) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.log(`AC_HIH_UI [Error]: Entering ngOnInit in DocumentDetailComponent with activateRoute URL : ${error}`);
        }
      }, () => {
      });
    });

    this._storageService.fetchAllDocTypes();
    this._currService.fetchAllCurrencies();
    this._storageService.fetchAllControlCenters();
    this._storageService.fetchAllAccounts();
    this._storageService.fetchAllTranTypes();
    this._storageService.fetchAllOrders();
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
    return true;
  }

  public onCreateDocItem() {
    this.itemUIMode = UIMode.Create;
    this.curItemObject = new DocumentItem();
  }

  public onDisplayDocItem(di) {

  }

  public onChangeDocItem(di) {

  }

  public onDeleteDocItem(di) {

  }

  public onSubmit() {
    if (this.uiMode === UIMode.Create) {
      this._storageService.createDocumentEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof Document) {
          // Show a dialog, then jump to the display view
          const dlginfo: MessageDialogInfo = {
            Header: 'Common.Success',
            Content: x.Id.toString(),
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
            this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
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

      this._storageService.createDocument(this.detailObject);
    }
  }
}
