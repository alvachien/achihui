import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent } from '@angular/material';
import { Observable, forkJoin, merge, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LogLevel, momentDateFormat, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAdvancePayment,
  UIFinAdvPayDocument, TemplateDocADP, AccountExtraAdvancePayment, RepeatFrequencyEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  UIDisplayStringUtil, IAccountCategoryFilter, financeAccountCategoryAdvanceReceived, TranType,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService, AuthService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { AccountExtADPComponent } from '../account-ext-adp';

@Component({
  selector: 'hih-document-adpcreate',
  templateUrl: './document-adpcreate.component.html',
  styleUrls: ['./document-adpcreate.component.scss'],
})
export class DocumentADPCreateComponent implements OnInit {
  private _isADP: boolean;

  public curMode: UIMode = UIMode.Create;
  public accountAdvPay: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Step: Generic info
  public firstFormGroup: FormGroup;

  get TranAmount(): number {
    let amtctrl: any = this.firstFormGroup.get('amountControl');
    if (amtctrl) {
      return amtctrl.value;
    }
  }
  get TranDate(): string {
    let datctrl: any = this.firstFormGroup.get('dateControl');
    if (datctrl && datctrl.value && datctrl.value.format) {
      return datctrl.value.format(momentDateFormat);
    }

    return '';
  }
  get TranType(): TranType {
    let trantypectrl: any = this.firstFormGroup.get('tranTypeControl');
    if (trantypectrl && trantypectrl.value) {
      return trantypectrl.value;
    }
  }

  constructor(public _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _activateRoute: ActivatedRoute,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    private _currService: FinCurrencyService,
    private _router: Router,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnInit...');
    }

    // Fetch the data
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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentAdvancepaymentDetailComponent ngAfterViewInit for activateRoute URL: ${rst.length}`);
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
          if (x[0].path === 'createadp' || x[0].path === 'createadr') {
            if (x[0].path === 'createadp') {
              this._isADP = true;
            } else {
              this._isADP = false;
            }
          }
        }
      });
    });

    this.firstFormGroup = this._formBuilder.group({
      dateControl: new FormControl({ value: moment() }, Validators.required),
      accountControl: ['', Validators.required],
      tranTypeControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      currControl: ['', Validators.required],
      despControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
    });
  }
}
