import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, NzDrawerService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';
import { EChartOption } from 'echarts';

import { FinanceReportByAccount, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  momentDateFormat, Account, AccountCategory, ITableFilterValues, GeneralFilterValueType, GeneralFilterItem, GeneralFilterOperatorEnum
} from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';
import { DocumentItemViewComponent } from '../../document-item-view';

@Component({
  selector: 'hih-finance-report-account',
  templateUrl: './account-report.component.html',
  styleUrls: ['./account-report.component.less'],
})
export class AccountReportComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults = false;
  dataSet: any[] = [];
  arAccounts: Account[] = [];
  arAccountCategories: AccountCategory[] = [];
  arReportByAccount: FinanceReportByAccount[] = [];
  baseCurrency: string;
  chartAssetOption: EChartOption;
  chartLiabilitiesOption: EChartOption;
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

    this.isLoadingResults = false;
    this.baseCurrency = homeService.ChosedHome.BaseCurrency;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    // Load data
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchAllReportsByAccount(),
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAccounts()
    ])
      .pipe(takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (x: any[]) => {
          this.arReportByAccount = x[0] as FinanceReportByAccount[];
          this.arAccountCategories = x[1];
          this.arAccounts = x[2];

          this.arAccountCategories.forEach((val: AccountCategory) => {
            this.listCategoryFilter.push({
              text: translate(val.Name),
              value: val.ID
            });
          });

          this.buildReportList();
          this.buildAssetChart();
          this.buildLiabilityChart();
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

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountReportComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
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

  private buildAssetChart() {
    const namevalues: Array<{ category: number; name: string; value: number; }> = [];
    const names: any[] = [];
    this.arAccountCategories.forEach((ctgy: AccountCategory) => {
      if (ctgy.AssetFlag) {
        const ctgyName = translate(ctgy.Name);
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

        namevalues.push({
          category: ctgy.ID,
          name: ctgyName,
          value: ctgyAmt,
        });
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
        const ctgyName = translate(ctgy.Name);
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

        namevalues.push({
          category: ctgy.ID,
          name: ctgyName,
          value: ctgyAmt,
        });
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

  private buildReportList() {
    this.dataSet = [];

    this.arReportByAccount.forEach((baldata: FinanceReportByAccount) => {
      const acntobj: Account = this.arAccounts.find((acnt: Account) => {
        return acnt.Id === baldata.AccountId;
      });

      if (acntobj !== undefined) {
        const ctgyobj: AccountCategory = this.arAccountCategories.find((ctg: AccountCategory) => {
          return ctg.ID === acntobj.CategoryId;
        });

        if (this.selectedCategoryFilter.length > 0 && ctgyobj !== undefined) {
          if (this.selectedCategoryFilter.indexOf(ctgyobj.ID) !== -1) {
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
