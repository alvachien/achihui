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

  onDisplay(rid: number): void {
    this.router.navigate(['/finance/account/display/' + rid.toString()]);
  }

  onEdit(rid: number): void {
    this.router.navigate(['/finance/account/edit/' + rid.toString()]);
  }
}
