import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
//import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MdDialog, MdSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIFinTransferDocument, UIMode, getUIModeString, FinanceDocType_Transfer } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'app-document-transfer-detail',
  templateUrl: './document-transfer-detail.component.html',
  styleUrls: ['./document-transfer-detail.component.scss'],
})
export class DocumentTransferDetailComponent implements OnInit {
  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: UIFinTransferDocument | null = null;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  // public commonFormGroup: FormGroup;
  // public sourceFormGroup: FormGroup;
  // public targetFormGroup: FormGroup;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isForeignCurrency(): boolean {
    if (this.detailObject && this.detailObject.TranCurr !== this._homedefService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }

  constructor(private _dialog: MdDialog,
    private _snackbar: MdSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
    //private _formBuilder: FormBuilder) {
    this.detailObject = new UIFinTransferDocument();
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentTransferDetailComponent ngOnInit...');
    }

    // this.commonFormGroup = this._formBuilder.group({
    //   tdateCtrl: ['', Validators.required],
    //   despCtrl: ['', Validators.required],
    //   amtCtrl: ['', Validators.required]
    // });
    // this.sourceFormGroup = this._formBuilder.group({
    //   //srcaccountCtrl: ['', Validators.required]
    // });
    // this.targetFormGroup = this._formBuilder.group({
    //   //tgtaccountCtrl: ['', Validators.required]
    // });

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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentTransferDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      this._activateRoute.url.subscribe((x) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'createtransfer') {
            this.detailObject = new UIFinTransferDocument();
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
            this._storageService.readDocumentEvent.subscribe((x2) => {
              if (x2 instanceof Document) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.log(`AC_HIH_UI [Debug]: Entering ngOninit, succeed to readDocument : ${x2}`);
                }

                this.detailObject.parseDocument(x2);
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to readDocument : ${x2}`);
                }

                this.detailObject = new UIFinTransferDocument();
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
    }, (error) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to load depended objects : ${error}`);
      }

      const dlginfo: MessageDialogInfo = {
        Header: 'Common.Error',
        Content: error ? error.toString() : 'Common.Error',
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
        Currencies: this._currService.Currencies,
        BaseCurrency: this._homedefService.ChosedHome.BaseCurrency,
      })) {
        // Show a dialog for error details
        const dlginfo: MessageDialogInfo = {
          Header: 'Common.Error',
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

      this._storageService.createDocumentEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentTransferDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof Document) {
          // Show the snackbar
          this._snackbar.open('Message archived', 'OK', {
            duration: 3000,
          }).afterDismissed().subscribe(() => {
            // Navigate to display
            this._router.navigate(['/finance/document/displaytransfer/' + x.Id.toString()]);
          });
        } else {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: 'Common.Error',
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
    this._router.navigate(['/finance/document/']);
  }
}
