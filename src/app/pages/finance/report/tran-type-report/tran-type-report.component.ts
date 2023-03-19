import { Component, OnInit, OnDestroy } from "@angular/core";
import { forkJoin, ReplaySubject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import { NzModalService } from "ng-zorro-antd/modal";
import { NzDrawerService } from "ng-zorro-antd/drawer";
import { translate } from "@ngneat/transloco";
import { Router } from "@angular/router";
import * as moment from "moment";

import {
  LogLevel,
  ModelUtility,
  ConsoleLogTypeEnum,
  UIDisplayStringUtil,
  FinanceReportMostExpenseEntry,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  GeneralFilterItem,
  momentDateFormat,
  TranType,
  FinanceReportEntryByTransactionType,
} from "../../../../model";
import {
  FinanceOdataService,
  UIStatusService,
  HomeDefOdataService,
} from "../../../../services";
import { NumberUtility } from "actslib";
import { DocumentItemViewComponent } from "../../document-item-view";

@Component({
  selector: "hih-finance-report-trantype",
  templateUrl: "./tran-type-report.component.html",
  styleUrls: ["./tran-type-report.component.less"],
})
export class TranTypeReportComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  reportIncome: FinanceReportMostExpenseEntry[] = [];
  reportExpense: FinanceReportMostExpenseEntry[] = [];
  baseCurrency: string;
  totalIncome = 0;
  totalExpense = 0;
  selectedScope = "2"; // '1': Preview year, '2': Current Year, '3': Preview month, '4': Current month
  groupLevel = "3"; // '3': Group level is 3; '2': Group level is 2; '1': Group level is 1
  arTranType: TranType[] = [];
  arReportData: FinanceReportEntryByTransactionType[] = [];

  constructor(
    public odataService: FinanceOdataService,
    private homeService: HomeDefOdataService,
    private modalService: NzModalService,
    private drawerService: NzDrawerService
  ) {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering TranTypeReportComponent constructor...",
      ConsoleLogTypeEnum.debug
    );

    this.baseCurrency = this.homeService.ChosedHome!.BaseCurrency;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering TranTypeReportComponent ngOnInit...",
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);
    this.onLoadData();
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering TranTypeReportComponent ngOnDestroy...",
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }

  onLoadData() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering TranTypeReportComponent onLoadData...`,
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = true;
    let tnow = moment();
    let year = tnow.year();
    let month: number | undefined = undefined;
    if (this.selectedScope === "1") {
      // Previous year
      year = year - 1;
      month = undefined;
    } else if (this.selectedScope === "2") {
      // Current year
      month = undefined;
    } else if (this.selectedScope === "3") {
      // Previous month
      tnow = moment().subtract(1, "month");
      year = tnow.year();
      month = tnow.month() + 1;
    } else if (this.selectedScope === "4") {
      // Current month
      year = tnow.year();
      month = tnow.startOf("month").month() + 1;
    }

    forkJoin([
      this.odataService.fetchReportByTransactionType(year, month),
      this.odataService.fetchAllTranTypes(),
    ])
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (val: any[]) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering TranTypeReportComponent onLoadData forkJoin succeed`,
            ConsoleLogTypeEnum.debug
          );

          this.arReportData = val[0];
          this.arTranType = val[1];

          this.onRebuildData();
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering TranTypeReportComponent ngOnInit forkJoin failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate("Common.Error"),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }
  public onRebuildData(): void {
    this.reportExpense = [];
    this.reportIncome = [];
    this.totalExpense = 0;
    this.totalIncome = 0;

    this.arReportData.forEach((item: any) => {
      if (item.InAmount !== 0) {
        this.totalIncome += item.InAmount;
      }
      if (item.OutAmount !== 0) {
        this.totalExpense += item.OutAmount;
      }
    });

    const armaps: Map<number, number> = new Map<number, number>();

    if (this.groupLevel === "3") {
    } else if (this.groupLevel === "2") {
      this.arTranType.forEach((trantype) => {
        if (trantype.HierLevel === 2) {
          armaps.set(trantype.Id!, trantype.ParId!);
        } else {
          armaps.set(trantype.Id!, trantype.Id!);
        }
      });
    } else if (this.groupLevel === "1") {
      const armaps2: Map<number, number> = new Map<number, number>();
      this.arTranType.forEach((trantype) => {
        if (trantype.HierLevel === 2) {
          // Level 3:
          armaps2.set(trantype.Id!, trantype.ParId!);
        } else if (trantype.HierLevel === 1) {
          // Level 2: One step.
          armaps.set(trantype.Id!, trantype.ParId!);
        } else {
          // Level 1: mapping to itself
          armaps.set(trantype.Id!, trantype.Id!);
        }
      });
      armaps2.forEach((val, key) => {
        if (armaps.get(val)) {
          armaps.set(key, armaps.get(val)!);
        }
      });
    }

    this.arReportData.forEach((item: FinanceReportEntryByTransactionType) => {
      if (item.InAmount !== 0) {
        const entry: FinanceReportMostExpenseEntry =
          new FinanceReportMostExpenseEntry();
        if (armaps.size > 0 && armaps.get(item.TransactionType)) {
          entry.TransactionType = armaps.get(item.TransactionType)!;
          // Exist already?
          const rptindex = this.reportIncome.findIndex(
            (val) => val.TransactionType === entry.TransactionType
          );
          if (rptindex === -1) {
            // Not exist
            const ttObj = this.arTranType.find(
              (val) => val.Id === entry.TransactionType
            );
            if (ttObj) {
              entry.TransactionTypeName = ttObj.Name;
            }
            entry.Amount = item.InAmount;
            entry.Precentage = NumberUtility.Round2Two(
              (100 * item.InAmount) / this.totalIncome
            );
            this.reportIncome.push(entry);
          } else {
            this.reportIncome[rptindex].Amount += item.InAmount;
            this.reportIncome[rptindex].Precentage = NumberUtility.Round2Two(
              (100 * this.reportIncome[rptindex].Amount) / this.totalIncome
            );
          }
        } else {
          entry.TransactionType = item.TransactionType;
          entry.TransactionTypeName = item.TransactionTypeName;
          entry.Amount = item.InAmount;
          entry.Precentage = NumberUtility.Round2Two(
            (100 * item.InAmount) / this.totalIncome
          );
          this.reportIncome.push(entry);
        }
      }
      if (item.OutAmount !== 0) {
        const entry: FinanceReportMostExpenseEntry =
          new FinanceReportMostExpenseEntry();

        if (armaps.size > 0 && armaps.get(item.TransactionType)) {
          entry.TransactionType = armaps.get(item.TransactionType)!;
          // Exist already?
          const rptindex = this.reportExpense.findIndex(
            (val) => val.TransactionType === entry.TransactionType
          );
          if (rptindex === -1) {
            const ttObj = this.arTranType.find(
              (val) => val.Id === entry.TransactionType
            );
            if (ttObj) {
              entry.TransactionTypeName = ttObj.Name;
            }
            entry.Amount = item.OutAmount;
            entry.Precentage = NumberUtility.Round2Two(
              (100 * item.OutAmount) / this.totalExpense
            );
            this.reportExpense.push(entry);
          } else {
            this.reportExpense[rptindex].Amount += item.OutAmount;
            this.reportExpense[rptindex].Precentage = NumberUtility.Round2Two(
              (100 * this.reportExpense[rptindex].Amount) / this.totalExpense
            );
          }
        } else {
          entry.TransactionType = item.TransactionType;
          entry.TransactionTypeName = item.TransactionTypeName;
          entry.Amount = item.OutAmount;
          entry.Precentage = NumberUtility.Round2Two(
            (100 * item.OutAmount) / this.totalExpense
          );
          this.reportExpense.push(entry);
        }
      }
    });

    this.reportIncome.sort((a, b) => b.Precentage - a.Precentage);
    this.reportExpense.sort((a, b) => b.Precentage - a.Precentage);
  }

  public onDisplayDocumentItem(trantype: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: "TransactionType",
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: trantype,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    if (this.groupLevel === "2") {
      this.arTranType.forEach((tt) => {
        if (tt.ParId === trantype) {
          // Ensure it appears in report data
          const rptidx = this.arReportData.findIndex(
            (rp) => rp.TransactionType === tt.Id
          );
          if (rptidx !== -1) {
            fltrs.push({
              fieldName: "TransactionType",
              operator: GeneralFilterOperatorEnum.Equal,
              lowValue: tt.Id,
              highValue: 0,
              valueType: GeneralFilterValueType.number,
            });
          }
        }
      });
    } else if (this.groupLevel === "1") {
      // Level 2
      const tts: number[] = [];
      this.arTranType.forEach((tt) => {
        if (tt.ParId === trantype) {
          tts.push(tt.Id!);
          // Ensure it appears in report data
          const rptidx = this.arReportData.findIndex(
            (rp) => rp.TransactionType === tt.Id
          );
          if (rptidx !== -1) {
            fltrs.push({
              fieldName: "TransactionType",
              operator: GeneralFilterOperatorEnum.Equal,
              lowValue: tt.Id,
              highValue: 0,
              valueType: GeneralFilterValueType.number,
            });
          }
        }
      });

      // Level 3
      this.arTranType.forEach((tt) => {
        if (tt.ParId) {
          const level2idx = tts.findIndex((val) => tt.ParId === val);
          if (level2idx !== -1) {
            const rptidx = this.arReportData.findIndex(
              (rp) => rp.TransactionType === tt.Id
            );
            if (rptidx !== -1) {
              fltrs.push({
                fieldName: "TransactionType",
                operator: GeneralFilterOperatorEnum.Equal,
                lowValue: tt.Id,
                highValue: 0,
                valueType: GeneralFilterValueType.number,
              });
            }
          }
        }
      });
    }

    if (this.selectedScope === "1") {
      // Last year
      fltrs.push({
        fieldName: "TransactionDate",
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: moment()
          .startOf("year")
          .subtract(1, "year")
          .format(momentDateFormat),
        highValue: moment().startOf("year").format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
      });
    } else if (this.selectedScope === "2") {
      // Current year
      fltrs.push({
        fieldName: "TransactionDate",
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: moment().startOf("year").format(momentDateFormat),
        highValue: moment()
          .startOf("year")
          .add(1, "year")
          .format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
      });
    } else if (this.selectedScope === "3") {
      // Preview month
      fltrs.push({
        fieldName: "TransactionDate",
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: moment()
          .startOf("month")
          .subtract(1, "month")
          .format(momentDateFormat),
        highValue: moment().startOf("month").format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
      });
    } else if (this.selectedScope === "4") {
      // Current month
      fltrs.push({
        fieldName: "TransactionDate",
        operator: GeneralFilterOperatorEnum.Between,
        lowValue: moment().startOf("month").format(momentDateFormat),
        highValue: moment()
          .startOf("month")
          .add(1, "month")
          .format(momentDateFormat),
        valueType: GeneralFilterValueType.date,
      });
    }
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      { filterDocItem: GeneralFilterItem[] },
      string
    >({
      nzTitle: translate("Finance.Items"),
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
