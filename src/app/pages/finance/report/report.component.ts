import { Component, OnInit, OnDestroy } from "@angular/core";
import { forkJoin, ReplaySubject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import { NzModalService } from "ng-zorro-antd/modal";
import { translate } from "@ngneat/transloco";
import { Router } from "@angular/router";
import { EChartsOption } from "echarts";
import { NzStatisticValueType } from "ng-zorro-antd/statistic/typings";
import { NzDrawerService } from "ng-zorro-antd/drawer";

import {
  FinanceReportByAccount,
  ModelUtility,
  ConsoleLogTypeEnum,
  UIDisplayStringUtil,
  momentDateFormat,
  Account,
  AccountCategory,
  FinanceReportByControlCenter,
  FinanceReportByOrder,
  ControlCenter,
  Order,
  FinanceReportEntryByTransactionType,
  FinanceReportMostExpenseEntry,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
} from "../../../model";
import {
  FinanceOdataService,
  UIStatusService,
  HomeDefOdataService,
} from "../../../services";
import * as moment from "moment";
import { NumberUtility } from "actslib";
import { DocumentItemViewComponent } from "../document-item-view";

@Component({
  selector: "hih-finance-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.less"],
})
export class ReportComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  dataReportByAccount: FinanceReportByAccount[] = [];
  dataReportByControlCenter: FinanceReportByControlCenter[] = [];
  dataReportByOrder: FinanceReportByOrder[] = [];
  baseCurrency: string;
  arAccountCategories: AccountCategory[] = [];
  arAccounts: Account[] = [];
  arControlCenters: ControlCenter[] = [];
  arOrders: Order[] = [];

  // Current Month - Transaction Type
  reportByMostOutgoInCurrentMonth: FinanceReportMostExpenseEntry[] = [];
  totalOutgoInCurrentMonth = 0;
  reportByMostIncomeInCurrentMonth: FinanceReportMostExpenseEntry[] = [];
  totalIncomeInCurrentMonth = 0;
  // Last Month - Transaction Type
  reportByMostOutgoInLastMonth: FinanceReportMostExpenseEntry[] = [];
  totalOutgoInLastMonth = 0;
  reportByMostIncomeInLastMonth: FinanceReportMostExpenseEntry[] = [];
  totalIncomeInLastMonth = 0;
  // Card: Account
  reportAccountAsset: NzStatisticValueType = 0;
  reportAccountLibility: NzStatisticValueType = 0;
  chartAccountOption?: EChartsOption;
  // Card: Control center
  chartControlCenterOption?: EChartsOption;
  // Card: Order
  chartOrderOption?: EChartsOption;

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome!.IsChild!;
  }

  constructor(
    public router: Router,
    public odataService: FinanceOdataService,
    private homeService: HomeDefOdataService,
    private modalService: NzModalService,
    public drawerService: NzDrawerService
  ) {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering ReportComponent constructor...",
      ConsoleLogTypeEnum.debug
    );

    this.baseCurrency = homeService.ChosedHome!.BaseCurrency;
    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering ReportComponent ngOnInit...",
      ConsoleLogTypeEnum.debug
    );

    // Load data
    this._destroyed$ = new ReplaySubject(1);

    if (!this.isChildMode) {
      this.buildData();
    }
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering ReportComponent OnDestroy...",
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }

  onDrillDownToAccount(): void {
    this.router.navigate(["/finance/report/account"]);
  }
  onDrillDownToAccountMoM(): void {
    this.router.navigate(["/finance/report/accountmom"]);
  }
  onDrillDownToTranTypeMoM(): void {
    this.router.navigate(["finance", "report", "trantypemom"]);
  }
  onDrillDownToControlCenter(): void {
    this.router.navigate(["/finance/report/controlcenter"]);
  }
  onDrillDownToControlCenterMoM(): void {
    this.router.navigate(["/finance/report/controlcentermom"]);
  }
  onDrillDownToOrder(): void {
    this.router.navigate(["/finance/report/order"]);
  }
  onDrillDownToTranType(): void {
    this.router.navigate(["finance", "report", "trantype"]);
  }
  onDrillDownToCash(): void {
    this.router.navigate(["finance", "report", "cash"]);
  }
  onDrillDownToCashMoM(): void {
    this.router.navigate(["finance", "report", "cashmom"]);
  }
  onDrillDownToStatementOfIncomeExpenseMoM(): void {
    this.router.navigate(["finance", "report", "statementofincexpmom"]);
  }

  private buildData(): void {
    this.isLoadingResults = true;
    const today = moment();
    this.reportByMostIncomeInCurrentMonth = [];
    this.totalOutgoInCurrentMonth = 0;
    this.reportByMostOutgoInCurrentMonth = [];
    this.totalIncomeInCurrentMonth = 0;

    // Current month
    const dateInLastMonth = today.clone();
    dateInLastMonth.subtract(1, "month");
    forkJoin([
      this.odataService.fetchReportByTransactionType(
        today.year(),
        today.month() + 1
      ),
      this.odataService.fetchReportByTransactionType(
        dateInLastMonth.year(),
        dateInLastMonth.month() + 1
      ),
    ])
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (val: any[]) => {
          // Current month
          val[0].forEach((item: any) => {
            if (item.InAmount !== 0) {
              this.totalIncomeInCurrentMonth += item.InAmount;
            }
            if (item.OutAmount !== 0) {
              this.totalOutgoInCurrentMonth += item.OutAmount;
            }
          });
          val[0].forEach((item: any) => {
            if (item.InAmount !== 0) {
              const entry: FinanceReportMostExpenseEntry =
                new FinanceReportMostExpenseEntry();
              entry.Amount = item.InAmount;
              entry.TransactionType = item.TransactionType;
              entry.TransactionTypeName = item.TransactionTypeName;
              entry.Precentage = NumberUtility.Round2Two(
                (100 * item.InAmount) / this.totalIncomeInCurrentMonth
              );
              this.reportByMostIncomeInCurrentMonth.push(entry);
            }
            if (item.OutAmount !== 0) {
              const entry: FinanceReportMostExpenseEntry =
                new FinanceReportMostExpenseEntry();
              entry.Amount = item.OutAmount;
              entry.TransactionType = item.TransactionType;
              entry.TransactionTypeName = item.TransactionTypeName;
              entry.Precentage = NumberUtility.Round2Two(
                (100 * item.OutAmount) / this.totalOutgoInCurrentMonth
              );
              this.reportByMostOutgoInCurrentMonth.push(entry);
            }
          });

          this.reportByMostIncomeInCurrentMonth.sort(
            (a, b) => b.Amount - a.Amount
          );
          if (this.reportByMostIncomeInCurrentMonth.length > 3) {
            this.reportByMostIncomeInCurrentMonth.splice(2);
          }
          this.reportByMostOutgoInCurrentMonth.sort(
            (a, b) => a.Amount - b.Amount
          );
          if (this.reportByMostOutgoInCurrentMonth.length > 3) {
            this.reportByMostOutgoInCurrentMonth.splice(3);
          }
          // Last month
          val[1].forEach((item: any) => {
            if (item.InAmount !== 0) {
              this.totalIncomeInLastMonth += item.InAmount;
            }
            if (item.OutAmount !== 0) {
              this.totalOutgoInLastMonth += item.OutAmount;
            }
          });
          val[1].forEach((item: any) => {
            if (item.InAmount !== 0) {
              const entry: FinanceReportMostExpenseEntry =
                new FinanceReportMostExpenseEntry();
              entry.Amount = item.InAmount;
              entry.TransactionType = item.TransactionType;
              entry.TransactionTypeName = item.TransactionTypeName;
              entry.Precentage = NumberUtility.Round2Two(
                (100 * item.InAmount) / this.totalIncomeInLastMonth
              );
              this.reportByMostIncomeInLastMonth.push(entry);
            }
            if (item.OutAmount !== 0) {
              const entry: FinanceReportMostExpenseEntry =
                new FinanceReportMostExpenseEntry();
              entry.Amount = item.OutAmount;
              entry.TransactionType = item.TransactionType;
              entry.TransactionTypeName = item.TransactionTypeName;
              entry.Precentage = NumberUtility.Round2Two(
                (100 * item.OutAmount) / this.totalOutgoInLastMonth
              );
              this.reportByMostOutgoInLastMonth.push(entry);
            }
          });

          this.reportByMostIncomeInLastMonth.sort(
            (a, b) => b.Amount - a.Amount
          );
          if (this.reportByMostIncomeInLastMonth.length > 3) {
            this.reportByMostIncomeInLastMonth.splice(2);
          }
          this.reportByMostOutgoInLastMonth.sort((a, b) => a.Amount - b.Amount);
          if (this.reportByMostOutgoInLastMonth.length > 3) {
            this.reportByMostOutgoInLastMonth.splice(3);
          }
        },
        error: (err) => {
          this.modalService.error({
            nzTitle: translate("Common.Error"),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  onShowDetail(ttid: number, monthDiff: number, isexp: boolean) {
    let bgn = "";
    let end = "";
    if (monthDiff === 0) {
      bgn = moment().startOf("M").format(momentDateFormat);
      end = moment().endOf("M").format(momentDateFormat);
    } else if (monthDiff < 0) {
      bgn = moment()
        .subtract(-1 * monthDiff, "M")
        .startOf("M")
        .format(momentDateFormat);
      end = moment()
        .subtract(-1 * monthDiff, "M")
        .endOf("M")
        .format(momentDateFormat);
    } else if (monthDiff > 0) {
      bgn = moment().add(monthDiff, "M").startOf("M").format(momentDateFormat);
      end = moment().add(monthDiff, "M").endOf("M").format(momentDateFormat);
    }

    this.onDisplayDocItem(bgn, end, ttid, isexp);
  }
  onDisplayDocItem(
    beginDate: string,
    endDate: string,
    ttid: number,
    isexp: boolean
  ) {
    const fltrs: GeneralFilterItem[] = [];
    fltrs.push({
      fieldName: "TransactionDate",
      operator: GeneralFilterOperatorEnum.Between,
      lowValue: beginDate,
      highValue: endDate,
      valueType: GeneralFilterValueType.date,
    });
    fltrs.push({
      fieldName: "IsExpense",
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: isexp,
      highValue: isexp,
      valueType: GeneralFilterValueType.boolean,
    });
    fltrs.push({
      fieldName: "TransactionType",
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ttid,
      highValue: ttid,
      valueType: GeneralFilterValueType.number,
    });

    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
      nzTitle: translate("Finance.Documents"),
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: "100%",
      nzHeight: "50%",
      nzPlacement: "bottom",
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe((data) => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
}
