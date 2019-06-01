import { Component, OnInit, Input, OnDestroy, } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ValidationErrors, } from '@angular/forms';
import { Observable, forkJoin, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  LogLevel, Account, Document, DocumentItem, ControlCenter, Order, TranType,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  UICommonLabelEnum, Currency, financeDocTypeRepay, financeTranTypeRepaymentOut, financeTranTypeInterestOut,
  financeAccountCategoryBorrowFrom, financeTranTypeRepaymentIn, financeTranTypeInterestIn, momentDateFormat,
  AccountExtraLoan, TemplateDocLoan, financeAccountCategoryAsset, financeAccountCategoryLendTo, DocumentType,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';

@Component({
  selector: 'hih-document-normal-mass-create-item',
  templateUrl: 'document-normal-mass-create-item.component.html',
})
export class DocumentNormalMassCreateItemComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  public arUIAccount: UIAccountForSelection[] = [];
  public arUIOrder: UIOrderForSelection[] = [];
  // Variables
  arControlCenters: ControlCenter[];
  arOrders: Order[];
  arTranTypes: TranType[];
  arAccounts: Account[];
  // arDocTypes: DocumentType[];
  arCurrencies: Currency[];

  @Input('group')
  public itemFormGroup: FormGroup;

  constructor(private _storageService: FinanceStorageService,
    private _currService: FinCurrencyService,
    private _formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);
    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      this.arTranTypes = rst[1];
      this.arAccounts = rst[2];
      this.arControlCenters = rst[3];
      this.arOrders = rst[4];
      this.arCurrencies = rst[5];

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
    });
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}

@Component({
  selector: 'hih-document-normal-mass-create',
  templateUrl: './document-normal-mass-create.component.html',
  styleUrls: ['./document-normal-mass-create.component.scss'],
})
export class DocumentNormalMassCreateComponent implements OnInit {
  public myForm: FormGroup;

  constructor(private _fb: FormBuilder) { }

  ngOnInit(): void {
    this.myForm = this._fb.group({
      items: this._fb.array([]),
    });
  }

  initItem(): FormGroup {
    return this._fb.group({
      dateControl: ['', Validators.required],
      accountControl: ['', Validators.required],
      tranTypeControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      currControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
    });
  }

  addItem(): void {
    const control = <FormArray>this.myForm.controls['items'];
    const addrCtrl = this.initItem();

    control.push(addrCtrl);
  }

  removeItem(i: number): void {
    const control = <FormArray>this.myForm.controls['items'];
    control.removeAt(i);
  }
}
