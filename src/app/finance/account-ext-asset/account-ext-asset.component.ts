import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, AccountExtraAsset,
  RepeatFrequencyEnum, UIDisplayStringUtil,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'hih-finance-account-ext-asset',
  templateUrl: './account-ext-asset.component.html',
  styleUrls: ['./account-ext-asset.component.scss'],
})
export class AccountExtAssetComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
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
    return this._homeService.ChosedHome.BaseCurrency;
  }

  constructor(public _storageService: FinanceStorageService,
    private _homeService: HomeDefDetailService,
    private _snackBar: MatSnackBar,
    private _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtAssetComponent constructor`);
    }
    // Do nothing
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtAssetComponent ngOnInit`);
    }

    this._destroyed$ = new ReplaySubject(1);

    // Ensure those request has been loaded
    forkJoin([
      this._storageService.fetchAllAssetCategories(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders()])
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      // Empty
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering AccountExtAssetComponent ngOnInit, forkJoin failed: ${error}`);
      }

      this._snackBar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering AccountExtAssetComponent ngOnDestroy`);
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  generateAccountInfoForSave(): void {
    // Placeholder
  }
}
