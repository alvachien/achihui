import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import {
  LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, FinanceAccountCategory_Asset,
  UIFinAssetOperationDocument, AccountExtraAsset, RepeatFrequency, 
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';

@Component({
  selector: 'hih-document-asset-operation-detail',
  templateUrl: './document-asset-operation-detail.component.html',
  styleUrls: ['./document-asset-operation-detail.component.scss']
})
export class DocumentAssetOperationDetailComponent implements OnInit {
  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: UIFinAssetOperationDocument | null = null;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;
  public PageTitle: string;
  public arUIAccount: UIAccountForSelection[] = [];
  public arUIOrder: UIOrderForSelection[] = [];
  
  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
    this.detailObject = new UIFinAssetOperationDocument();
    this.detailObject.isBuyin = true;
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentAssetOperationDetailComponent ngOnInit...');
    }

    Observable.forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAssetCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).subscribe((rst) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentAssetOperationDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
            
      this._activateRoute.url.subscribe((x) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'createassetbuy') {
            this.detailObject = new UIFinAssetOperationDocument();
            this.detailObject.isBuyin = true;

            this.uiMode = UIMode.Create;
          } else if (x[0].path === 'createassetsold') {
            this.detailObject = new UIFinAssetOperationDocument();
            this.detailObject.isBuyin = false;

            this.uiMode = UIMode.Create;
          } else if (x[0].path === 'editassetbuy') {
            this.routerID = +x[1].path;
            this.detailObject.isBuyin = true;
            
            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'editassetsold') {
            this.routerID = +x[1].path;
            this.detailObject.isBuyin = false;
            
            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'displayassetbuy') {
            this.routerID = +x[1].path;
            this.detailObject.isBuyin = true;
            
            this.uiMode = UIMode.Display;
          } else if (x[0].path === 'displayassetsold') {
            this.routerID = +x[1].path;
            this.detailObject.isBuyin = false;
            
            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);
          this.PageTitle = this.detailObject.isBuyin ? 'Sys.DocTy.AssetBuyIn' : 'Sys.DocTy.AssetSoldOut';

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readAssetDocument(this.routerID, this.detailObject.isBuyin).subscribe((x2) => {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.log(`AC_HIH_UI [Debug]: Entering DocumentAssetOperationDetailComponent ngOnInit for activateRoute URL: ${x2}`);
              }

              this.detailObject.parseDocument(x2);
            }, (error2) => {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Error]: Entering ngOninit, failed to readADPDocument : ${error2}`);
              }
            });
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
        console.error(`AC_HIH_UI [Error]: Entering DocumentAssetOperationDetailComponent's ngOninit, failed to load depended objects : ${error}`);
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
          console.log(`AC_HIH_UI [Debug]: Receiving createDocumentEvent in DocumentAssetOperationDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof Document) {
          // Show the snackbar
          this._snackbar.open('Document posted', 'OK', {
            duration: 3000,
          }).afterDismissed().subscribe(() => {
            // Navigate to display
            this._router.navigate([(this.detailObject.isBuyin? '/finance/document/displayassetbuy/' : '/finance/document/displayassetsold/') + x.Id.toString()]);
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

      // Build the JSON file to API
      let sobj = docObj.writeJSONObject(); // Document first
      let acntobj: Account = new Account();
      acntobj.HID = this._homedefService.ChosedHome.ID;
      acntobj.CategoryId = FinanceAccountCategory_Asset;
      acntobj.Name = docObj.Desp;
      acntobj.Comment = docObj.Desp;
      acntobj.ExtraInfo = this.detailObject.AssetAccount;
      sobj.AccountVM = acntobj.writeJSONObject();

      let dataJSON = JSON.stringify(sobj);
      this._storageService.createAssetDocument(sobj, this.detailObject.isBuyin);
    }
  }

  public onCancel(): void {
    this._router.navigate(['/finance/document/']);
  }
}
