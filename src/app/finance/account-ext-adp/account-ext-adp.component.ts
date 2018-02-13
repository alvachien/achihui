import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account,
  AccountExtraAdvancePayment, RepeatFrequencyEnum, UIDisplayStringUtil,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';

@Component({
  selector: 'hih-finance-account-ext-adp',
  templateUrl: './account-ext-adp.component.html',
  styleUrls: ['./account-ext-adp.component.scss']
})
export class AccountExtADPComponent implements OnInit {
  public currentMode: string;
  public arFrequencies: any[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();

  @Input() extObject: AccountExtraAdvancePayment;
  @Input() uiMode: UIMode;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(public _storageService: FinanceStorageService) {
  }

  ngOnInit(): void {
    // Empty
  }
}
