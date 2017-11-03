import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, AccountExtraAsset, RepeatFrequency,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';

@Component({
  selector: 'hih-finance-account-ext-loan',
  templateUrl: './account-ext-loan.component.html',
  styleUrls: ['./account-ext-loan.component.scss']
})
export class AccountExtLoanComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
