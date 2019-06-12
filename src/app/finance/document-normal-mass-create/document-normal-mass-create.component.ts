import { Component, OnInit, Input, OnDestroy, } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ValidationErrors, AbstractControl, } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, forkJoin, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import {
  LogLevel, ControlCenter, TranType, Document,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  UICommonLabelEnum, Currency, FinanceNormalDocItemMassCreate, InfoMessage, MessageType,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { popupDialog, } from '../../message-dialog';

@Component({
  selector: 'hih-document-normal-mass-create-item',
  templateUrl: 'document-normal-mass-create-item.component.html',
})
export class DocumentNormalMassCreateItemComponent implements OnInit {
  @Input('arUIAccount')
  public arUIAccount: UIAccountForSelection[] = [];
  @Input('arUIOrder')
  public arUIOrder: UIOrderForSelection[] = [];
  @Input('arControlCenter')
  arControlCenter: ControlCenter[] = [];
  @Input('arTranType')
  arTranType: TranType[] = [];
  @Input('localCurrency')
  localCurrency: String;
  @Input('group')
  public itemFormGroup: FormGroup;

  constructor() {
    // Empty
  }

  ngOnInit(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-document-normal-mass-create',
  templateUrl: './document-normal-mass-create.component.html',
  styleUrls: ['./document-normal-mass-create.component.scss'],
})
export class DocumentNormalMassCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  public myForm: FormGroup;
  public arUIAccount: UIAccountForSelection[];
  public arUIOrder: UIOrderForSelection[] = [];
  public arControlCenter: ControlCenter[];
  public arTranType: TranType[];
  public localCurrency: string;
  public arCurrencies: Currency[] = [];

  constructor(private _fb: FormBuilder,
    private _storageService: FinanceStorageService,
    private _currService: FinCurrencyService,
    private _uiStatusService: UIStatusService,
    private _homeService: HomeDefDetailService,
    private _router: Router,
    private _dialog: MatDialog) {
      // Empty
    }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);
    this.myForm = this._fb.group({
      items: this._fb.array([]),
    });

    this.localCurrency = this._homeService.ChosedHome.BaseCurrency;
    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(rst[2], rst[0]);
      // Orders
      this.arUIOrder = BuildupOrderForSelection(rst[4], true);

      // Currencies
      this.arCurrencies = rst[5];
      // Tran. type
      this.arTranType = rst[1];
      // Control Centers
      this.arControlCenter = rst[3];
    }, (error: any) => {
      // Show the error
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }
  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  initItem(): FormGroup {
    return this._fb.group({
      dateControl: [moment(), Validators.required],
      accountControl: ['', Validators.required],
      tranTypeControl: ['', Validators.required],
      amountControl: ['', Validators.required],
      // currControl: ['', Validators.required],
      despControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
    });
  }

  addItem(): void {
    const control: any = <FormArray>this.myForm.controls.items;
    const addrCtrl: any = this.initItem();

    control.push(addrCtrl);
  }

  removeItem(i: number): void {
    const control: any = <FormArray>this.myForm.controls.items;
    control.removeAt(i);
  }

  public onSubmit(): void {
    let arItems: FinanceNormalDocItemMassCreate[] = [];

    const control: any = <FormArray>this.myForm.controls.items;
    control.controls.forEach((ctrl: AbstractControl) => {
      // Read the items
      if (ctrl.value) {
        let item: FinanceNormalDocItemMassCreate = new FinanceNormalDocItemMassCreate();
        item.accountID = ctrl.get('accountControl').value;
        item.controlCenterID = ctrl.get('ccControl').value;
        item.orderID = ctrl.get('orderControl').value;
        item.desp = ctrl.get('despControl').value;
        item.tranAmount = ctrl.get('amountControl').value;
        item.tranCurrency = this.localCurrency;
        item.tranDate = ctrl.get('dateControl').value;
        item.tranType = ctrl.get('tranTypeControl').value;

        if (item.isValid) {
          arItems.push(item);
        }
      }
    });
    if (arItems.length <= 0 || arItems.length !== control.controls.length) {
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
      return;
    }

    this._storageService.massCreateNormalDocument(arItems).subscribe((docs: Document[]) => {
      // Show the success dialog.
      let infoMsg: InfoMessage[] = [];
      docs.forEach((val: Document) => {
        let imsg: InfoMessage = new InfoMessage();
        imsg.MsgType = MessageType.Info;
        imsg.MsgTitle = val.Id.toString();
        imsg.MsgContent = 'Document Posted';
        infoMsg.push(imsg);
      });
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
        undefined,
        infoMsg).afterClosed().subscribe(() => {
          // Jump to document list page
          this._router.navigate(['/finance/document']);
        });
    }, (error: any) => {
      // Popup error dialog
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }
}
