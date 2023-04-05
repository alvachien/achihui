import { Component } from '@angular/core';
import { TransferItem } from 'ng-zorro-antd/transfer';

import { Account, ConsoleLogTypeEnum, ModelUtility, TranType } from 'src/app/model';
import { FinanceOdataService } from 'src/app/services';

interface InsightRecord {
  TransactionDate: string;
  TransactionType: number;
  AccountID: number;
  Amount: number;
  Currency: string;
}

@Component({
  selector: 'hih-document-item-insight',
  templateUrl: './document-item-insight.component.html',
  styleUrls: ['./document-item-insight.component.less'],
})
export class DocumentItemInsightComponent {
  listGroupFields: TransferItem[] = [];
  listData: InsightRecord[] = [];
  isLoadingData = false;
  totalDataCount = 0;
  pageIndex = 0;
  pageSize = 50;
  selectedOptions = 0;
  arTranType: TranType[] = [];
  arAccounts: Account[] = [];
  incomeAmount = 0;
  outgoAmount = 0;
  incomeCurrency = '';
  outgoCurrency = '';
  selectedGroupFieldKeys: string[] = [];

  constructor(private odataService: FinanceOdataService) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent constructor`,
      ConsoleLogTypeEnum.debug
    );

    this.listGroupFields.push({
      key: 'date',
      title: `Transaction Date`
    });
    this.listGroupFields.push({
      key: 'trantype',
      title: `Transaction Type`
    });
    this.listGroupFields.push({
      key: 'account',
      title: `Account`
    });
  }

  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts.find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranType.find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }

  onGroupSelectChanged(ret: {}): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent onGroupSelectChanged: ${ret}...`,
      ConsoleLogTypeEnum.debug
    );

    this.selectedGroupFieldKeys = [];
    this.listGroupFields.forEach(field => {
      if (field.direction === 'right') {
        this.selectedGroupFieldKeys.push(field['key']);
      }
    });

    // Need refresh data!
  }

  onQueryParamsChange(event: any): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent onQueryParamsChange: ${event}...`,
      ConsoleLogTypeEnum.debug
    );
  }
}
