import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';

import { FinanceOdataService, HomeDefOdataService, UIStatusService } from '../../../../services';
import {
  ITableFilterValues,
  Account,
  AccountStatusEnum,
  UIDisplayString,
  UIDisplayStringUtil,
  ModelUtility,
  ConsoleLogTypeEnum,
  AccountCategory,
} from '../../../../model';
import { UITableColumnItem } from '../../../../uimodel';
import { AccountChangeNameDialogComponent } from '../account-change-name-dialog';

@Component({
  selector: 'hih-fin-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.less'],
})
export class AccountListComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: Account[] = [];
  arCategories: AccountCategory[] = [];
  arrayStatus: UIDisplayString[] = [];
  listCategoryFilter: ITableFilterValues[] = [];
  listStatusFilter: ITableFilterValues[] = [];
  listOfColumns: UITableColumnItem<Account>[] = [];

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome!.IsChild!;
  }

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    public router: Router,
    private homeService: HomeDefOdataService,
    public modalService: NzModalService,
    private viewContainerRef: ViewContainerRef
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.arrayStatus.forEach((val) => {
      this.listStatusFilter.push({
        text: translate(val.i18nterm),
        value: val.value,
      });
    });

    // Columns: ID, Name, Category, Status, Comment
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
        name: 'Common.Name',
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: Account, b: Account): number => a.Name!.localeCompare(b.Name!),
      },
      {
        name: 'Common.Category',
        sortOrder: null,
        sortFn: null,
        sortDirections: [],
        listOfFilter: [],
        filterMultiple: true,
        filterFn: (selectedCategories: number[], item: Account) =>
          selectedCategories ? selectedCategories.some((ctgyid) => item.CategoryId === ctgyid) : false,
      },
      {
        name: 'Common.Status',
        sortOrder: null,
        sortFn: null,
        sortDirections: [],
        listOfFilter: this.listStatusFilter,
        filterMultiple: true,
        filterFn: (selectedStatus: AccountStatusEnum[], item: Account) =>
          selectedStatus ? selectedStatus.some((sts) => item.Status === sts) : false,
      },
      {
        name: 'Common.Comment',
        sortOrder: null,
        sortDirections: [],
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        sortFn: (a: Account, b: Account) => a.Comment!.localeCompare(b.Comment!),
      },
    ];
  }
  public getCategoryName(ctgyid: number): string {
    const ctgyobj = this.arCategories.find((val) => {
      return val.ID === ctgyid;
    });
    return ctgyobj && ctgyobj.Name ? ctgyobj.Name : '';
  }
  public getStatusString(sts: any): string {
    const stsobj = this.arrayStatus.find((val) => {
      return val.value === sts;
    });
    return stsobj ? stsobj.i18nterm : '';
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.arCategories = [];
    this.listCategoryFilter = [];
    this.odataService
      .fetchAllAccountCategories()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (val) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit fetchAllAccountCategories succeed',
            ConsoleLogTypeEnum.debug
          );
          this.arCategories = val;
          this.arCategories.forEach((val2: AccountCategory) => {
            this.listCategoryFilter.push({
              text: translate(val2.Name!),
              value: val2.ID,
            });
          });
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Error]: Entering AccountListComponent ngOnInit fetchAllAccountCategories failed',
            ConsoleLogTypeEnum.error
          );
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
        complete: () => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit fetchAllAccountCategories completed',
            ConsoleLogTypeEnum.debug
          );
          this.onRefresh();
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountListComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
      this._destroyed$ = null;
    }
  }

  onRefresh(isreload?: boolean): void {
    this.isLoadingResults = true;
    this.dataSet = [];
    this.odataService
      .fetchAllAccounts(isreload)
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (data: Account[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering AccountListComponent onRefresh fetchAllAccounts succeed',
            ConsoleLogTypeEnum.debug
          );
          this.dataSet = data.slice();
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering AccountListComponent onRefresh fetchAllAccounts failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }

  onDisplay(rid: number): void {
    this.router.navigate(['/finance/account/display/' + rid.toString()]);
  }

  onEdit(rid: number): void {
    this.router.navigate(['/finance/account/edit/' + rid.toString()]);
  }

  onDelete(rid: number): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Error]: Entering AccountListComponent onDelete, ${rid}`,
      ConsoleLogTypeEnum.debug
    );
    // After the pop confirm
    this.odataService
      .deleteAccount(rid)
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: (val) => {
          // Just remove the item
          const acnts = this.dataSet.slice();
          const extidx = acnts.findIndex((val2) => {
            return val2.Id === rid;
          });

          if (extidx !== -1) {
            acnts.splice(extidx, 1);
            this.dataSet = [];
            this.dataSet = acnts;
          }
        },
        error: (err) => {
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  onChangeAccountName(acntid: number): void {
    const acntidx = this.odataService.Accounts.findIndex((p) => p.Id === acntid);
    if (acntidx !== -1) {
      // Change the account name
      const modal = this.modalService.create({
        nzTitle: translate('Finance.ChangeAccountName'),
        nzContent: AccountChangeNameDialogComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzComponentParams: {
          accountid: acntid,
          name: this.odataService.Accounts[acntidx].Name,
          comment: this.odataService.Accounts[acntidx].Comment,
        },
        // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
      });
      const instance = modal.getContentComponent();
      modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));
      // Return a result when closed
      modal.afterClose.subscribe((result) => console.log('[afterClose] The result is:', result));
    }
  }
  onAccountReconcile(acntid: number): void {
    this.router.navigate(['/finance/account-reconcile/bymonth/' + acntid.toString()]);
  }
}
