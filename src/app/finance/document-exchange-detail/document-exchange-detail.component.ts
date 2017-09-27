import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MdDialog, MdSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIFinCurrencyExchangeDocument, 
  UIMode, getUIModeString, FinanceDocType_CurrencyExchange } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'app-document-exchange-detail',
  templateUrl: './document-exchange-detail.component.html',
  styleUrls: ['./document-exchange-detail.component.scss']
})
export class DocumentExchangeDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: UIFinCurrencyExchangeDocument | null = null;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  headerFormGroup: FormGroup;
  sourceFormGroup: FormGroup;

  constructor(private _dialog: MdDialog,
    private _snackbar: MdSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService,
    private _formBuilder: FormBuilder) {
    this.detailObject = new UIFinCurrencyExchangeDocument();    
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentExchangeDetailComponent ngOnInit...');
    }

    this.headerFormGroup = this._formBuilder.group({
      hdrDateCtrl: ['', Validators.required],
      hdrDespCtrl: ['', Validators.required],
    });
    this.sourceFormGroup = this._formBuilder.group({
      srcAccountCtrl: ['', Validators.required],
      srcCurrCtrl: ['', Validators.required],
      srcAmountCtrl: ['', Validators.required],
    });

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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentExchangeDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      this._activateRoute.url.subscribe(x => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'createexg') {
            this.detailObject = new UIFinCurrencyExchangeDocument();
            this.uiMode = UIMode.Create;
          } else if (x[0].path === 'editexg') {
            this.routerID = +x[1].path;
  
            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'displayexg') {
            this.routerID = +x[1].path;
  
            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);
          
          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readDocumentEvent.subscribe(x2 => {
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
          } else {
            // Create mode!
            this.detailObject.SourceTranCurr = this._homedefService.ChosedHome.BaseCurrency;            
          }
        } else {
          this.uiMode = UIMode.Invalid;
        }
      });
    }, error => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to load depended objects : ${error}`);
      }

      const dlginfo: MessageDialogInfo = {
        Header: 'Common.Error',
        Content: error? error.toString() : 'Common.Error',
        Button: MessageDialogButtonEnum.onlyok
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo
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
        Currencies: this._currService.Currencies
      })) {
        // Show a dialog for error details
        const dlginfo: MessageDialogInfo = {
          Header: 'Common.Error',
          ContentTable: docObj.VerifiedMsgs,
          Button: MessageDialogButtonEnum.onlyok
        };

        this._dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '500px',
          data: dlginfo
        });
        
        return;
      }
      
      this._storageService.createDocumentEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentExchangeDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof Document) {
          // Show the snackbar
          this._snackbar.open('Message archived', 'OK', {
            duration: 3000
          }).afterDismissed().subscribe(() => {
            // Navigate to display
            this._router.navigate(['/finance/document/displayexg/' + x.Id.toString()]);
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

      docObj.HID = this._homedefService.ChosedHome.ID;
      this._storageService.createDocument(docObj);
    }
  }

  public onCancel(): void {
    this._router.navigate(['/finance/document/']);
  }
}
