# Library Tests Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift the `achihui` library feature's component spec suite from vacuous `should create` smoke tests to behavior-level coverage (init → render → error → save → validation), matching the bar set by `person-detail.component.spec.ts` and `person-selection-dlg.component.spec.ts`.

**Architecture:** This is a *test-only* remediation — it changes `.spec.ts` files (and, where a test surfaces a genuine bug, the smallest possible `.ts` fix). No production behavior is added or removed. The suite stays on Vitest via the `@angular/build:unit-test` builder. Each task is scoped to one spec file so every commit is independently green.

**Tech Stack:** Angular 22 · Vitest (via `@angular/build:unit-test`) · NG-ZORRO · `createSpyObj`/`asyncData`/`asyncError` test helpers · `ActivatedRouteUrlStub`.

**Spec:**
- `achihui/docs/library-tests-review-2026-08-15.md` (the diagnosis)
- `achihui/docs/library-tests-todo-2026-08-15.md` (the wave breakdown this plan implements)

---

## Execution Log

- **2026-08-15 — Wave 0 (Task 0):** Baseline established. `npx ng test --watch=false --include='src/app/pages/library/**/*.spec.ts'` → **23 files / 44 tests pass (exit 0)**. `npm run lint` → exit 0. Git is available in `achihui/` (branch `fix/ui-issue`); however, per user instruction **no git operations are performed** — changes are left in the working tree and verified by the test+lint gate only. (Note: the branch carries a large pre-existing *uncommitted* library restructure — standalone-components migration, folder-per-component move, duplicate-folder deletions — which interleaves with these spec edits in the same files. Commits are deferred to the user.)
- **2026-08-15 — Wave 1 Task 1.1:** `btest` dead-assertion pattern purged from all 15 specs (`grep btest src/app/pages/library` now empty). The 11 "assigned-but-unused" spy bindings were prefixed `_` (project lint whitelists `/^_/u`) to preserve spy configuration while marking intentionally-unused; the 4 "defined-but-never-used" spies (`readBookSpy`×3, `readLocationSpy`) were deleted outright, plus the now-orphaned `SafeAny` import in `location-selection-dlg`. Re-verified: **44 tests pass, lint clean.**
- **2026-08-15 — Wave 1 Task 1.2:** Re-enabled `fixture.detectChanges()` in `beforeEach` for the 3 safe files (`borrow-record-list`, `borrow-record-create-dlg`, `search`); left it commented for the 3 mode-switching files (`person-detail`, `person-selection-dlg`, `book-detail`) whose behavior `it`s already drive detection per-`it` (verified). Fixed `borrow-record-list`'s stub `of({})` → valid `BaseListModel`. **Surfaced + fixed a real component bug:** `BorrowRecordCreateDlgComponent` was missing `NzDatePickerModule`/`NzSwitchModule`/`NzInputModule`/`NzTypographyModule`/`NzGridModule` in its standalone `imports` (SC-migration regression → `NG01203` on render); fixed by adding them. Final: **44/44 tests pass, lint clean.**

## Global Constraints

These are **verified facts** about the codebase, confirmed by reading the source on 2026-08-15. Every task assumes them; do not re-derive.

### Test runner & commands
- Builder: `@angular/build:unit-test` (Vitest under the hood). `angular.json` → `test` → `builder`. `vitest.config.ts` sets `include: ['src/**/*.spec.ts']`, `environment: 'jsdom'`, `globals: true`.
- Run **all** tests headless: `npm run test-headless` (= `ng test --watch=false`).
- Run **library only**: `npx ng test --watch=false --include='src/app/pages/library/**/*.spec.ts'`. If `--include` is rejected by the builder, fall back to `npm run test-headless` and read the library block from the summary.
- Lint: `npm run lint` (must exit 0).
- Both must pass before a wave is "done".

### Test helpers (from `src/testing/`)
- `asyncData<T>(data: T)` → `defer(() => Promise.resolve(data))`. Emit-once-then-complete after one JS turn. Drive with `await new Promise<void>(r => setTimeout(r, 0))`.
- `asyncError<T>(err: T)` → `defer(() => Promise.reject(err))`. Errors after one JS turn.
- `createSpyObj<T extends string>(name, methodNames)` → object whose each method is a `vi.fn()` with a Jasmine-style `.and` adapter: `.and.returnValue(x)`, `.and.callFake(fn)`, `.and.throwError(msg)`, `.and.callThrough()` (no-op).
- `ActivatedRouteUrlStub` → has `.setURL(UrlSegment[])` and a `url` observable. Construct with `new ActivatedRouteUrlStub([new UrlSegment('create', {})])`. For display/edit: `.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})])`.
- `FakeDataHelper` → `.buildCurrencies()`, `.buildCurrentUser()`, `.buildChosedHome()`, `.buildPersonRoles()`, etc. Provides `.chosedHome` (with `.Members`), `.personRoles`.
- `getTranslocoModule()` → Transloco test module; import in every `TestBed`.

### Import conventions
**Match whatever import style the spec file already uses — do not rewrite imports.** Two styles coexist:
- Older/relative (e.g. `person-detail` spec): `from '../../../../../testing'`, `from '../../../../services'`, `from '../../../../model'`.
- Newer/bare (e.g. `person-selection-dlg` spec): `from 'testing'`, `from '@services/index'`, `from '@model/index'`, `from '@common/any'` (for `SafeAny`).
Both resolve via `tsconfig` paths. Keep each file consistent with itself.

### Async pattern (mandatory)
```ts
fixture.detectChanges();
await new Promise<void>((r) => setTimeout(r, 0));
fixture.detectChanges();
await new Promise<void>((r) => setTimeout(r, 0));
fixture.detectChanges();
```
Repeat the `setTimeout(0)` flush between each `detectChanges` until observables settle. This is the established pattern — never use `fakeAsync`/`tick` (the helpers' comments say it breaks TestBed).

### Error-modal assertion pattern
```ts
// in a describe block with its own beforeEach:
let overlayContainer: OverlayContainer;
let overlayContainerElement: HTMLElement;
beforeEach(() => {
  const oc: OverlayContainer = TestBed.inject(OverlayContainer);
  overlayContainer = oc;
  overlayContainerElement = oc.getContainerElement();
});
afterEach(() => { overlayContainer.ngOnDestroy(); });
// assert:
expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
```
`NzModalService.error(...)` and `.confirm(...)` both render into the overlay container, so this catches fetch-error modals and confirm dialogs alike.

### `LibraryStorageService` method surface (verified signatures)
```
fetchAllPersonRoles(forceReload?)        : Observable<PersonRole[]>
fetchAllOrganizationTypes(forceReload?)  : Observable<OrganizationType[]>
fetchAllBookCategories(forceReload?)     : Observable<BookCategory[]>
fetchAllPersons(forceReload?)           : Observable<Person[]>
fetchAllOrganizations(forceReload?)      : Observable<Organization[]>
fetchAllLocations(forceReload?)          : Observable<Location[]>
fetchBooks(pageSize, offset)             : Observable<BaseListModel<Book>>   // { totalCount, contentList }
fetchBookBorrowRecords(pageSize, offset) : Observable<BaseListModel<BookBorrowRecord>>
readPerson(pid)      : Observable<Person>
readOrganization(pid) : Observable<Organization>
readLocation(lid)    : Observable<Location>
readBook(bid)        : Observable<Book>
createPerson(obj)     : Observable<Person>
createOrganization(obj): Observable<Organization>
createLocation(obj)   : Observable<Location>
createBook(obj)       : Observable<Book>
deletePerson(pid) / deleteOrganization(pid) / deleteLocation(pid) / deleteBook(bid) / deleteBookBorrowRecord(bid) : Observable<any>
```
Also: cached **getter properties** (not methods) on the service: `.Persons`, `.Organizations`, `.BookCategories`, `.Locations`. The book-detail `onAssignX()` handlers read these — to test the OK path, seed these getters.

### Per-component verified facts
**List components** (property holding rows / fetch method / delete handler / delete service call):

| Component | Rows signal | Fetch (ngOnInit→loadDataFromServer) | Delete handler | Delete service call |
|---|---|---|---|---|
| `BookListComponent` | `listData = signal<Book[]>` (+`totalCount`, `isLoadingResults`) | `fetchBooks(pageSize, offset)` | `onDelete(bid)` (via `modal.confirm`) | `deleteBook(bid)` then `listData.update(filter)` |
| `PersonListComponent` | `dataSet = signal<Person[]>` | `fetchAllPersons()` | `onDelete(pid)` | `deletePerson(pid)` |
| `OrganizationListComponent` | `dataSet = signal<Organization[]>` | `fetchAllOrganizations()` | `onDelete(pid)` | `deleteOrganization(pid)` |
| `LocationListComponent` | `dataSet = signal<Location[]>` | `fetchAllLocations()` | `onDelete(pid)` | `deleteLocation(pid)` |
| `BookCategoryListComponent` | `dataSet = signal<BookCategory[]>` | `fetchAllBookCategories()` | — (reference data) | — |
| `OrganizationTypeListComponent` | `dataSet = signal<OrganizationType[]>` | `fetchAllOrganizationTypes()` | — | — |
| `PersonRoleListComponent` | `dataSet = signal<PersonRole[]>` | `fetchAllPersonRoles()` | — | — |
| `BorrowRecordListComponent` | `dataSet = signal<BookBorrowRecord[]>` (+`totalCount`) | `forkJoin([fetchAllOrganizationTypes(), fetchBookBorrowRecords(pageSize, offset)])` | `onDelete(bid)` | `deleteBookBorrowRecord(bid)` |

> **⚠ Signals are functions.** Assert row counts as `component.dataSet().length` / `component.listData().length` — **call the signal**. The existing `borrow-record-list` spec writes `component.dataSet.length`, which reads the *function's arity* (always 0), so its "zero-rows" test passes vacuously for the wrong reason. Task 2.0 fixes this.

**Detail components** (form group, controls + validators, save path, init fetch):

| Component | Form group | Controls (validators) | `isEditable` | Create-mode init | Save Create | Save Update |
|---|---|---|---|---|---|---|
| `PersonDetailComponent` | `detailFormGroup` | `nnameControl`(required), `detailControl` | getter | `fetchAllPersonRoles()` | `createPerson()` + navigate | (no update impl) |
| `BookDetailComponent` | `detailFormGroup` | `idControl`, `nnameControl`(required,maxLen100), `cnameControl`(maxLen100), `chnIsNativeControl` | getter | `idControl='NEW OBJECT'` | `createBook()` + navigate | `// Do nothing for now.` |
| `OrganizationDetailComponent` | `detailFormGroup` | `nnameControl`(required,maxLen100), `cnameControl`(maxLen100), `chnIsNativeControl` | getter | `fetchAllOrganizationTypes()` | `createOrganization()` + navigate | `objtbo.ID = ...` (no call) |
| `LocationDetailComponent` | `detailFormGroup` | `idControl`, `nameControl`(required,maxLen100), `locTypeControl`(required, default `LocationTypeEnum.PaperBook`), `cmtControl`(maxLen100) | getter | `idControl='NEW OBJECT'` | `createLocation()` + navigate | `// TBD.` |

**Book detail associations (all signals):** `listAuthors`, `listTranslators`, `listPresses`, `listCategories`, `listLocations` (each `signal<T[]>`). Handlers:
- `onAssignAuthor/Press/Category/Location()` — open an `NzModalRef` via `modal.create({...})`; `nzOnOk` reads `storageService.Persons`/`.Organizations`/`.BookCategories`/`.Locations` and `listX.set(filtered)`.
- **`onAssignTranslator()` is a `// TBD.` stub** — body empty.
- `onRemoveAuthor/Translator/Category/Press/Location(id)` — `signal.update(arr => arr.filter(x => x.ID !== id))`. Pure; trivially testable.

**Selection dialogs (checked-set logic):** all define `setOfCheckedId = model<Set<number>>()`, a per-entity current-page signal, `checked`/`indeterminate` computed signals, and `updateCheckedSet(id,bool)` / `onCurrentPageDataChange(list)` / `onItemChecked(id,bool)` / `onAllChecked(bool)`. Per-entity page-signal name:

| Dialog | Current-page signal | Init fetch |
|---|---|---|
| `PersonSelectionDlgComponent` (reference) | `listOfCurrentPagePerson` | `fetchAllPersons()` |
| `OrganizationSelectionDlgComponent` | `listOfOrganizationInCurrentPage` | `fetchAllOrganizations()` |
| `LocationSelectionDlgComponent` | `listOfLocationInCurrentPage` | `fetchAllLocations()` |
| `BookCategorySelectionDlgComponent` | `listOfBookCategoryInCurrentPage` | `fetchAllBookCategories()` |
| **`OrganizationTypeSelectionDlgComponent`** | **NONE — empty stub `class X {}`** | — |
| **`PersonRoleSelectionDlgComponent`** | **NONE — empty stub `class X {}`** | — |

> **⚠ Correction to the to-do doc:** T5.1 assumes all sibling dialogs share the checked-set logic. `OrganizationTypeSelectionDlgComponent` and `PersonRoleSelectionDlgComponent` are **empty placeholder components** with no logic. They cannot be lifted to `person-selection-dlg` parity. Task 5.0 pins them as stubs instead.

### Repository state
- This repo (`hih/`) is **not a git repository** at the top level. Committing is per-sub-project: run `git` commands from `achihui/` if that sub-project is a git repo; otherwise treat a task as "done" when `npm run test-headless` + `npm run lint` pass. **Verify git presence in `achihui/` before Task 1's commit step** and adapt the commit instruction (`git -C achihui ...` vs. `cd achihui && git ...`).

---

## File Structure

All work is under `achihui/src/app/pages/library/`. No new files are created — every task modifies an existing `.spec.ts`. The plan touches these 23 specs (folder-per-component):

```
library/
├── library.component.spec.ts                          (Task 2.6)
├── search/search.component.spec.ts                    (Task 2.6)
├── book/
│   ├── book-list/book-list.component.spec.ts          (Task 2.1)
│   ├── book-detail/book-detail.component.spec.ts       (Task 1.2, 3.1, 4.1, 6.1, 6.2)
│   └── book-associations/book-associations.component.spec.ts  (unchanged — already 4 behavior tests)
├── person/
│   ├── person-list/person-list.component.spec.ts       (Task 2.2, 1.1)
│   └── person-detail/person-detail.component.spec.ts   (Task 1.2 — already good; minor)
├── organization/
│   ├── organization-list/organization-list.component.spec.ts  (Task 2.3, 1.1)
│   └── organization-detail/organization-detail.component.spec.ts (Task 3.2, 4.1)
├── location/
│   ├── location-list/location-list.component.spec.ts   (Task 2.4, 1.1)
│   └── location-detail/location-detail.component.spec.ts       (Task 3.3, 4.1)
├── borrow-record-list/borrow-record-list.component.spec.ts     (Task 1.2, 2.0)
├── borrow-record-create-dlg/borrow-record-create-dlg.component.spec.ts (Task 1.1, 1.2)
├── person-selection-dlg/person-selection-dlg.component.spec.ts (Task 1.1 — already good logic)
├── organization-selection-dlg/organization-selection-dlg.component.spec.ts (Task 5.1, 1.1)
├── location-selection-dlg/location-selection-dlg.component.spec.ts           (Task 5.1, 1.1)
├── config/
│   ├── config.component.spec.ts                        (Task 1.1)
│   ├── book-category-list/book-category-list.component.spec.ts        (Task 2.5, 1.1)
│   ├── organization-type-list/organization-type-list.component.spec.ts (Task 2.5, 1.1)
│   ├── person-role-list/person-role-list.component.spec.ts            (Task 2.5, 1.1)
│   ├── book-category-selection-dlg/book-category-selection-dlg.component.spec.ts (Task 5.1, 1.1)
│   ├── organization-type-selection-dlg/organization-type-selection-dlg.component.spec.ts (Task 5.0)
│   └── person-role-selection-dlg/person-role-selection-dlg.component.spec.ts (Task 5.0)
```

---

## Task 0: Baseline & worktree

**Files:** none (verification only).

- [x] **Step 1: Confirm the current suite passes** (establish the green baseline before any change).

Run (from `achihui/`):
```bash
npx ng test --watch=false --include='src/app/pages/library/**/*.spec.ts'
```
Expected: all library specs pass (exit 0). **Record the passing count** — every later task must not reduce it. If `--include` is rejected, run `npm run test-headless` and note the library block.

- [x] **Step 2: Confirm lint passes.**

Run: `npm run lint`
Expected: exit 0.

- [x] **Step 3: Check git availability for commits.** — *git present in `achihui/`, but no git ops performed per user instruction.*

Run: `cd achihui && git status` (or `git -C achihui status`). If `achihui/` is a git repo, note it; commits use `git -C achihui add ... && git -C achihui commit ...`. If not, skip the commit step in later tasks and rely on the test+lint gate.

---

## Wave 1 — Make the existing suite honest (mechanical, no behavior change)

Goal: remove misleading scaffolding so the suite no longer *appears* to verify contracts it doesn't. Lowest risk; do first and in isolation.

### Task 1.1: Purge the `btest = false` dead-assertion pattern (15 files)

**Files (15 specs):** `book-detail`, `book-list`, `borrow-record-create-dlg`, `book-category-list`, `organization-type-list`, `organization-type-selection-dlg` (only if it contains the pattern; it may be a bare stub — check), `person-role-list`, `location-detail`, `location-list`, `location-selection-dlg`, `organization-detail`, `organization-list`, `person-list`, `person-selection-dlg`, `search`.

Each affected `should create` block looks like:
```ts
it('should create', () => {
  expect(component).toBeTruthy();

  const btest = false;
  if (btest) {
    expect(fetchBooksSpy).toHaveBeenCalled();   // never executes
  }
});
```

- [x] **Step 1: Find every occurrence.**

Run: `grep -rn "btest" src/app/pages/library`
Expected: ~15 hits. Each is inside an `if (btest) { ... }` block within (or near) a `should create` `it`.

- [x] **Step 2: In each file, delete the dead block.**

For each hit, remove the `const btest = false;` line **and** the entire `if (btest) { ... }` block. Leave only:
```ts
it('should create', () => {
  expect(component).toBeTruthy();
});
```
Do this with the editor (exact-match `Edit`), one file at a time. If a file's `should create` is the *only* `it` and it referenced a spy variable only inside the deleted block, also remove the now-unused spy variable declaration to avoid a lint "unused" error — but **only** if lint flags it; otherwise leave it (Wave 2/3 will use that spy).

- [x] **Step 3: Verify no `btest` remains.**

Run: `grep -rn "btest" src/app/pages/library`
Expected: no output.

- [x] **Step 4: Run library tests.** — 44/44 pass (≥ baseline).

- [x] **Step 5: Lint.** — exit 0.

- [ ] **Step 6: Commit.** — *skipped per user instruction (no git ops); change left in working tree.*

### Task 1.2: Re-enable `fixture.detectChanges()` in shared `beforeEach` (6 files) — selectively

**Files (6 specs):** `book-detail`, `borrow-record-create-dlg`, `borrow-record-list`, `person-detail`, `person-selection-dlg`, `search`.

The shared `beforeEach` currently has `//fixture.detectChanges();` commented. With it commented, `ngOnInit` never fires and configured spies are never subscribed — the test only proves the constructor didn't throw.

**Careful (per the to-do):** `book-detail`, `person-detail`, `person-selection-dlg` also call `fixture.detectChanges()` *inside* individual `it`s. Enabling it in `beforeEach` may double-fire `ngOnInit` or change spy call counts. The rule per file:

- **`borrow-record-list`, `borrow-record-create-dlg`, `search`** → uncomment in `beforeEach`. These have no per-`it` duplicate; safe.
- **`person-detail`, `person-selection-dlg`, `book-detail`** → **leave `beforeEach` commented**. Their mode-specific `describe` blocks drive detection per-`it` (they switch `activatedRouteStub.setURL(...)` between modes *before* detection). Moving detection into `beforeEach` would fire `ngOnInit` with the wrong URL. Keep the per-`it` pattern; just make sure each behavior `it` actually calls `fixture.detectChanges()` (some may have it commented too — check).

- [x] **Step 1: For the 3 safe files, uncomment `beforeEach` detection.** — done for `borrow-record-list`, `borrow-record-create-dlg`, `search`. Additionally fixed `borrow-record-list`'s beforeAll stub `of({})` → `of({ totalCount: 0, contentList: [] })` so `ngOnInit` renders a valid empty `BaseListModel` instead of `undefined`.

In `borrow-record-list.component.spec.ts`, `borrow-record-create-dlg.component.spec.ts`, `search.component.spec.ts`, change:
```ts
  beforeEach(() => {
    fixture = TestBed.createComponent(XxxComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });
```
to:
```ts
  beforeEach(() => {
    fixture = TestBed.createComponent(XxxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
```

- [x] **Step 2: For the 3 mode-switching files, leave `beforeEach` commented but verify each behavior `it` calls `detectChanges`.** — verified: `book-detail` (every behavior `it` calls `detectChanges`), `person-detail` (same), `person-selection-dlg` (tests are pure checked-set logic, no `ngOnInit`/render needed). No changes required.

In `person-detail`, `person-selection-dlg`, `book-detail` specs: grep for `it(` blocks that contain no `fixture.detectChanges()` call. Any behavior `it` (not `should create`) lacking it is a live bug in the test — add `fixture.detectChanges();` as its first line. The reference `person-detail` spec already does this in its `describe('create mode')` / `describe('display mode')` / `describe('4. shall display error dialog')` blocks.

- [x] **Step 3: Run tests after EACH file** — done. A real failure surfaced in `borrow-record-create-dlg`: `NG01203: No value accessor for form control name: 'dateRangeControl'`. Root cause = a genuine component bug — `BorrowRecordCreateDlgComponent`'s standalone `@Component.imports` was missing `NzDatePickerModule`, `NzSwitchModule`, `NzInputModule`, `NzTypographyModule`, `NzGridModule` (template uses `nz-range-picker`, `nz-switch`, `nz-input`, `nz-typography`, `nz-row`/`nz-col` — a regression from the SC migration). **Fixed** by adding those five modules to the component's `imports` (production fix, surfaced by the now-live test) rather than reverting `detectChanges` or `it.todo`-ing. Re-run: **44/44 pass.**

- [x] **Step 4: Lint.** — `npm run lint` → exit 0.

- [ ] **Step 5: Commit.** — *skipped per user instruction (no git ops); change left in working tree, verified by test+lint gate.*

---

## Wave 2 — Lift every list component to "init + render + error" (+delete)

Pattern target: three `it` blocks per list — (1) fetch spy called on init, (2) fetched rows land in the rows-signal, (3) fetch error opens a modal. List components with a delete action get a 4th: (4) delete handler calls the delete service (via the confirm dialog).

### Task 2.0: Fix the `borrow-record-list` spec's vacuous signal assertion

**Files:** `borrow-record-list/borrow-record-list.component.spec.ts`

The existing "should show data after OnInit" asserts `component.dataSet.length`, but `dataSet` is a **signal** — `.length` is the function's arity (0), so it passes for the wrong reason.

- [ ] **Step 1: Write the corrected assertion (red→green).**

Replace:
```ts
    it('should show data after OnInit', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();

      expect(component.dataSet.length).toEqual(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
```
with:
```ts
    it('should show zero rows when fetch returns empty', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.dataSet().length).toEqual(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should render fetched rows into dataSet', async () => {
      const rec = { ID: 1 } as unknown as BookBorrowRecord;
      fetchBookBorrowRecordsSpy.and.returnValue(
        asyncData({ totalCount: 1, contentList: [rec] }),
      );
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.dataSet().length).toEqual(1);
      expect(component.dataSet()[0].ID).toEqual(1);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
```
(Import `BookBorrowRecord` from the model barrel the spec already uses.)

- [ ] **Step 2: Run — expect the new render test to pass.**

Run: `npx ng test --watch=false --include='src/app/pages/library/borrow-record-list/**/*.spec.ts'`
Expected: pass.

- [ ] **Step 3: Commit.**
```bash
git -C achihui add src/app/pages/library/borrow-record-list
git -C achihui commit -m "test(library): assert borrow-record rows via signal call, not function arity"
```

### Task 2.1: Book list — init + render + error

**File:** `book/book-list/book-list.component.spec.ts`
**Component:** `BookListComponent` — rows signal is **`listData`** (not `dataSet`); `fetchBooks(pageSize, offset)` returns `BaseListModel<Book>` `{ totalCount, contentList }`.

The current spec stubs `fetchBooks`? Check the existing `createSpyObj` method list — it must include `'fetchBooks'` and `'deleteBook'`. If the existing spec only declared `fetchBooks`, add `'deleteBook'` to the `createSpyObj` array in Task 2.1's delete step (Task 2.1 only does the 3 core tests; delete is Task 2.1-optional below).

- [ ] **Step 1: Ensure the spy list includes `fetchBooks`.**

In the spec's `beforeAll`, the `createSpyObj('LibraryStorageService', [...])` array must contain `'fetchBooks'`. If missing, add it. Default its return in `beforeAll`:
```ts
fetchBooksSpy = storageService.fetchBooks.and.returnValue(of({ totalCount: 0, contentList: [] }));
```
(Import `of` from `rxjs` if not already.)

- [ ] **Step 2: Add the three behavior tests** (after the `should create` `it`):

```ts
  describe('list behavior', () => {
    it('calls fetchBooks on init', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(fetchBooksSpy).toHaveBeenCalled();

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('renders fetched books into listData', async () => {
      const b1 = { ID: 1 } as unknown as Book;
      const b2 = { ID: 2 } as unknown as Book;
      fetchBooksSpy.and.returnValue(
        asyncData({ totalCount: 2, contentList: [b1, b2] }),
      );
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.listData().length).toEqual(2);
      expect(component.totalCount()).toEqual(2);

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shows error modal when fetch fails', async () => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      const overlayContainerElement = oc.getContainerElement();
      fetchBooksSpy.and.returnValue(asyncError<string>('fetch failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      oc.ngOnDestroy();

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
```
Add imports at top: `OverlayContainer` from `@angular/cdk/overlay`; `asyncError`, `asyncData` from the testing barrel (match existing import style); `Book` from the model barrel.

- [ ] **Step 3: Run.**

Run: `npx ng test --watch=false --include='src/app/pages/library/book/book-list/**/*.spec.ts'`
Expected: 4 tests pass (`should create` + 3 new).

- [ ] **Step 4: Lint + commit.**
```bash
npm run lint
git -C achihui add src/app/pages/library/book/book-list
git -C achihui commit -m "test(library): book-list init/render/error behavior"
```

### Task 2.2: Person list — init + render + error + delete

**File:** `person/person-list/person-list.component.spec.ts`
**Component:** `PersonListComponent` — rows signal `dataSet = signal<Person[]>`; `fetchAllPersons()`; `onDelete(pid)` → `modal.confirm` → `deletePerson(pid)`.

The delete path is gated behind `NzModalService.confirm({...nzOnOk: () => { deletePerson(pid).subscribe(...) }})`. To exercise it, capture the confirm config and invoke `nzOnOk`.

- [ ] **Step 1: Extend the spy list.**

In `beforeAll`, `createSpyObj('LibraryStorageService', [...])` must include `'fetchAllPersons'` and `'deletePerson'`. Add:
```ts
fetchAllPersonsSpy = storageService.fetchAllPersons.and.returnValue(of([]));
deletePersonSpy = storageService.deletePerson.and.returnValue(asyncData({}));
```
Declare `let fetchAllPersonsSpy: any; let deletePersonSpy: any;` at the top of `describe`.

- [ ] **Step 2: Add the behavior tests.**

```ts
  describe('list behavior', () => {
    it('calls fetchAllPersons on init', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(fetchAllPersonsSpy).toHaveBeenCalled();
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('renders fetched persons into dataSet', async () => {
      const p1 = { ID: 1 } as unknown as Person;
      const p2 = { ID: 2 } as unknown as Person;
      fetchAllPersonsSpy.and.returnValue(asyncData([p1, p2]));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.dataSet().length).toEqual(2);
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shows error modal when fetch fails', async () => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      const el = oc.getContainerElement();
      fetchAllPersonsSpy.and.returnValue(asyncError<string>('fail'));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(el.querySelectorAll('.ant-modal-body').length).toBe(1);
      oc.ngOnDestroy();
      await new Promise<Void>((r) => setTimeout(r, 0));
    });
  });
```
(Fix the `Void` typo to `void` when you paste — `Promise<void>`.)

- [ ] **Step 3: Add the delete test** (confirm-capture pattern):

```ts
    it('calls deletePerson when delete confirm is OK-ed', async () => {
      const modalSvc = TestBed.inject(NzModalService);
      const confirmCfg: { nzOnOk?: () => void } = {};
      vi.spyOn(modalSvc, 'confirm').mockImplementation((cfg: any) => {
        confirmCfg.nzOnOk = cfg.nzOnOk;
        return {} as any;
      });

      component.onDelete(7);              // opens confirm; nzOnOk captured
      expect(confirmCfg.nzOnOk).toBeTruthy();
      confirmCfg.nzOnOk!();              // user clicks OK -> deletePerson subscribes
      await new Promise<void>((r) => setTimeout(r, 0));

      expect(deletePersonSpy).toHaveBeenCalledWith(7);
      vi.restoreAllMocks();
    });
```
This works because `BookListComponent`/`PersonListComponent.onDelete` call `this.modal.confirm({ nzOnOk: () => { ...deleteXxx().subscribe(...) } })`; invoking the captured `nzOnOk` triggers the subscribe.

- [ ] **Step 4: Run + lint + commit.**
```bash
npx ng test --watch=false --include='src/app/pages/library/person/person-list/**/*.spec.ts'
npm run lint
git -C achihui add src/app/pages/library/person/person-list
git -C achihui commit -m "test(library): person-list init/render/error/delete behavior"
```

### Task 2.3: Organization list — init + render + error + delete

**File:** `organization/organization-list/organization-list.component.spec.ts`
**Component:** `OrganizationListComponent` — rows signal `dataSet = signal<Organization[]>`; `fetchAllOrganizations()`; `onDelete(pid)` → `deleteOrganization(pid)`.

This mirrors Task 2.2 exactly with three substitutions: `fetchAllPersons`→`fetchAllOrganizations`, `deletePerson`→`deleteOrganization`, `Person`→`Organization`, `component.dataSet()` stays the same (same property name).

- [ ] **Step 1: Extend spy list** (`fetchAllOrganizations`, `deleteOrganization`):
```ts
fetchAllOrganizationsSpy = storageService.fetchAllOrganizations.and.returnValue(of([]));
deleteOrganizationSpy = storageService.deleteOrganization.and.returnValue(asyncData({}));
```

- [ ] **Step 2: Add the four tests** — copy Task 2.2's four `it` blocks verbatim, applying the three substitutions above. The delete test asserts `deleteOrganizationSpy` `toHaveBeenCalledWith(7)` and captures `nzOnOk` the same way.

- [ ] **Step 3: Run + lint + commit.**
```bash
npx ng test --watch=false --include='src/app/pages/library/organization/organization-list/**/*.spec.ts'
npm run lint
git -C achihui add src/app/pages/library/organization/organization-list
git -C achihui commit -m "test(library): organization-list init/render/error/delete behavior"
```

### Task 2.4: Location list — init + render + error + delete

**File:** `location/location-list/location-list.component.spec.ts`
**Component:** `LocationListComponent` — rows signal `dataSet = signal<Location[]>`; `fetchAllLocations()`; `onDelete(pid)` → `deleteLocation(pid)`.

Mirrors Task 2.2 with substitutions: `fetchAllPersons`→`fetchAllLocations`, `deletePerson`→`deleteLocation`, `Person`→`Location`. `component.dataSet()` unchanged.

- [ ] **Step 1:** Extend spy list (`fetchAllLocations`, `deleteLocation`), default returns.
- [ ] **Step 2:** Add the four tests (Task 2.2 blocks with substitutions). Delete test asserts `deleteLocationSpy` `toHaveBeenCalledWith(7)`.
- [ ] **Step 3:** Run + lint + commit:
```bash
npx ng test --watch=false --include='src/app/pages/library/location/location-list/**/*.spec.ts'
npm run lint
git -C achihui add src/app/pages/library/location/location-list
git -C achihui commit -m "test(library): location-list init/render/error/delete behavior"
```

### Task 2.5: Config lists — init + render + error (no delete)

Three files, each a simpler 3-test shape (reference data, no delete):
- `config/book-category-list/book-category-list.component.spec.ts` — `dataSet = signal<BookCategory[]>`, `fetchAllBookCategories()`.
- `config/organization-type-list/organization-type-list.component.spec.ts` — `dataSet = signal<OrganizationType[]>`, `fetchAllOrganizationTypes()`.
- `config/person-role-list/person-role-list.component.spec.ts` — `dataSet = signal<PersonRole[]>`, `fetchAllPersonRoles()`.

For each file (do them as three separate commits):

- [ ] **Step 1 (book-category-list):** Add spy `fetchAllBookCategories` (default `of([])`). Add these three `it`s inside a `describe('list behavior')`:

```ts
    it('calls fetchAllBookCategories on init', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(fetchAllBookCategoriesSpy).toHaveBeenCalled();
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('renders fetched categories into dataSet', async () => {
      const c1 = { ID: 1 } as unknown as BookCategory;
      fetchAllBookCategoriesSpy.and.returnValue(asyncData([c1]));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.dataSet().length).toEqual(1);
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shows error modal when fetch fails', async () => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      const el = oc.getContainerElement();
      fetchAllBookCategoriesSpy.and.returnValue(asyncError<string>('fail'));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(el.querySelectorAll('.ant-modal-body').length).toBe(1);
      oc.ngOnDestroy();
      await new Promise<void>((r) => setTimeout(r, 0));
    });
```

- [ ] **Step 2:** Run + lint + commit (book-category-list).

- [ ] **Step 3 (organization-type-list):** Same three tests, substitutions `fetchAllBookCategories`→`fetchAllOrganizationTypes`, `BookCategory`→`OrganizationType`. Run + lint + commit.

- [ ] **Step 4 (person-role-list):** Same three tests, substitutions `fetchAllBookCategories`→`fetchAllPersonRoles`, `BookCategory`→`PersonRole`. Run + lint + commit.

Commit messages: `test(library): <name>-list init/render/error behavior` (×3).

### Task 2.6: Library shell + search page (Low)

**Files:** `library.component.spec.ts`, `search/search.component.spec.ts`.

- [ ] **Step 1: Library shell.** `LibraryComponent` is a router-shell. Read `library.component.ts`; if `ngOnInit` does nothing observable (just a router-outlet host), leave its `should create` and add an `it('has router-outlet')` asserting `fixture.debugElement.query(By.css('router-outlet'))` is truthy. If it does call a service, mirror the init+error pattern. Import `By` from `@angular/platform-browser`.

- [ ] **Step 2: Search.** Read `search.component.ts`. Confirm its init service call (likely `fetchAllPersons`). Add: `it('calls fetchAllPersons on init')` and `it('filters results by search term')` — seed `dataSet`/`listData` with two items, set the search term control, call the filter handler, assert the bound list narrows. If the filter logic is unclear or absent, add only the init test and `it.todo('filters by search term')`.

- [ ] **Step 3:** Run + lint + commit: `test(library): shell + search init behavior`.

---

## Wave 3 — Bring detail components to `person-detail` parity

Standard shape per detail component: `create mode` (init editable + save happy path + save error), `display mode` (init not editable + form populated), and an error-modal `describe`. Copy structure from `person-detail.component.spec.ts`.

### Task 3.1: Book detail — association + remove coverage (highest value — new code, zero coverage)

**File:** `book/book-detail/book-detail.component.spec.ts` (already has create/display/error per the review).

- [ ] **Step 1: Add `onRemoveX()` coverage (5 tests, pure signals).**

These handlers are pure `signal.update(filter)` — test directly, no modal, no async:

```ts
  describe('onRemoveX handlers', () => {
    it('onRemoveAuthor removes the matching author', () => {
      component.listAuthors.set([{ ID: 1 } as unknown as Person, { ID: 2 } as unknown as Person]);
      component.onRemoveAuthor(1);
      expect(component.listAuthors().map((p) => p.ID)).toEqual([2]);
    });

    it('onRemoveTranslator removes the matching translator', () => {
      component.listTranslators.set([{ ID: 1 } as unknown as Person, { ID: 2 } as unknown as Person]);
      component.onRemoveTranslator(2);
      expect(component.listTranslators().map((p) => p.ID)).toEqual([1]);
    });

    it('onRemovePress removes the matching press', () => {
      component.listPresses.set([{ ID: 1 } as unknown as Organization, { ID: 2 } as unknown as Organization]);
      component.onRemovePress(1);
      expect(component.listPresses().map((p) => p.ID)).toEqual([2]);
    });

    it('onRemoveCategory removes the matching category', () => {
      component.listCategories.set([{ ID: 1 } as unknown as BookCategory, { ID: 2 } as unknown as BookCategory]);
      component.onRemoveCategory(1);
      expect(component.listCategories().map((c) => c.ID)).toEqual([2]);
    });

    it('onRemoveLocation removes the matching location', () => {
      component.listLocations.set([{ ID: 1 } as unknown as Location, { ID: 2 } as unknown as Location]);
      component.onRemoveLocation(1);
      expect(component.listLocations().map((l) => l.ID)).toEqual([2]);
    });
  });
```
Import `Person`, `Organization`, `BookCategory`, `Location` from the model barrel (match the spec's existing import style).

- [ ] **Step 2: Add `onAssignAuthor` OK-path coverage** (capture `modal.create` config, invoke `nzOnOk`, assert `listAuthors` reflects the selection read from `storageService.Persons`):

```ts
  describe('onAssignAuthor OK path', () => {
    it('sets listAuthors from storageService.Persons on modal OK', () => {
      // Seed the cached getter the handler reads inside nzOnOk
      (storageService as any).Persons = [
        { ID: 1 } as unknown as Person,
        { ID: 2 } as unknown as Person,
      ];
      component.listAuthors.set([{ ID: 2 } as unknown as Person]); // pre-selected

      const modalSvc = TestBed.inject(NzModalService);
      const cfg: { nzOnOk?: () => void } = {};
      vi.spyOn(modalSvc, 'create').mockImplementation((c: any) => {
        cfg.nzOnOk = c.nzOnOk;
        return {} as any;
      });

      component.onAssignAuthor();
      cfg.nzOnOk!();   // user clicks OK; setPerson={2}; reads Persons -> [Person#2]

      expect(component.listAuthors().map((p) => p.ID)).toEqual([2]);
      vi.restoreAllMocks();
    });
  });
```

- [ ] **Step 3: Pin the `onAssignTranslator` stub** as `it.todo`:

```ts
  // TODO: onAssignTranslator() is a `// TBD.` stub in book-detail.component.ts.
  it.todo('onAssignTranslator populates listTranslators (stub: not yet implemented)');
```

- [ ] **Step 4: Run + lint + commit.**
```bash
npx ng test --watch=false --include='src/app/pages/library/book/book-detail/**/*.spec.ts'
npm run lint
git -C achihui add src/app/pages/library/book/book-detail
git -C achihui commit -m "test(library): book-detail onRemove/onAssign handlers + translator stub pin"
```

### Task 3.2: Organization detail — create / display / error parity

**File:** `organization/organization-detail/organization-detail.component.spec.ts` (currently 1 test).
**Component:** `OrganizationDetailComponent` — `detailFormGroup` (`nnameControl` required+maxLen100, `cnameControl`, `chnIsNativeControl`, `idControl`); Create-mode init calls `fetchAllOrganizationTypes()`; Display/Update calls `forkJoin([fetchAllOrganizationTypes(), readOrganization(id)])`; `onSave()` Create → `createOrganization()` + navigate.

- [ ] **Step 1: Extend spies.** `createSpyObj('LibraryStorageService', ['fetchAllOrganizationTypes', 'readOrganization', 'createOrganization'])`. Defaults:
```ts
fetchAllOrganizationTypesSpy = storageService.fetchAllOrganizationTypes.and.returnValue(of([]));
readOrganizationSpy = storageService.readOrganization.and.returnValue(of({}));
createOrganizationSpy = storageService.createOrganization.and.returnValue(of({}));
```

- [ ] **Step 2: Add `describe('create mode')`** (mirror `person-detail`):

```ts
  describe('create mode', () => {
    beforeEach(() => {
      activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})]);
      fetchAllOrganizationTypesSpy.and.returnValue(asyncData([]));
      createOrganizationSpy.and.returnValue(asyncData({ ID: 5 } as unknown as Organization));
    });

    it('create mode init is editable', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.isEditable).toBe(true);
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('create with valid name saves and navigates', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('Acme');
      component.detailFormGroup.markAsDirty();
      expect(component.detailFormGroup.valid).toBe(true);

      component.onSave();
      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(createOrganizationSpy).toHaveBeenCalled();
      expect(routerstub.navigate).toHaveBeenCalled();
      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
```
Note: `activatedRouteStub` must be provided as `{ provide: ActivatedRoute, useValue: activatedRouteStub }` and re-set per mode (as `person-detail` does). If the existing spec's `beforeEach` recreates the stub, restructure so each `describe` sets its URL before compile or via `setURL` — copy `person-detail`'s approach (stub created in `beforeEach`, `setURL` inside each `describe`'s `beforeEach`).

- [ ] **Step 3: Add `describe('display mode')`:**

```ts
  describe('display mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('3', {})]);
      const org = { ID: 3, NativeName: 'Acme', ChineseName: '', ChineseIsNative: false, Types: [] } as unknown as Organization;
      fetchAllOrganizationTypesSpy.and.returnValue(asyncData([]));
      readOrganizationSpy.and.returnValue(asyncData(org));
    });

    it('display mode init is not editable and form is populated', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.isEditable).toBe(false);
      expect(component.detailFormGroup.get('nnameControl')?.value).toEqual('Acme');
      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
```

- [ ] **Step 4: Add error-modal `describe`** (mirror `person-detail`'s "4. shall display error dialog"): make `fetchAllOrganizationTypes` return `asyncError('fail')` in Create mode, detectChanges, assert `.ant-modal-body` length 1.

- [ ] **Step 5: Run + lint + commit.**
```bash
npx ng test --watch=false --include='src/app/pages/library/organization/organization-detail/**/*.spec.ts'
npm run lint
git -C achihui add src/app/pages/library/organization/organization-detail
git -C achihui commit -m "test(library): organization-detail create/display/error parity"
```

### Task 3.3: Location detail — create / display / error parity

**File:** `location/location-detail/location-detail.component.spec.ts` (currently 1 test; `readLocation` spy is commented out per the review).
**Component:** `LocationDetailComponent` — `detailFormGroup` (`nameControl` required+maxLen100, `locTypeControl` required default `LocationTypeEnum.PaperBook`, `cmtControl`, `idControl`); Display/Update → `readLocation(id)`; Create → `idControl='NEW OBJECT'`; `onSave()` Create → `createLocation()` + navigate.

- [ ] **Step 1: Wire `readLocation` spy.** `createSpyObj('LibraryStorageService', ['readLocation', 'createLocation'])` (no `fetchAll*` — location detail Create-mode doesn't fetch a list). Defaults:
```ts
readLocationSpy = storageService.readLocation.and.returnValue(of({}));
createLocationSpy = storageService.createLocation.and.returnValue(of({}));
```
Uncomment/repair the commented `readLocation` wiring.

- [ ] **Step 2: Add `describe('create mode')`:**

```ts
  describe('create mode', () => {
    beforeEach(() => {
      activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})]);
      createLocationSpy.and.returnValue(asyncData({ ID: 9 } as unknown as Location));
    });

    it('create mode init is editable', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(component.isEditable).toBe(true);
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('create with valid name saves and navigates', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nameControl')?.setValue('Shelf A');
      component.detailFormGroup.markAsDirty();
      expect(component.detailFormGroup.valid).toBe(true);

      component.onSave();
      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(createLocationSpy).toHaveBeenCalled();
      expect(routerstub.navigate).toHaveBeenCalled();
      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
```

- [ ] **Step 3: Add `describe('display mode')`:**

```ts
  describe('display mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('4', {})]);
      const loc = { ID: 4, Name: 'Shelf A', Comment: '', LocType: LocationTypeEnum.PaperBook } as unknown as Location;
      readLocationSpy.and.returnValue(asyncData(loc));
    });

    it('display mode init is not editable and form populated', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.isEditable).toBe(false);
      expect(component.detailFormGroup.get('nameControl')?.value).toEqual('Shelf A');
      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
```
Import `LocationTypeEnum` from the model barrel.

- [ ] **Step 4: Add error-modal `describe`** — `readLocationSpy.and.returnValue(asyncError('fail'))` in display mode; assert `.ant-modal-body` length 1.

- [ ] **Step 5: Run + lint + commit.**
```bash
npx ng test --watch=false --include='src/app/pages/library/location/location-detail/**/*.spec.ts'
npm run lint
git -C achihui add src/app/pages/library/location/location-detail
git -C achihui commit -m "test(library): location-detail create/display/error parity"
```

---

## Wave 4 — Validation & negative testing

### Task 4.1: Required-field validation across detail specs

**Files:** `book-detail`, `person-detail`, `organization-detail`, `location-detail` specs.

For each detail spec, add (inside `describe('create mode')` or a new `describe('validation')`):

```ts
    it('form is invalid when required name is empty', async () => {
      fixture.detectChanges();
      await new Promise<void>((r => setTimeout(r, 0)));
      fixture.detectChanges();

      component.detailFormGroup.get('<nameCtrl>')?.setValue('');
      expect(component.detailFormGroup.valid).toBe(false);
      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('onSave does not call create when form invalid', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('<nameCtrl>')?.setValue('');
      component.onSave();
      expect(<createSpy>).not.toHaveBeenCalled();
      await new Promise<void>(r => setTimeout(r, 0));
    });

    it('form invalid when name exceeds 100 chars', async () => {
      fixture.detectChanges();
      await new Promise<void>(r => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('<nameCtrl>')?.setValue('x'.repeat(101));
      expect(component.detailFormGroup.valid).toBe(false);
      await new Promise<void>(r => setTimeout(r, 0));
    });
```

Per-file substitutions (the required name control + create spy name):

| Spec | `<nameCtrl>` | `<createSpy>` |
|---|---|---|
| `book-detail` | `nnameControl` | `createBookSpy` |
| `person-detail` | `nnameControl` | `createPersonSpy` |
| `organization-detail` | `nnameControl` | `createOrganizationSpy` |
| `location-detail` | `nameControl` | `createLocationSpy` |

- [ ] **Step 1:** Add the three validation `it`s to `book-detail`. The `createBook` spy must be declared (it already is, per the review). Run + commit: `test(library): book-detail required-field validation`.
- [ ] **Step 2:** Same for `person-detail` (`createPersonSpy` — declared). Run + commit.
- [ ] **Step 3:** Same for `organization-detail` (`createOrganizationSpy` — declared in Task 3.2). Run + commit.
- [ ] **Step 4:** Same for `location-detail` (`createLocationSpy` — declared in Task 3.3; `nameControl` has `maxLength(100)` so the 101-char test applies; `locTypeControl` is also required but leave it default). Run + commit.

### Task 4.2: Association-dialog cancel path (Low)

**File:** `book-detail` spec.

- [ ] **Step 1:** Add an `it` that calls `component.onAssignAuthor()` with the `modal.create` spy capturing `nzOnCancel` (instead of `nzOnOk`), invokes `nzOnCancel`, and asserts `component.listAuthors()` is unchanged from its pre-call value. Mirror Task 3.1 Step 2's capture pattern.

- [ ] **Step 2:** Run + commit: `test(library): book-detail association dialog cancel leaves list unchanged`.

---

## Wave 5 — Selection dialogs

### Task 5.0: Pin the two empty stub dialogs (correction to the to-do doc)

**Files:** `config/organization-type-selection-dlg/*.spec.ts`, `config/person-role-selection-dlg/*.spec.ts`.

These components are **empty `class X {}`** — no checked-set logic. They cannot be lifted to `person-selection-dlg` parity.

- [ ] **Step 1:** In each spec, replace the `btest`/smoke body with:
```ts
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TODO: OrganizationTypeSelectionDlgComponent is an empty stub (no checked-set logic).
  // When it is implemented to mirror PersonSelectionDlgComponent, port the 6 tests from
  // person-selection-dlg.component.spec.ts (updateCheckedSet/onCurrentPageDataChange/
  // onItemChecked/onAllChecked + checked/indeterminate).
  it.todo('checked-set logic (component is currently an empty stub)');
```
(Adjust the component name + TODO text per file.)

- [ ] **Step 2:** Run + lint + commit: `test(library): pin organization-type/person-role selection-dlg stubs`.

### Task 5.1: Lift the three real sibling dialogs to `person-selection-dlg` parity

**Files:** `organization-selection-dlg`, `location-selection-dlg`, `config/book-category-selection-dlg` specs.

Each dialog shares the `person-selection-dlg` logic; only the current-page signal name differs. From `person-selection-dlg.component.spec.ts`, the six assertions are (adapt the entity type + signal name):

```ts
  it('should add id to set when checked is true', () => {
    component.setOfCheckedId.set(new Set());
    component.updateCheckedSet(1, true);
    expect(component.setOfCheckedId().has(1)).toBe(true);
  });

  it('should remove id from set when checked is false', () => {
    component.setOfCheckedId.set(new Set([1, 2]));
    component.updateCheckedSet(1, false);
    expect(component.setOfCheckedId().has(1)).toBe(false);
  });

  it('should refresh checked status on current page data change', () => {
    component.setOfCheckedId.set(new Set());
    component.<pageSignal>.set(mockEntities);
    component.onCurrentPageDataChange(mockEntities);
    expect(component.checked()).toBe(false);
  });

  it('should call updateCheckedSet on item checked', () => {
    vi.spyOn(component, 'updateCheckedSet');
    component.onItemChecked(1, true);
    expect(component.updateCheckedSet).toHaveBeenCalledWith(1, true);
  });

  it('should check all items on all checked', () => {
    component.setOfCheckedId.set(new Set());
    component.<pageSignal>.set(mockEntities);
    component.onAllChecked(true);
    expect(component.setOfCheckedId().size).toBe(<n>);
    expect(component.checked()).toBe(true);
  });

  it('should uncheck all items on all unchecked', () => {
    component.setOfCheckedId.set(new Set([1, 2]));
    component.<pageSignal>.set(mockEntities);
    component.onAllChecked(false);
    expect(component.setOfCheckedId().size).toBe(0);
  });
```

Per-dialog substitutions (`<pageSignal>` + entity type + mock array + expected `<n>`):

| Dialog | `<pageSignal>` | Entity type | mock array | `<n>` |
|---|---|---|---|---|
| `organization-selection-dlg` | `listOfOrganizationInCurrentPage` | `Organization` | `[{ID:1},{ID:2}]` | 2 |
| `location-selection-dlg` | `listOfLocationInCurrentPage` | `Location` | `[{ID:1},{ID:2}]` | 2 |
| `book-category-selection-dlg` | `listOfBookCategoryInCurrentPage` | `BookCategory` | `[{ID:1},{ID:2}]` | 2 |

- [ ] **Step 1 (organization-selection-dlg):** Add the spy `fetchAllOrganizations` to its `createSpyObj`, then add the six `it`s with the substitutions. Run + lint + commit.
- [ ] **Step 2 (location-selection-dlg):** Same; `fetchAllLocations`. Run + lint + commit.
- [ ] **Step 3 (book-category-selection-dlg):** Same; `fetchAllBookCategories`. Run + lint + commit.

Commit messages: `test(library): <name> checked-set parity with person-selection-dlg` (×3).

---

## Wave 6 — Pin known gaps

### Task 6.1: Pin the `onAssignTranslator` stub

**File:** `book-detail` spec.

- [ ] **Step 1:** Already added as `it.todo` in Task 3.1 Step 3. If Task 3.1 was executed, this is done — mark complete and skip to 6.2. Otherwise add:
```ts
  it.todo('onAssignTranslator populates listTranslators (stub: not yet implemented)');
```

### Task 6.2: Pin the dead `UIMode.Update` save path

**File:** `book-detail` spec.

`book-detail.onSave()` Update branch is `// Do nothing for now.` and there is no `edit` route registered in `book.routes.ts`.

- [ ] **Step 1:** Add (inside an `describe('update mode')` or the existing edit-mode block):
```ts
  describe('update mode (unimplemented)', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})]);
      readBookSpy.and.returnValue(asyncData({ ID: 122, NativeName: 'x', Authors: [], Translators: [], Presses: [], Categories: [], Locations: [] } as unknown as Book));
    });

    it('onSave in Update mode does not call createBook or an update endpoint', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      component.detailFormGroup.get('nnameControl')?.setValue('x');
      component.onSave();
      expect(createBookSpy).not.toHaveBeenCalled();
      // TODO: once updateBook() exists, assert it is called with the edited book.
      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
```

- [ ] **Step 2:** Run + lint + commit: `test(library): pin book-detail unimplemented Update save path`.

### Task 6.3: Pin leaking `afterClose` subscriptions (Low)

**File:** `book-detail` spec.

The five `onAssignX()` handlers subscribe to `modal.afterClose` without `takeUntilDestroyed`. Per the to-do, prefer fixing the leak first (one-line `takeUntilDestroyed(this.destroyedRef)` per `afterClose` pipe) and adding a test that destroys the component mid-dialog and asserts no `afterClose` callback fires post-destroy.

- [ ] **Step 1 (optional fix):** In `book-detail.component.ts`, for each `modal.afterClose.subscribe(...)` add `.pipe(takeUntilDestroyed(this.destroyedRef))`. This is a production change — run the full suite after.
- [ ] **Step 2 (test):** Add an `it` that calls `onAssignAuthor()`, captures the modal ref, destroys the fixture (`fixture.destroy()`), and asserts the `afterClose` callback did not run (spy a flag set inside the callback; assert it stays false). If this proves too brittle against NzModal internals, mark `it.todo` documenting the leak and skip.
- [ ] **Step 3:** Run + lint + commit: `test(library): pin book-detail afterClose subscription lifecycle`.

---

## Sequencing summary

| Wave | Tasks | Risk | Est. |
|---|---|---|---|
| 0 | Baseline + worktree | — | 0.25h |
| 1 | Stop lying (purge `btest`, re-enable `detectChanges`) | Low | ~2.5h |
| 2 | List components: init + render + error + delete | Medium | ~6h |
| 3 | Detail components → `person-detail` parity | Medium | ~6h |
| 4 | Validation / negative testing | Low | ~2h |
| 5 | Selection dialogs → parity (2 stubs pinned) | Low | ~2h |
| 6 | Pin known gaps (stubs, dead code, leaks) | Low | ~1.5h |

Wave 1 first and in isolation. Waves 2–3 deliver the real coverage gains. Waves 4–6 harden edges. Each task is a standalone commit gated on `ng test --watch=false` + `npm run lint` exit 0.

---

## Verification (run after every wave, mandatory before "done")

```bash
cd achihui
npx ng test --watch=false --include='src/app/pages/library/**/*.spec.ts'
npm run lint
```

Both must exit 0. If a new failure appears after re-enabling `detectChanges` or adding an init test, **that is a real bug surfaced by a now-live test** — investigate, do not suppress. Log it in the spec as `// SURFACED BY WAVE <n>: <behavior>` and either fix the production code minimally or `it.todo` the assertion with a comment.

---

## Self-Review

**1. Spec coverage (to-do doc → plan):**
- T1.1 (btest purge, 15 files) → Task 1.1 ✓
- T1.2 (detectChanges, 6 files) → Task 1.2 ✓ (with the to-do's own "be careful" caveat baked in)
- T2.1 book list → Task 2.1 ✓
- T2.2/T2.3/T2.4 person/org/location lists (incl. delete) → Tasks 2.2/2.3/2.4 ✓
- T2.5 config lists → Task 2.5 ✓
- T2.6 shell + search → Task 2.6 ✓
- T3.1 book-detail gaps (onAssign result, onRemoveX, translator stub) → Task 3.1 ✓
- T3.2 organization-detail parity → Task 3.2 ✓
- T3.3 location-detail parity → Task 3.3 ✓
- T4.1 required-field validation → Task 4.1 ✓
- T4.2 association cancel path → Task 4.2 ✓
- T5.1 selection-dlg parity → Task 5.1 ✓ + Task 5.0 (correction: 2 dialogs are empty stubs) ✓
- T6.1 translator stub pin → Task 6.1 (folded into 3.1) ✓
- T6.2 dead Update save path → Task 6.2 ✓
- T6.3 afterClose leak → Task 6.3 ✓

**2. Placeholder scan:** No "TBD"/"implement later" as *steps*; the only `TODO`/`it.todo` occurrences are *intentional* gap-pins (translator stub, empty-stub dialogs, Update path) — these are deliverables, not plan placeholders. Every code step contains real, runnable code.

**3. Type/name consistency:** Verified against source on 2026-08-15: row signals (`listData` for book-list, `dataSet` for all others), detail form controls (`nnameControl` for person/book/org; `nameControl`/`locTypeControl`/`cmtControl` for location), selection-dlg page-signal names per the table, `LibraryStorageService` method names per the signature list. The borrow-record-list `dataSet.length`→`dataSet().length` fix (Task 2.0) corrects the one inconsistency the to-do doc inherited.

**Two corrections to the source to-do doc are baked in (both verified against code):**
1. `OrganizationTypeSelectionDlgComponent` and `PersonRoleSelectionDlgComponent` are empty stubs — they have no checked-set logic to test (Task 5.0).
2. `borrow-record-list` spec's `dataSet.length` assertion is vacuous (function arity, not array length) — fixed in Task 2.0.
