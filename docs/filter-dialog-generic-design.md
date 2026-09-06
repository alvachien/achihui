# Design: Generic Reusable Filter Dialog (condition-tree filter editor over actslib)

Portable version of `reusable-filter-dialog-design.md` — the consumer-page
migration content (which pages adopted it, legacy dialogs, phase plan) has been
stripped. What remains is the dialog itself: its public contract, editor state
model, actslib integration, validation, and invariants. Any Angular 21+
standalone component project that depends on **actslib** can implement this
specification directly.

Dependencies: Angular + Angular Material (`MatDialog`, `MatTree` nested nodes,
form fields/select/checkbox), an i18n layer (key-based labels throughout),
actslib (`IFilterDefinition`, `IFilterCondition`, `FilterOperation`,
`FilterUtility`, `EnumLike`).

---

## 1. Purpose & scope

One project-wide dialog for defining list-page filters as a **condition tree**
(SQL-WHERE shape: leaves = property conditions, inner nodes = AND/OR joins).
The dialog is configured per page with a **property schema** whose operator set
derives from actslib's filter semantics; its seed and result are
actslib-native (`IFilterDefinition`), so pages store, translate-free, and
evaluate exactly what the dialog returns.

Name it "Filter Dialog" (not "filter *options* dialog") to avoid a collision
with exercise/settings options dialogs, which configure options, not filters.

### Goals

1. **actslib-driven operators.** Each property's allowed operations are derived
   from actslib (`FilterOperation` + the per-kind support matrix) and narrowed
   by a per-page whitelist. Two special editor cases:
   - **enum properties** render their value editor as a **multiple-choice list**
     (checkboxes), compiled to actslib conditions on Submit (§6.3);
   - **`Between`** renders **two inputs** (low + high) (§6.2).
2. **mat-tree + detail-pane design**: tree navigator (left), editor for the
   selected node (right), draggable splitter, insert/delete toolbar, live
   expression preview, Submit gated by validation.

### Non-goals

- The **free-text search box** stays on each page's filter bar (hand-written
  cross-field matching; never enters the dialog) — but its *behavior* is
  standardized by this spec: it is a **live pre-filter**, applied immediately
  as the user types (§7.1). Only the predicate itself (which fields, how)
  remains per page.
- **Where the evaluated values come from** (row fields, computed or per-user
  fields) is the page's concern — pages evaluate against a synthesized target
  object handed to `FilterUtility.MatchFilter`.
- No negation / NOT groups: actslib `FilterUtility` cannot express them.
- No persistence of filter presets (in-memory per page).

---

## 2. Design decisions at a glance

| # | Decision | Rationale |
|---|---|---|
| D1 | Seed + result are **actslib `IFilterDefinition`** | Pages already evaluate it (`FilterUtility.MatchFilter`); no page-specific dialog model and no model ↔ definition translation. The dialog is generic precisely because its I/O is the evaluator's language. |
| D2 | **Property schema** passed via `MAT_DIALOG_DATA`, operators defaulted per kind from actslib's matrix, narrowed by whitelist | "allowed options per property" without every page re-listing `>`/`>=`/…; the whitelist still controls what's *offered* (e.g. a rating property may offer only `=`). |
| D3 | Enum multi-select compiles to **one leaf that emits an OR-of-`Equal` group**; seeds fold back | actslib has no `In` operation; OR-of-equals is the only faithful encoding, and `enumValues` per condition keeps actslib's enum validation. Fold-back keeps round-trips editable (§6.3). |
| D4 | Valueless custom operators via a **`customOperators` hook** (`emit` + `recognize`) | App-specific semantics actslib can't express (e.g. "is a multi-word phrase" → `Contains ' '`) are supplied by the page; the hook keeps the dialog reusable without hardcoding domain knowledge (§6.4). |
| D5 | Editor-state pattern: numeric-id nodes, **reference `trackBy`**, **id `expansionKey`**, all edits **immutable through the root signal** | These are load-bearing CDK facts, not style choices (see §5.3). Encoding them in the shared component prevents per-page reintroduction of the associated stale-view bugs. |
| D6 | `prepareValue?` hook per property for case-folding / trimming | actslib string comparison is case-sensitive; the page lowercases folded *target* fields, the hook folds *condition* values at emit time. Keeping the hook on the property lets the page decide match semantics while the dialog stays content-agnostic (§7). |
| D7 | Validation lives in the dialog model: blank/missing values and non-branching nested groups block Submit; root exempt | Keeps `emitTree` total — no silent pruning of empty groups on Submit; the "empty group would match everything" hazard is blocked at the gate. |

---

## 3. Component structure

```
shared/filter-dialog/
├── index.ts                          # public surface barrel
├── filter-dialog.component.ts        # dialog shell (MAT_DIALOG_DATA consumer)
├── filter-dialog.component.html      # mat-tree + splitter + detail pane
├── filter-dialog.component.scss
├── filter-dialog.component.spec.ts   # DOM tests
├── filter-dialog-model.ts            # editor types + ALL pure logic (seed,
│                                     # mutate, validation, emit, summarize)
└── filter-dialog-model.spec.ts       # pure-function tests (no Angular)
```

- Standalone component, `ChangeDetectionStrategy.OnPush`.
- **All tree logic lives in the model file as pure functions over plain
  objects.** The component is thin: hold the `root`/`selectedId` signals, call
  model functions, wire the template. The interesting logic is then testable
  without `TestBed` and reusable for a future flat-mode variant.
- Imports: `MatTree`/`MatNestedTreeNode`/`MatTreeNodeDef`/`MatTreeNodeOutlet`,
  `FormsModule`, Material form fields/select/checkbox-list, the i18n module.

---

## 4. Public contract

```ts
import type { EnumLike, FilterOperation } from 'actslib';
import type { IFilterCondition, IFilterDefinition } from 'actslib';

/** What kind of values a property carries. Drives the default operator list
 *  (§5.1), the value editor (§6), and the seed/emit dispatch. */
export type FilterPropertyKind = 'string' | 'number' | 'date' | 'enum';

/** One choice of an enum property's multiple-choice editor. */
export interface FilterEnumChoice {
  value: string | number;
  labelKey: string;          // i18n key, translated by the dialog
}

/** A valueless, app-specific operator. The page supplies the actslib
 *  encoding and the fold-back recognizer. */
export interface FilterCustomOperator {
  /** editor-local id, never crosses the dialog boundary */
  id: string;
  labelKey: string;
  /** actslib condition this operator emits on Submit */
  emit(property: string): IFilterCondition;
  /** true when `condition` is one of this operator's emissions (seed fold-back) */
  recognize(condition: IFilterCondition): boolean;
}

/** One filterable property of the page's target shape. */
export interface FilterableProperty {
  /** actslib condition property name (matched against the evaluated target) */
  key: string;
  labelKey: string;
  kind: FilterPropertyKind;
  /** offered operators; default = per-kind actslib set (§5.1), ∩ when given. */
  operations?: FilterOperation[];
  /** kind 'enum': actslib enum validation, passed through to each condition. */
  enumValues?: EnumLike;
  /** kind 'enum': choices rendered as the multiple-value editor (§6.3). */
  choices?: FilterEnumChoice[];
  /** valueless operators appended to the operator select (§6.4). */
  customOperators?: FilterCustomOperator[];
  /** number/date editors: input constraints (ui only; not enforced on text input). */
  numberRange?: { min?: number; max?: number };
  /** transforms the raw editor value before it is emitted (D6: trim + lowercase). */
  prepareValue?: (value: string | number) => string | number;
}

export interface FilterDialogData {
  properties: FilterableProperty[];
  /** seed = the filter currently in effect; empty/undefined starts blank */
  root?: IFilterDefinition;
  /** deepest group level the toolbar offers; default 4 */
  maxDepth?: number;
  /** dialog title key; default 'editFilter' (namespaced per host project) */
  titleKey?: string;
}

export interface FilterDialogResult {
  root: IFilterDefinition;
}
```

The **uniform close contract**: Submit → `{ root }`;
Cancel/backdrop/Esc → `undefined` (caller leaves state untouched).

The host page applies the emitted filter **only on this close event** — the
structured filter is never applied live while the dialog is open (§7.2).

### 4.1 Operator derivation from actslib

actslib's support matrix (`FilterUtility` docs + `MatchCondition` behavior):

| kind | default operators (actslib order) |
|---|---|
| `string` | `BeginsWith`, `Contains`, `Equal`, `EndsWith`, `>` `>=` `<` `<=` (lexicographic), `Between` |
| `number` | `>`, `>=`, `=`, `<=`, `<`, `Between` |
| `date`   | same as `number` (actslib detects dates at runtime) |
| `enum`   | `Equal` only at the *leaf* level (multi-choice compiles to OR-of-`Equal`; §6.3) |

Rules:

- The dialog offers `customOperators` **in addition** to the
  (whitelist-narrowed) default list — `hasValue: false` by definition (they
  encode the value).
- Ordering follows the table above (familiar → exotic); pages that care pass
  an explicit `operations` list, which also fixes order.
- A property whose effective operator list is empty is a schema bug: dev-mode
  `console.warn`, property skipped in the select.

### 4.2 Example schema (one property per kind)

```ts
const EXAMPLE_FILTER_PROPERTIES: FilterableProperty[] = [
  { key: 'title', labelKey: 'docList.title', kind: 'string',
    operations: [BeginsWith, Contains, Equal, EndsWith],
    customOperators: [IS_MULTIWORD],       // emit: Contains ' '; recognize: op=Contains && lowValue=' '
    prepareValue: v => String(v).trim().toLowerCase() },
  { key: 'status', labelKey: 'docList.status', kind: 'enum',
    enumValues: DocumentStatusEnum,
    choices: [/* one FilterEnumChoice per enum member, label translated */] },
  { key: 'score', labelKey: 'docList.score', kind: 'number',
    operations: [GreaterThan, LargerOrEquals, Equal, LessOrEquals, LessThan, Between],
    numberRange: { min: 0, max: 5 } },
  { key: 'createdAt', labelKey: 'docList.created', kind: 'date' },
];
```

Property `key`s must match the fields of the object the page later passes to
`FilterUtility.MatchFilter`.

---

## 5. Editor state model

### 5.1 Types

```ts
/** One editable leaf. All value kinds COEXIST: switching property/operator
 *  never loses input, and the template only shows the controls the current
 *  dispatch selects. */
export interface SharedFilterDialogLeaf {
  id: number;
  propertyKey: string;
  /** a FilterOperation value, or a customOperator id */
  operator: string;
  textValue: string;                       // string editor
  numberValue: number | null;              // number/date single-value editor
  lowValue: number | null;                 // Between bounds
  highValue: number | null;
  selectedChoices: (string | number)[];    // enum editor (§6.3)
}

export interface SharedFilterDialogNode {
  id: number;
  join: FilterJoinType;
  members: Array<SharedFilterDialogLeaf | SharedFilterDialogNode>;
}
```

### 5.2 Pure functions in the model file

| function | role |
|---|---|
| `seedTree(def: IFilterDefinition \| undefined, schema): SharedFilterDialogNode` | copy-in: conditions → leaves (fold-back: custom `recognize`, Between, enum OR-of-equals → one multi-choice leaf, single value); nested groups → nodes; **structure preserved at any depth**; never mutates the caller's def |
| `emitTree(root, schema): IFilterDefinition` | Submit output: leaves → conditions/groups (§6 dispatch); drops nothing (validation already guarantees completeness); root may emit `conditions: []` (= match-all = cleared filter) |
| `insertMember / deleteMember / patchNode / patchLeaf` | immutable mutators: every edit returns a new object along the mutation path |
| `emptyLeaf(schema): SharedFilterDialogLeaf` | new row = first property, its first operator, blank values |
| `validateTree(root, schema): ValidationState` | `hasMissingValue` + `invalidGroupIds` (§8) |
| `summarizeFilterDefinition(def, schema, labels): string` | preview + menu label (parenthesized notation, per-group join, choice lists as `a/b/c`, Between as `low ≤ x ≤ high`) |

`patchLeaf` replaces a leaf by id inside its parent (`parentIdOf` +
`members.map`).

### 5.3 The CDK tree invariants (load-bearing — do not "simplify")

These prevent stale-view bugs that are otherwise very easy to reintroduce; the
shared component must carry them verbatim:

1. **`[trackBy]` = object reference** (`(_i, m) => m`). CdkTree's nested nodes
   read their children *once* at view creation; its differ defaults trackBy to
   the expansion key. An id-keyed differ therefore "keeps" mutated (replaced)
   nodes whose views render stale children forever. Reference keys make every
   immutable replacement re-create the affected views.
2. **`[expansionKey]` = node id** + `[isExpanded]="true"` per
   `mat-nested-tree-node` — always-expanded navigator that survives view
   re-creation (expansion model keyed by id; recreated groups stay open).
3. **Every edit flows through the root signal** (`root.update(...)`); nothing
   mutates editor objects in place. The dialog is OnPush: an in-place write
   (e.g. `[(ngModel)]="leaf.textValue"`) dirties no signal, so tree labels and
   the preview show stale values. All detail-pane bindings are
   `[ngModel]` + `(ngModelChange)` → patch handlers.
4. `treeData = computed(() => [root()])` as `[dataSource]` — one top-level row
   (the root node); member ids are unique editor-local counters.

---

## 6. Value editors (detail pane), by dispatch

The detail pane's **property select** drives everything: picking a property
swaps the operator select contents (per §4.1) and the **value editor** below.
Dispatch table:

| effective editor | condition | controls |
|---|---|---|
| text | `kind: string`, valued operator | `matInput` (single) |
| number | `kind: number`, single-value operator | `matInput type=number` with `numberRange` |
| date | `kind: date`, single-value operator | date input (native `<input type="date">` avoids datepicker adapter providers; `MatDatepicker` + adapter is the alternative if the host project already has one) |
| **between** | any valued kind, `operation = Between` | **two inputs** (low, high) — §6.2 |
| **enum choices** | `kind: enum` (operator fixed to `Equal`) | **multiple-choice checkbox list** — §6.3 |
| custom (valueless) | `operator ∈ customOperators` | none ("this needs no value" hint row) |

### 6.1 State co-location

All value fields live on the leaf (§5.1) and keep their values across switches
(a property→operator→property round-trip must not lose typed text).
`emitTree` reads only the one field the dispatch selects — the others are
discarded.

### 6.2 Between

- Two inputs (`lowValue`, `highValue`); actslib `Between` is **inclusive on
  both bounds** and examines both.
- Validation: both filled; `low <= high` (numeric and date compare; string
  Between compares lexicographically per actslib — allowed, no extra rule).
- Emit: `{ property, operation: Between, lowValue, highValue }` (+
  `enumValues` passthrough if the property has it).
- Seed fold-back: a condition with `operation === Between` populates
  `lowValue`/`highValue` directly (no group involved).

### 6.3 Enum: multiple-choice (the first special case)

The leaf for a `kind: 'enum'` property offers `choices[]` as checkboxes
(`MatSelectionList` + `MatCheckbox` or a checkbox group; label =
`t(labelKey)`); its operator select shows `Equal` (disabled select — operator
is implied by the kind).

**Emit (Submit):**

- 1 value chosen → single condition
  `{ property, operation: Equal, lowValue: v, enumValues }`
- N > 1 values → a nested group
  `{ join: OR, conditions: [ {Equal, v₁, enumValues}, …, {Equal, vₙ, enumValues} ] }`
- 0 values → **invalid** (§8: enum leaf must pick at least one). There is no
  "inactive" escape: an all-empty tree is the way to clear the filter.

Rationale: actslib has no `In` operation; OR-of-`Equal` is the only faithful
encoding of "row's enum value ∈ chosen set", and attaching `enumValues` to
each condition reuses actslib's enum validation (non-members never match).

**Seed fold-back:** when `seedTree` meets an **OR group whose every member is**
`Equal` **on the same enum property**, it collapses it into ONE multi-choice
leaf (values = the `lowValue`s). The fold is deliberately strict (direct
members, all-`Equal`, same property) so hand-built or legacy definitions that
don't match stay editable as an OR group of value-level `Equal` leaves; a lone
`Equal v` on an enum property seeds to the same leaf with `[v]` checked.

A page whose legacy model stores "field + selected values array" maps 1:1 to
the enum leaf — its emit/fold round-trip is lossless for the
`values → OR-of-Equal` shape, and evaluation by `includes` keeps working
against the emitted definition.

### 6.4 Custom (valueless) operators

`FilterCustomOperator.recognize` runs first during seed fold-back, so an
encoded condition (e.g. `Contains ' '`) on a property that declares the
matching custom op folds back into that custom leaf. The `emit()` runs on
Submit. `prepareValue` is *skipped* for custom operators (they own their
value). The recognizer must be unambiguous — a page that also offers literal
`Contains ' '` would lose that distinction; document this as the hook's
contract.

---

## 7. Evaluation contract (page side)

The page's filter bar carries **two independent narrowing mechanisms**, and
they compose with AND (the free-text pre-filter first, then the structured
condition tree — or, server-side, as the query's search parameter plus its
`$filter` fragment):

| mechanism | when it takes effect | lifetime |
|---|---|---|
| free-text input (§7.1) | **immediately on each keystroke** (live pre-filter) | per-keystroke, transient, no dialog |
| structured filter dialog (§7.2) | **when the dialog closes via Submit** | stored in a page signal, survives re-opening (seeded back) |

### 7.1 Free-text input = live pre-filter

The search box is *not* a "commit" control. It must narrow the visible rows as
the user types — no Enter key, no Search button, no deferred commit step. The
raw template binding is the dialog's own invariant-#3 style (§5.3):
`[ngModel]` + `(ngModelChange)` into a page signal, so the change is observable
by the display pipeline:

```html
<input type="text" [ngModel]="searchText()" (ngModelChange)="onSearchInput($event)" ... />
```

```ts
// client-side page (whole list loaded once):
onSearchInput(value: string): void {
  this.searchText.set(value);   // read directly by the displayList computed
  this.pageIndex.set(1);        // pre-filter changed → back to the first page
}
```

Rules:

- **Applies per keystroke.** `ngModelChange` fires on input, paste and clear —
  every path that changes the text re-narrows the table. The old
  Enter/Search-button commit pattern is explicitly superseded; pages should
  not carry a redundant Search button beside a live input.
- **Resets pagination to page 1** on each change, otherwise the user can be
  left on an out-of-range page of the narrowed result set.
- **Case-insensitive cross-field matching** (e.g. "contains in *NativeName* or
  *ChineseName*") is the page's hand-written predicate — the haystack differs
  per page. This is separate from actslib's case-sensitive structured
  conditions; the two never share a matcher.
- **Client-evaluated pages** (selection dialogs, small reference lists): apply
  the predicate directly in the `computed()` that derives the table data —
  filtering is synchronous and free.
- **Server-paginated pages**: per-keystroke *semantics*, coalesced *requests*.
  Keystrokes feed a `Subject` piped through `debounceTime(300)` +
  `distinctUntilChanged()` before the refetch — the visible effect is still
  immediate narrowing, but one network call per typing pause, not per key.
  Because in-flight responses can arrive out of order, the page must carry a
  request sequence token and let only the **latest** request update the list,
  raise an error modal, or clear the spinner.

### 7.2 Structured filter: applied on dialog close (Submit), not on cancel

The dialog works on a **copy** of the current definition (seed); nothing the
user does inside it — adding conditions, editing values, expanding groups —
touches the page state. The filter changes **exactly once, at close**:

- **Submit (OK)** → `afterClosed()` emits `{ root }` → the page stores
  `result.root` as the active filter and refetches/re-derives the list.
  An empty tree is a legitimate Submit and means *match-all* (cleared filter).
- **Cancel / backdrop / Esc** → emits `undefined` → the page leaves the
  previous filter untouched and does not reload. The dialog discards its copy.

There is deliberately no "apply live while open" mode: partial or invalid
condition trees (blank values, half-built groups) would leak into the list
mid-edit, and validation (§8) gates Submit instead.

```ts
onDefineFilter(): void {
  this.dialog.open(SharedFilterDialogComponent, {
    data: { properties: PAGE_FILTER_PROPERTIES, root: this.filterDefinition() },
    width: '880px',
  }).afterClosed().pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(result => {
      // Applied here — and only here. result === undefined → Cancel, keep old.
      if (result) { this.filterDefinition.set(result.root); this.applyCurrentFilter(); }
    });
}
```

The page's matcher is `FilterUtility.MatchFilter(target, definition)` with the
target carrying the evaluated fields — including any **computed or per-user
fields** (the target object is synthesized by the page, so the dialog never
needs to know where a value comes from). `prepareValue` (D6) is invoked by the
dialog at emit time, so the definition the page stores already carries
case-folded string values; fold the target's string fields the same way, one
rule each side.

Server-paginated pages translate the same definition with `toODataFilter()`
into a `$filter` fragment instead of matching in memory; the fragment is
derived **per request** so paging/sorting/search all compose with whatever
filter was last applied at close.

After asynchronous data (e.g. per-user values that arrive after first render)
completes, force re-filtering (e.g. re-assign the table filter string) so the
predicate re-runs against the refreshed targets.

### 7.3 Active-filter indication and record counts

Every page carrying a filter bar shows **whether any narrowing is in effect**,
no matter which mechanism produced it:

```ts
filterActive = computed(() => searchText().trim().length > 0 || hasFilter());
```

- **Bar highlight**: while `filterActive`, the whole `.filter-bar` box gets an
  `filter-bar-on` class — accent border + tinted background + soft focus-ring
  shadow (e.g. `#1890ff` / `#e6f7ff` on the ng-zorro palette). When both
  mechanisms are off (text emptied *and* structured filter cleared) the class
  drops and the bar resets to its neutral look; no manual reset is needed
  since the state is derived, not stored. The structured-filter trigger keeps
  its own per-mechanism cue (`filter-bar-active` bold + summary label).

#### Layout: the filter row

The filter bar and the record-count caption form **one row** directly above
the table — a `.filter-row` flex container (`display: flex; align-items:
center; gap: 8px`) with two children:

```
┌─── .filter-row ──────────────────────────────────────────────────────────┐
│ ┌─ .filter-bar (flex: 1 1 auto; min-width: 0) ──────────┐   N | M        │
│ │ [ search input (grows)  │ Filter ▾ ]                  │  (right end)   │
│ └────────────────────────────────────────────────────────┘               │
└───────────────────────────────────────────────────────────────────────────┘
```

- **The bar occupies the whole row** (`flex: 1 1 auto`): its free-text input
  stretches with the available width instead of the box sitting at its
  natural size. `min-width: 0` keeps the flex item shrinkable below content
  width.
- **Inside the bar, `flex-wrap: nowrap` is load-bearing.** Ant-style text
  inputs carry `width: 100%`; once the bar has a definite (stretched) width,
  the input's *flex base size* equals the bar's whole width, and a *wrapping*
  flex container assigns lines by pre-shrink sizes — the input would claim
  line 1 alone and the Filter trigger would drop to a second row. With
  `nowrap`, shrink runs instead and the input gives up width (down to its
  `min-width`) so the input, divider and trigger always share one row. (A
  shrink-to-fit bar — e.g. inside a page-header actions area — hides this;
  the bug only appears once the bar is stretched.)
- **The `N | M` count sticks to the right end** of the row
  (`flex: 0 0 auto; white-space: nowrap`) — a quiet 12px muted line, never
  wrapping, never pushing into the bar.
- Consequently the filter bar is **not** placed in a page-header actions
  area: on server pages (e.g. the book list) it moved out of
  `nz-page-header-extra` (which now holds only the Create action) into this
  full-width row between header and table. Client-evaluated pages — the
  person / organization list pages and the selection dialogs — render the
  same row above their tables.

#### Count caption semantics

`N | M` — **N** = total records in the table, **M** = records matching the
current pre-filter + filter. Each page derives both from its evaluation
strategy:

- client-evaluated pages (selection dialogs, small lists):
  `N = listAll().length`, `M = displayList().length` — plain computeds,
  always exact;
- server-paginated pages: `M = totalCount()` (the current query's
  `@odata.count`), `N` = one dedicated unfiltered count fetch per visit
  (`fetchBooks(1, 0)` — a 1-row page whose only consumed field is the
  count), adjusted by the local delete handler alongside `M`.

N is deliberately **never** narrowed by the filters — it is the baseline
the highlight and M are read against.

---

## 8. Validation (Submit gate)

`validateTree` returns per-leaf "missing value" flags + `invalidGroupIds`
(nested groups with `< 2` members; **root exempt**: 0 = clear-filter, 1 =
single-condition filter). A leaf is missing its value when the dispatch
selects an input and it is blank (`textValue.trim() === ''`,
`numberValue == null`, any Between bound null,
`selectedChoices.length === 0`), or when Between has `low > high`.

- **Submit button** `[disabled]="!canSubmit()"` where
  `canSubmit = noMissingValue && noInvalidGroups`.
- Offending rows get the invalid class + `error` icon (tree), and the detail
  pane shows the matching hint below the offending control; group hints use a
  shared "a group needs at least two conditions" message key.
- **No silent pruning on Submit**: validation prevents submitting an empty
  group, so `emitTree` is total. `Cancel` still mutates nothing.
- `maxDepth` disables "+ group" at the deepest level (default 4).

---

## 9. UI layout

```
┌───────────────────────────── title: t(titleKey) ─────────────────────────────┐
│ ┌─ tree pane (splitLeft%) ──────┐ │ ┌─ detail pane (rest) ──────────────────┐ │
│ │ [+cond] [+group] [delete]    │ │ │ (group → join select + hint)          │ │
│ │ ─────────────────────────────│ │ │ (leaf  → property select             │ │
│ │ ▾ mat-tree, always expanded  │ │ │          operator select              │ │
│ │   rows: icon + label +       │◄┼►│          value editor per §6)         │ │
│ │   invalid ⚠ icon             │ │ │                                       │ │
│ │   (draggable splitter)       │ │ │                                       │ │
│ └──────────────────────────────┘ │ └───────────────────────────────────────┘ │
│ preview:  <label>  title starts foo AND (status draft/published OR score ≥3)  │
│                                                    [Cancel]  [Submit]         │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Grid `splitLeft% / 8px splitter / 1fr`, 25–65 clamp, pointer + keyboard
  resize, stacked panes below ~720px.
- Tree row label via `summarizeFilterDefinition`'s leaf renderer (`nodeLabel`):
  `"<property> <op> <value>"`, enum leaves `"<property> a/b"`, Between
  `"<property> 2≤x≤4"`, custom `"<property> <opLabel>"`. Render numeric/date
  operators as comparison symbols (`>=`, `<`) to keep phrases compact; word
  labels otherwise.
- **Live preview**: same function, uncapped; menu labels on pages call it with
  their own cap (e.g. 40 chars, ellipsis) — the summarize helper lives in the
  model file so both use one implementation.
- Toolbar: insert condition / insert group (depth-capped) / delete selected.
- Selection & keyboard: click or `(activation)` selects; selection is id-based
  (`selectedId` signal) so immutable replacements don't drop it; root
  preselected.
- Follow the host project's dialog-sizing conventions.

---

## 10. i18n

Every user-visible string is an i18n key supplied/namespaced by the host
project; the dialog takes none of its vocabulary as literals (join words in
summaries included). Required label groups:

- generic: `submit`, `cancel`, `editFilter` (title default), `addCondition`,
  join words (`and`/`or`);
- operator labels for every `FilterOperation` offered
  (`opStartsWith`, `opContains`, `opEqual`, `opEndsWith`, `opGreaterThan`,
  `opLargerOrEquals`, `opLessThan`, `opLessOrEquals`, `opBetween`, …) —
  a tiny `FILTER_OPERATION_LABEL_KEYS: Record<FilterOperation, string>` map
  lives in the model file;
- validation/hint messages: group-needs-two, needs-value, enum-needs-choice,
  custom-op "no value needed";
- preview/detail-empty/splitter aria labels.

Property labels and enum choice labels come from the schema — they are the
page's responsibility, so the dialog adds no domain keys of its own.

---

## 11. Testing strategy

Model spec (pure functions — the bulk of the value):

- seed fold-back: custom-ops, Between, OR-of-`Equal`→multi-choice, mixed
  nesting depth preserved, caller's def never mutated;
- emit: every dispatch row of §6, `prepareValue` applied (incl. skipped for
  custom ops), enum 0/1/N behavior, empty root → `conditions: []`;
- round-trip: `emitTree(seedTree(emitTree(seed))) === emitTree(seed)` for
  representative trees;
- `validateTree` matrix; `summarize` (parens, cap, choice/between rendering).

Component spec (DOM, with the host project's mocked-i18n harness):

- tree refreshes after toolbar inserts/deletes (reference-trackBy guard);
- **join/operator/value edits flow through the signal** — assert
  `root()` identity changed (guards the OnPush staleness class of bug; note
  `fixture.detectChanges()` checks the whole tree and *masks* staleness, so
  the identity assertion is the real guard);
- enum editor renders checkboxes from schema, multi-select emits OR group
  (drive the real DOM), fold-back keeps the checkboxes checked;
- Between shows two inputs, validates low≤high;
- Submit disabled/enabled tracks `validateTree` live; invalid-group ⚠ icon;
- schema dispatch: switching property switches operator list and editor;
- depth cap hides +group; root never deletable; Cancel never mutates.

Host-page specs should cover the §7 contracts too: the pre-filter narrows on a
single `onSearchInput` call (no commit step) and resets the page index; the
structured filter changes only when the close observable emits `{ root }` — an
`undefined` (Cancel) emission keeps the previous definition and triggers no
reload.

Run tests via the host project's standard test command.

---

## 12. Risks & open issues

| risk | mitigation |
|---|---|
| Fold-back ambiguity (`Contains ' '` = custom op or literal space?) | custom-op `recognize` runs first — the page's hook owns the interpretation; documented as its contract (§6.4). |
| Enum OR-of-equals emits groups the "≥2 members" rule could later reject after folding | the *emitted* definition is evaluated, not re-validated; `validateTree` only sees editor leaves. Single-value enums emit bare conditions anyway. |
| `prepareValue` double-folding (page also folds target fields) | one rule each side: page folds target, hook folds condition values — explicit and single-sourced. |
| actslib string ops are case-sensitive | D6: folded at emit; target folded in the predicate — documented per page. |
| `date` kind support | implemented in the dispatch table; actslib detects dates at runtime. Keep the editor case even without an early adopter — the cost is one dispatch row. |
| Per-term free-text search predicate stays hand-written on each page | the *predicate* differs per page, but the *behavior* is standardized: live pre-filter per keystroke with a page-1 reset, debounced + sequence-guarded refetch on server pages (§7.1); the dialog covers only the structured condition part. |

## 13. Explicitly deferred

- Negation (`NOT`) — needs actslib `IFilterDefinition` support first.
- `In` as a first-class actslib operation (would replace the OR-of-equals
  encoding; the leaf model and UI would not change — only `emitTree`).
- Saved filter presets / server-persisted per-user filters.
- A flat (non-tree) "simple mode" for casual users — the tree handles single
  conditions fine (root with one leaf).

---

## Appendix A — a `FilterCustomOperator` example

A "word is a multi-word phrase" operator, encoded as actslib `Contains ' '`:

```ts
const IS_MULTIWORD: FilterCustomOperator = {
  id: 'isMultiword',
  labelKey: 'docList.wordOpIsMultiword',
  emit: property => ({ property, operation: FilterOperation.Contains, lowValue: ' ' }),
  recognize: c =>
    c.operation === FilterOperation.Contains && c.lowValue === ' '
};
```

## Appendix B — what is *not* reusable (stays per page)

1. free-text box + its predicate (each page's haystack differs — e.g.
   multi-term or recursive sub-item search);
2. the evaluated-target synthesis (which row/computed fields go into the
   object `MatchFilter` receives);
3. the property schema itself (that's the configuration);
4. the filter menu label cap and placement.
