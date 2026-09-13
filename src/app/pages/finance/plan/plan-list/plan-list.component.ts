import { Component, OnInit, inject, signal, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

import { Plan, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil, Account } from '../../../../model';
import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'hih-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzDividerModule,
    NzResultModule,
    NzInputModule,
    NzTableModule,
    NzInputNumberModule,
    NzModalModule,
    NzFormModule,
    FormsModule,
    NzSpinModule,
    NzInputNumberModule,
    NzDropdownModule,
    NzMenuModule,
    NzIconModule,
    RouterModule,
    TranslocoModule,
  ],
})
export class PlanListComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<Plan[]>([]);
  // Progress dialog fields
  isProgressDlgVisible = false;
  progressModalTitle = '';
  currentPlanActualBalance = signal(0);
  currentPlan = signal<Plan | undefined>(undefined);
  arAccounts = signal<Account[]>([]);
  getDateDisplayString = ModelUtility.getDateDisplayString;
  getPlanTypeDisplayString = UIDisplayStringUtil.getFinancePlanTypeEnumDisplayString;

  readonly currentDifferenceWithTarget = computed(() =>
    this.currentPlan() ? this.currentPlanActualBalance() - this.currentPlan()!.TargetBalance : 0,
  );

  public readonly odataService = inject(FinanceOdataService);

  public readonly router = inject(Router);

  private readonly homeService = inject(HomeDefOdataService);

  // Read the service's curHomeMember signal directly (Tier F route (b)):
  // isChildMode updates reactively without manual subscriptions.
  private readonly currentMember = computed(() => this.homeService.curHomeMember());
  readonly isChildMode = computed(() => this.currentMember()?.IsChild ?? false);

  public readonly modalService = inject(NzModalService);

  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PlanListComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(false);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PlanListComponent OnInit...', ConsoleLogTypeEnum.debug);

    this.onRefresh(false);
  }

  onCreate(): void {
    this.router.navigate(['/finance/plan/create']);
  }

  onEdit(rid: number): void {
    this.router.navigate(['/finance/plan/edit/' + rid.toString()]);
  }

  onDelete(rid: number): void {
    if (rid) {
      // TBD.
    }
  }

  onCheckProgress(planData: Plan): void {
    if (planData && planData.AccountID) {
      this.currentPlan.set(planData);
      this.isProgressDlgVisible = true;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-unsafe-optional-chaining, @typescript-eslint/no-non-null-asserted-optional-chain
      this.odataService.fetchAccountBalance(this.currentPlan()?.AccountID!).subscribe({
        next: (val) => {
          this.currentPlanActualBalance.set(+val);
        },
      });
    }
  }

  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts().find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }

  handleProgressModalCancel() {
    this.isProgressDlgVisible = false;
  }

  onRefresh(refresh?: boolean) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PlanListComponent onRefresh`, ConsoleLogTypeEnum.debug);

    this.isLoadingResults.set(true);
    forkJoin([this.odataService.fetchAllAccounts(), this.odataService.fetchAllPlans(refresh)])
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x) => {
          this.arAccounts.set(x[0]);
          this.dataSet.set(x[1]);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering PlanListComponent onRefresh failed ${err}`,
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
}
