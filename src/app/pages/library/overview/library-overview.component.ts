import { Component, OnInit, computed, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';

import { ConsoleLogTypeEnum, ModelUtility } from '@model/index';
import { HomeDefOdataService, LibraryStorageService } from '@services/index';
import { LibraryOverviewStats, LibraryRankingItem } from '../../../services/library-storage.service';

import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
  selector: 'hih-library-overview',
  templateUrl: './library-overview.component.html',
  styleUrls: ['./library-overview.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzIconModule,
    NzButtonModule,
    NzEmptyModule,
    NzProgressModule,
    TranslocoModule,
    RouterModule,
    NzModalModule,
  ],
})
export class LibraryOverviewComponent implements OnInit {
  readonly isLoadingResults = signal(false);
  // One server-computed aggregate per visit (LibraryBooks/GetLibraryOverviewKeyFigure):
  // totals, month deltas and the three top-3 rankings. The math that used to
  // live here ran over a full client-side walk of the collection; it now lives
  // in the API (see LibraryBooksController.GetLibraryOverviewKeyFigure).
  readonly stats = signal<LibraryOverviewStats | null>(null);

  private readonly odataService = inject(LibraryStorageService);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly homeName = computed(() => this.homeService.ChosedHome?.Name ?? '');
  readonly totalBooks = computed(() => this.stats()?.totalBooks ?? 0);
  // The shelf, as opposed to the catalogue: same rows, but each contributing its
  // copy count. Shown next to totalBooks because the pair is the interesting
  // fact (titles held, physical books) - neither number alone says it.
  readonly totalCopies = computed(() => this.stats()?.totalCopies ?? 0);
  readonly addedThisMonth = computed(() => this.stats()?.addedThisMonth ?? 0);
  readonly addedLastMonth = computed(() => this.stats()?.addedLastMonth ?? 0);
  readonly completedThisMonth = computed(() => this.stats()?.completedThisMonth ?? 0);
  readonly completedLastMonth = computed(() => this.stats()?.completedLastMonth ?? 0);
  readonly topCategories = computed(() => this.stats()?.topCategories ?? []);
  readonly topAuthors = computed(() => this.stats()?.topAuthors ?? []);
  readonly topPresses = computed(() => this.stats()?.topPresses ?? []);

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering LibraryOverviewComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.fetchData();
  }

  fetchData(): void {
    // Re-entrancy guard: overlapping fetches from repeated Refresh clicks would
    // last-writer-wins race and the spinner would clear when the FIRST one
    // lands. The spin overlay also blocks the button; this makes the intent
    // explicit.
    if (this.isLoadingResults()) {
      return;
    }
    this.isLoadingResults.set(true);
    this.odataService
      .fetchLibraryOverviewKeyFigure()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (s: LibraryOverviewStats) => {
          this.stats.set(s);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LibraryOverviewComponent fetchData failed ${err}...`,
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

  /** Bar width of a ranking row, relative to that ranking's top entry. */
  rankingPercent(item: LibraryRankingItem, ranking: LibraryRankingItem[]): number {
    const max = ranking.length > 0 ? ranking[0].count : 1;
    return max > 0 ? Math.round((item.count / max) * 100) : 0;
  }
}
