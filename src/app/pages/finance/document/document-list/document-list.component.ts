import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { Account, Document, ControlCenter, AccountCategory, TranType,
  OverviewScopeEnum, DocumentType, Currency, Order,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  getOverviewScopeRange, UICommonLabelEnum, BaseListModel, ModelUtility, ConsoleLogTypeEnum,
} from '../../../../model';

@Component({
  selector: 'hih-fin-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.less'],
})
export class DocumentListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  listOfDocs: Document[] = [];
  selectedDocScope: OverviewScopeEnum;
  isReload = false;
  pageIndex = 0;
  pageSize = 10;
  totalDocumentCount = 1;
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

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    private router: Router,
    public modalService: NzModalService) {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent constructor...', ConsoleLogTypeEnum.debug);
      this.isLoadingResults = false;
    }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit...', ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this.selectedDocScope = OverviewScopeEnum.All;

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
      .pipe(takeUntil(this._destroyed$))
      .subscribe((val: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnInit, forkJoin...', ConsoleLogTypeEnum.debug);

        this.arDocTypes = val[0];
        this.arCurrencies = val[1];
        this.arAccountCategories = val[2];
        this.arTranTypes = val[3];
        this.arAccounts = val[4];
        this.arControlCenters = val[5];
        this.arOrders = val[6];
        this.arUIAccounts = BuildupAccountForSelection(this.arAccounts, this.arAccountCategories);
        this.arUIOrders = BuildupOrderForSelection(this.arOrders);

        this.fetchData();
      }, (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentListComponent ngOnInit, forkJoin failed ${error}`,
          ConsoleLogTypeEnum.error);

        // Error
        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: error
        });
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent ngOnDestroy...', ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  fetchData(reset: boolean = false): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentListComponent fetchData...', ConsoleLogTypeEnum.debug);
    if (reset) {
      this.pageIndex = 0;
    }
    this.isLoadingResults = true;
    const { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this.selectedDocScope);
    this.odataService.fetchAllDocuments(bgn, end, this.pageSize, this.pageIndex * this.pageSize)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((revdata: BaseListModel<Document>) => {
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
      }, (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentListComponent fetchData, fetchAllDocuments failed ${error}...`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: error
        });
      }, () => {
        this.isLoadingResults = false;
      });
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
    this.router.navigate(['/finance/document/createrepayex']);
  }
  public onDisplayDocument(doc: Document): void {
    this.router.navigate(['/finance/document/display', doc.Id]);
  }
  public onMassCreateNormalDocument(): void {
    this.router.navigate(['/finance/document/masscreatenormal']);
  }
  public onMassCreateNormalDocument2(): void {
    this.router.navigate(['/finance/document/masscreatenormal2']);
  }
}
