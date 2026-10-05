import { DecimalPipe, NgIf } from '@angular/common';
import { SafeAny } from '@common/any';
import { Component, inject, OnInit, signal, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { translate, TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTransferModule, TransferDirection, TransferItem } from 'ng-zorro-antd/transfer';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { forkJoin, of } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { format } from 'date-fns';
import { dateFormat } from '@model/index';
import * as echarts from 'echarts';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
import { NumberUtility } from 'actslib';

import {
  Account,
  ConsoleLogTypeEnum,
  DocumentItemView,
  GeneralFilterItem,
  GeneralFilterOperatorEnum,
  GeneralFilterValueType,
  ModelUtility,
  TranType,
  financeTranTypeAdvancePaymentOut,
  financeTranTypeAdvanceReceiveIn,
  financeTranTypeAssetValueDecrease,
  financeTranTypeAssetValueIncrease,
  financeTranTypeOpeningAsset,
  financeTranTypeOpeningLiability,
  financeTranTypeTransferIn,
  financeTranTypeTransferOut,
} from '@model/index';
import {
  DocInsightOption,
  FinanceOdataService,
  HomeDefOdataService,
  UIStatusService,
  UserPreferencesService,
} from '@services/index';
import { RouterModule } from '@angular/router';

// nz-transfer mutates the items it is given (it owns `direction`/`checked`),
// so they stay plain objects; only the ARRAY reference changes when the
// language switches, which re-triggers the transfer's ngOnChanges re-split.
interface GroupTransferItem extends TransferItem {
  key: string;
  titleKey: string;
}

const GROUP_FIELD_DEFS: ReadonlyArray<Pick<GroupTransferItem, 'key' | 'titleKey'> & { direction?: TransferDirection }> =
  [
    { key: 'date', titleKey: 'Common.Date', direction: 'right' },
    { key: 'trantype', titleKey: 'Finance.TransactionType' },
    { key: 'account', titleKey: 'Finance.Account' },
  ];

// searchDocItem page size, and the rollup thresholds for the charts: past
// TREND_DAILY_LIMIT distinct dates the trend aggregates by month; the
// composition chart always shows at most COMPOSITION_TOP categories plus a
// rolled-up "Others" bucket.
const PAGE_SIZE = 90;
const TREND_DAILY_LIMIT = 90;
const COMPOSITION_TOP = 10;

// Transfer/opening movements the Exclude-transfer criterion drops. Hardcoded
// system transaction-type ids: the tran type metadata carries no such flag yet
// (follow-up), so any NEW system type is invisible to this list until added.
function isTransferTranType(tt: number | undefined): boolean {
  return (
    tt === financeTranTypeOpeningAsset ||
    tt === financeTranTypeOpeningLiability ||
    tt === financeTranTypeTransferIn ||
    tt === financeTranTypeTransferOut ||
    tt === financeTranTypeAdvancePaymentOut ||
    tt === financeTranTypeAdvanceReceiveIn ||
    tt === financeTranTypeAssetValueDecrease ||
    tt === financeTranTypeAssetValueIncrease
  );
}

interface InsightRecord {
  TransactionDate?: string;
  TransactionType?: number;
  AccountID?: number;
  Amount: number;
  Currency: string;
}

@Component({
  selector: 'hih-document-item-insight',
  templateUrl: './document-item-insight.component.html',
  styleUrls: ['./document-item-insight.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({ echarts })],
  imports: [
    NzGridModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTransferModule,
    NzTooltipModule,
    NzDividerModule,
    NzTableModule,
    NzTagModule,
    NzResultModule,
    NzCardModule,
    NzStatisticModule,
    NzIconModule,
    NzButtonModule,
    NgxEchartsModule,
    DecimalPipe,
    TranslocoModule,
    NzModalModule,
    RouterModule,
    NgIf,
  ],
})
export class DocumentItemInsightComponent implements OnInit {
  // Group-field transfer items. `title` carries the imperative translate()
  // result, so — same langTick contract as document-list's filter labels — it
  // is re-applied on every runtime language switch; the array lives in a
  // signal (zoneless CD) so handing nz-transfer a fresh reference triggers its
  // ngOnChanges re-split of both panels.
  listGroupFields = signal<GroupTransferItem[]>(GROUP_FIELD_DEFS.map((f) => ({ ...f, title: translate(f.titleKey) })));
  isLoadingData = signal(false);
  arTranType = signal<TranType[]>([]);
  arAccounts = signal<Account[]>([]);
  baseCurrency: string;

  selectedGroupFieldKeys: string[] = [];
  // UI service. A signal because the criteria tags mutate it at runtime
  // (closing a tag rewrites one option and re-fetches).
  insightOption = signal<DocInsightOption | null>(null);
  // Buffer data
  totalDataCount = signal(0);
  listData = signal<DocumentItemView[]>([]);
  // Rows that survived the transfer/opening exclusion — what the KPIs, the
  // aggregates and the charts are all computed from.
  filteredRows = signal<DocumentItemView[]>([]);
  processedCount = signal(0);
  incomeAmount = signal(0);
  outgoAmount = signal(0);
  // Display
  listDisplayData = signal<InsightRecord[]>([]);
  // Amount column sort (client-side: the rows are aggregates built here, not a
  // query page, so there is no server orderby to send). null = keep the
  // grouped date/account/type ordering produced by buildDisplayList.
  amountSortOrder = signal<'ascend' | 'descend' | null>(null);
  // Bumped on every runtime language switch so the computeds below that call
  // the imperative translate() (no implicit active-lang dependency) recompute —
  // same contract as document-list's filter labels.
  private readonly langTick = signal(0);
  // Transfer panel captions, re-translated on language switch (see langTick).
  readonly transferTitles = computed(() => {
    this.langTick();
    return [translate('Finance.InsightAvailable'), translate('Finance.InsightSelected')];
  });
  // The table's bound view of listDisplayData, ordered by the amount sort.
  listSortedDisplayData = computed(() => {
    const order = this.amountSortOrder();
    const data = this.listDisplayData();
    if (order === null) {
      return data;
    }
    const dir = order === 'ascend' ? 1 : -1;
    return [...data].sort((a, b) => (a.Amount - b.Amount) * dir);
  });

  readonly netAmount = computed(() => this.incomeAmount() - this.outgoAmount());

  // Chart palettes below are NOT the app's green/red income/outgo semantics:
  // #52c41a/#ff4d4f fail color-vision-deficiency separation (deutan ΔE 5.8,
  // under the 6 floor). The pairs here are the dataviz-validator-passing steps
  // that keep the same order (income first, cool hue; outgo second, warm hue);
  // identity also travels in the legend/axis labels, never in color alone.
  private chartPalette() {
    const dark = this.prefs.theme() === 'dark';
    return {
      income: dark ? '#1677ff' : '#0958d9',
      outgo: dark ? '#e8590c' : '#d4380d',
      ink: dark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)',
      secondary: dark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
      splitLine: dark ? '#303030' : '#f0f0f0',
      surface: dark ? '#141414' : '#ffffff',
    };
  }

  // Amount trend over time, shown whenever Date is a selected grouping field:
  // per day, rolled up per month past TREND_DAILY_LIMIT distinct dates. One
  // line per direction; a direction-filtered query leaves the empty series
  // out entirely (single series → no legend).
  readonly chartTrendOption = computed<echarts.EChartsOption | null>(() => {
    this.langTick();
    const c = this.chartPalette();
    if (!this.isTranDateVisible) {
      return null;
    }
    const rows = this.filteredRows();
    if (rows.length === 0) {
      return null;
    }

    const monthly = new Set(rows.map((r) => r.TransactionDate)).size > TREND_DAILY_LIMIT;
    const income = new Map<string, number>();
    const outgo = new Map<string, number>();
    for (const r of rows) {
      const key = monthly ? (r.TransactionDate ?? '').slice(0, 7) : (r.TransactionDate ?? '');
      // Both series read as positive magnitudes (expense amounts arrive
      // negative from the view).
      const bucket = r.IsExpense ? outgo : income;
      bucket.set(key, (bucket.get(key) ?? 0) + Math.abs(r.Amount));
    }
    const categories = Array.from(new Set([...income.keys(), ...outgo.keys()])).sort();

    const incomeName = translate('Finance.Income');
    const outgoName = translate('Finance.Outgoing');
    const series: echarts.LineSeriesOption[] = [];
    if (income.size > 0) {
      series.push(this.buildTrendSeries(incomeName, c.income, categories, income));
    }
    if (outgo.size > 0) {
      series.push(this.buildTrendSeries(outgoName, c.outgo, categories, outgo));
    }

    return {
      grid: { left: 8, right: 16, top: series.length > 1 ? 40 : 20, bottom: 4, containLabel: true },
      color: [c.income, c.outgo],
      tooltip: {
        trigger: 'axis',
        // ECharts spells the crosshair pointer 'cross' in tooltip.axisPointer.
        axisPointer: { type: 'cross' },
        formatter: (params: SafeAny) => {
          const list = params as Array<{ seriesName: string; value: number; axisValue: string; marker: string }>;
          const head = `${list[0]?.axisValue ?? ''} — ${this.baseCurrency}`;
          return [head, ...list.map((p) => `${p.marker}${p.seriesName}: ${this.money(p.value)}`)].join('<br/>');
        },
      },
      legend:
        series.length > 1
          ? { top: 8, data: series.map((s) => s.name as string), textStyle: { color: c.ink } }
          : { show: false },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: categories,
        axisLine: { lineStyle: { color: c.splitLine } },
        axisTick: { show: false },
        axisLabel: {
          color: c.secondary,
          hideOverlap: true,
          rotate: categories.length > 12 ? 45 : 0,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: c.secondary, formatter: (value: SafeAny) => Number(value).toLocaleString() },
        splitLine: { lineStyle: { color: c.splitLine } },
      },
      series,
    };
  });

  private buildTrendSeries(
    name: string,
    color: string,
    categories: string[],
    bucket: Map<string, number>,
  ): echarts.LineSeriesOption {
    return {
      name,
      type: 'line',
      data: categories.map((k) => NumberUtility.Round2Two(bucket.get(k) ?? 0)),
      lineStyle: { width: 2, color },
      itemStyle: { color },
      symbol: 'circle',
      // >=8px markers on hoverable counts; on dense daily series the points
      // degrade to a clean line and the crosshair tooltip still hits per date.
      showSymbol: categories.length <= 45,
      symbolSize: 8,
      emphasis: { focus: 'series' },
    };
  }

  // Composition over the selected non-date grouping fields (transaction type
  // and/or account; the category label joins the selected dimensions the same
  // way the table groups rows): income and outgo stacked per category, top
  // COMPOSITION_TOP by total with the remainder rolled into "Others".
  readonly chartCompositionOption = computed<echarts.EChartsOption | null>(() => {
    this.langTick();
    const c = this.chartPalette();
    const needtype = this.isTranTypeVisible;
    const needacnt = this.isAccountVisible;
    if (!needtype && !needacnt) {
      return null;
    }
    const rows = this.filteredRows();
    if (rows.length === 0) {
      return null;
    }

    const agg = new Map<string, { income: number; outgo: number }>();
    for (const r of rows) {
      const parts: string[] = [];
      if (needtype) {
        const tt = this.getTranTypeName(r.TransactionType ?? -1);
        parts.push(tt !== '' ? tt : `#${r.TransactionType ?? '?'}`);
      }
      if (needacnt) {
        const ac = this.getAccountName(r.AccountID ?? -1);
        parts.push(ac !== '' ? ac : `#${r.AccountID ?? '?'}`);
      }
      const key = parts.join(' / ');
      const slot = agg.get(key) ?? { income: 0, outgo: 0 };
      // Stacked bars read as positive magnitudes (expense amounts arrive
      // negative from the view); the hasIncome/hasOutgo checks below rely on it.
      if (r.IsExpense) {
        slot.outgo += Math.abs(r.Amount);
      } else {
        slot.income += Math.abs(r.Amount);
      }
      agg.set(key, slot);
    }

    const sorted = Array.from(agg.entries()).sort((a, b) => b[1].income + b[1].outgo - (a[1].income + a[1].outgo));
    let entries = sorted;
    if (sorted.length > COMPOSITION_TOP) {
      const rest = sorted.slice(COMPOSITION_TOP);
      const others = rest.reduce((acc, [, v]) => ({ income: acc.income + v.income, outgo: acc.outgo + v.outgo }), {
        income: 0,
        outgo: 0,
      });
      entries = [...sorted.slice(0, COMPOSITION_TOP), [translate('Common.Others'), others]];
    }
    const categories = entries.map(([k]) => k);

    const incomeName = translate('Finance.Income');
    const outgoName = translate('Finance.Outgoing');
    const hasIncome = entries.some(([, v]) => v.income > 0);
    const hasOutgo = entries.some(([, v]) => v.outgo > 0);
    const series: echarts.BarSeriesOption[] = [];
    // A 2px surface ring separates stacked segments; with a single series the
    // bar needs no ring. The rounded data end belongs to the outermost
    // segment only (income when it is the last one standing), baseline flat.
    const gapStyle = hasIncome && hasOutgo ? { borderColor: c.surface, borderWidth: 2 } : {};
    if (hasIncome) {
      series.push({
        name: incomeName,
        type: 'bar',
        stack: 'amount',
        data: entries.map(([, v]) => NumberUtility.Round2Two(v.income)),
        itemStyle: { color: c.income, ...gapStyle, ...(hasOutgo ? {} : { borderRadius: [0, 4, 4, 0] }) },
        barMaxWidth: 20,
      });
    }
    if (hasOutgo) {
      series.push({
        name: outgoName,
        type: 'bar',
        stack: 'amount',
        data: entries.map(([, v]) => NumberUtility.Round2Two(v.outgo)),
        itemStyle: { color: c.outgo, ...gapStyle, borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 20,
      });
    }

    return {
      grid: { left: 8, right: 24, top: series.length > 1 ? 40 : 20, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: SafeAny) => {
          const list = params as Array<{ seriesName: string; value: number; name: string; marker: string }>;
          const head = `${list[0]?.name ?? ''} — ${this.baseCurrency}`;
          return [head, ...list.map((p) => `${p.marker}${p.seriesName}: ${this.money(p.value)}`)].join('<br/>');
        },
      },
      legend:
        series.length > 1
          ? { top: 8, data: series.map((s) => s.name as string), textStyle: { color: c.ink } }
          : { show: false },
      xAxis: {
        type: 'value',
        axisLabel: { color: c.secondary, formatter: (value: SafeAny) => Number(value).toLocaleString() },
        splitLine: { lineStyle: { color: c.splitLine } },
      },
      yAxis: {
        type: 'category',
        // Largest category on top: the entries are sorted descending and the
        // inverse flips the axis origin.
        inverse: true,
        data: categories,
        axisLine: { lineStyle: { color: c.splitLine } },
        axisTick: { show: false },
        axisLabel: {
          color: c.secondary,
          width: 120,
          overflow: 'truncate',
        },
      },
      series,
    };
  });

  private money(value: number): string {
    return NumberUtility.Round2Two(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private readonly odataService = inject(FinanceOdataService);
  private readonly uiStatusService = inject(UIStatusService);
  private readonly modalService = inject(NzModalService);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly translocoService = inject(TranslocoService);
  private readonly prefs = inject(UserPreferencesService);

  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent constructor`,
      ConsoleLogTypeEnum.debug,
    );

    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';

    // The transfer's item/panel captions come from imperative translate()
    // calls, which the runtime language switch does not re-run on its own:
    // bump langTick (recomputes transferTitles), re-translate each item's
    // title in place (nz-transfer owns `direction` on these objects, so they
    // must be kept), and hand back a NEW array reference so the transfer's
    // ngOnChanges re-splits both panels with the fresh captions.
    this.translocoService.langChanges$.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
      this.langTick.update((n) => n + 1);
      this.listGroupFields.update((items) => {
        items.forEach((item) => (item.title = translate(item.titleKey)));
        return [...items];
      });
    });
  }

  public getAccountName(acntid: number): string {
    const acntObj = this.arAccounts().find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranType().find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }
  get isTranDateVisible(): boolean {
    return this.listGroupFields().findIndex((p) => p['key'] === 'date' && p.direction === 'right') !== -1;
  }
  get isAccountVisible(): boolean {
    return this.listGroupFields().findIndex((p) => p['key'] === 'account' && p.direction === 'right') !== -1;
  }
  get isTranTypeVisible(): boolean {
    return this.listGroupFields().findIndex((p) => p['key'] === 'trantype' && p.direction === 'right') !== -1;
  }
  get insideDateRangeString(): string {
    const opt = this.insightOption();
    if (opt !== null) {
      return format(opt.SelectedDataRange[0], dateFormat) + ' - ' + format(opt.SelectedDataRange[1], dateFormat);
    }
    return '';
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent ngOnInit...`,
      ConsoleLogTypeEnum.debug,
    );
    // Options
    this.insightOption.set(this.uiStatusService.docInsightOption ?? null);
    if (this.insightOption() === null) {
      // Deep-linked without criteria: the guidance result is rendered instead
      // of firing metadata/row queries nothing would feed.
      return;
    }
    // Read accounts and tran. types
    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
    ])
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (returnResults) => {
          this.arAccounts.set(returnResults[2]);
          this.arTranType.set(returnResults[1]);

          this.fetchData();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentItemInsightComponent ngOnInit forkJoin failed ${err}...`,
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

  onTransferChanged(ret: SafeAny): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent onTransferChanged: ${ret}...`,
      ConsoleLogTypeEnum.debug,
    );

    // Need refresh data!
    this.buildDisplayList();
  }

  onAmountSortChange(order: string | null): void {
    // nzSortOrderChange emits a plain string union - narrow it to ours (same
    // contract as the person/organization selection dialogs).
    this.amountSortOrder.set(order === 'ascend' || order === 'descend' ? order : null);
  }

  // Closing a criteria tag rewrites the option (a fresh object: the signal
  // must notify) and re-runs the query with that criterion dropped.
  onRemoveDirection(): void {
    const cur = this.insightOption();
    if (!cur) {
      return;
    }
    this.insightOption.set({ ...cur, TransactionDirection: undefined });
    this.fetchData();
  }

  onRemoveExcludeTransfer(): void {
    const cur = this.insightOption();
    if (!cur) {
      return;
    }
    this.insightOption.set({ ...cur, ExcludeTransfer: false });
    // Exclude-transfer never reaches the server query (it is applied while
    // aggregating), so the rows already fetched are complete: re-run the local
    // build instead of paying a network round-trip for the same data.
    this.buildDisplayList();
  }

  // Bumped on every fetchData() call: the criteria tags are rendered (and
  // closeable) while the initial load is still in flight, so two queries with
  // different filters can overlap. Only the latest generation owns the UI
  // state — a stale response resolving late must not clobber it.
  private fetchGeneration = 0;

  fetchData(): void {
    const opt = this.insightOption();
    if (opt === null) {
      return;
    }

    const fltrs: GeneralFilterItem[] = [];
    if (opt.TransactionDirection !== undefined) {
      fltrs.push({
        fieldName: 'IsExpense',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: opt.TransactionDirection ? false : true,
        highValue: opt.TransactionDirection ? false : true,
        valueType: GeneralFilterValueType.boolean,
      });
    }
    fltrs.push({
      fieldName: 'TransactionDate',
      operator: GeneralFilterOperatorEnum.Between,
      lowValue: format(opt.SelectedDataRange[0], dateFormat),
      highValue: format(opt.SelectedDataRange[1], dateFormat),
      valueType: GeneralFilterValueType.date,
    });

    this.listData.set([]);
    this.filteredRows.set([]);
    this.totalDataCount.set(0);
    this.isLoadingData.set(true);
    const gen = ++this.fetchGeneration;

    // Pages 2..n are issued in parallel and joined, so the aggregate is built
    // exactly once, after ALL responses (success or failure) — the spinner
    // always unwinds via finalize(); a failing page can no longer leave the
    // totals half-filled. Responses from a superseded fetch (gen mismatch) are
    // dropped so a stale narrower query can't overwrite the current result.
    this.odataService
      .searchDocItem(fltrs, PAGE_SIZE, 0)
      .pipe(
        switchMap((firstPage) => {
          const total = Number(firstPage?.totalCount) || 0;
          if (gen === this.fetchGeneration) {
            this.totalDataCount.set(total);
          }
          const extraPages = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
          if (extraPages === 0) {
            return of([firstPage]);
          }
          return forkJoin(
            Array.from({ length: extraPages }, (_, i) =>
              this.odataService.searchDocItem(fltrs, PAGE_SIZE, PAGE_SIZE * (i + 1)),
            ),
          ).pipe(map((rest) => [firstPage, ...rest]));
        }),
        finalize(() => {
          if (gen === this.fetchGeneration) {
            this.isLoadingData.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyedRef),
      )
      .subscribe({
        next: (pages) => {
          if (gen !== this.fetchGeneration) {
            return; // a newer fetch owns the UI state now
          }
          this.listData.set(pages.flatMap((p) => p?.contentList ?? []));
          this.buildDisplayList();
        },
        error: (err) => {
          if (gen !== this.fetchGeneration) {
            return; // stale failure: the newer query's outcome is what matters
          }
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentItemInsightComponent searchDocItem ${err}...`,
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

  buildDisplayList(): void {
    const excludeTransfer = this.insightOption()?.ExcludeTransfer === true;

    let incomeAmt = 0;
    let outgoAmt = 0;

    const needdate = this.isTranDateVisible;
    const needacnt = this.isAccountVisible;
    const needtype = this.isTranTypeVisible;
    const displayData: InsightRecord[] = [];
    const kept: DocumentItemView[] = [];

    this.listData().forEach((p) => {
      if (excludeTransfer && isTransferTranType(p.TransactionType)) {
        return;
      }
      kept.push(p);

      // Classify with the view's own IsExpense - the same field the server
      // filters the direction criterion on - instead of re-looking the tran
      // type up: an unknown type no longer falls through into "income".
      // The view signs expense amounts negative; the cards show magnitudes.
      if (p.IsExpense) {
        outgoAmt += Math.abs(p.Amount);
      } else {
        incomeAmt += Math.abs(p.Amount);
      }

      const idx = displayData.findIndex((data) => {
        if (needdate && data.TransactionDate !== p.TransactionDate) {
          return false;
        }
        if (needacnt && data.AccountID !== p.AccountID) {
          return false;
        }
        if (needtype && data.TransactionType !== p.TransactionType) {
          return false;
        }
        return true;
      });

      if (idx !== -1) {
        displayData[idx].Amount += p.Amount;
      } else {
        const ndata: InsightRecord = {
          Amount: p.Amount,
          Currency: this.baseCurrency,
        };
        if (needdate) {
          ndata.TransactionDate = p.TransactionDate;
        }
        if (needacnt) {
          ndata.AccountID = p.AccountID;
        }
        if (needtype) {
          ndata.TransactionType = p.TransactionType;
        }

        displayData.push(ndata);
      }
    });

    displayData.sort((item1, item2) => {
      let ndatecmp = 0;
      if (needdate) {
        const date1 = typeof item1.TransactionDate === 'string' ? item1.TransactionDate : '';
        const date2 = typeof item2.TransactionDate === 'string' ? item2.TransactionDate : '';
        ndatecmp = date1.localeCompare(date2);
      }

      if (ndatecmp === 0) {
        let nacntcmp = 0;
        if (needacnt) {
          nacntcmp = item1.AccountID! - item2.AccountID!;

          if (nacntcmp === 0) {
            let nttcmp = 0;
            if (needtype) {
              nttcmp = item1.TransactionType! - item2.TransactionType!;
            }
            return nttcmp;
          }

          return nacntcmp;
        }
      }
      return ndatecmp;
    });

    this.filteredRows.set(kept);
    this.processedCount.set(kept.length);
    this.listDisplayData.set(displayData);
    this.incomeAmount.set(incomeAmt);
    this.outgoAmount.set(outgoAmt);
  }
}
