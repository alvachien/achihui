import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { translate, TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTreeModule, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FilterJoinType, FilterUtility, FilterRoot } from 'actslib';

import {
  DEFAULT_FILTER_MAX_DEPTH,
  DEFAULT_FILTER_TITLE_KEY,
  FILTER_GROUP_NEEDS_TWO_KEY,
  FILTER_LEAF_ERROR_KEYS,
  FilterDialogData,
  FilterDialogResult,
  FilterableProperty,
  SharedFilterDialogLeaf,
  SharedFilterDialogNode,
  checkFilterSchema,
  deleteMember,
  depthOf,
  effectiveOperations,
  emptyLeaf,
  emptyLeafForProperty,
  emptyNode,
  emitTree,
  findMember,
  findProperty,
  hasActiveFilterDefinition,
  insertMember,
  isDialogNode,
  nextEditorId,
  operatorLabel,
  parentIdOf,
  patchLeaf,
  patchNode,
  selectableProperties,
  seedTree,
  summarizeFilterDefinition,
  summarizeMember,
  validateTree,
  valueEditorFor,
} from './filter-dialog-model';

interface OptionItem {
  value: string;
  label: string;
}

/**
 * Generic condition-tree filter editor dialog (design §3/§5.3/§9, as
 * corrected by the hierarchy contract: seed/result are actslib `FilterRoot`,
 * the editor tree normalizes to a SINGLE top node under an invisible
 * 0-or-1-member wrapper, and the empty tree is not submittable).
 *
 * NG-ZORRO adaptation of the spec: NzModal (via the `openFilterDialog`
 * helper below) replaces MatDialog, nz-tree replaces mat-tree. The
 * load-bearing invariants of §5.3 are preserved: editor nodes carry
 * numeric ids, every edit is an immutable replacement routed through the
 * `root` signal (never an in-place write), and tree selection is id-based
 * so immutable replacements don't drop it. nz-tree is fed a freshly built
 * `NzTreeNodeOptions[]` from a computed over `root`, which sidesteps the
 * MatTree reference-trackBy concern entirely (the whole view rebuilds).
 *
 * The navigator renders the (at most one) root NODE — never the unrendered
 * wrapper: case 1 shows one condition row, case 2 one group row with its
 * members nested below, and the transient empty tree shows none (the two
 * insert buttons arm; delete stays off). A dialog seeded empty — the "new
 * filter" case — opens SCAFFOLDED with one blank condition, selected.
 * The toolbar holds exactly three buttons, armed by the selected node's
 * kind: a GROUP arms all three (it becomes the insert target), a CONDITION
 * arms delete only, and with nothing selected the two inserts arm. Inserts
 * select the new node; deleting a member returns the selection to the
 * parent group — or to nothing when the tree just emptied, where the
 * inserts re-arm (delete → + group → + condition is the growth path from
 * any state). Submit emits a `FilterRoot`: a bare condition for a
 * single-condition filter (case 1, via `FilterUtility.Simplify`), a
 * definition otherwise (case 2). Cancel/backdrop/Esc yield `undefined` and
 * the caller keeps its previous filter.
 */
@Component({
  selector: 'hih-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TranslocoModule,
    NzTreeModule,
    NzSelectModule,
    NzInputModule,
    NzCheckboxModule,
    NzButtonModule,
    NzIconModule,
  ],
})
export class SharedFilterDialogComponent {
  private readonly modalData = inject<FilterDialogData | null>(NZ_MODAL_DATA, { optional: true });
  private readonly modal = inject(NzModalRef);

  readonly schema: FilterableProperty[];
  readonly maxDepth: number;

  /** root of the editor tree — the invisible 0-or-1-member wrapper; the
   *  single source all edits flow through */
  readonly root = signal<SharedFilterDialogNode>({
    id: 0,
    kind: 'group',
    join: FilterJoinType.AND,
    members: [],
  });
  /** id-based selection so immutable replacements keep it (§5.3.3); null =
   *  nothing selected (the transient empty tree — the insert-anchor state) */
  readonly selectedId = signal<number | null>(null);
  readonly splitPct = signal(42);
  // Bumped on runtime language switches so the computeds below that call the
  // imperative translate() - which has no activeLang signal of its own -
  // recompute. Without it, labels opened dialog-wide stay stale until reopen.
  private readonly langTick = signal(0);

  /** deepest group the toolbar may insert into (root = 1) */
  private readonly container = viewChild<ElementRef<HTMLElement>>('fdContainer');
  private dragging = false;

  constructor() {
    const data = this.modalData;
    this.schema = data?.properties ?? [];
    this.maxDepth = data?.maxDepth ?? DEFAULT_FILTER_MAX_DEPTH;
    const warnings = checkFilterSchema(this.schema);
    if (warnings.length > 0) {
      warnings.forEach((w) => console.warn(w));
    }
    // Seed normalized to a single top node (the wrapper holds 0 or 1
    // members). An empty seed — the "new filter" case — opens SCAFFOLDED
    // with one blank condition (case 1), selected: the dialog only ever
    // presents cases 1/2, and the missing-value rule keeps Submit disabled
    // until the leaf is filled.
    let seeded = seedTree(data?.root, this.schema);
    if (seeded.members.length === 0 && selectableProperties(this.schema).length > 0) {
      seeded = { ...seeded, members: [emptyLeaf(this.schema)] };
    }
    this.root.set(seeded);
    this.selectedId.set(seeded.members[0]?.id ?? null);

    inject(TranslocoService)
      .langChanges$.pipe(takeUntilDestroyed())
      .subscribe(() => this.langTick.update((n) => n + 1));
  }

  // -- derived state --------------------------------------------------------

  readonly validation = computed(() => validateTree(this.root(), this.schema));
  readonly canSubmit = computed(() => this.validation().isValid);
  /** The navigator's top rows: the (at most one) root NODE — never the
   *  unrendered wrapper (case 1: one condition row; case 2: one group row
   *  with nested rows; the transient empty tree: no rows). */
  readonly treeNodes = computed<NzTreeNodeOptions[]>(() => {
    this.langTick(); // tree titles embed translate() results
    return this.root().members.map((m) => (isDialogNode(m) ? this.buildTreeNode(m) : this.buildTreeLeaf(m)));
  });
  readonly selectedKeys = computed(() => (this.selectedId() === null ? [] : [String(this.selectedId())]));

  readonly selectedMember = computed(() => {
    const id = this.selectedId();
    return id === null ? null : findMember(this.root(), id);
  });
  readonly selectedGroup = computed(() => {
    const m = this.selectedMember();
    return m && isDialogNode(m) ? m : null;
  });
  readonly selectedLeaf = computed(() => {
    const m = this.selectedMember();
    return m && !isDialogNode(m) ? m : null;
  });
  readonly selectedLeafProp = computed(() => {
    const leaf = this.selectedLeaf();
    return leaf ? findProperty(this.schema, leaf.propertyKey) : undefined;
  });

  /**
   * The group that accepts toolbar inserts: a selected GROUP (the case-2
   * root node or any nested group), or — with NOTHING selected (the empty
   * tree) — the scaffold root, so the insert becomes THE single top node.
   * A selected CONDITION targets nothing: its parent is not the selection,
   * so both add buttons stay disabled for it.
   */
  readonly insertTargetId = computed<number | null>(() => {
    const g = this.selectedGroup();
    if (g) {
      return g.id;
    }
    const leaf = this.selectedLeaf();
    if (leaf) {
      return null; // a condition arms delete only — inserts are off
    }
    return this.root().id; // nothing selected (empty tree): the scaffold takes the insert
  });

  readonly canAddCondition = computed(() => {
    const target = this.insertTargetId();
    return target !== null && selectableProperties(this.schema).length > 0;
  });
  readonly canAddGroup = computed(() => {
    const target = this.insertTargetId();
    if (target === null) {
      return false;
    }
    // The depth cap counts VISIBLE group levels: the unrendered wrapper is
    // level 0, so the single top node the user sees sits at level 1 and
    // maxDepth is exactly the deepest group level the toolbar offers.
    return depthOf(this.root(), target) < this.maxDepth;
  });
  readonly canDelete = computed(() => this.selectedId() !== null);

  readonly propertyOptions = computed<OptionItem[]>(() => {
    this.langTick();
    return selectableProperties(this.schema).map((p) => ({ value: p.key, label: translate(p.labelKey) }));
  });

  readonly operatorOptions = computed<OptionItem[]>(() => {
    this.langTick();
    const prop = this.selectedLeafProp();
    if (!prop) {
      return [];
    }
    const ops = effectiveOperations(prop).map((op) => ({
      value: op as string,
      label: operatorLabel(op, translate),
    }));
    const customs = (prop.customOperators ?? []).map((co) => ({
      value: co.id,
      label: translate(co.labelKey),
    }));
    return [...ops, ...customs];
  });

  readonly operatorDisabled = computed(() => this.selectedLeafProp()?.kind === 'enum');
  readonly valueEditor = computed(() => {
    const leaf = this.selectedLeaf();
    return leaf ? valueEditorFor(this.selectedLeafProp(), leaf.operator) : 'none';
  });
  readonly selectedLeafErrorKey = computed(() => {
    const leaf = this.selectedLeaf();
    if (!leaf) {
      return null;
    }
    const err = this.validation().leafErrors.get(leaf.id);
    return err ? FILTER_LEAF_ERROR_KEYS[err] : null;
  });
  readonly selectedGroupInvalid = computed(() => {
    const g = this.selectedGroup();
    return !!g && this.validation().invalidGroupIds.includes(g.id);
  });
  readonly previewText = computed(() => {
    this.langTick();
    return summarizeFilterDefinition(emitTree(this.root(), this.schema), this.schema, translate);
  });
  readonly joinOptions: OptionItem[] = [
    { value: FilterJoinType.AND, label: 'AND' },
    { value: FilterJoinType.OR, label: 'OR' },
  ];

  // -- tree -------------------------------------------------------------------

  private buildTreeNode(node: SharedFilterDialogNode): NzTreeNodeOptions {
    const invalid = this.validation().invalidGroupIds.includes(node.id);
    const options: NzTreeNodeOptions = {
      key: String(node.id),
      title: `${invalid ? '⚠ ' : ''}${summarizeMember(node, this.schema, translate)}`,
      expanded: true,
    };
    options['children'] = node.members.map((m) => (isDialogNode(m) ? this.buildTreeNode(m) : this.buildTreeLeaf(m)));
    return options;
  }

  private buildTreeLeaf(leaf: SharedFilterDialogLeaf): NzTreeNodeOptions {
    const missing = this.validation().leafErrors.has(leaf.id);
    return {
      key: String(leaf.id),
      title: `${missing ? '⚠ ' : ''}${summarizeMember(leaf, this.schema, translate)}`,
      isLeaf: true,
    };
  }

  onTreeClick(key: string | number | null | undefined): void {
    if (key === null || key === undefined) {
      return;
    }
    const id = Number(key);
    if (!Number.isNaN(id)) {
      this.selectedId.set(id);
    }
  }

  // -- toolbar mutators (all immutable through the root signal) ---------------

  addCondition(): void {
    const target = this.insertTargetId();
    if (target === null) {
      return;
    }
    const leaf = emptyLeaf(this.schema);
    this.root.update((r) => insertMember(r, target, leaf));
    this.selectedId.set(leaf.id);
  }

  /**
   * Insert an AND-joined, CHILDLESS group into the target group and select
   * it. One click adds exactly one node: the group starts empty and carries
   * the ≥2-members warning until the user fills it (+ condition targets the
   * selected group) — no phantom placeholder row.
   */
  addGroup(): void {
    const target = this.insertTargetId();
    if (target === null || !this.canAddGroup()) {
      return;
    }
    const group = emptyNode(nextEditorId());
    this.root.update((r) => insertMember(r, target, group));
    this.selectedId.set(group.id);
  }

  /**
   * Delete the selected node (leaf, or group with its subtree). Selection
   * moves to the parent group; when the parent is the unrendered scaffold
   * root, it lands on the root's surviving first member — or on NOTHING
   * once the tree has emptied, the insert-anchor state where both add
   * buttons re-arm (the top level holds at most one node, so deleting the
   * top node always empties the tree).
   */
  deleteSelected(): void {
    const id = this.selectedId();
    if (id === null) {
      return;
    }
    const parent = parentIdOf(this.root(), id);
    if (parent === null) {
      return; // the unrendered wrapper itself is never deletable
    }
    this.root.update((r) => deleteMember(r, id));
    const after = this.root();
    this.selectedId.set(parent === after.id ? (after.members[0]?.id ?? null) : parent);
  }

  // -- detail-pane patchers ----------------------------------------------------

  setJoin(join: string): void {
    const g = this.selectedGroup();
    if (!g) {
      return;
    }
    this.root.update((r) => patchNode(r, g.id, join === FilterJoinType.OR ? FilterJoinType.OR : FilterJoinType.AND));
  }

  /** Property switch: resets the operator (it belongs to the previous
   *  property) AND the value slots — stale values from another property
   *  must never be re-emitted. The leaf id is kept so selection survives. */
  setProperty(key: string): void {
    const leaf = this.selectedLeaf();
    if (!leaf) {
      return;
    }
    const prop = findProperty(this.schema, key);
    if (!prop) {
      return;
    }
    const fresh = emptyLeafForProperty(prop, leaf.id);
    this.root.update((r) => patchLeaf(r, leaf.id, fresh));
  }

  setOperator(operator: string): void {
    const leaf = this.selectedLeaf();
    if (!leaf) {
      return;
    }
    this.root.update((r) => patchLeaf(r, leaf.id, { operator }));
  }

  setTextValue(value: string): void {
    const leaf = this.selectedLeaf();
    if (leaf) {
      this.root.update((r) => patchLeaf(r, leaf.id, { textValue: value ?? '' }));
    }
  }

  setNumberValue(value: number | null): void {
    const leaf = this.selectedLeaf();
    if (leaf) {
      this.root.update((r) => patchLeaf(r, leaf.id, { numberValue: value }));
    }
  }

  setDateValue(value: string): void {
    const leaf = this.selectedLeaf();
    if (leaf) {
      this.root.update((r) => patchLeaf(r, leaf.id, { dateValue: value ?? '' }));
    }
  }

  setLowValue(value: string | number | null): void {
    const leaf = this.selectedLeaf();
    if (leaf) {
      this.root.update((r) => patchLeaf(r, leaf.id, { lowValue: value }));
    }
  }

  setHighValue(value: string | number | null): void {
    const leaf = this.selectedLeaf();
    if (leaf) {
      this.root.update((r) => patchLeaf(r, leaf.id, { highValue: value }));
    }
  }

  isChoiceSelected(value: string | number): boolean {
    return this.selectedLeaf()?.selectedChoices.includes(value) ?? false;
  }

  toggleChoice(value: string | number, checked: boolean): void {
    const leaf = this.selectedLeaf();
    if (!leaf) {
      return;
    }
    const next = checked ? [...leaf.selectedChoices, value] : leaf.selectedChoices.filter((v) => v !== value);
    this.root.update((r) => patchLeaf(r, leaf.id, { selectedChoices: next }));
  }

  numberRange(): { min: number | null; max: number | null } {
    const range = this.selectedLeafProp()?.numberRange;
    return { min: range?.min ?? null, max: range?.max ?? null };
  }

  leaf(): SharedFilterDialogLeaf | null {
    return this.selectedLeaf();
  }

  group(): SharedFilterDialogNode | null {
    return this.selectedGroup();
  }

  groupNeedsTwoKey(): string {
    return FILTER_GROUP_NEEDS_TWO_KEY;
  }

  // -- splitter --------------------------------------------------------------

  onSplitterPointerDown(event: PointerEvent): void {
    const host = this.container()?.nativeElement;
    if (!host) {
      return;
    }
    event.preventDefault(); // keep the drag from starting a text selection
    this.dragging = true;
    const rect = host.getBoundingClientRect();
    const move = (ev: PointerEvent) => {
      if (!this.dragging) {
        return;
      }
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      this.splitPct.set(Math.min(65, Math.max(25, pct)));
    };
    const up = () => {
      this.dragging = false;
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }

  onSplitterKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const delta = event.key === 'ArrowLeft' ? -2 : 2;
      this.splitPct.set(Math.min(65, Math.max(25, this.splitPct() + delta)));
    }
  }

  // -- close contract: Submit → { root: FilterRoot }; Cancel → undefined ------

  /**
   * Emit the edited tree as an actslib `FilterRoot` (validation gated the
   * button). `Simplify` reduces the 1-member wrapper to a bare condition so
   * a single-condition filter (case 1) leaves the dialog in its minimal
   * form; a group tree (case 2) is returned unchanged. The empty filter
   * (case 0) is not submittable — clearing is the pages' Clear Filter
   * button.
   */
  submit(): void {
    if (!this.canSubmit()) {
      return;
    }
    const result: FilterDialogResult = { root: FilterUtility.Simplify(emitTree(this.root(), this.schema)) };
    this.modal.close(result);
  }

  cancel(): void {
    this.modal.close(undefined);
  }
}

/**
 * Open the filter dialog with the uniform close contract (design §7):
 * `afterClose` emits `{ root }` on Submit and `undefined` on cancel,
 * backdrop click or Esc.
 */
export function openFilterDialog(
  modal: NzModalService,
  data: FilterDialogData,
  viewContainerRef?: ViewContainerRef,
): NzModalRef<SharedFilterDialogComponent, FilterDialogResult | undefined> {
  return modal.create<SharedFilterDialogComponent, FilterDialogData, FilterDialogResult | undefined>({
    nzTitle: translate(data.titleKey ?? DEFAULT_FILTER_TITLE_KEY),
    nzWidth: 880,
    nzContent: SharedFilterDialogComponent,
    nzData: data,
    nzFooter: null,
    nzViewContainerRef: viewContainerRef,
  });
}

/** Reusable filter menu label: the current filter root summarized for
 *  display (empty string when there is no active filter). */
export function filterMenuLabel(def: FilterRoot | undefined, schema: FilterableProperty[], maxLength = 40): string {
  if (!hasActiveFilterDefinition(def)) {
    return '';
  }
  return summarizeFilterDefinition(def, schema, translate, maxLength);
}
