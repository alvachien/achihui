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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';

import { FinanceOdataService, HomeDefOdataService, UIStatusService } from '@services/index';
import {
  ITableFilterValues,
  Account,
  AccountStatusEnum,
  UIDisplayString,
  UIDisplayStringUtil,
  ModelUtility,
  ConsoleLogTypeEnum,
  AccountCategory,
} from '@model/index';
import { UITableColumnItem } from '@uimodel/index';
import { AccountChangeNameDialogComponent } from '../account-change-name-dialog';
import { SafeAny } from '@common/any';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'hih-fin-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzDividerModule,
    NzTableModule,
    NzButtonModule,
    NzPopconfirmModule,
    NzDropdownModule,
    NgClass,
    NgIf,
    TranslocoModule,
    NzModalModule,
    RouterModule,
  ],
})
export class AccountListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<Account[]>([]);
  arCategories = signal<AccountCategory[]>([]);
  arrayStatus: UIDisplayString[] = [];
  listCategoryFilter = signal<ITableFilterValues[]>([]);
  listStatusFilter: ITableFilterValues[] = [];
  listOfColumns: UITableColumnItem<Account>[] = [];

  private readonly odataService = inject(FinanceOdataService);
  private readonly uiStatusService = inject(UIStatusService);
  private readonly router = inject(Router);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyedRef = inject(DestroyRef);

  // Read the service's curHomeMember signal directly (Tier F route (b)):
  // isChildMode updates reactively without manual subscriptions.
  private readonly currentMember = computed(() => this.homeService.curHomeMember());
  readonly isChildMode = computed(() => this.currentMember()?.IsChild ?? false);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sortFn: (a: Account, b: Account) => a.Comment!.localeCompare(b.Comment!),
      },
    ];
  }
  public getCategoryName(ctgyid: number): string {
    const ctgyobj = this.arCategories().find((val) => {
      return val.ID === ctgyid;
    });
    return ctgyobj && ctgyobj.Name ? ctgyobj.Name : '';
  }
  public getStatusString(sts: SafeAny): string {
    const stsobj = this.arrayStatus.find((val) => {
      return val.value === sts;
    });
    return stsobj ? stsobj.i18nterm : '';
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    this.arCategories.set([]);
    this.listCategoryFilter.set([]);
    this.odataService
      .fetchAllAccountCategories()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (val) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering AccountListComponent ngOnInit fetchAllAccountCategories succeed',
            ConsoleLogTypeEnum.debug,
          );
          this.arCategories.set(val);
          const filters: ITableFilterValues[] = [];
          val.forEach((val2: AccountCategory) => {
            filters.push({
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              text: translate(val2.Name!),
              value: val2.ID,
            });
          });
          this.listCategoryFilter.set(filters);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Error]: Entering AccountListComponent ngOnInit fetchAllAccountCategories failed',
            ConsoleLogTypeEnum.error,
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
            ConsoleLogTypeEnum.debug,
          );
          this.onRefresh();
        },
      });
  }

  onRefresh(isreload?: boolean): void {
    this.isLoadingResults.set(true);
    this.dataSet.set([]);
    this.odataService
      .fetchAllAccounts(isreload)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (data: Account[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering AccountListComponent onRefresh fetchAllAccounts succeed',
            ConsoleLogTypeEnum.debug,
          );
          this.dataSet.set(data.slice());
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering AccountListComponent onRefresh fetchAllAccounts failed ${err}`,
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

  onDisplay(rid: number): void {
    this.router.navigate(['/finance/account/display/' + rid.toString()]);
  }

  onEdit(rid: number): void {
    this.router.navigate(['/finance/account/edit/' + rid.toString()]);
  }

  onDelete(rid: number): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Error]: Entering AccountListComponent onDelete, ${rid}`,
      ConsoleLogTypeEnum.debug,
    );
    // After the pop confirm
    this.odataService
      .deleteAccount(rid)
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: () => {
          // Just remove the item
          this.dataSet.update((items) => items.filter((val2) => val2.Id !== rid));
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
        nzData: {
          accountid: acntid,
          name: this.odataService.Accounts[acntidx].Name,
          comment: this.odataService.Accounts[acntidx].Comment,
        },
        // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
      });
      //const instance = modal.getContentComponent();
      modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));
      // Return a result when closed
      modal.afterClose.subscribe((result) => console.log('[afterClose] The result is:', result));
    }
  }
  onAccountReconcile(acntid: number): void {
    this.router.navigate(['/finance/account-reconcile/bymonth/' + acntid.toString()]);
  }
}
