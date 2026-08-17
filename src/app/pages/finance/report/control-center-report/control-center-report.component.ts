import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { translate, TranslocoModule } from '@jsverse/transloco';

import {
  FinanceReportByControlCenter,
  ModelUtility,
  ConsoleLogTypeEnum,
  ControlCenter,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  GeneralFilterItem,
} from '../../../../model';
import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { DocumentItemViewComponent } from '../../document/document-item-view';
import { SafeAny } from '@common/any';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'hih-finance-report-controlcenter',
  templateUrl: './control-center-report.component.html',
  styleUrls: ['./control-center-report.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    DecimalPipe,
    TranslocoModule,
  ],
})
export class ControlCenterReportComponent implements OnInit {
  isLoadingResults = signal(false);
  dataSet = signal<SafeAny[]>([]);
  arReportByControlCenter = signal<FinanceReportByControlCenter[]>([]);
  arControlCenter = signal<ControlCenter[]>([]);
  baseCurrency: string;

  public readonly odataService = inject(FinanceOdataService);

  private readonly homeService = inject(HomeDefOdataService);

  private readonly modalService = inject(NzModalService);

  private readonly drawerService = inject(NzDrawerService);

  private readonly router = inject(Router);

  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterReportComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterReportComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    // Load data
    this.onLoadData();
  }

  onDisplayMasterData(ccid: number) {
    this.router.navigate(['/finance/controlcenter/display/' + ccid.toString()]);
  }

  onDisplayDebitData(ccid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'ControlCenterID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ccid,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    fltrs.push({
      fieldName: 'Amount',
      operator: GeneralFilterOperatorEnum.LargerThan,
      lowValue: 0,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
      nzTitle: 'Document Items',
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(() => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
  onDisplayCreditData(ccid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'ControlCenterID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ccid,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    fltrs.push({
      fieldName: 'Amount',
      operator: GeneralFilterOperatorEnum.LessThan,
      lowValue: 0,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
      nzTitle: 'Document Items',
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(() => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }
  onDisplayBalanceData(ccid: number) {
    const fltrs = [];
    fltrs.push({
      fieldName: 'ControlCenterID',
      operator: GeneralFilterOperatorEnum.Equal,
      lowValue: ccid,
      highValue: 0,
      valueType: GeneralFilterValueType.number,
    });
    const drawerRef = this.drawerService.create<
      DocumentItemViewComponent,
      {
        filterDocItem: GeneralFilterItem[];
      },
      string
    >({
      nzTitle: 'Document Items',
      nzContent: DocumentItemViewComponent,
      nzContentParams: {
        filterDocItem: fltrs,
      },
      nzWidth: '100%',
      nzHeight: '50%',
      nzPlacement: 'bottom',
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(() => {
      // console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });
  }

  public onLoadData(forceReload?: true) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering ControlCenterReportComponent onLoadData(${forceReload})...`,
      ConsoleLogTypeEnum.debug,
    );
    this.isLoadingResults.set(true);
    forkJoin([this.odataService.fetchReportByControlCenter(forceReload), this.odataService.fetchAllControlCenters()])
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x) => {
          this.arReportByControlCenter.set(x[0]);
          this.arControlCenter.set(x[1]);

          this.buildReportList();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ControlCenterReportComponent ngOnInit forkJoin failed ${err}`,
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

  private buildReportList(): void {
    const ds: SafeAny[] = [];
    this.arReportByControlCenter().forEach((bal: FinanceReportByControlCenter) => {
      const ccobj = this.arControlCenter().find((cc: ControlCenter) => {
        return cc.Id === bal.ControlCenterId;
      });
      if (ccobj) {
        ds.push({
          ControlCenterId: bal.ControlCenterId,
          ControlCenterName: ccobj.Name,
          DebitBalance: bal.DebitBalance,
          CreditBalance: bal.CreditBalance,
          Balance: bal.Balance,
        });
      }
    });
    this.dataSet.set(ds);
  }
}
