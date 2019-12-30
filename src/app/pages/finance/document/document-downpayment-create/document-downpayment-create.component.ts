import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';

import { financeDocTypeAdvancePayment, financeDocTypeAdvanceReceived, UIMode, UIAccountForSelection,
  IAccountCategoryFilter, UIOrderForSelection, Currency, ControlCenter, TranType, Order, ModelUtility,
  ConsoleLogTypeEnum, BuildupAccountForSelection, Account, BuildupOrderForSelection, costObjectValidator, } from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';

@Component({
  selector: 'hih-fin-document-downpayment-create',
  templateUrl: './document-downpayment-create.component.html',
  styleUrls: ['./document-downpayment-create.component.less'],
})
export class DocumentDownpaymentCreateComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  // tslint:disable-next-line:variable-name
  private _isADP: boolean;
  public curMode: UIMode = UIMode.Create;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public curTitle: string;
  public arCurrencies: Currency[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arOrders: Order[] = [];
  public arDocTypes: DocumentType[] = [];
  public curDocType: number = financeDocTypeAdvancePayment;
  public headerFormGroup: FormGroup;

  current = 0;

  index = 'First-content';

  pre(): void {
    this.current -= 1;
    this.changeContent();
  }

  next(): void {
    this.current += 1;
    this.changeContent();
  }

  done(): void {
    console.log('done');
  }

  changeContent(): void {
    switch (this.current) {
      case 0: {
        this.index = 'First-content';
        break;
      }
      case 1: {
        this.index = 'Second-content';
        break;
      }
      case 2: {
        this.index = 'third-content';
        break;
      }
      default: {
        this.index = 'error';
      }
    }
  }

  constructor(
    private odataService: FinanceOdataService,
    private _uiStatusService: UIStatusService,
    private _activateRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _homeService: HomeDefOdataService,
    private _router: Router) {
      this.headerFormGroup = new FormGroup({
        headerControl: new FormControl('', Validators.required),
        accountControl: new FormControl('', Validators.required),
        tranTypeControl: new FormControl('', Validators.required),
        amountControl: new FormControl('', Validators.required),
        ccControl: new FormControl(''),
        orderControl: new FormControl(''),
      }, [costObjectValidator]);
    }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
    ])
    .pipe(takeUntil(this._destroyed$))
      .subscribe((rst: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentDownpaymentCreateComponent, forkJoin`, ConsoleLogTypeEnum.debug);

        // Accounts
        this.arAccounts = rst[3];
        this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
        this.uiAccountStatusFilter = undefined;
        this.uiAccountCtgyFilter = undefined;
        // Orders
        this.arOrders = rst[5];
        this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
        this.uiOrderFilter = undefined;
        // Currencies
        this.arCurrencies = rst[6];
        // Tran. type
        this.arTranType = rst[2];
        // Control Centers
        this.arControlCenters = rst[4];
        // Document type
        this.arDocTypes = rst[1];

        this._activateRoute.url.subscribe((x: any) => {
          if (x instanceof Array && x.length > 0) {
            if (x[0].path === 'createadp' || x[0].path === 'createadr') {
              if (x[0].path === 'createadp') {
                this._isADP = true;
              } else {
                this._isADP = false;
              }
              this._updateCurrentTitle();
              this.uiAccountStatusFilter = 'Normal';
              this.uiAccountCtgyFilter = {
                skipADP: true,
                skipLoan: true,
                skipAsset: true,
              };
              this.uiOrderFilter = true;

              this._cdr.detectChanges();
            }
          }
        });
      }, (error: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Error]: Entering Entering DocumentADPCreateComponent ngOnInit forkJoin, failed',
          ConsoleLogTypeEnum.error);
        // TBD.
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onSave(): void {
    // Save current document
  }

  private _updateCurrentTitle(): void {
    if (this._isADP) {
      this.curTitle = 'Sys.DocTy.AdvancedPayment';
      this.curDocType = financeDocTypeAdvancePayment;
    } else {
      this.curTitle = 'Sys.DocTy.AdvancedRecv';
      this.curDocType = financeDocTypeAdvanceReceived;
    }
  }
}
