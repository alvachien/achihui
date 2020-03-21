import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';

import { financeDocTypeNormal, UIMode, Account, Document, DocumentItem, ModelUtility, ConsoleLogTypeEnum,
  UIOrderForSelection, Currency, TranType, ControlCenter, Order, UIAccountForSelection, DocumentType,
  BuildupAccountForSelection, BuildupOrderForSelection, UIDisplayStringUtil, costObjectValidator,
} from '../../../../model';
import { HomeDefOdataService, UIStatusService, FinanceOdataService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';

@Component({
  selector: 'hih-document-normal-mass-create',
  templateUrl: './document-normal-mass-create.component.html',
  styleUrls: ['./document-normal-mass-create.component.less'],
})
export class DocumentNormalMassCreateComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  public curDocType: number = financeDocTypeNormal;
  public curMode: UIMode = UIMode.Create;
  public arUIOrders: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public arCurrencies: Currency[] = [];
  public arDocTypes: DocumentType[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arUIAccounts: UIAccountForSelection[] = [];
  public arOrders: Order[] = [];
  public baseCurrency: string;
  public currentStep = 0;
  // Step: Item
  public itemsFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};
  // Step: Result
  public isDocPosting = false;
  public docIdCreated?: number = null;
  public docPostingFailed: string;

  constructor(
    private homeService: HomeDefOdataService,
    private uiStatusService: UIStatusService,
    private odataService: FinanceOdataService,
    private modalService: NzModalService,
    private fb: FormBuilder,
    private router: Router) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalMassCreateComponent constructor...',
      ConsoleLogTypeEnum.debug);

    // Set the default currency
    this.baseCurrency = this.homeService.ChosedHome.BaseCurrency;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalMassCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this.itemsFormGroup = this.fb.group({
      items: this.fb.array([]),
    });

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
      this.odataService.fetchAllDocTypes(),
    ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe((rst: any) => {
        // Accounts
        this.arAccounts = rst[2];
        this.arUIAccounts = BuildupAccountForSelection(rst[2], rst[0]);
        // this.uiAccountStatusFilter = undefined;
        // this.uiAccountCtgyFilter = undefined;
        // Orders
        this.arOrders = rst[4];
        this.arUIOrders = BuildupOrderForSelection(this.arOrders);
        // Tran. type
        this.arTranType = rst[1];
        // Control Centers
        this.arControlCenters = rst[3];
        // Currencies
        this.arCurrencies = rst[5];
        // Doc. type
        this.arDocTypes = rst[6];

        // Create first item
        this.createItem();
      }, (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentNormalMassCreateComponent ngOnInit, forkJoin, ${error}`,
          ConsoleLogTypeEnum.error);
        this.modalService.create({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentNormalMassCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onCreateNewItem(event: MouseEvent): void {
    event.stopPropagation();

    this.createItem();
  }

  onCopyItem(event: MouseEvent, i: number): void {
    event.stopPropagation();

    this.copyItem(i);
  }

  onRemoveItem(event: MouseEvent, i: number) {
    event.stopPropagation();

    this.removeItem(i);
  }

  onSave(): void {
    // save it
  }

  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    switch (this.currentStep) {
      case 0: {
        this._updateConfirmInfo();
        this.currentStep ++;
        break;
      }
      case 1: {
        this.currentStep ++;
        break;
      }
      case 2: {
        this.isDocPosting = true;
        // this.onSave();
        break;
      }
      default:
        break;
    }
  }
  get nextButtonEnabled(): boolean {
    if (this.currentStep === 0) {
      const controlArray: FormArray = this.itemsFormGroup.controls.items as FormArray;
      if (controlArray.length <= 0) {
        return false;
      }
      return controlArray.valid;
    } else if (this.currentStep === 1) {
      return this.itemsFormGroup.valid;
    } else {
      return true;
    }
  }

  // Step 0: Items
  private initItem(): FormGroup {
    return this.fb.group({
      dateControl: [new Date(), Validators.required],
      accountControl: [undefined, Validators.required],
      tranTypeControl: [undefined, Validators.required],
      amountControl: [0, Validators.required],
      // currControl: ['', Validators.required],
      despControl: ['', Validators.required],
      ccControl: [undefined],
      orderControl: [undefined],
    }, {
      validators: [costObjectValidator],
    });
  }
  private createItem(): void {
    const control: FormArray = this.itemsFormGroup.controls.items as FormArray;
    const addrCtrl: any = this.initItem();

    control.push(addrCtrl);
  }
  private copyItem(i: number): void {
    const control: FormArray = this.itemsFormGroup.controls.items as FormArray;
    const newItem: FormGroup = this.initItem();
    const oldItem = control.at(i);
    newItem.get('dateControl').setValue(oldItem.get('dateControl').value);
    newItem.get('accountControl').setValue(oldItem.get('accountControl').value);
    newItem.get('tranTypeControl').setValue(oldItem.get('tranTypeControl').value);
    newItem.get('amountControl').setValue(oldItem.get('amountControl').value);
    newItem.get('despControl').setValue(oldItem.get('despControl').value);
    newItem.get('ccControl').setValue(oldItem.get('ccControl').value);
    newItem.get('orderControl').setValue(oldItem.get('orderControl').value);

    control.push(newItem);
  }
  private removeItem(i: number): void {
    const control: FormArray = this.itemsFormGroup.controls.items as FormArray;
    control.removeAt(i);
  }
  // Step 1: Confirm
  private _updateConfirmInfo(): void {
    this.confirmInfo = {};
    this.confirmInfo.docsByDate = [];

    const controlArrays: FormArray = this.itemsFormGroup.controls.items as FormArray;

    for(var i = 0; i < controlArrays.length; i ++) {
      this.confirmInfo.docsByDate = [
        ...this.confirmInfo.docsByDate,
        controlArrays.at(i).get('dateControl').value,
      ];
    }
  }
}
