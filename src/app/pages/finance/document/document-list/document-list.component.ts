import {
  Component,
  OnInit,
  ViewContainerRef,
  inject,
  signal,
  computed,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { format, startOfMonth, endOfMonth } from 'date-fns';

import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
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
  dateFormat,
} from '../../../../model';
import { DocumentChangeDateDialogComponent } from '../document-change-date-dialog';
import { DocumentChangeDespDialogComponent } from '../document-change-desp-dialog';
import { SafeAny } from '@common/any';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'hih-fin-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzInputModule,
    NzDividerModule,
    NzDropdownModule,
    NzTableModule,
    NzDatePickerModule,
    NzPopconfirmModule,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslocoModule,
    NzButtonModule,
    NzMenuModule,
    NzDropdownModule,
    NzModalModule,
    RouterModule,
  ],
})
export class DocumentListComponent implements OnInit {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _filterDocItem: GeneralFilterItem[] = [];
  private _isInitialized = false;
  isLoadingResults = signal(false);
  shortcutDocID?: number;

  mapOfExpandData: { [key: string]: boolean } = {};
  public arCurrencies = signal<Currency[]>([]);
  public arDocTypes = signal<DocumentType[]>([]);
  public arAccounts = signal<Account[]>([]);
  public arUIAccounts: UIAccountForSelection[] = [];
  public arAccountCategories = signal<AccountCategory[]>([]);
  public arControlCenters = signal<ControlCenter[]>([]);
  public arOrders = signal<Order[]>([]);
  public arUIOrders: UIOrderForSelection[] = [];
  public arTranTypes = signal<TranType[]>([]);
  public selectedRange: SafeAny[] = [];
  // Table
  pageIndex = signal(1);
  pageSize = signal(20);
  listOfDocs = signal<Document[]>([]);
  totalDocumentCount = signal(1);
  listCurrencyFilters: ITableFilterValues[] = [];
  listDocTypeFilters: ITableFilterValues[] = [];

  private readonly odataService = inject(FinanceOdataService);
  private readonly router = inject(Router);
  private readonly modalService = inject(NzModalService);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly currentMember = computed(() => this.homeService.curHomeMember());
  readonly isChildMode = computed(() => this.currentMember()?.IsChild ?? false);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this._isInitialized = true;

    this.selectedRange = [startOfMonth(new Date()), endOfMonth(new Date())];

    this.isLoadingResults.set(true);
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
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => {
          this.isLoadingResults.set(false);
        }),
      )
      .subscribe({
        next: (val: SafeAny) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit, forkJoin...',
            ConsoleLogTypeEnum.debug,
          );

          this.arDocTypes.set(val[0]);
          this.arCurrencies.set(val[1]);
          this.arAccountCategories.set(val[2]);
          this.arTranTypes.set(val[3]);
          this.arAccounts.set(val[4]);
          this.arControlCenters.set(val[5]);
          this.arOrders.set(val[6]);
          this.arUIAccounts = BuildupAccountForSelection(this.arAccounts(), this.arAccountCategories());
          this.arUIOrders = BuildupOrderForSelection(this.arOrders());

          let arfilters: SafeAny[] = [];
          this.arCurrencies().forEach((cur) => {
            arfilters.push({
              value: cur.Currency,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              text: translate(cur.Name!),
            });
          });
          this.listCurrencyFilters = arfilters.slice();

          arfilters = [];
          this.arDocTypes().forEach((dt) => {
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
            ConsoleLogTypeEnum.error,
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

  public getCurrencyName(curr: string): string {
    const curobj = this.arCurrencies().find((c) => {
      return c.Currency === curr;
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return curobj ? translate(curobj.Name!) + `(${curr})` : curr;
  }
  public getDocTypeName(dtid: number) {
    const dtobj = this.arDocTypes().find((dt) => {
      return dt.Id === dtid;
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return dtobj ? translate(dtobj.Name!) : dtid.toString();
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts().find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters().find((cc) => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arOrders().find((ord) => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranTypes().find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent onQueryParamsChange...',
      ConsoleLogTypeEnum.debug,
    );

    const { pageSize, pageIndex, sort } = params;
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
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
          : undefined,
      );
    }
  }

  fetchData(orderby?: { field: string; order: string }): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentListComponent fetchData...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    const bgn = this.selectedRange.length > 0 ? startOfMonth(this.selectedRange[0] as Date) : startOfMonth(new Date());
    const end = this.selectedRange.length > 1 ? endOfMonth(this.selectedRange[1] as Date) : endOfMonth(new Date());

    this._filterDocItem = [];
    this._filterDocItem.push({
      fieldName: 'TranDate',
      operator: GeneralFilterOperatorEnum.Between,
      lowValue: format(bgn, dateFormat),
      highValue: format(end, dateFormat),
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
        this.pageSize(),
        this.pageIndex() >= 1 ? (this.pageIndex() - 1) * this.pageSize() : 0,
        orderby,
      )
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (revdata: BaseListModel<Document>) => {
          if (revdata) {
            if (revdata.totalCount) {
              this.totalDocumentCount.set(+revdata.totalCount);
            } else {
              this.totalDocumentCount.set(0);
            }

            this.listOfDocs.set(revdata.contentList);
          } else {
            this.totalDocumentCount.set(0);
            this.listOfDocs.set([]);
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentListComponent fetchData, fetchAllDocuments failed ${err}...`,
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
    this.odataService
      .deleteDocument(docid)
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
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
  public onChangeDate(docid: number, docdate: Date): void {
    // Change the account name
    const modal = this.modalService.create({
      nzTitle: translate('Finance.ChangeDate'),
      nzContent: DocumentChangeDateDialogComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        documentid: docid,
        documentdate: docdate,
      },
      // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
    });
    modal.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
      this.fetchData();
    });
  }
  public onChangeDesp(docid: number, docdesp: string): void {
    // Change the account name
    const modal = this.modalService.create({
      nzTitle: translate('Finance.ChangeDate'),
      nzContent: DocumentChangeDespDialogComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        documentid: docid,
        documentdesp: docdesp,
      },
      // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
    });
    modal.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
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
