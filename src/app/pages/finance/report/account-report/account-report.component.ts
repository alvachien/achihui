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
  GeneralFilterOperatorEnum, } from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';
import { DocumentItemViewComponent } from '../../document-item-view';
import { NumberUtility } from 'actslib';

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
  // Drilldown to table level
  selectedCategoryFilter: number[] = [];
  selectedAccountFilter: number[] = [];

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

  onAssetsCategoryChartClicked(event: any) {
    if (event && event.data && event.data.category) {
      this.filterReportByAccountTable([event.data.category], []);
    }
  }
  onLiabilitiesCategoryChartClicked(event: any) {
    if (event && event.data && event.data.category) {
      this.filterReportByAccountTable([event.data.category], []);
    }
  }
  onAssetsAccountChartClicked(event: any) {
    if (event && event.data && event.data.category) {
      this.filterReportByAccountTable([], [event.data.category]);
    }
  }
  onLiabilitiesAccountChartClicked(event: any) {
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
          this.buildAssetAccountChart();
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

    let ctgyAmt = 0;
    let ctgyUsed = false;
    this.arAccountCategories.forEach((ctgy: AccountCategory) => {
      if (ctgy.AssetFlag) {
        ctgyAmt = 0;
        ctgyUsed = false;
        this.arAccounts.forEach((acnt: Account) => {
          if (acnt.CategoryId === ctgy.ID) {
            this.arReportByAccount.forEach((rpt: FinanceReportByAccount) => {
              if (rpt.AccountId === acnt.Id) {
                ctgyUsed = true;
                ctgyAmt += rpt.Balance;
              }
            });
          }
        });

        if (ctgyUsed) {
          const ctgyName = translate(ctgy.Name!);
          names.push(ctgyName);
  
          namevalues.push({
            category: ctgy.ID!,
            name: ctgyName as string,
            value: ctgyAmt,
          });  
        }
      }
    });
    namevalues.forEach(val => {
      val.value = NumberUtility.Round2Two(val.value);
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

    let ctgyAmt = 0;
    let ctgyUsed = false;
    this.arAccountCategories.forEach((ctgy: AccountCategory) => {
      if (!ctgy.AssetFlag) {
        ctgyAmt = 0;
        ctgyUsed = false;

        this.arAccounts.forEach((acnt: Account) => {
          if (acnt.CategoryId === ctgy.ID) {
            this.arReportByAccount.forEach((rpt: FinanceReportByAccount) => {
              if (rpt.AccountId === acnt.Id) {
                ctgyUsed = true;
                ctgyAmt += rpt.Balance;
              }
            });
          }
        });

        if (ctgyUsed) {
          const ctgyName = translate(ctgy.Name!);
          names.push(ctgyName);

          namevalues.push({
            category: ctgy.ID!,
            name: ctgyName as string,
            value: -1 * ctgyAmt,
          });  
        }
      }
    });
    namevalues.forEach(val => {
      val.value = NumberUtility.Round2Two(val.value);
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
  private buildAssetAccountChart() {
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
    namevalues.forEach(val => {
      val.value = NumberUtility.Round2Two(val.value);
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
          value: -1 * rpt.Balance,
        });  
      }
    });
    namevalues.forEach(val => {
      val.value = NumberUtility.Round2Two(val.value);
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
        } else if (this.selectedAccountFilter.length > 0) {
          if (this.selectedAccountFilter.indexOf(acntobj.Id!) !== -1) {
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
