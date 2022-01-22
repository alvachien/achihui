import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, } from 'ng-zorro-antd/modal';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { translate } from '@ngneat/transloco';
import { EChartsOption } from 'echarts';

import { FinanceReportByAccount, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  momentDateFormat, Account, AccountCategory, ITableFilterValues, GeneralFilterValueType, GeneralFilterItem,
  GeneralFilterOperatorEnum, AccountStatusEnum, UIDisplayString, FinanceReportEntryByAccountAndExpense,
} from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';
import { DocumentItemViewComponent } from '../../document-item-view';

@Component({
  selector: 'hih-finance-report-account',
  templateUrl: './account-report.component.html',
  styleUrls: ['./account-report.component.less'],
})
export class AccountReportComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  dataSet: any[] = [];
  arAccounts: Account[] = [];
  arAccountCategories: AccountCategory[] = [];
  arReportByAccount: FinanceReportByAccount[] = [];
  baseCurrency: string = '';
  chartAssetOption: EChartsOption | null = null;
  chartLiabilitiesOption: EChartsOption | null = null;
  chartAssetAccountOption: EChartsOption | null = null;
  chartLiabilitiesAccountOption: EChartsOption | null = null;
  listCategoryFilter: ITableFilterValues[] = [];
  selectedCategoryFilter: number[] = [];

  constructor(
    private odataService: FinanceOdataService,
    private homeService: HomeDefOdataService,
    private modalService: NzModalService,
    private router: Router,
    private drawerService: NzDrawerService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountReportComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.baseCurrency = homeService.ChosedHome!.BaseCurrency;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    // Load data
    this._destroyed$ = new ReplaySubject(1);
    this.onLoadData();
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountReportComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }

  onAccountStatusFilterChanged(event: any) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountReportComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    this.buildReportList();
    this.buildAssetChart();
    this.buildLiabilityChart();
  }

  onDisplayMasterData(acntid: number) {
    this.router.navigate(['/finance/account/display/' + acntid.toString()]);
  }
  onDisplayDebitData(ccid: number) {
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
      operator: GeneralFilterOperatorEnum.LargerThan,
      lowValue: 0,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<DocumentItemViewComponent, {
      filterDocItem: GeneralFilterItem[],
    }, string>({
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

    drawerRef.afterClose.subscribe(data => {
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
    const drawerRef = this.drawerService.create<DocumentItemViewComponent, {
      filterDocItem: GeneralFilterItem[],
    }, string>({
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

    drawerRef.afterClose.subscribe(data => {
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
    const drawerRef = this.drawerService.create<DocumentItemViewComponent, {
      filterDocItem: GeneralFilterItem[],
    }, string>({
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

    drawerRef.afterClose.subscribe(data => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }

  onAssetsClicked(event: any) {
    if (event && event.data && event.data.category) {
      this.filterReportByAccountTable([event.data.category]);
    }
  }
  onLiabilitiesClicked(event: any) {
    if (event && event.data && event.data.category) {
      this.filterReportByAccountTable([event.data.category]);
    }
  }

  filterReportByAccountTable(seledCategory: number[]) {
    this.selectedCategoryFilter = seledCategory;

    this.buildReportList();
  }
  onLoadData(forceReload?: boolean) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering AccountReportComponent onLoadData(${forceReload})...`,
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchReportByAccount(forceReload),
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAccounts()
    ])
      .pipe(takeUntil(this._destroyed$!),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (x: any[]) => {
          this.arReportByAccount = x[0] as FinanceReportByAccount[];
          this.arAccountCategories = x[1];
          this.arAccounts = x[2];

          this.arAccountCategories.forEach((val: AccountCategory) => {
            this.listCategoryFilter.push({
              text: translate(val.Name!),
              value: val.ID
            });
          });

          this.buildReportList();
          this.buildAssetChart();
          this.buildAssetChartChart();
          this.buildLiabilityChart();
          this.buildLiabilityAccountChart();
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountReportComponent ngOnInit forkJoin failed ${error}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  private buildAssetChart() {
    const namevalues: Array<{ category: number; name: string; value: number; }> = [];
    const names: any[] = [];
    this.arAccountCategories.forEach((ctgy: AccountCategory) => {
      if (ctgy.AssetFlag) {
        const ctgyName = translate(ctgy.Name!);
        names.push(ctgyName);

        let ctgyAmt = 0;
        this.arAccounts.forEach((acnt: Account) => {
          if (acnt.CategoryId === ctgy.ID) {
            this.arReportByAccount.forEach((rpt: FinanceReportByAccount) => {
              if (rpt.AccountId === acnt.Id) {
                ctgyAmt += rpt.Balance;
              }
            });
          }
        });

        if (ctgyAmt > 0) {
          namevalues.push({
            category: ctgy.ID!,
            name: ctgyName as string,
            value: ctgyAmt,
          });  
        }
      }
    });

    this.chartAssetOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        left: 'center',
        top: 'bottom',
        data: names
      },
      toolbox: {
        show: true,
        feature: {
          dataView: {show: true, readOnly: true},
          restore: {show: true},
          saveAsImage: {show: true},
        }
      },
      series: [{
        name: '',
        type: 'pie',
        radius: [30, 110],
        roseType: 'area',
        data: namevalues
      }],
    };
  }
  private buildLiabilityChart() {
    const names: any[] = [];
    const namevalues: Array<{ category: number; name: string; value: number; }> = [];
    this.arAccountCategories.forEach((ctgy: AccountCategory) => {
      if (!ctgy.AssetFlag) {
        const ctgyName = translate(ctgy.Name!);
        names.push(ctgyName);

        let ctgyAmt = 0;
        this.arAccounts.forEach((acnt: Account) => {
          if (acnt.CategoryId === ctgy.ID) {
            this.arReportByAccount.forEach((rpt: FinanceReportByAccount) => {
              if (rpt.AccountId === acnt.Id) {
                ctgyAmt += rpt.Balance;
              }
            });
          }
        });

        if (ctgyAmt > 0) {
          namevalues.push({
            category: ctgy.ID!,
            name: ctgyName as string,
            value: ctgyAmt,
          });  
        }
      }
    });

    this.chartLiabilitiesOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        left: 'center',
        top: 'bottom',
        data: names,
      },
      toolbox: {
        show: true,
        feature: {
          dataView: {show: true, readOnly: true},
          restore: {show: true},
          saveAsImage: {show: true},
        }
      },
      series: [{
        name: '',
        type: 'pie',
        radius: [30, 110],
        roseType: 'radius',
        data: namevalues,
      }],
    };
  }
  private buildAssetChartChart() {
    const namevalues: Array<{ category: number; name: string; value: number; }> = [];
    const names: any[] = [];

    this.arReportByAccount.forEach((rpt: FinanceReportByAccount) => {
      const acntobj = this.arAccounts.find((acnt: Account) => {
        return acnt.Id === rpt.AccountId;
      });
      const acntCtgy = this.arAccountCategories.find((ctgy: AccountCategory) => {
        return ctgy.ID === acntobj?.CategoryId;
      });
      if (acntCtgy?.AssetFlag) {
        names.push(acntobj?.Name);

        namevalues.push({
          category: rpt.AccountId!,
          name: acntobj?.Name!,
          value: rpt.Balance,
        });  
      }
    });

    this.chartAssetAccountOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        left: 'center',
        top: 'bottom',
        data: names
      },
      toolbox: {
        show: true,
        feature: {
          dataView: {show: true, readOnly: true},
          restore: {show: true},
          saveAsImage: {show: true},
        }
      },
      series: [{
        name: '',
        type: 'pie',
        radius: [30, 110],
        roseType: 'area',
        data: namevalues
      }],
    };
  }
  private buildLiabilityAccountChart() {
    const names: any[] = [];
    const namevalues: Array<{ category: number; name: string; value: number; }> = [];

    this.arReportByAccount.forEach((rpt: FinanceReportByAccount) => {
      const acntobj = this.arAccounts.find((acnt: Account) => {
        return acnt.Id === rpt.AccountId;
      });
      const acntCtgy = this.arAccountCategories.find((ctgy: AccountCategory) => {
        return ctgy.ID === acntobj?.CategoryId;
      });
      if (acntCtgy && !acntCtgy.AssetFlag) {
        names.push(acntobj?.Name);

        namevalues.push({
          category: rpt.AccountId!,
          name: acntobj?.Name!,
          value: rpt.Balance,
        });  
      }
    });

    this.chartLiabilitiesAccountOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        left: 'center',
        top: 'bottom',
        data: names,
      },
      toolbox: {
        show: true,
        feature: {
          dataView: {show: true, readOnly: true},
          restore: {show: true},
          saveAsImage: {show: true},
        }
      },
      series: [{
        name: '',
        type: 'pie',
        radius: [30, 110],
        roseType: 'radius',
        data: namevalues,
      }],
    };
  }
  private buildReportList() {
    this.dataSet = [];

    this.arReportByAccount.forEach((baldata: FinanceReportByAccount) => {
      const acntobj = this.arAccounts.find((acnt: Account) => {
        return acnt.Id === baldata.AccountId;
      });
      if (acntobj !== undefined) {
        const ctgyobj = this.arAccountCategories.find((ctg: AccountCategory) => {
          return ctg.ID === acntobj.CategoryId;
        });

        if (this.selectedCategoryFilter.length > 0 && ctgyobj !== undefined) {
          if (this.selectedCategoryFilter.indexOf(ctgyobj.ID!) !== -1) {
            this.dataSet.push({
              AccountId: baldata.AccountId,
              AccountName: acntobj.Name,
              CategoryName: ctgyobj ? ctgyobj.Name : '',
              DebitBalance: baldata.DebitBalance,
              CreditBalance: baldata.CreditBalance,
              Balance: baldata.Balance,
            });
          }
        } else {
          this.dataSet.push({
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
  }
}
