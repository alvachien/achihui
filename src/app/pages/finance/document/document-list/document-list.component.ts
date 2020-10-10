import { Component, OnInit, OnDestroy, DefaultIterableDiffer } from '@angular/core';
import { ReplaySubject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { Account, Document, ControlCenter, AccountCategory, TranType,
  OverviewScopeEnum, DocumentType, Currency, Order,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  getOverviewScopeRange, UICommonLabelEnum, BaseListModel, ModelUtility, ConsoleLogTypeEnum,
  ITableFilterValues, GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType, momentDateFormat,
} from '../../../../model';
import { UITableColumnItem } from '../../../../uimodel';

@Component({
  selector: 'hih-fin-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.less'],
})
export class DocumentListComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private _filterDocItem: GeneralFilterItem[] = [];
  private _isInitialized = false;
  isLoadingResults: boolean;

  mapOfExpandData: { [key: string]: boolean } = {};
  public arCurrencies: Currency[] = [];
  public arDocTypes: DocumentType[] = [];
  public arAccounts: Account[] = [];
  public arUIAccounts: UIAccountForSelection[] = [];
  public arAccountCategories: AccountCategory[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arOrders: Order[] = [];
  public arUIOrders: UIOrderForSelection[] = [];
  public arTranTypes: TranType[] = [];
  public selectedRange: any[] = [];
  // Table
  listOfColumns: UITableColumnItem[] = [];
  pageIndex = 1;
  pageSize = 10;
  listOfDocs: Document[] = [];
  totalDocumentCount = 1;
  listCurrencyFilters: ITableFilterValues[] = [];
  listDocTypeFilters: ITableFilterValues[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    private router: Router,
    private modalService: NzModalService,
    private msgService: NzMessageService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
    this.listOfColumns = [{
      name: 'Common.ID',
      columnKey: 'docid'
    }, {
      name: 'Finance.Currency',
      columnKey: 'curr',
      sortOrder: null,
      sortFn: true,
      showSort: true,
      listOfFilter: this.listCurrencyFilters,
      filterMultiple: true,
      filterFn: true
    }, {
      name: 'Common.Date',
      columnKey: 'date',
      sortOrder: 'descend',
      showSort: true,
      sortFn: true
    }, {
      name: 'Finance.DocumentType',
      columnKey: 'doctype',
      sortOrder: null,
      showSort: true,
      sortFn: true,
      listOfFilter: this.listDocTypeFilters,
      filterMultiple: true,
      filterFn: true
    }, {
      name: 'Common.Description',
      columnKey: 'desp',
      sortFn: true,
      showSort: true,
    }];
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this._isInitialized = true;

    this.selectedRange = [moment().startOf('month').toDate(), moment().endOf('month').toDate()];

    this.isLoadingResults = true;
    const arseqs = [
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllCurrencies(),
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
    ];
    forkJoin(arseqs)
      .pipe(takeUntil(this._destroyed$),
        finalize(() => {
          this.isLoadingResults = false;
        }))
      .subscribe({
        next: (val: any) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit, forkJoin...',
            ConsoleLogTypeEnum.debug);

          this.arDocTypes = val[0];
          this.arCurrencies = val[1];
          this.arAccountCategories = val[2];
          this.arTranTypes = val[3];
          this.arAccounts = val[4];
          this.arControlCenters = val[5];
          this.arOrders = val[6];
          this.arUIAccounts = BuildupAccountForSelection(this.arAccounts, this.arAccountCategories);
          this.arUIOrders = BuildupOrderForSelection(this.arOrders);

          let arfilters = [];
          this.arCurrencies.forEach(cur => {
            arfilters.push({
              value: cur.Currency,
              text: translate(cur.Name),
            });
          });
          this.listCurrencyFilters = arfilters.slice();

          arfilters = [];
          this.arDocTypes.forEach(dt => {
            arfilters.push({
              value: dt.Id,
              text: translate(dt.Name),
            });
          });
          this.listDocTypeFilters = arfilters.slice();
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentListComponent ngOnInit, forkJoin failed ${error}`,
            ConsoleLogTypeEnum.error);

          // Error
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    this._isInitialized = false;
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public getCurrencyName(curr: string): string {
    const curobj = this.arCurrencies.find(c => {
      return c.Currency === curr;
    });
    return curobj ? translate(curobj.Name) + `(${curr})`  : curr;
  }
  public getDocTypeName(dtid: number) {
    const dtobj = this.arDocTypes.find(dt => {
      return dt.Id === dtid;
    });
    return dtobj ? dtobj.Name : dtid.toString();
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts.find(acnt => {
      return acnt.Id === acntid;
    });
    return acntObj ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters.find(cc => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders.find(ord => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranTypes.find(tt => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }
  trackByName(_: number, item: UITableColumnItem): string {
    return item.name;
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent onQueryParamsChange...',
      ConsoleLogTypeEnum.debug);

    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find(item => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    let fieldName = '';
    switch (sortField) {
      case 'curr': fieldName = 'Desp'; break;
      case 'date': fieldName = 'TranDate'; break;
      case 'doctype': fieldName = 'DocType'; break;
      case 'desp': fieldName = 'Desp'; break;
      default: break;
    }
    let fieldOrder = '';
    switch (sortOrder) {
      case 'ascend': fieldOrder = 'asc'; break;
      case 'descend': fieldOrder = 'desc'; break;
      default: break;
    }

    if (this._isInitialized) {
      this.fetchData((fieldName && fieldOrder) ? {
        field: fieldName,
        order: fieldOrder,
      } : undefined);
    }
  }

  fetchData(orderby?: { field: string, order: string }): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent fetchData...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = true;
    const bgn = this.selectedRange.length > 0 ?  moment(this.selectedRange[0] as Date) : moment();
    const end = this.selectedRange.length > 1 ?  moment(this.selectedRange[1] as Date) : moment();

    this._filterDocItem = [];
    this._filterDocItem.push({
      fieldName: 'TranDate',
      operator: GeneralFilterOperatorEnum.Between,
      lowValue: bgn.format(momentDateFormat),
      highValue: end.format(momentDateFormat),
      valueType: GeneralFilterValueType.number
    });
    this.odataService.fetchAllDocuments(
      this._filterDocItem,
      this.pageSize,
      this.pageIndex >= 1 ? (this.pageIndex - 1) * this.pageSize : 0,
      orderby)
      .pipe(takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: (revdata: BaseListModel<Document>) => {
          if (revdata) {
            if (revdata.totalCount) {
              this.totalDocumentCount = +revdata.totalCount;
            } else {
              this.totalDocumentCount = 0;
            }

            this.listOfDocs = revdata.contentList;
          } else {
            this.totalDocumentCount = 0;
            this.listOfDocs = [];
          }
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentListComponent fetchData, fetchAllDocuments failed ${error}...`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  public onRangeChange(event): void {
    this.fetchData();
  }
  public onCreateNormalDocument(): void {
    this.router.navigate(['/finance/document/createnormal']);
  }
  public onCreateTransferDocument(): void {
    this.router.navigate(['/finance/document/createtransfer']);
  }
  public onCreateADPDocument(): void {
    this.router.navigate(['/finance/document/createadp']);
  }
  public onCreateADRDocument(): void {
    this.router.navigate(['/finance/document/createadr']);
  }
  public onCreateExgDocument(): void {
    this.router.navigate(['/finance/document/createexg']);
  }
  public onCreateAssetBuyInDocument(): void {
    this.router.navigate(['/finance/document/createassetbuy']);
  }
  public onCreateAssetSoldOutDocument(): void {
    this.router.navigate(['/finance/document/createassetsold']);
  }
  public onCreateBorrowFromDocument(): void {
    this.router.navigate(['/finance/document/createbrwfrm']);
  }
  public onCreateLendToDocument(): void {
    this.router.navigate(['/finance/document/createlendto']);
  }
  public onCreateAssetValChgDocument(): void {
    this.router.navigate(['/finance/document/createassetvalchg']);
  }
  public onCreateRepayDocument(): void {
    this.router.navigate(['/finance/document/createloanrepay']);
  }
  public onDisplayDocument(doc: Document): void {
    this.router.navigate(['/finance/document/display', doc.Id]);
  }
  public onMassCreateNormalDocument(): void {
    this.router.navigate(['/finance/document/masscreatenormal']);
  }
  public onMassCreateRecurredDocument(): void {
    this.router.navigate(['/finance/document/masscreaterecurred']);
  }
  public onEdit(docid: number): void {
    this.router.navigate(['/finance/document/edit/', docid]);
  }
  public onDelete(docid: number): void {
    this.msgService.error('This functionality is still under construction', { nzDuration: 2500 });
  }
}
