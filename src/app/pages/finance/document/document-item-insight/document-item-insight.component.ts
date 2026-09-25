import { DecimalPipe, NgIf } from '@angular/common';
import { SafeAny } from '@common/any';
import { Component, inject, OnInit, signal, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { translate, TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTransferModule, TransferDirection, TransferItem } from 'ng-zorro-antd/transfer';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { format } from 'date-fns';
import { dateFormat } from '@model/index';

import {
  Account,
  ConsoleLogTypeEnum,
  DocumentItemView,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  ModelUtility,
  TranType,
  financeTranTypeAdvancePaymentOut,
  financeTranTypeAdvanceReceiveIn,
  financeTranTypeAssetValueDecrease,
  financeTranTypeAssetValueIncrease,
  financeTranTypeOpeningAsset,
  financeTranTypeOpeningLiability,
  financeTranTypeTransferIn,
  financeTranTypeTransferOut,
} from '@model/index';
import { DocInsightOption, FinanceOdataService, HomeDefOdataService, UIStatusService } from '@services/index';
import { RouterModule } from '@angular/router';

// nz-transfer mutates the items it is given (it owns `direction`/`checked`),
// so they stay plain objects; only the ARRAY reference changes when the
// language switches, which re-triggers the transfer's ngOnChanges re-split.
interface GroupTransferItem extends TransferItem {
  key: string;
  titleKey: string;
}

const GROUP_FIELD_DEFS: ReadonlyArray<Pick<GroupTransferItem, 'key' | 'titleKey'> & { direction?: TransferDirection }> =
  [
    { key: 'date', titleKey: 'Common.Date', direction: 'right' },
    { key: 'trantype', titleKey: 'Finance.TransactionType' },
    { key: 'account', titleKey: 'Finance.Account' },
  ];

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzGridModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTransferModule,
    NzTooltipModule,
    NzDividerModule,
    NzTableModule,
    DecimalPipe,
    TranslocoModule,
    NzModalModule,
    RouterModule,
    NgIf,
  ],
})
export class DocumentItemInsightComponent implements OnInit {
  // Group-field transfer items. `title` carries the imperative translate()
  // result, so — same langTick contract as document-list's filter labels — it
  // is re-applied on every runtime language switch; the array lives in a
  // signal (zoneless CD) so handing nz-transfer a fresh reference triggers its
  // ngOnChanges re-split of both panels.
  listGroupFields = signal<GroupTransferItem[]>(GROUP_FIELD_DEFS.map((f) => ({ ...f, title: translate(f.titleKey) })));
  isLoadingData = signal(false);
  arTranType = signal<TranType[]>([]);
  arAccounts = signal<Account[]>([]);
  incomeCurrency = '';
  outgoCurrency = '';
  baseCurrency: string;

  selectedGroupFieldKeys: string[] = [];
  // UI service
  insightOption: DocInsightOption | null = null;
  // Buffer data
  totalDataCount = signal(0);
  listData = signal<DocumentItemView[]>([]);
  incomeAmount = signal(0);
  outgoAmount = signal(0);
  // Display
  listDisplayData = signal<InsightRecord[]>([]);
  // Amount column sort (client-side: the rows are aggregates built here, not a
  // query page, so there is no server orderby to send). null = keep the
  // grouped date/account/type ordering produced by buildDisplayList.
  amountSortOrder = signal<'ascend' | 'descend' | null>(null);
  // Bumped on every runtime language switch so the computeds below that call
  // the imperative translate() (no implicit active-lang dependency) recompute —
  // same contract as document-list's filter labels.
  private readonly langTick = signal(0);
  // Transfer panel captions, re-translated on language switch (see langTick).
  readonly transferTitles = computed(() => {
    this.langTick();
    return [translate('Finance.InsightAvailable'), translate('Finance.InsightSelected')];
  });
  // The table's bound view of listDisplayData, ordered by the amount sort.
  listSortedDisplayData = computed(() => {
    const order = this.amountSortOrder();
    const data = this.listDisplayData();
    if (order === null) {
      return data;
    }
    const dir = order === 'ascend' ? 1 : -1;
    return [...data].sort((a, b) => (a.Amount - b.Amount) * dir);
  });

  private readonly odataService = inject(FinanceOdataService);
  private readonly uiStatusService = inject(UIStatusService);
  private readonly modalService = inject(NzModalService);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly translocoService = inject(TranslocoService);

  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent constructor`,
      ConsoleLogTypeEnum.debug,
    );

    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';

    // The transfer's item/panel captions come from imperative translate()
    // calls, which the runtime language switch does not re-run on its own:
    // bump langTick (recomputes transferTitles), re-translate each item's
    // title in place (nz-transfer owns `direction` on these objects, so they
    // must be kept), and hand back a NEW array reference so the transfer's
    // ngOnChanges re-splits both panels with the fresh captions.
    this.translocoService.langChanges$.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
      this.langTick.update((n) => n + 1);
      this.listGroupFields.update((items) => {
        items.forEach((item) => (item.title = translate(item.titleKey)));
        return [...items];
      });
    });
  }

  // Header option values as translated Yes/No (Common.Yes / Common.No) instead
  // of the raw `true`/`false` string. The template only calls this when the
  // value is defined (the @if/ngIf guards); the empty branch just keeps the
  // binding total. Language switches re-run this through the sibling translate
  // pipes' change detection.
  public boolText(value: boolean | undefined | null): string {
    if (value === undefined || value === null) {
      return '';
    }
    return translate(value ? 'Common.Yes' : 'Common.No');
  }

  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts().find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranType().find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }
  get isTranDateVisible(): boolean {
    return this.listGroupFields().findIndex((p) => p['key'] === 'date' && p.direction === 'right') !== -1;
  }
  get isAccountVisible(): boolean {
    return this.listGroupFields().findIndex((p) => p['key'] === 'account' && p.direction === 'right') !== -1;
  }
  get isTranTypeVisible(): boolean {
    return this.listGroupFields().findIndex((p) => p['key'] === 'trantype' && p.direction === 'right') !== -1;
  }
  get insideDateRangeString(): string {
    if (this.insightOption !== null) {
      return (
        format(this.insightOption.SelectedDataRange[0], dateFormat) +
        ' - ' +
        format(this.insightOption.SelectedDataRange[1], dateFormat)
      );
    }
    return '';
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent ngOnInit...`,
      ConsoleLogTypeEnum.debug,
    );
    // Options
    this.insightOption = this.uiStatusService.docInsightOption ? this.uiStatusService.docInsightOption : null;
    // Read accounts and tran. types
    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
    ])
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (returnResults) => {
          this.arAccounts.set(returnResults[2]);
          this.arTranType.set(returnResults[1]);

          this.fetchData();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentItemInsightComponent ngOnInit forkJoin failed ${err}...`,
            ConsoleLogTypeEnum.error,
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  onTransferChanged(ret: SafeAny): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent onTransferChanged: ${ret}...`,
      ConsoleLogTypeEnum.debug,
    );

    // Need refresh data!
    this.buildDisplayList();
  }

  onAmountSortChange(order: string | null): void {
    // nzSortOrderChange emits a plain string union - narrow it to ours (same
    // contract as the person/organization selection dialogs).
    this.amountSortOrder.set(order === 'ascend' || order === 'descend' ? order : null);
  }

  fetchData(): void {
    if (this.insightOption) {
      const fltrs: GeneralFilterItem[] = [];
      if (this.insightOption.TransactionDirection !== undefined) {
        fltrs.push({
          fieldName: 'IsExpense',
          operator: GeneralFilterOperatorEnum.Equal,
          lowValue: this.insightOption.TransactionDirection ? false : true,
          highValue: this.insightOption.TransactionDirection ? false : true,
          valueType: GeneralFilterValueType.boolean,
        });
      }
      fltrs.push({
        fieldName: 'TransactionDate',
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: format(this.insightOption.SelectedDataRange[0], dateFormat),
        highValue: format(this.insightOption.SelectedDataRange[1], dateFormat),
        valueType: GeneralFilterValueType.date,
      });

      this.isLoadingData.set(true);
      this.odataService
        .searchDocItem(fltrs, 90, 0)
        .pipe(takeUntilDestroyed(this.destroyedRef))
        .subscribe({
          next: (val) => {
            this.totalDataCount.set(val.totalCount);
            this.listData.update((arr) => [...arr, ...val.contentList]);

            if (this.totalDataCount() > 90) {
              let ntimes = Math.floor(this.totalDataCount() / 90);
              const nlef = this.totalDataCount() % 90;
              if (nlef > 0) {
                ntimes++;
              }
              ntimes--; // Already fetched it
              let nskip = 90;

              while (ntimes > 0) {
                this.odataService
                  .searchDocItem(fltrs, 90, nskip)
                  .pipe(takeUntilDestroyed(this.destroyedRef))
                  .subscribe({
                    next: (val) => {
                      this.listData.update((arr) => [...arr, ...val.contentList]);

                      if (this.listData().length === this.totalDataCount()) {
                        this.buildDisplayList();
                      }
                    },
                    error: (err) => {
                      ModelUtility.writeConsoleLog(
                        `AC_HIH_UI [Error]: Entering DocumentItemInsightComponent searchDocItem ${err}...`,
                        ConsoleLogTypeEnum.error,
                      );

                      this.modalService.error({
                        nzTitle: translate('Common.Error'),
                        nzContent: err.toString(),
                        nzClosable: true,
                      });
                    },
                  });

                nskip += 90;
                ntimes--;
              }
            } else {
              if (this.listData().length === this.totalDataCount()) {
                this.buildDisplayList();
              }
            }
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering DocumentItemInsightComponent searchDocItem ${err}...`,
              ConsoleLogTypeEnum.error,
            );

            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    }
  }

  buildDisplayList(): void {
    this.isLoadingData.set(false);

    let incomeAmt = 0;
    let outgoAmt = 0;

    const needdate = this.isTranDateVisible;
    const needacnt = this.isAccountVisible;
    const needtype = this.isTranTypeVisible;
    const displayData: InsightRecord[] = [];

    this.listData().forEach((p) => {
      let bcont = true;
      if (this.insightOption?.ExcludeTransfer === true) {
        if (
          p.TransactionType === financeTranTypeOpeningAsset ||
          p.TransactionType === financeTranTypeOpeningLiability ||
          p.TransactionType === financeTranTypeTransferIn ||
          p.TransactionType === financeTranTypeTransferOut ||
          p.TransactionType === financeTranTypeAdvancePaymentOut ||
          p.TransactionType === financeTranTypeAdvanceReceiveIn ||
          p.TransactionType === financeTranTypeAssetValueDecrease ||
          p.TransactionType === financeTranTypeAssetValueIncrease
        ) {
          bcont = false;
        }
      }

      if (bcont) {
        const isexps = this.arTranType().find((tt) => tt.Id === p.TransactionType)?.Expense;
        if (isexps) {
          outgoAmt += p.Amount;
        } else {
          incomeAmt += p.Amount;
        }

        const idx = displayData.findIndex((data) => {
          if (needdate && data.TransactionDate !== p.TransactionDate) {
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
          displayData[idx].Amount += p.Amount;
        } else {
          const ndata: InsightRecord = {
            Amount: p.Amount,
            Currency: this.baseCurrency,
          };
          if (needdate) {
            ndata.TransactionDate = p.TransactionDate;
          }
          if (needacnt) {
            ndata.AccountID = p.AccountID;
          }
          if (needtype) {
            ndata.TransactionType = p.TransactionType;
          }

          displayData.push(ndata);
        }
      }
    });

    displayData.sort((item1, item2) => {
      let ndatecmp = 0;
      if (needdate) {
        const date1 = typeof item1.TransactionDate === 'string' ? item1.TransactionDate : '';
        const date2 = typeof item2.TransactionDate === 'string' ? item2.TransactionDate : '';
        ndatecmp = date1.localeCompare(date2);
      }

      if (ndatecmp === 0) {
        let nacntcmp = 0;
        if (needacnt) {
          nacntcmp = item1.AccountID! - item2.AccountID!;

          if (nacntcmp === 0) {
            let nttcmp = 0;
            if (needtype) {
              nttcmp = item1.TransactionType! - item2.TransactionType!;
            }
            return nttcmp;
          }

          return nacntcmp;
        }
      }
      return ndatecmp;
    });

    this.listDisplayData.set(displayData);
    this.incomeAmount.set(incomeAmt);
    this.outgoAmount.set(outgoAmt);
  }
}
