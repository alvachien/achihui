import { DestroyRef, ViewContainerRef, computed, inject, signal, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { translate, TranslocoService } from '@jsverse/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FilterOperation, type FilterRoot } from 'actslib';

import {
  type FilterableProperty,
  filterMenuLabel,
  hasActiveFilterDefinition,
  openFilterDialog,
} from '../filter-dialog';

export interface FilterBarOptions {
  /** Schema driving the menu summary and the dialog itself. */
  properties: FilterableProperty[];
  /** Fired on every committed narrowing change (search commit, dialog apply,
   *  clear) - client-paginated hosts use it to return to page 1. */
  onReset: () => void;
  /** Extra narrowing sources OUTSIDE the bar (column-header dropdowns, the
   *  order validity switch), folded into filterActive so the highlight and the
   *  table always agree. */
  extraActive?: () => boolean;
}

/**
 * FilterBar - the state machine behind the client-paginated finance lists'
 * filter bar (docs/filter-dialog-generic-design.md §7): live free-text
 * pre-filter + structured filter through the shared dialog, the menu summary
 * label, and the filterActive highlight.
 *
 * Composition over inheritance (the established pattern in src/app/shared -
 * the repo has no component base classes): hosts build one in a FIELD
 * INITIALIZER (inject() is legal during construction) and alias its members
 * into their own fields, so templates and specs keep binding the same names.
 * The fetch-once dataSet/displayList stay component-owned.
 */
export class FilterBar {
  /** Committed free-text pre-filter (client-side keyword). */
  readonly searchText = signal('');
  /** Structured filter emitted by the shared dialog (undefined = none; any
   *  actslib FilterRoot spelling — a single-condition filter travels as a
   *  bare condition, the dialog's Submit runs Simplify). */
  readonly filterDef = signal<FilterRoot | undefined>(undefined);
  readonly hasFilter = computed(() => hasActiveFilterDefinition(this.filterDef()));
  /** Any narrowing in effect (free text OR structured filter OR the host's
   *  extra sources); resets automatically as each source clears. */
  readonly filterActive: Signal<boolean>;
  /** Menu item label: a summary of the active filter, or "New filter" when none. */
  readonly filterMenuText: Signal<string>;

  private readonly options: FilterBarOptions;
  // Bumped on every runtime language switch so the computeds below that call
  // the imperative translate() (no implicit activeLang dependency) recompute.
  private readonly langTick = signal(0);
  private readonly modalService = inject(NzModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyedRef = inject(DestroyRef);

  constructor(options: FilterBarOptions) {
    this.options = options;
    this.filterActive = computed(
      () => this.searchText().trim().length > 0 || this.hasFilter() || (options.extraActive?.() ?? false),
    );
    this.filterMenuText = computed(() => {
      this.langTick();
      return filterMenuLabel(this.filterDef(), options.properties) || translate('Filter.NewFilter');
    });

    inject(TranslocoService)
      .langChanges$.pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe(() => this.langTick.update((n) => n + 1));
  }

  /** ngModelChange target: commit the fresh text and reset the host page. */
  onSearchInput(value: string): void {
    this.searchText.set(value);
    this.options.onReset();
  }

  /** Open the shared filter dialog seeded with the current filter. Close
   *  contract: Submit → { root }; cancel/backdrop/Esc → undefined (previous
   *  filter kept). */
  onEditFilter(): void {
    const ref = openFilterDialog(
      this.modalService,
      { properties: this.options.properties, root: this.filterDef() },
      this.viewContainerRef,
    );
    ref.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((result) => {
      if (result) {
        this.filterDef.set(result.root);
        this.options.onReset();
      }
    });
  }

  /** Drop the structured filter only - the host's extra narrowing sources
   *  carry their own controls (the order-list comment spells this out). */
  onClearFilter(): void {
    if (!this.hasFilter()) {
      return;
    }
    this.filterDef.set(undefined);
    this.options.onReset();
  }
}

/**
 * The account-list / control-center-list filter schema, byte-identical in
 * both before the extraction: the two free-text fields + ID (client class
 * property names — FilterUtility.FilterList reads them off the runtime
 * object). order-list composes its two validity-date entries on top.
 */
export const NAME_COMMENT_ID_FILTER_PROPERTIES: FilterableProperty[] = [
  { key: 'Name', labelKey: 'Common.Name', kind: 'string' },
  { key: 'Comment', labelKey: 'Common.Comment', kind: 'string' },
  {
    key: 'Id',
    labelKey: 'Common.ID',
    kind: 'number',
    operations: [FilterOperation.Equal, FilterOperation.Between, FilterOperation.GreaterThan, FilterOperation.LessThan],
  },
];
