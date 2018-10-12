import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent } from '@angular/material';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAsset,
  UIFinAssetOperationDocument, AccountExtraAsset, RepeatFrequencyEnum, UICommonLabelEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilter, UIFinAssetSoldoutDocument,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';

@Component({
  selector: 'hih-document-asset-soldout-create',
  templateUrl: './document-asset-soldout-create.component.html',
  styleUrls: ['./document-asset-soldout-create.component.scss'],
})
export class DocumentAssetSoldoutCreateComponent implements OnInit {
  public detailObject: UIFinAssetSoldoutDocument;
  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  // Step: Generic info
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  // Step: Extra info
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;

  get BaseCurrency(): string {
    return this._homeService.curHomeSelected.value.BaseCurrency;
  }

  constructor(public _storageService: FinanceStorageService,
    private _homeService: HomeDefDetailService,
    private _currService: FinCurrencyService,
    private _formBuilder: FormBuilder) {
    // Initialize the object
    this.detailObject = new UIFinAssetSoldoutDocument();
  }

  ngOnInit(): void {
    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAssetCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentAssetSoldoutCreateComponent ngOnInit for forkJoin, result length: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);
      this.uiOrderFilter = undefined;
    });

    this.firstFormGroup = this._formBuilder.group({
      accountControl: ['', Validators.required],
      dateControl: ['', Validators.required],
      amountControl: ['', Validators.required],
    });

    this.secondFormGroup = this._formBuilder.group({
      ccControl: [''],
      orderControl: [''],
    });
  }
}
