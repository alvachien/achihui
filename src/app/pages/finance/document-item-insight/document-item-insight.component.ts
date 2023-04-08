import { Component, OnInit } from '@angular/core';
import { translate } from '@ngneat/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { finalize, forkJoin } from 'rxjs';

import { Account, ConsoleLogTypeEnum, DocumentItemView, GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType, ModelUtility,
  TranType, momentDateFormat } from 'src/app/model';
import { DocInsightOption, FinanceOdataService, HomeDefOdataService, UIStatusService } from 'src/app/services';

interface InsightRecord {
  TransactionDate?: string;
  TransactionType?: number;
  AccountID?: number;
  Amount: number;
  Currency: string;
}

@Component({
  selector: 'hih-document-item-insight',
  templateUrl: './document-item-insight.component.html',
  styleUrls: ['./document-item-insight.component.less'],
})
export class DocumentItemInsightComponent implements OnInit {
  listGroupFields: TransferItem[] = [];
  isLoadingData = false;  
  arTranType: TranType[] = [];
  arAccounts: Account[] = [];
  incomeCurrency = '';
  outgoCurrency = '';
  baseCurrency: string;

  selectedGroupFieldKeys: string[] = [];
  // UI service
  insightOption: DocInsightOption | null = null;
  // Buffer data
  totalDataCount = 0;
  listData: DocumentItemView[] = [];
  incomeAmount = 0;
  outgoAmount = 0;
  // Display
  listDisplayData: InsightRecord[] = [];

  constructor(private odataService: FinanceOdataService,
    private uiStatusService: UIStatusService,
    private modalService: NzModalService,
    private homeService: HomeDefOdataService,) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent constructor`,
      ConsoleLogTypeEnum.debug
    );

    this.listGroupFields.push({
      key: 'date',
      title: `Transaction Date`,
      direction: 'right'
    });
    this.listGroupFields.push({
      key: 'trantype',
      title: `Transaction Type`
    });
    this.listGroupFields.push({
      key: 'account',
      title: `Account`
    });
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
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
  get isTranDateVisible(): boolean {
    return this.listGroupFields.findIndex(p => p['key'] === 'date' && p.direction === 'right') !== -1;
  }
  get isAccountVisible(): boolean {
    return this.listGroupFields.findIndex(p => p['key'] === 'account' && p.direction === 'right') !== -1;
  }
  get isTranTypeVisible(): boolean {
    return this.listGroupFields.findIndex(p => p['key'] === 'trantype' && p.direction === 'right') !== -1;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent ngOnInit...`,
      ConsoleLogTypeEnum.debug
    );
    // Options
    this.insightOption = this.uiStatusService.docInsightOption ? this.uiStatusService.docInsightOption : null;
    // Read accounts and tran. types
    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
    ]).subscribe({
      next: (returnResults) => {
        this.arAccounts = returnResults[2];
        this.arTranType = returnResults[1];

        this.fetchData();
      },
      error: (err) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering FinanceComponent onAssetDeprec forkJoin failed ${err}...`,
          ConsoleLogTypeEnum.error
        );

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: err.toString(),
          nzClosable: true,
        });
      },
    });
  }

  onTransferChanged(ret: {}): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent onTransferChanged: ${ret}...`,
      ConsoleLogTypeEnum.debug
    );

    // Need refresh data!
    this.buildDisplayList();
  }

  fetchData(): void {
    if (this.insightOption) {
      let fltrs: GeneralFilterItem[] = [];
      if (this.insightOption.TransactionDirection !== undefined) {
        fltrs.push({
          fieldName: 'IsExpense',
          operator: GeneralFilterOperatorEnum.Equal,
          lowValue: this.insightOption.TransactionDirection? false : true,
          highValue: this.insightOption.TransactionDirection? false : true,
          valueType: GeneralFilterValueType.boolean,
        });  
      }
      fltrs.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: this.insightOption.SelectedDataRange[0].format(momentDateFormat),
        highValue: this.insightOption.SelectedDataRange[1].format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
      });

      this.isLoadingData = true;
      this.odataService.searchDocItem(fltrs, 90, 0)
        .subscribe({
        next: val => {
          this.totalDataCount = val.totalCount;
          this.listData.push(...val.contentList);

          if (this.totalDataCount > 90) {
            let ntimes = Math.floor(this.totalDataCount / 90);
            let nlef = this.totalDataCount % 90;
            if (nlef > 0) {
              ntimes ++;
            }
            ntimes --; // Already fetched it
            let nskip = 90;

            while(ntimes > 0) {
              this.odataService.searchDocItem(fltrs, 90, nskip).subscribe({
                next: val => {
                  this.listData.push(...val.contentList);

                  if (this.listData.length === this.totalDataCount) {
                    this.buildDisplayList();
                  }
                },
                error: err => {
                  // TBD.
                }
              })

              nskip += 90;
              ntimes --;
            }
          } else {
            if (this.listData.length === this.totalDataCount) {
              this.buildDisplayList();
            }
          }
        },
        error: err => {
          // TBD.
        }
      })
    }
  }

  buildDisplayList(): void {
    this.isLoadingData = false;

    this.incomeAmount = 0;
    this.outgoAmount = 0;
  
    const needdate = this.isTranDateVisible;
    const needacnt = this.isAccountVisible;
    const needtype = this.isTranTypeVisible;
    this.listDisplayData = [];

    this.listData.forEach(p => {
      if (p.IsExpense) {
        this.outgoAmount += p.Amount;
      } else {
        this.incomeAmount += p.Amount;
      }

      const idx = this.listDisplayData.findIndex(data => {
        if (needdate && data.TransactionDate !== p.TransactionDate?.format(momentDateFormat)) {
          return false;
        }
        if (needacnt && data.AccountID !== p.AccountID) {
          return false;
        }
        if (needtype && data.TransactionType !== p.TransactionType) {
          return false;
        }
        return true;
      });

      if (idx !== -1) {
        this.listDisplayData[idx].Amount += p.Amount;
      } else {
        let ndata: InsightRecord = {
          Amount: p.Amount,
          Currency: this.baseCurrency,
        };
        if (needdate) {
          ndata.TransactionDate = p.TransactionDate?.format(momentDateFormat);
        }
        if (needacnt) {
          ndata.AccountID = p.AccountID;
        }
        if (needtype) {
          ndata.TransactionType = p.TransactionType;
        }

        this.listDisplayData.push(ndata);
      }      
    });
  }
}
