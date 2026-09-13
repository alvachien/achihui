import { NgIf } from '@angular/common';
import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { format, parse } from 'date-fns';

import {
  GeneralFilterOperatorEnum,
  GeneralFilterItem,
  UIDisplayString,
  UIDisplayStringUtil,
  GeneralFilterValueType,
  TranType,
  Account,
  ControlCenter,
  Order,
  DocumentItemView,
  ModelUtility,
  ConsoleLogTypeEnum,
  dateFormat,
} from '../../../../model';
import { UITableColumnItem } from '../../../../uimodel';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { HomeDefOdataService } from '@services/index';
import { SafeAny } from '@common/any';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { DocumentItemViewComponent } from '../document-item-view';
import { RouterModule } from '@angular/router';
import { OperatorFilterPipe } from 'app/pages/reusable-components/pipes';

@Component({
  selector: 'hih-document-item-search',
  templateUrl: './document-item-search.component.html',
  styleUrls: ['./document-item-search.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzCheckboxModule,
    NzDatePickerModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzResultModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzInputModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    DocumentItemViewComponent,
    NzModalModule,
    RouterModule,
    TranslocoModule,
    OperatorFilterPipe,
    NgIf,
  ],
})
export class DocumentItemSearchComponent implements OnInit {
  // Filter
  filters = signal<GeneralFilterItem[]>([]);
  allOperators: UIDisplayString[] = [];
  allFields: SafeAny[] = [];
  realFilters = signal<GeneralFilterItem[]>([]);
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

  private readonly modalService = inject(NzModalService);
  private readonly homeService = inject(HomeDefOdataService);
  readonly currentMember = computed(() => this.homeService.curHomeMember());
  readonly isChildMode = computed(() => this.currentMember()?.IsChild ?? false);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentItemViewComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
    this.allOperators = UIDisplayStringUtil.getGeneralFilterOperatorDisplayStrings();
    this.allFields = [
      {
        displayas: 'Finance.TransactionType',
        value: 'TransactionType',
        valueType: GeneralFilterValueType.number, // 1
      },
      {
        displayas: 'Finance.IsExpense',
        value: 'IsExpense',
        valueType: GeneralFilterValueType.boolean, // 4
      },
      {
        displayas: 'Finance.Currency',
        value: 'Currency',
        valueType: GeneralFilterValueType.string, // 2
      },
      {
        displayas: 'Finance.Account',
        value: 'AccountID',
        valueType: GeneralFilterValueType.number, // 1
      },
      {
        displayas: 'Finance.ControlCenter',
        value: 'ControlCenterID',
        valueType: GeneralFilterValueType.number, // 1
      },
      {
        displayas: 'Finance.Activity',
        value: 'OrderID',
        valueType: GeneralFilterValueType.number, // 1
      },
      {
        displayas: 'Finance.TransactionDate',
        value: 'TransactionDate',
        valueType: GeneralFilterValueType.date, // 3
      },
    ];
    this.listOfColumns = [
      {
        name: 'Common.ID',
        sortOrder: null,
        sortFn: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
      },
      {
        name: 'Finance.Items',
        sortOrder: null,
        sortFn: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
      },
      {
        name: 'Common.Description',
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) => a.ItemDesp.localeCompare(b.ItemDesp),
      },
      {
        name: 'Common.Date',
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (a.TransactionDate || '').localeCompare(b.TransactionDate || ''),
      },
      {
        name: 'Finance.TransactionType',
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sortFn: (a: DocumentItemView, b: DocumentItemView) => a.TransactionType! - b.TransactionType!,
      },
      {
        name: 'Finance.Amount',
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) => a.Amount - b.Amount,
      },
      {
        name: 'Finance.Account',
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.getAccountName(a.AccountID!).localeCompare(this.getAccountName(b.AccountID!)),
      },
      {
        name: 'Finance.ControlCenter',
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.getControlCenterName(a.ControlCenterID!).localeCompare(this.getControlCenterName(b.ControlCenterID!)),
      },
      {
        name: 'Finance.Activity',
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: DocumentItemView, b: DocumentItemView) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.getOrderName(a.OrderID!).localeCompare(this.getOrderName(b.OrderID!)),
      },
    ];
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts.find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters.find((cc) => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders.find((ord) => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranType.find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }
  trackByName(_: number, item: UITableColumnItem<DocumentItemView>): string {
    return item.name;
  }

  ngOnInit(): void {
    this.onAddFilter();
  }

  ///
  /// Filter
  ///
  onFieldSelectionChanged(filter: GeneralFilterItem) {
    this.allFields.forEach((value) => {
      if (value.value === filter.fieldName) {
        filter.valueType = value.valueType;
      }
    });
  }
  public onAddFilter(): void {
    this.filters.update((arr) => [...arr, new GeneralFilterItem()]);
  }
  public onRemoveFilter(idx: number): void {
    this.filters.update((arr) => {
      const next = arr.filter((_, i) => i !== idx);
      return next.length === 0 ? [new GeneralFilterItem()] : next;
    });
  }
  onSearch(): void {
    // Do the translate first
    const arRealFilter: GeneralFilterItem[] = [];
    this.filters().forEach((value: GeneralFilterItem) => {
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
            val.lowValue = 'true';
          } else {
            val.lowValue = 'false';
          }
          val.highValue = '';
          break;
        }

        case GeneralFilterValueType.date: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          val.lowValue = format(parse(value.lowValue, dateFormat, new Date()), dateFormat);
          if (value.operator === GeneralFilterOperatorEnum.Between) {
            val.highValue = format(parse(value.highValue, dateFormat, new Date()), dateFormat);
          } else {
            val.highValue = '';
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
            val.highValue = '';
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
            val.highValue = '';
          }
          break;
        }

        default:
          break;
      }
      arRealFilter.push(val);
    });
    if (arRealFilter.length > 0) {
      this.realFilters.set(arRealFilter);
    } else {
      this.modalService.warning({
        nzTitle: translate('Common.Warning'),
        nzContent: translate('Common.FilterIsMust'),
        nzClosable: true,
      });
    }
  }
}
