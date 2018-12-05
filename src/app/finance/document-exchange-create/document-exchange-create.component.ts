import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { Observable, Subject, BehaviorSubject, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIFinCurrencyExchangeDocument,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  UIMode, getUIModeString, financeDocTypeCurrencyExchange, DocumentWithPlanExgRate, DocumentWithPlanExgRateForUpdate,
  IAccountCategoryFilter } from '../../model';
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
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: From
  public fromFormGroup: FormGroup;
  // Step: To
  public toFormGroup: FormGroup;
  // Step: Prev. doc items
  separatorKeysCodes: any[] = [ENTER, COMMA];
  dataSource: MatTableDataSource<DocumentWithPlanExgRate> = new MatTableDataSource<DocumentWithPlanExgRate>();
  displayedColumns: string[] = ['DocID', 'DocType', 'TranDate', 'Desp', 'Desp', 'ControlCenter', 'Order'];

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
        console.log(`AC_HIH_UI [Debug]: Entering DocumentExchangeDetailComponent ngOnInit for activateRoute URL: ${rst.length}`);
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

}
