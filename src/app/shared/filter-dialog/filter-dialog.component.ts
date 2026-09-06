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
import { FilterJoinType, IFilterDefinition } from 'actslib';

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
  emptyNode,
  emitTree,
  findMember,
  findProperty,
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
 * Generic condition-tree filter editor dialog (design §3/§5.3/§9).
 *
 * NG-ZORRO adaptation of the spec: NzModal (via the `openFilterDialog`
 * helper below) replaces MatDialog, nz-tree replaces mat-tree. The
 * load-bearing invariants of §5.3 are preserved: editor nodes carry
 * numeric ids, every edit is an immutable replacement routed through the
 * `root` signal (never an in-place write), and tree selection is id-based
 * so immutable replacements don't drop it. nz-tree is fed a freshly built
 * `NzTreeNodeOptions[]` from a computed over `root`, which sidesteps the
 * MatTree reference-trackBy concern entirely (the whole view rebuilds).
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

  /** root of the editor tree — the single source all edits flow through */
  readonly root = signal<SharedFilterDialogNode>({
    id: 0,
    kind: 'group',
    join: FilterJoinType.AND,
    members: [],
  });
  /** id-based selection so immutable replacements keep it (§5.3.3) */
  readonly selectedId = signal(0);
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
    const seeded = seedTree(data?.root, this.schema);
    this.root.set(seeded);
    this.selectedId.set(seeded.id);

    inject(TranslocoService)
      .langChanges$.pipe(takeUntilDestroyed())
      .subscribe(() => this.langTick.update((n) => n + 1));
  }

  // -- derived state --------------------------------------------------------

  readonly validation = computed(() => validateTree(this.root(), this.schema));
  readonly canSubmit = computed(() => this.validation().isValid);
  readonly treeNodes = computed<NzTreeNodeOptions[]>(() => {
    this.langTick(); // tree titles embed translate() results
    return [this.buildTreeNode(this.root())];
  });
  readonly selectedKeys = computed(() => [String(this.selectedId())]);

  readonly selectedMember = computed(() => findMember(this.root(), this.selectedId()));
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

  /** the group toolbar inserts into: the selected group, or a leaf's parent */
  readonly insertTargetId = computed(() => {
    const g = this.selectedGroup();
    if (g) {
      return g.id;
    }
    const leaf = this.selectedLeaf();
    if (leaf) {
      return parentIdOf(this.root(), leaf.id) ?? this.root().id;
    }
    return this.root().id;
  });

  readonly canAddGroup = computed(() => depthOf(this.root(), this.insertTargetId()) < this.maxDepth);
  readonly canDelete = computed(() => this.selectedId() !== this.root().id);

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
    const leaf = emptyLeaf(this.schema);
    const target = this.insertTargetId();
    this.root.update((r) => insertMember(r, target, leaf));
    this.selectedId.set(leaf.id);
  }

  addGroup(): void {
    if (!this.canAddGroup()) {
      return;
    }
    const group = { ...emptyNode(nextEditorId()), members: [emptyLeaf(this.schema)] };
    const target = this.insertTargetId();
    this.root.update((r) => insertMember(r, target, group));
    this.selectedId.set(group.id);
  }

  deleteSelected(): void {
    const id = this.selectedId();
    if (id === this.root().id) {
      return; // the root is never deletable
    }
    const parent = parentIdOf(this.root(), id) ?? this.root().id;
    this.root.update((r) => deleteMember(r, id));
    this.selectedId.set(parent);
  }

  // -- detail-pane patchers ----------------------------------------------------

  setJoin(join: string): void {
    const g = this.selectedGroup();
    if (!g) {
      return;
    }
    this.root.update((r) => patchNode(r, g.id, join === FilterJoinType.OR ? FilterJoinType.OR : FilterJoinType.AND));
  }

  setProperty(key: string): void {
    const leaf = this.selectedLeaf();
    if (!leaf) {
      return;
    }
    const prop = findProperty(this.schema, key);
    const first = prop ? effectiveOperations(prop)[0] : undefined;
    // value fields keep their content across switches (§6.1); the operator is
    // re-defaulted because it belongs to the previous property.
    this.root.update((r) =>
      patchLeaf(r, leaf.id, {
        propertyKey: key,
        operator: first ?? leaf.operator,
      }),
    );
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

  // -- close contract: Submit → { root }; Cancel → undefined ------------------

  submit(): void {
    if (!this.canSubmit()) {
      return;
    }
    const result: FilterDialogResult = { root: emitTree(this.root(), this.schema) };
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

/** Reusable filter menu label: the current definition summarized for display. */
export function filterMenuLabel(
  def: IFilterDefinition | undefined,
  schema: FilterableProperty[],
  maxLength = 40,
): string {
  if (!def || def.conditions.length === 0) {
    return '';
  }
  return summarizeFilterDefinition(def, schema, translate, maxLength);
}
