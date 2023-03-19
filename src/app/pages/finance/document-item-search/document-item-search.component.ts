import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  Observable,
  forkJoin,
  merge,
  of as observableOf,
  BehaviorSubject,
  ReplaySubject,
} from "rxjs";
import { NzModalService } from "ng-zorro-antd/modal";
import * as moment from "moment";

import {
  GeneralFilterOperatorEnum,
  GeneralFilterItem,
  UIDisplayString,
  UIDisplayStringUtil,
  GeneralFilterValueType,
  TranType,
  UICommonLabelEnum,
  Account,
  ControlCenter,
  Order,
  DocumentItemView,
  ModelUtility,
  ConsoleLogTypeEnum,
  momentDateFormat,
} from "../../../model";
import { UITableColumnItem } from "../../../uimodel";
import { translate } from "@ngneat/transloco";
import { HomeDefOdataService } from "src/app/services";

@Component({
  selector: "hih-document-item-search",
  templateUrl: "./document-item-search.component.html",
  styleUrls: ["./document-item-search.component.less"],
})
export class DocumentItemSearchComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  // Filter
  filters: GeneralFilterItem[] = [];
  allOperators: UIDisplayString[] = [];
  allFields: any[] = [];
  realFilters: GeneralFilterItem[] = [];
  // Table
  isLoadingDocItems = false;
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arOrders: Order[] = [];
  public arAccounts: Account[] = [];
  pageIndex = 1;
  pageSize = 10;
  listDocItem: DocumentItemView[] = [];
  totalDocumentItemCount = 0;
  listOfColumns: UITableColumnItem<DocumentItemView>[] = [];
  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome!.IsChild!;
  }

  constructor(
    private modalService: NzModalService,
    private homeService: HomeDefOdataService
  ) {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering DocumentItemViewComponent constructor...",
      ConsoleLogTypeEnum.debug
    );
    this.allOperators =
      UIDisplayStringUtil.getGeneralFilterOperatorDisplayStrings();
    this.allFields = [
      {
        displayas: "Finance.TransactionType",
        value: "TransactionType",
        valueType: GeneralFilterValueType.number, // 1
      },
      {
        displayas: "Finance.IsExpense",
        value: "IsExpense",
        valueType: GeneralFilterValueType.boolean, // 4
      },
      {
        displayas: "Finance.Currency",
        value: "Currency",
        valueType: GeneralFilterValueType.string, // 2
      },
      {
        displayas: "Finance.Account",
        value: "AccountID",
        valueType: GeneralFilterValueType.number, // 1
      },
      {
        displayas: "Finance.ControlCenter",
        value: "ControlCenterID",
        valueType: GeneralFilterValueType.number, // 1
      },
      {
        displayas: "Finance.Activity",
        value: "OrderID",
        valueType: GeneralFilterValueType.number, // 1
      },
      {
        displayas: "Finance.TransactionDate",
        value: "TransactionDate",
        valueType: GeneralFilterValueType.date, // 3
      },
    ];
    this.listOfColumns = [
      {
        name: "Common.ID",
        sortOrder: null,
        sortFn: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
      },
      {
        name: "Finance.Items",
        sortOrder: null,
        sortFn: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
      },
      {
        name: "Common.Description",
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) =>
          a.ItemDesp.localeCompare(b.ItemDesp),
      },
      {
        name: "Common.Date",
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) =>
          a
            .TransactionDate!.format(moment.HTML5_FMT.DATE)
            .localeCompare(b.TransactionDate!.format(moment.HTML5_FMT.DATE)),
      },
      {
        name: "Finance.TransactionType",
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) =>
          a.TransactionType! - b.TransactionType!,
      },
      {
        name: "Finance.Amount",
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) =>
          a.Amount - b.Amount,
      },
      {
        name: "Finance.Account",
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) =>
          this.getAccountName(a.AccountID!).localeCompare(
            this.getAccountName(b.AccountID!)
          ),
      },
      {
        name: "Finance.ControlCenter",
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) =>
          this.getControlCenterName(a.ControlCenterID!).localeCompare(
            this.getControlCenterName(b.ControlCenterID!)
          ),
      },
      {
        name: "Finance.Activity",
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) =>
          this.getOrderName(a.OrderID!).localeCompare(
            this.getOrderName(b.OrderID!)
          ),
      },
    ];
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts.find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : "";
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters.find((cc) => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : "";
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders.find((ord) => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : "";
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranType.find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : "";
  }
  trackByName(_: number, item: UITableColumnItem<DocumentItemView>): string {
    return item.name;
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);
    this.onAddFilter();
  }
  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }

  ///
  /// Filter
  ///
  onFieldSelectionChanged(filter: GeneralFilterItem) {
    this.allFields.forEach((value: any) => {
      if (value.value === filter.fieldName) {
        filter.valueType = value.valueType;
      }
    });
  }
  public onAddFilter(): void {
    this.filters.push(new GeneralFilterItem());
  }
  public onRemoveFilter(idx: number): void {
    this.filters.splice(idx, 1);
    if (this.filters.length === 0) {
      this.onAddFilter();
    }
  }
  onSearch(): void {
    // Do the translate first
    const arRealFilter: GeneralFilterItem[] = [];
    this.filters.forEach((value: GeneralFilterItem) => {
      if (!value.valueType || !value.fieldName) {
        return;
      }
      const val: GeneralFilterItem = new GeneralFilterItem();
      val.valueType = +value.valueType;
      switch (value.valueType) {
        case GeneralFilterValueType.boolean: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          if (value.lowValue) {
            val.lowValue = "true";
          } else {
            val.lowValue = "false";
          }
          val.highValue = "";
          break;
        }

        case GeneralFilterValueType.date: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          val.lowValue = moment(value.lowValue).format(momentDateFormat);
          if (value.operator === GeneralFilterOperatorEnum.Between) {
            val.highValue = moment(value.highValue).format(momentDateFormat);
          } else {
            val.highValue = "";
          }
          break;
        }

        case GeneralFilterValueType.number: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          val.lowValue = +value.lowValue;
          if (value.operator === GeneralFilterOperatorEnum.Between) {
            val.highValue = +value.highValue;
          } else {
            val.highValue = "";
          }
          break;
        }

        case GeneralFilterValueType.string: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          val.lowValue = value.lowValue;
          if (value.operator === GeneralFilterOperatorEnum.Between) {
            val.highValue = value.highValue;
          } else {
            val.highValue = "";
          }
          break;
        }

        default:
          break;
      }
      arRealFilter.push(val);
    });
    if (arRealFilter.length > 0) {
      this.realFilters = arRealFilter;
    } else {
      this.modalService.warning({
        nzTitle: translate("Common.Warning"),
        nzContent: translate("Common.FilterIsMust"),
        nzClosable: true,
      });
    }
  }
}
