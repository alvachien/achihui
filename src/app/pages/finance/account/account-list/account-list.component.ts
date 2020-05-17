import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { ITableFilterValues, Account, AccountStatusEnum, UIDisplayString, UIDisplayStringUtil,
  ModelUtility, ConsoleLogTypeEnum, AccountCategory,
} from '../../../../model';
import { UITableColumnItem } from '../../../../uimodel';

@Component({
  selector: 'hih-fin-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.less'],
})
export class AccountListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  dataSet: Account[] = [];
  arCategories: AccountCategory[] = [];
  arrayStatus: UIDisplayString[] = [];
  listCategoryFilter: ITableFilterValues[] = [];
  listStatusFilter: ITableFilterValues[] = [];
  listOfColumns: UITableColumnItem[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    public router: Router,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.arrayStatus.forEach(val => {
      this.listStatusFilter.push({
        text: translate(val.i18nterm),
        value: val.value,
      });
    });

    // Columns: ID, Name, Category, Status, Comment
    this.listOfColumns = [{
      name: 'Common.ID',
    }, {
      name: 'Common.Name',
      sortFn: (a: Account, b: Account) => a.Name.localeCompare(b.Name),
      showSort: true,
    }, {
      name: 'Common.Category',
      sortOrder: null,
      showSort: false,
      sortFn: null,
      listOfFilter: this.listCategoryFilter,
      filterMultiple: true,
      filterFn: (selectedCategories: number[], item: Account) =>
        selectedCategories ? selectedCategories.some(ctgyid => item.CategoryId === ctgyid) : false
    }, {
      name: 'Common.Status',
      sortOrder: null,
      showSort: false,
      // sortFn: (a: Account, b: Account) => a.Status === b.Status ? 0 : (a. Status > b.Status ? 1 : -1),
      listOfFilter: this.listStatusFilter,
      filterMultiple: true,
      filterFn: (selectedStatus: AccountStatusEnum[], item: Account) =>
        selectedStatus ? selectedStatus.some(sts => item.Status === sts) : false
    }, {
      name: 'Common.Comment',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Account, b: Account) => a.Comment.localeCompare(b.Comment),
    }];
  }
  public getCategoryName(ctgyid: number): string {
    const ctgyobj = this.arCategories.find(val => {
      return val.ID === ctgyid;
    });
    return ctgyobj ? ctgyobj.Name : '';
  }
  public getStatusString(sts): string {
    const stsobj = this.arrayStatus.find(val => {
      return val.value === sts;
    });
    return stsobj ? stsobj.i18nterm : '';
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.onRefresh();
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onRefresh(isreload?: boolean): void {
    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAccounts(isreload),
    ])
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (data: any) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent onRefresh, forkJoin...',
            ConsoleLogTypeEnum.debug);

          this.arCategories = [];
          this.dataSet = [];
          this.listCategoryFilter = [];

          if (data instanceof Array && data.length > 0) {
            // Parse the data
            this.arCategories = data[0];
            this.dataSet = data[1];

            this.arCategories.forEach((val: AccountCategory) => {
              this.listCategoryFilter.push({
                text: translate(val.Name),
                value: val.ID
              });
            });
          }
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountListComponent onRefresh, forkJoin, failed ${error}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
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
    // TBD.
  }
}
