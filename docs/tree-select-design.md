# Design: Shared tree-select pickers for hierarchical reference data

Status: as-built documentation (2026-09-23) of the `nz-tree-select` wrappers
introduced on `chroe/keepimprv-4` (2026-09-20), including the adoption audit of
`finance/document` document-create flows and their exceptions.

## 1. Purpose & scope

Transaction types and control centers are two-level hierarchies (category →
child, control center → child). Rendering them as a flat `nz-select` loses the
grouping and produces very long option lists; rendering them through a
selection dialog costs an extra round-trip for a single ID. Both are now picked
through an inline `nz-tree-select` that shows the hierarchy, rebuilds the
familiar dotted-path label (`主业收入.工资`) on the collapsed trigger, and
exposes the picked value as a plain **number ID** through `ControlValueAccessor`
— so a wrapper drops into exactly the template slot the old `nz-select`
(`[nzValue]="tt.Id" [nzLabel]="tt.FullDisplayText"`) used to occupy, under both
`[(ngModel)]` (document item rows) and `formControlName` (document/plan forms).

Out of scope: book categories in `book-detail` / `book-associations` — those
are edited as *inline tree-select rows* (a list of assignments), not a single-ID
picker, so they use `nz-tree-select` directly with the shared tree assembly
below rather than the CVA wrapper.

## 2. Building blocks

| Piece | Location | Role |
|---|---|---|
| `buildFlatTree(rows)` / `dottedPathTitle(node)` | `src/common/flat-tree.ts` | Framework-agnostic assembly of `FlatTreeRow[] { id, parentId, title }` into `NzTreeNode[]`-shaped nodes, and the walk up a selected node's parent chain for the trigger label. No ng-zorro dependency; unit-tested standalone. |
| `hih-trantype-tree-select` | `src/app/shared/trantype-tree-select/` | CVA wrapper; value = transaction type ID. |
| `hih-controlcenter-tree-select` | `src/app/shared/controlcenter-tree-select/` | CVA wrapper; value = control center ID. |

Both wrappers are signal-based from birth (`input()` / `signal()` / `computed()`
+ a `host` listener instead of `@HostListener`), `OnPush`, and own their
hierarchy as a `computed` over the flat dictionary input — so a language switch
that refetches the dictionary rebuilds the tree labels with it.

## 3. Public contract

- **Value:** `number | undefined` — the entity ID. `writeValue` coerces strings
  and nulls; the clear button emits `undefined`.
- **Inputs:** the flat dictionary (`[tranTypes]` / `[controlCenters]`),
  host-level `[disabled]`, and `[allowClear]` (default **false**).
- **Template:** the income/outgoing nodes of the tran-type wrapper render
  through the global `.hih-trantype-node-*` classes in `src/styles.less` —
  global because the dropdown lives in a body-level CDK overlay component
  styles cannot reach. The direction is each node's own `Expense` flag, the
  same marker the report views use to split IN/OUT.

## 4. Load-bearing gotchas (from the 2026-09-20 review)

1. **`touched` does not flow out of `nz-tree-select` on blur.** The inner
   control reports its own CVA touched, but that callback belongs to the inner
   `NgModel` the wrapper template binds — nothing forwards it to the control
   the wrapper exposes. The wrapper therefore listens to the host's
   `(focusout)` and calls `registerOnTouched`'s fn (idempotent; extra calls
   from picks are harmless). In single mode with `nzShowSearch` the search
   input renders inside the trigger, so focus leaving the host subtree *is*
   the blur.
2. **`nzAllowClear` default drift.** `nz-select` defaulted it to false,
   `nz-tree-select` to true — converted fields silently became clearable. The
   wrappers pin the default to **false**; a site opts in explicitly.
3. **CVA callbacks arrive outside this view's change detection.** The
   `writeValue`/`setDisabledState` plain-signal writes do not mark the OnPush
   view when they run mid-tick, so both re-check explicitly (`markForCheck`).

Full findings and verification: `docs/ui-review-2026-09-20.md` §2 and §7.

## 5. As-built adoption audit

### 5.1 `hih-trantype-tree-select`

| Site | Level |
|---|---|
| `document-items` (`hih-fin-document-items`) | per item — embedded by `document-normal-create`, `document-asset-buy-create`, `document-asset-sold-create` via `[arTranType]`, so those three create flows inherit the picker |
| `document-normal-mass-create-item` | per item (inside `document-normal-mass-create`) |
| `document-recurred-mass-create` | doc-level + per item (two placements) |
| `document-downpayment-create` | doc-level |
| `finance/plan/plan-detail` | plan form |

### 5.2 `hih-controlcenter-tree-select`

`account-detail`, `account-hierarchy`, `control-center-detail`,
`finance-asset-deprec` dialog, every `finance/document` create flow
(asset-buy, asset-sold, asset-value-change, downpayment, loan, loan-repay,
transfer, normal, normal-mass, recurred-mass — the last five also through
`document-items` / `document-normal-mass-create-item`), `order-detail`,
`plan-detail`.

### 5.3 Exceptional cases in `finance/document` tran-type selection (audited 2026-09-23)

- **`document-loan-repay-create` — the only genuine exception.** Its item
  tran-type is a plain `nz-select` with two hardcoded options (Repayment of
  Principal / Interest Expense), bound via `[(ngModel)]="data.TranType"` to a
  local `BorrowFromRepayType` enum (1/2) that the TypeScript then maps to
  `financeTranTypeRepaymentIn/Out` / `InterestIn/Out`. It is not even bound to
  finance `TranType` IDs. A two-option domain does not need a tree, so the
  deviation is accepted as-is and grandfathered.
- **No picker at all, by design (not deviations):** `document-transfer-create`
  (hardcodes `TransferOut` / `TransferIn`), `document-loan-create`
  (`LendTo` / `BorrowFrom`), `document-asset-value-change-create`
  (`ValueIncrease` / `ValueDecrease`). These fetch the tran-type list only for
  validation/name lookup, never for selection — the tran type is implied by
  the document type.

### 5.4 Rule going forward

Any document-create flow that lets the user choose a tran type uses the
wrapper; `document-loan-repay-create` is the single grandfathered deviation.
Flows whose tran type is implied by the document type have no picker at all
and are not deviations. New hierarchical single-ID pickers should be built as
CVA wrappers over `@common/flat-tree` following the contract in §3–§4, not as
flat `nz-select` lists or selection dialogs.
