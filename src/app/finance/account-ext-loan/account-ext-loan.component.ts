import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, AccountExtraLoan } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';

@Component({
  selector: 'hih-finance-account-ext-loan',
  templateUrl: './account-ext-loan.component.html',
  styleUrls: ['./account-ext-loan.component.scss']
})
export class AccountExtLoanComponent implements OnInit {

  public currentMode: string;

  @Input() extObject: AccountExtraLoan;
  @Input() uiMode: UIMode;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService) {
    // this._uiStatusService.
  }

  ngOnInit(): void {
    // Empty
  }
}
