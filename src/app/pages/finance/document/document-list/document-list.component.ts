import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { FinanceOdataService, HomeDefOdataService, UIStatusService } from '../../../../services';
import {
  Account,
  Document,
  ControlCenter,
  AccountCategory,
  TranType,
  DocumentType,
  Currency,
  Order,
  BuildupAccountForSelection,
  UIAccountForSelection,
  BuildupOrderForSelection,
  UIOrderForSelection,
  BaseListModel,
  ModelUtility,
  ConsoleLogTypeEnum,
  ITableFilterValues,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  momentDateFormat,
} from '../../../../model';
import { DocumentChangeDateDialogComponent } from '../document-change-date-dialog';
import { DocumentChangeDespDialogComponent } from '../document-change-desp-dialog';
import { SafeAny } from 'src/common';

@Component({
  selector: 'hih-fin-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.less'],
})
export class DocumentListComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  private _filterDocItem: GeneralFilterItem[] = [];
  private _isInitialized = false;
  isLoadingResults = false;
  shortcutDocID?: number;

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
  public selectedRange: SafeAny[] = [];
  // Table
  pageIndex = 1;
  pageSize = 20;
  listOfDocs: Document[] = [];
  totalDocumentCount = 1;
  listCurrencyFilters: ITableFilterValues[] = [];
  listDocTypeFilters: ITableFilterValues[] = [];

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome?.IsChild ?? false;
  }

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    private router: Router,
    private modalService: NzModalService,
    private homeService: HomeDefOdataService,
    private msgService: NzMessageService,
    private viewContainerRef: ViewContainerRef
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

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
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => {
          this.isLoadingResults = false;
        })
      )
      .subscribe({
        next: (val: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit, forkJoin...',
            ConsoleLogTypeEnum.debug
          );

          this.arDocTypes = val[0];
          this.arCurrencies = val[1];
          this.arAccountCategories = val[2];
          this.arTranTypes = val[3];
          this.arAccounts = val[4];
          this.arControlCenters = val[5];
          this.arOrders = val[6];
          this.arUIAccounts = BuildupAccountForSelection(this.arAccounts, this.arAccountCategories);
          this.arUIOrders = BuildupOrderForSelection(this.arOrders);

          let arfilters: SafeAny[] = [];
          this.arCurrencies.forEach((cur) => {
            arfilters.push({
              value: cur.Currency,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              text: translate(cur.Name!),
            });
          });
          this.listCurrencyFilters = arfilters.slice();

          arfilters = [];
          this.arDocTypes.forEach((dt) => {
            arfilters.push({
              value: dt.Id,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              text: translate(dt.Name!),
            });
          });
          this.listDocTypeFilters = arfilters.slice();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentListComponent ngOnInit, forkJoin failed ${err}`,
            ConsoleLogTypeEnum.error
          );

          // Error
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public getCurrencyName(curr: string): string {
    const curobj = this.arCurrencies.find((c) => {
      return c.Currency === curr;
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return curobj ? translate(curobj.Name!) + `(${curr})` : curr;
  }
  public getDocTypeName(dtid: number) {
    const dtobj = this.arDocTypes.find((dt) => {
      return dt.Id === dtid;
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return dtobj ? translate(dtobj.Name!) : dtid.toString();
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
    const tranTypeObj = this.arTranTypes.find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent onQueryParamsChange...',
      ConsoleLogTypeEnum.debug
    );

    const { pageSize, pageIndex, sort } = params;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    let fieldName = '';
    switch (sortField) {
      case 'curr':
        fieldName = 'Currency';
        break;
      case 'date':
        fieldName = 'TranDate';
        break;
      case 'doctype':
        fieldName = 'DocType';
        break;
      case 'desp':
        fieldName = 'Desp';
        break;
      default:
        break;
    }
    let fieldOrder = '';
    switch (sortOrder) {
      case 'ascend':
        fieldOrder = 'asc';
        break;
      case 'descend':
        fieldOrder = 'desc';
        break;
      default:
        break;
    }

    if (this._isInitialized) {
      this.fetchData(
        fieldName && fieldOrder
          ? {
              field: fieldName,
              order: fieldOrder,
            }
          : undefined
      );
    }
  }

  fetchData(orderby?: { field: string; order: string }): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent fetchData...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = true;
    const bgn = this.selectedRange.length > 0 ? moment(this.selectedRange[0] as Date) : moment();
    const end = this.selectedRange.length > 1 ? moment(this.selectedRange[1] as Date) : moment();

    this._filterDocItem = [];
    this._filterDocItem.push({
      fieldName: 'TranDate',
      operator: GeneralFilterOperatorEnum.Between,
      lowValue: bgn.format(momentDateFormat),
      highValue: end.format(momentDateFormat),
      valueType: GeneralFilterValueType.number,
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.homeService.CurrentMemberInChosedHome!.IsChild) {
      this._filterDocItem.push({
        fieldName: 'Createdby',
        operator: GeneralFilterOperatorEnum.Equal,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        lowValue: `${this.homeService.CurrentMemberInChosedHome!.User}`,
        highValue: ``,
        valueType: GeneralFilterValueType.string,
      });
    }

    this.odataService
      .fetchAllDocuments(
        this._filterDocItem,
        this.pageSize,
        this.pageIndex >= 1 ? (this.pageIndex - 1) * this.pageSize : 0,
        orderby
      )
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
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
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentListComponent fetchData, fetchAllDocuments failed ${err}...`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onRangeChange(event: SafeAny): void {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.onDisplay(doc.Id!);
  }
  public onMassCreateNormalDocument(): void {
    this.router.navigate(['/finance/document/masscreatenormal']);
  }
  public onMassCreateRecurredDocument(): void {
    this.router.navigate(['/finance/document/masscreaterecurred']);
  }
  public onDisplay(docid: number): void {
    this.router.navigate(['/finance/document/display/', docid]);
  }
  public onEdit(docid: number): void {
    this.router.navigate(['/finance/document/edit/', docid]);
  }
  public onDelete(docid: number): void {
    this.odataService.deleteDocument(docid).subscribe({
      next: () => {
        // Show dialog.
        const ref: NzModalRef = this.modalService.success({
          nzTitle: translate('Common.Success'),
          nzContent: translate('Finance.DeleteDocumentSuccessfully'),
        });
        setTimeout(() => {
          ref.close();
          ref.destroy();
        }, 1000);

        // Need refresh
        this.fetchData();
      },
      error: (err) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering DocumentListComponent onDelete, failed ${err}...`,
          ConsoleLogTypeEnum.error
        );

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: err.toString(),
          nzClosable: true,
        });
      },
    });
  }
  public onChangeDate(docid: number, docdate: moment.Moment): void {
    // Change the account name
    const modal = this.modalService.create({
      nzTitle: translate('Finance.ChangeDate'),
      nzContent: DocumentChangeDateDialogComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        documentid: docid,
        documentdate: docdate.toDate(),
      },
      // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
    });
    modal.afterClose.subscribe(() => {
      this.fetchData();
    });
  }
  public onChangeDesp(docid: number, docdesp: string): void {
    // Change the account name
    const modal = this.modalService.create({
      nzTitle: translate('Finance.ChangeDate'),
      nzContent: DocumentChangeDespDialogComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        documentid: docid,
        documentdesp: docdesp,
      },
      // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
    });
    modal.afterClose.subscribe(() => {
      this.fetchData();
    });
  }
  public onOpenShortCutDocID(): void {
    if (this.shortcutDocID) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.onDisplay(this.shortcutDocID!);
    }
  }
}
