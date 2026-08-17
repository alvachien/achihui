# Library Test Remediation To-Do — 2026-08-15

Actionable, prioritized work list derived from
[`library-tests-review-2026-08-15.md`](./library-tests-review-2026-08-15.md).
Each item names the files to touch and the concrete acceptance assertions. Items
are grouped by wave; within a wave, order is roughly lowest-risk-highest-leverage
first. The reference bar for "a good spec" is `person-detail.component.spec.ts`
and `person-selection-dlg.component.spec.ts`.

Conventions to follow when writing these (already established in the feature):

- Stub services with `createSpyObj` + `asyncData` / `asyncError` from `testing`.
- Stub `ActivatedRoute` with `ActivatedRouteUrlStub` + `UrlSegment` (see
  `person-detail` / `book-detail` specs).
- Always call `fixture.detectChanges()` (do **not** leave it commented).
- Drive async with `await new Promise<void>((r) => setTimeout(r, 0))` between
  `detectChanges` calls — this is the existing pattern.
- Assert on the service spy (`expect(createXxxSpy).toHaveBeenCalled()`), the
  router (`vi.spyOn(routerstub, 'navigate')`), form state
  (`detailFormGroup.valid` / `.value`), and the error modal
  (`overlayContainerElement.querySelectorAll('.ant-modal-body')`).

Legend: **[H]** High · **[M]** Medium · **[L]** Low. Estimate is rough, in
focused hours.

---

## Wave 1 — Make the existing suite honest (mechanical, no behavior change)

These do not add features; they turn misleading tests into real tests or remove
the misleading scaffolding. Lowest risk; do first.

### T1.1  Purge the `btest = false` dead-assertion pattern  **[H]** · ~1h
**Files (15):** `book-detail`, `book-list`, `borrow-record-create-dlg`,
`book-category-list`, `organization-type-list`,
`organization-type-selection-dlg`, `person-role-list`, `location-detail`,
`location-list`, `location-selection-dlg`, `organization-detail`,
`organization-list`, `person-list`, `person-selection-dlg`, `search`.

**Do:** In each `should create` `it`, remove the `const btest = false;
if (btest) { expect(...Spy)... }` block entirely. Leave only
`expect(component).toBeTruthy()` for now (Wave 2/3 replaces it with real
assertions per component). Do not leave the dead `if` — it misleads readers.

**Acceptance:** `grep -r "btest" src/app/pages/library` returns nothing. All
library specs still pass.

### T1.2  Re-enable `fixture.detectChanges()` in shared `beforeEach`  **[H]** · ~1.5h
**Files (6):** `book-detail`, `borrow-record-create-dlg`, `borrow-record-list`,
`person-detail`, `person-selection-dlg`, `search`.

**Do:** Uncomment `fixture.detectChanges()` in each affected spec's
`beforeEach`. **Careful:** `book-detail`, `person-detail`,
`person-selection-dlg` call `detectChanges` inside individual `it`s too —
enabling it in `beforeEach` may double-fire `ngOnInit` or change spy call counts.
For those three, prefer keeping the `beforeEach` commented *only if* moving
detection into `beforeEach` breaks the mode-specific `describe` blocks; otherwise
standardize on `beforeEach` detection and drop the per-`it` duplicate. Re-run
after each file.

**Acceptance:** After re-enabling, the stubbed service spy is actually
subscribed. Every `should create` that previously did nothing now at least
exercises `ngOnInit`. No new failures beyond pre-existing stubs (e.g.
`onAssignTranslator`) — if a failure surfaces, that is a real finding; log it
rather than masking it.

---

## Wave 2 — Lift every list component to "init + render + error"  **[H]**

Pattern target (copy from `borrow-record-list`, generalized). For each list
component, add three `it` blocks.

### T2.1  Book list  **[H]**
**File:** `book-list.component.spec.ts`.  **Component:** `BookListComponent`
(also `fetchBooks` spy — already stubbed).

- `it('calls fetchBooks on init')` → after `detectChanges`,
  `expect(fetchBooksSpy).toHaveBeenCalled()`.
- `it('renders fetched books into the table')` → spy returns
  `asyncData([book1, book2])`; assert `component.dataSet` (or bound list) has
  length 2.
- `it('shows error modal when fetch fails')` → spy returns
  `asyncError('fail')`; assert `overlayContainerElement` has one
  `.ant-modal-body`.

### T2.2  Person list  **[H]** · **T2.3  Organization list**  **[H]** ·
### T2.4  Location list  **[H]**
Mirror T2.1 against `fetchPersons` / `fetchOrganizations` / `fetchLocations`
respectively. Each component exposes a delete action — add a 4th `it`:

- `it('deletes a row and refetches')` → spy `deleteXxx` returns `asyncData({})`;
  call the component's delete handler with an id; assert
  `deleteXxxSpy` called and a refetch occurred.

**Files:** `person-list`, `organization-list`, `location-list` specs.

### T2.5  Config lists (book-category / organization-type / person-role)  **[M]**
Same init + render + error shape against their `fetchAll*` loaders. These are
simpler (reference data, no delete). **[L]** if time-boxed.

### T2.6  Library shell + search page  **[L]**
`library.component.spec.ts` (router-shell) and `search.component.spec.ts`.
Search: assert `fetchAllPersons` on init and that a search term filters the
bound list. Low priority.

---

## Wave 3 — Bring detail components to `person-detail` parity  **[H]**

Standard shape per detail component: `create mode` (init editable + save happy
path + save error), `display mode` (init not editable + form populated), and an
error-modal `describe`. Copy the structure from
`person-detail.component.spec.ts`.

### T3.1  Book detail — fill the gaps  **[H]**
**File:** `book-detail.component.spec.ts` (already has create/display/error).

- **Association result assertions:** `onAssignAuthor()` is called but unasserted
  — after the modal `nzOnOk`, assert `component.listAuthors()` reflects the
  selection (drive via the dialog's `setOfCheckedId` model or by directly
  invoking the `nzOnOk` callback on the created `NzModalRef`).
- **`onRemoveX()` coverage (new code, 2026-08-15):** seed
  `component.listAuthors.set([...])`, call `onRemoveAuthor(id)`, assert the list
  no longer contains it. Same for translator/category/press/location (5 `it`s).
  These are the highest-value additions because they cover code with **zero**
  current coverage.
- **`onAssignTranslator()` stub:** add an `it` that calls
  `onAssignTranslator()` and asserts it currently does **not** mutate
  `listTranslators` — marked `it.skip`/`it.todo` until the stub is implemented,
  so the gap is tracked, not hidden.

### T3.2  Organization detail  **[H]**
**File:** `organization-detail.component.spec.ts` (currently 1 test).
Bring to parity: create / display / error-modal. Note: the existing spec stubs
`readOrganization` to return `of([])` — fix to return a real `Organization`
object for the display-mode test.

### T3.3  Location detail  **[H]**
**File:** `location-detail.component.spec.ts` (currently 1 test; the
`readLocation` spy is *commented out*). Wire `readLocation` and bring to
create / display / error-modal parity.

---

## Wave 4 — Validation & negative testing  **[M]**

### T4.1  Required-field validation  **[M]**
For each detail spec (`book-detail`, `person-detail`, `organization-detail`,
`location-detail`):

- `it('form is invalid when required name is empty')` → leave `nnameControl`
  empty → `expect(detailFormGroup.valid).toBe(false)`.
- `it('onSave does not call create when form invalid')` → empty name → call
  `onSave()` → `expect(createXxxSpy).not.toHaveBeenCalled()`.
- `it('form invalid when name exceeds 100 chars')` → 101-char string → invalid
  (`Validators.maxLength(100)`).

### T4.2  Association-dialog cancel path  **[L]**
Assert that cancelling a selection dialog leaves the corresponding list
unchanged (currently only the OK path is meaningfully exercised, and even that
is unasserted in book-detail).

---

## Wave 5 — Selection dialogs  **[M]**

### T5.1  Bring the other selection-dlg specs to person-selection-dlg parity  **[M]**
`person-selection-dlg` (7 tests) tests `updateCheckedSet` /
`onCurrentPageDataChange` / `onItemChecked` / `onAllChecked` /
`checked`/`indeterminate` computed. The sibling dialogs
(`organization-selection-dlg`, `location-selection-dlg`,
`book-category-selection-dlg`, `organization-type-selection-dlg`,
`person-role-selection-dlg`) are all single `should create`. They share the same
checked-set logic — apply the same 6 assertions to each.

---

## Wave 6 — Cross-cutting correctness the tests should pin down  **[M]**

These are findings the current suite would have caught but doesn't. Add a test
per finding so regressions are locked out.

### T6.1  Pin the `onAssignTranslator` stub  **[M]**
Until implemented, an `it.todo`/`it.skip` documents the gap (see T3.1). When the
stub is implemented, flip it to a real assertion.

### T6.2  Pin the dead `UIMode.Update` save path  **[M]**
`book-detail.onSave()` Update branch is `// Do nothing for now.` and there is no
`edit` route. Add an `it` that sets `uiMode` to Update, calls `onSave()`, and
asserts **no** `updateBook`/`createBook` spy fired — with a `// TODO` once an
update endpoint exists. This makes the gap explicit instead of silent.

### T6.3  Pin the leaking `afterClose` subscriptions  **[L]**
The five `onAssignX()` handlers subscribe to `modal.afterClose` without
`takeUntilDestroyed`. A test cannot directly assert a leak, but a test that
destroys the component mid-dialog and verifies no `afterClose` callback fires
post-destroy would document expected behavior. Low priority; consider fixing
the leak first (it's a one-line `takeUntilDestroyed(this.destroyedRef)` per
handler) and then adding the test.

---

## Sequencing summary

| Wave | Theme | Risk | Est. |
|---|---|---|---|
| 1 | Stop lying (purge `btest`, re-enable `detectChanges`) | Low | ~2.5h |
| 2 | List components: init + render + error + delete | Medium | ~6h |
| 3 | Detail components → `person-detail` parity | Medium | ~6h |
| 4 | Validation / negative testing | Low | ~2h |
| 5 | Selection dialogs → parity | Low | ~2h |
| 6 | Pin known gaps (stubs, dead code, leaks) | Low | ~1.5h |

Wave 1 is the highest leverage and is almost entirely mechanical; it should be
done first and in isolation. Waves 2–3 deliver the real coverage gains. Waves
4–6 harden the edges and lock in known issues.

## Verification after each wave

```bash
cd achihui
npx ng test --watch=false --include='src/app/pages/library/**/*.spec.ts'
npx ng lint
```

Both must pass (exit 0) before a wave is considered done. If a new failure
appears, it is a real regression or a pre-existing bug surfaced by a now-live
test — investigate, do not suppress.
