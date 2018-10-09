import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, AccountExtraAsset,
  RepeatFrequencyEnum, UIDisplayStringUtil,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'hih-finance-account-ext-asset',
  templateUrl: './account-ext-asset.component.html',
  styleUrls: ['./account-ext-asset.component.scss'],
})
export class AccountExtAssetComponent implements OnInit {
  public currentMode: string;
  @Input() uiMode: UIMode;
  @Input() extObject: AccountExtraAsset;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get BaseCurrency(): string {
    return this._homeService.curHomeSelected.value.BaseCurrency;
  }

  constructor(public _storageService: FinanceStorageService,
    private _homeService: HomeDefDetailService,
    private _currService: FinCurrencyService) {
    // Do nothing
  }

  ngOnInit(): void {
    // Ensure those request has been loaded
    forkJoin([
      this._storageService.fetchAllAssetCategories(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders()]).subscribe((x: any) => {
      // Empty
    });
  }

  generateAccountInfoForSave(): void {
    // Placeholder
  }
}
