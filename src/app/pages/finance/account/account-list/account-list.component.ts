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
  isReload: boolean;
  arCategories: AccountCategory[] = [];
  arrayStatus: UIDisplayString[] = [];
  listCategoryFilter: ITableFilterValues[] = [];
  listStatusFilter: ITableFilterValues[] = [];
  selectedCategoryFilter: number[] = [];
  selectedStatusFilter: AccountStatusEnum[] = [];
  columnItems: UITableColumnItem[] = [];

  constructor(
    public odataService: FinanceOdataService,
    public uiStatusService: UIStatusService,
    public router: Router,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
    this.isReload = false;
    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.arrayStatus.forEach(val => {
      this.listStatusFilter.push({
        text: translate(val.i18nterm),
        value: val.value,
      });
    });

    // Columns: ID, Name, Category, Status, Comment
    this.columnItems = [{
      name: 'Common.ID',
    }, {
      name: 'Common.Name',
      sortFn: (a: Account, b: Account) => a.Name.localeCompare(b.Name),
      showSort: true,
    }, {
      name: 'Common.Category',
      sortOrder: null,
      sortFn: (a: Account, b: Account) => a.CategoryName.localeCompare(b.CategoryName),
      listOfFilter: this.listCategoryFilter,
    }, {
      name: 'Common.Status',
      sortOrder: null,
      showSort: true,
      sortFn: (a: Account, b: Account) => a.Status === b.Status ? 0 : (a. Status > b.Status ? 1 : -1),
      listOfFilter: this.listStatusFilter
    }, {
      name: 'Common.Comment',
      showSort: true,
      sortFn: (a: Account, b: Account) => a.Comment.localeCompare(b.Comment),
    }];
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAccounts(this.isReload),
    ])
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe({
        next: (data: any) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit, forkJoin...',
            ConsoleLogTypeEnum.debug);

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
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountListComponent ngOnInit, forkJoin, failed ${error}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  doFilter(seledCategory: number[], seledStatus: any[]): void {
    this.selectedCategoryFilter = seledCategory;
    this.selectedStatusFilter = seledStatus;

    this.isLoadingResults = true;
    this.odataService.fetchAllAccounts()
    .pipe(takeUntil(this._destroyed$))
    .subscribe((data: Account[]) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AccountListComponent doFilter fetchAllAccounts...',
        ConsoleLogTypeEnum.debug);

      // Do the filters
      this.dataSet = [];
      data.forEach((val: Account) => {
        let binclude = true;
        if (this.selectedCategoryFilter.length > 0 && this.selectedCategoryFilter.indexOf(val.CategoryId) === -1) {
          binclude = false;
        }

        if (binclude) {
          if (this.selectedStatusFilter.length > 0 && this.selectedStatusFilter.indexOf(val.Status) === -1) {
            binclude = false;
          }
        }

        if (binclude) {
          this.dataSet.push(val);
        }
      });
      }, (error: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering AccountListComponent doFilter fetchAllAccounts failed ${error}`,
          ConsoleLogTypeEnum.error);

        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: error,
          nzClosable: true,
        });
      }, () => {
        this.isLoadingResults = false;
      });
  }

  onRefresh(): void {
  }

  onDisplay(rid: number): void {
    this.router.navigate(['/finance/account/display/' + rid.toString()]);
  }

  onEdit(rid: number): void {
    this.router.navigate(['/finance/account/edit/' + rid.toString()]);
  }
}
