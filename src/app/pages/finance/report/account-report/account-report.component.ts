import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer';
import { translate, TranslocoModule } from '@jsverse/transloco';
import * as echarts from 'echarts';

import {
  FinanceReportByAccount,
  ModelUtility,
  ConsoleLogTypeEnum,
  Account,
  AccountCategory,
  ITableFilterValues,
  GeneralFilterValueType,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
} from '../../../../model';
import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { DocumentItemViewComponent } from '../../document/document-item-view';
import { NumberUtility } from 'actslib';
import { SafeAny } from '@common/any';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'hih-finance-report-account',
  templateUrl: './account-report.component.html',
  styleUrls: ['./account-report.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({ echarts })],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzGridModule,
    NgxEchartsModule,
    NzDividerModule,
    NzTableModule,
    NzButtonModule,
    DecimalPipe,
    NzModalModule,
    NzDrawerModule,
    RouterModule,
    TranslocoModule,
  ],
})
export class AccountReportComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<SafeAny[]>([]);
  arAccounts = signal<Account[]>([]);
  arAccountCategories = signal<AccountCategory[]>([]);
  arReportByAccount = signal<FinanceReportByAccount[]>([]);
  baseCurrency = '';
  chartAssetOption: echarts.EChartsOption | null = null;
  chartLiabilitiesOption: echarts.EChartsOption | null = null;
  chartAssetAccountOption: echarts.EChartsOption | null = null;
  chartLiabilitiesAccountOption: echarts.EChartsOption | null = null;
  listCategoryFilter: ITableFilterValues[] = [];
  // Drilldown to table level
  selectedCategoryFilter: number[] = [];
  selectedAccountFilter: number[] = [];

  private readonly odataService = inject(FinanceOdataService);

  private readonly homeService = inject(HomeDefOdataService);

  private readonly modalService = inject(NzModalService);

  private readonly router = inject(Router);

  private readonly drawerService = inject(NzDrawerService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountReportComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    // Load data
    this.onLoadData();
  }

  onDisplayMasterData(acntid: number) {
    this.router.navigate(['/finance/account/display/' + acntid.toString()]);
  }
  onDisplayDebitData(acntid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'AccountID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: acntid,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    fltrs.push({
      fieldName: 'Amount',
      operator: GeneralFilterOperatorEnum.LargerThan,
      lowValue: 0,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
      nzTitle: 'Document Items',
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(() => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
  onDisplayCreditData(ccid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'AccountID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ccid,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    fltrs.push({
      fieldName: 'Amount',
      operator: GeneralFilterOperatorEnum.LessThan,
      lowValue: 0,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
      nzTitle: 'Document Items',
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(() => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
  onDisplayBalanceData(ccid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'AccountID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ccid,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
      nzTitle: 'Document Items',
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(() => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }

  onAssetsCategoryChartClicked(event: SafeAny) {
    if (event && event.data && event.data.category) {
      this.filterReportByAccountTable([event.data.category], []);
    }
  }
  onLiabilitiesCategoryChartClicked(event: SafeAny) {
    if (event && event.data && event.data.category) {
      this.filterReportByAccountTable([event.data.category], []);
    }
  }
  onAssetsAccountChartClicked(event: SafeAny) {
    if (event && event.data && event.data.category) {
      this.filterReportByAccountTable([], [event.data.category]);
    }
  }
  onLiabilitiesAccountChartClicked(event: SafeAny) {
    if (event && event.data && event.data.category) {
      this.filterReportByAccountTable([], [event.data.category]);
    }
  }

  filterReportByAccountTable(seledCategory: number[], selectedAccounts: number[]) {
    if (seledCategory.length > 0) {
      this.selectedCategoryFilter = seledCategory;
    } else if (selectedAccounts.length > 0) {
      this.selectedAccountFilter = selectedAccounts;
    }

    this.buildReportList();
  }
  onLoadData(forceReload?: boolean) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering AccountReportComponent onLoadData(${forceReload})...`,
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    forkJoin([
      this.odataService.fetchReportByAccount(forceReload),
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAccounts(),
    ])
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x) => {
          this.arReportByAccount.set(x[0] as FinanceReportByAccount[]);
          this.arAccountCategories.set(x[1]);
          this.arAccounts.set(x[2]);

          this.arAccountCategories().forEach((val: AccountCategory) => {
            this.listCategoryFilter.push({
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              text: translate(val.Name!),
              value: val.ID,
            });
          });

          this.buildReportList();
          this.buildAssetChart();
          this.buildAssetAccountChart();
          this.buildLiabilityChart();
          this.buildLiabilityAccountChart();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering AccountReportComponent ngOnInit forkJoin failed ${err}`,
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

  private buildAssetChart() {
    const namevalues: Array<{ category: number; name: string; value: number }> = [];
    const names: SafeAny[] = [];

    let ctgyAmt = 0;
    let ctgyUsed = false;
    this.arAccountCategories().forEach((ctgy: AccountCategory) => {
      if (ctgy.AssetFlag) {
        ctgyAmt = 0;
        ctgyUsed = false;
        this.arAccounts().forEach((acnt: Account) => {
          if (acnt.CategoryId === ctgy.ID) {
            this.arReportByAccount().forEach((rpt: FinanceReportByAccount) => {
              if (rpt.AccountId === acnt.Id) {
                ctgyUsed = true;
                ctgyAmt += rpt.Balance;
              }
            });
          }
        });

        if (ctgyUsed) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const ctgyName = translate(ctgy.Name!);
          names.push(ctgyName);

          namevalues.push({
            category: ctgy.ID ?? 0,
            name: ctgyName as string,
            value: ctgyAmt,
          });
        }
      }
    });
    namevalues.forEach((val) => {
      val.value = NumberUtility.Round2Two(val.value);
    });

    this.chartAssetOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        left: 'center',
        top: 'bottom',
        data: names,
      },
      toolbox: {
        show: true,
        feature: {
          dataView: { show: true, readOnly: true },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: [30, 110],
          roseType: 'area',
          data: namevalues,
        },
      ],
    };
  }
  private buildLiabilityChart() {
    const names: SafeAny[] = [];
    const namevalues: Array<{ category: number; name: string; value: number }> = [];

    let ctgyAmt = 0;
    let ctgyUsed = false;
    this.arAccountCategories().forEach((ctgy: AccountCategory) => {
      if (!ctgy.AssetFlag) {
        ctgyAmt = 0;
        ctgyUsed = false;

        this.arAccounts().forEach((acnt: Account) => {
          if (acnt.CategoryId === ctgy.ID) {
            this.arReportByAccount().forEach((rpt: FinanceReportByAccount) => {
              if (rpt.AccountId === acnt.Id) {
                ctgyUsed = true;
                ctgyAmt += rpt.Balance;
              }
            });
          }
        });

        if (ctgyUsed) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const ctgyName = translate(ctgy.Name!);
          names.push(ctgyName);

          namevalues.push({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            category: ctgy.ID!,
            name: ctgyName as string,
            value: -1 * ctgyAmt,
          });
        }
      }
    });
    namevalues.forEach((val) => {
      val.value = NumberUtility.Round2Two(val.value);
    });

    this.chartLiabilitiesOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        left: 'center',
        top: 'bottom',
        data: names,
      },
      toolbox: {
        show: true,
        feature: {
          dataView: { show: true, readOnly: true },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: [30, 110],
          roseType: 'radius',
          data: namevalues,
        },
      ],
    };
  }
  private buildAssetAccountChart() {
    const namevalues: Array<{ category: number; name: string; value: number }> = [];
    const names: SafeAny[] = [];

    // let aracnts = [];
    // this.arReportByAccount().forEach(val => {
    // });

    this.arReportByAccount().forEach((rpt: FinanceReportByAccount) => {
      const acntobj = this.arAccounts().find((acnt: Account) => {
        return acnt.Id === rpt.AccountId;
      });
      const acntCtgy = this.arAccountCategories().find((ctgy: AccountCategory) => {
        return ctgy.ID === acntobj?.CategoryId;
      });
      if (acntCtgy?.AssetFlag) {
        names.push(acntobj?.Name);

        namevalues.push({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          category: rpt.AccountId!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-unsafe-optional-chaining, @typescript-eslint/no-non-null-asserted-optional-chain
          name: acntobj?.Name!,
          value: rpt.Balance,
        });
      }
    });
    namevalues.forEach((val) => {
      val.value = NumberUtility.Round2Two(val.value);
    });

    this.chartAssetAccountOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        left: 'center',
        top: 'bottom',
        data: names,
      },
      toolbox: {
        show: true,
        feature: {
          dataView: { show: true, readOnly: true },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: [30, 110],
          roseType: 'area',
          data: namevalues,
        },
      ],
    };
  }
  private buildLiabilityAccountChart() {
    const names: SafeAny[] = [];
    const namevalues: Array<{ category: number; name: string; value: number }> = [];

    this.arReportByAccount().forEach((rpt: FinanceReportByAccount) => {
      const acntobj = this.arAccounts().find((acnt: Account) => {
        return acnt.Id === rpt.AccountId;
      });
      const acntCtgy = this.arAccountCategories().find((ctgy: AccountCategory) => {
        return ctgy.ID === acntobj?.CategoryId;
      });
      if (acntCtgy && !acntCtgy.AssetFlag) {
        names.push(acntobj?.Name);

        namevalues.push({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          category: rpt.AccountId!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-unsafe-optional-chaining, @typescript-eslint/no-non-null-asserted-optional-chain
          name: acntobj?.Name!,
          value: -1 * rpt.Balance,
        });
      }
    });
    namevalues.forEach((val) => {
      val.value = NumberUtility.Round2Two(val.value);
    });

    this.chartLiabilitiesAccountOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        left: 'center',
        top: 'bottom',
        data: names,
      },
      toolbox: {
        show: true,
        feature: {
          dataView: { show: true, readOnly: true },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: [30, 110],
          roseType: 'radius',
          data: namevalues,
        },
      ],
    };
  }
  private buildReportList() {
    const ds: SafeAny[] = [];

    this.arReportByAccount().forEach((baldata: FinanceReportByAccount) => {
      const acntobj = this.arAccounts().find((acnt: Account) => {
        return acnt.Id === baldata.AccountId;
      });
      if (acntobj !== undefined) {
        const ctgyobj = this.arAccountCategories().find((ctg: AccountCategory) => {
          return ctg.ID === acntobj.CategoryId;
        });

        if (this.selectedCategoryFilter.length > 0 && ctgyobj !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          if (this.selectedCategoryFilter.indexOf(ctgyobj.ID!) !== -1) {
            ds.push({
              AccountId: baldata.AccountId,
              AccountName: acntobj.Name,
              CategoryName: ctgyobj ? ctgyobj.Name : '',
              DebitBalance: baldata.DebitBalance,
              CreditBalance: baldata.CreditBalance,
              Balance: baldata.Balance,
            });
          }
        } else if (this.selectedAccountFilter.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          if (this.selectedAccountFilter.indexOf(acntobj.Id!) !== -1) {
            ds.push({
              AccountId: baldata.AccountId,
              AccountName: acntobj.Name,
              CategoryName: ctgyobj ? ctgyobj.Name : '',
              DebitBalance: baldata.DebitBalance,
              CreditBalance: baldata.CreditBalance,
              Balance: baldata.Balance,
            });
          }
        } else {
          ds.push({
            AccountId: baldata.AccountId,
            AccountName: acntobj.Name,
            CategoryName: ctgyobj ? ctgyobj.Name : '',
            DebitBalance: baldata.DebitBalance,
            CreditBalance: baldata.CreditBalance,
            Balance: baldata.Balance,
          });
        }
      }
    });

    this.dataSet.set(ds);
  }
}
