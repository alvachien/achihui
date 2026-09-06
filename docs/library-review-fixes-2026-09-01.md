# Code Review Findings & Fix Log — 2026-09-01

Source: `code-review` over the uncommitted changes on branch `feat/library` (2026-09-01).
All findings verified against source; the PUT-semantics finding was cross-checked against `../achihapi` `LibraryBooksController.cs`. Full test suite passed at review time and both `tsc` configs typecheck clean — every item below is a runtime/logic issue not covered by tests.

## Status Legend

- ⬜ Open — not started
- 🔄 In progress
- ✅ Fixed — code + tests done, test run green

## Status Table

| # | Severity | Finding | Status | Changed Locations |
|---|---|---|---|---|
| 1 | High | Edit-mode save wipes book/org fields | ✅ Fixed | `book-detail.component.ts`, `organization-detail.component.ts` + both specs |
| 2 | High | Role/type rows share cached service objects (cache corruption) | ✅ Fixed | `person-detail.component.ts/.html`, `organization-detail.component.ts/.html` + both specs |
| 3 | High | `update*` never syncs in-memory `_list*` cache | ✅ Fixed | `library-storage.service.ts` + spec (book N/A — no buffer) |
| 4 | Medium | Indexed row handlers use page-slice `$index` against full list | ✅ Fixed | same handlers as #2 — identity-based, see Fix Log #4 |
| 5 | Medium | "Not found" throws mangled by `catchError` re-formatting | ✅ Fixed | `library-storage.service.ts` (4 reads) + spec |
| 6 | Medium | `onSearch()` double-fetches and discards active sort | ✅ Fixed | `book-list.component.ts` + spec |
| 7 | Medium | Book search case-sensitive vs case-insensitive on other pages | ✅ Fixed | `library-storage.service.ts` (`fetchBooks`) + spec |
| 8 | Medium | Filter-bar i18n strings stale after runtime language switch | ✅ Fixed | `book-list.component.ts`, `shared/filter-dialog/filter-dialog.component.ts` + specs |
| 9 | Low | First `nzQueryParams` emission swallowed unconditionally | ✅ Fixed | same redesign as #6 |
| 10 | Low | Orphan categories invisible in Hierarchy tab | ✅ Fixed | `book-category-hierarchy.component.ts` + i18n + spec |
| C1 | Cleanup | Copy-pasted filter-bar wiring/LESS across 5 list components; log-name drift | ✅ Fixed (LESS shared + drift; TS wiring intentionally kept, see log) | `src/styles/filter-bar.less` + 5 `.less` + `angular.json` + `organization-list.component.ts` |
| C2 | Cleanup | Dead ternary `return isRoot ? '' : ''` | ✅ Fixed | `filter-dialog-model.ts` |
| C3 | Cleanup | Hand-rolled splitter duplicating `NzSplitterModule` | 🚫 Won't fix — intentional per design doc (see log) | — |
| C4 | Cleanup | `index.ts` re-exports all model internals | 🚫 Won't fix — convention + feature placeholders (see log) | — |
| C5 | Cleanup | `package.json` engines `^24.15.0` vs CLAUDE.md "Node ≥ 20" | ✅ Fixed | `package.json`, `../hih/CLAUDE.md` |

---

## Findings

### 1. Edit-mode save wipes book fields — `book-detail.component.ts:302` · High

Edit-mode save builds a fresh `new Book()` with only names/HID/linkages. `writeJSONObject()` omits null fields, and the backend PUT does `CurrentValues.SetValues(deserialized body)` (`../achihapi` `LibraryBooksController.cs:135`), so **ISBN, Detail, PublishedYear, PageCount, OriginLangID and BookLangID are silently nulled on every edit**.

Failure scenario: user opens Edit on a book that has ISBN/PublishedYear/Detail, changes only the name, saves → PUT body omits those columns → `SetValues` copies default nulls → fields irrecoverably wiped.

Same mechanism, smaller blast radius, in `organization-detail.component.ts:212` (`Detail` never set; Person got `detailControl` handling in this diff, Organization was left behind).

### 2. Role/org-type rows share cached service objects — `person-detail.component.ts:202` · High

`onRoleModeChanged` (and organization-detail's `onTypeModeChanged`) replaces the row with the **shared object** returned by `allRoles()` / `allTypes()` (the service's cached dictionary arrays). The template's `[(ngModel)]="data.ID"` then mutates that cached object on the next dropdown change.

Failure scenario: add a role row, select "Author" (row IS the cached object); change the row to "Translator" → `ngModel` writes `ID=2` onto the cached Author entry → `track coll.ID` hits duplicate keys (NG0955), dropdown renders wrong role, corruption leaks into every component reading the cached list, and `onSave` persists it.

### 3. `update*` never syncs the in-memory cache — `library-storage.service.ts:486` · High

`updatePerson` / `updateOrganization` / `updateLocation` / `updateBook` never sync the `_list*` cache buffers, while `create*` (dedupe-replace) and `delete*` (splice) do. `fetchAll*` short-circuits to the cache whenever `_isXLoaded` is true and no caller passes `forceReload`.

Failure scenario: edit person "John" → "Jonathan" via the new `/edit/:id` route, save succeeds; the person list, person-selection dialog and book-detail association pickers all serve `of(this._listPerson)` and keep showing "John" for the rest of the session. Org/location/book identical.

### 4. Indexed handlers operate on the wrong page — `person-detail.component.html:109` · Medium

`onRemoveRoleAssignment($index)` / `onRoleModeChanged($event, $index)` take `$index` from `@for (data of roleTable.data)` — the **current-page slice** of the front-paginated nz-table (default pageSize 10) — but the handlers index into the full `listRoles()` signal.

Failure scenario: a person with 11+ role rows, open page 2, delete the first visible row (`$index=0`) → removes role row 1 from page 1 instead. `organization-detail.component.html:78-92` (typeTable) has the identical off-by-one-page bug.

### 5. "Not found" errors get mangled by `catchError` — `library-storage.service.ts:427` (also 654 / 876 / 1117) · Medium

The new "not found" `throw`s are raised inside `map()` and caught by the same pipe's `catchError`, which re-formats them through `_buildHttpErrorMessage(error: HttpErrorResponse)` (line 1368) — a plain `Error` has no `status`/`statusText`/`error`.

Failure scenario: opening a stale/bookmarked `/display/99999` link for a deleted record shows `Error: undefined undefined: ""; Book 99999 not found` instead of the clean message.

### 6. Search from page > 1 double-fetches and drops sort — `book-list.component.ts:246` · Medium

`onSearch()` calls `loadDataFromServer(..., null, null)` directly **and** sets the `pageIndex` signal bound via `[nzPageIndex]`; from page > 1 this fires a second `nzQueryParams`-driven fetch (duplicate request), and the explicit fetch discards the active sort while never storing sort state anywhere.

Failure scenario: sort by ChineseName desc, go to page 4, type a search term → two identical `$filter` requests fire; the first has no `$orderby` while the header still shows the sort arrow; the second re-applies it — rows repeat across pages over the reordered filtered set.

### 7. Book search case-sensitive; other pages aren't — `library-storage.service.ts:1048` · Medium

The new book free-text search uses server-side `contains(NativeName,'term')`, which EF Core translates to SQLite `instr()` = **case-sensitive**, while the person/org/location pages' client-side search uses `toLowerCase().includes()` = case-insensitive.

Failure scenario: library contains "The Hobbit"; user types "hobbit" → 0 rows on the book page, while the same lowercase term on the person page finds the record instantly. ISBN check digit "x" typed lowercase likewise misses.

### 8. i18n strings never refresh on language switch — `book-list.component.ts:105` · Medium

`filterMenuText` / `propertyOptions` / `operatorOptions` / `previewText` (and `openFilterDialog`'s `nzTitle`, tree node titles) call imperative `translate()` inside signals/computeds that have no dependency on `TranslocoService.activeLang$`, so they never recompute on a runtime language switch.

Failure scenario: `app.component.ts:77` switches language via `setActiveLang()` without page reload; every `| transloco` pipe re-renders, but the Filter button summary, dialog property/operator dropdown labels, and tree titles stay stale indefinitely.

### 9. Timing-dependent fetch-skip guard — `book-list.component.ts:171` · Low

`doLoad()` unconditionally swallows the **first** `nzQueryParams` emission via the one-shot `initialFetchDone` guard, assuming it is always ng-zorro's synthetic initial emission — a timing-dependent invariant that is not enforced.

Failure scenario: if a user-triggered sort/page-change emission reaches the handler before the table's async initial emission, the first real interaction is silently discarded: header shows the new sort arrow but the list keeps the old order until the next click.

### 10. Orphan categories invisible in Hierarchy tab — `book-category-hierarchy.component.ts:82` · Low

`_buildTree` only emits nodes reachable from `ParentID=null` roots; any category whose `ParentID` points at a deleted/nonexistent ID (or is in a parent cycle) is completely invisible in the new Hierarchy tab, with no "unassigned" bucket or warning.

Failure scenario: category ID 7 with `ParentID=3` after category 3 was deleted → shows in the List tab (blank parent) but vanishes from the Hierarchy tab; the user concludes it was deleted and cannot reparent it from that view.

---

## Cleanup Items

### C1. Duplicated filter-bar wiring + LESS drift

Filter-bar wiring copy-pasted across 5 list components with ~30–72 identical LESS lines in 6 files. One copy already drifted: `organization-list.component.ts:182` logs `"PersonListComponent"`.

### C2. Dead ternary

`filter-dialog-model.ts:859`: `return isRoot ? '' : ''` — both branches identical.

### C3. Hand-rolled splitter

`filter-dialog.component.ts:369` reimplements split-pane resizing, duplicating ng-zorro's `NzSplitterModule`.

### C4. Barrel over-exposure

`index.ts` re-exports all model internals.

### C5. Node engines mismatch

`package.json` `engines` narrowed to `^24.15.0` while the repo CLAUDE.md still says "Requires Node ≥ 20".

---

## Refuted During Review (no action needed)

- Missing `Common.All` i18n key (present in both files)
- `borrowFilterActiveCount` plural drift (key used nowhere)
- `getBookBorrowRecords` unused date params (method has none)
- location-list dead `nzPagination` binding
- search.component route mismatch (all routes use `display/:id`; components read via URL segment)
- stale `totalCountAll` after create (list re-fetches on route re-entry)
- `Common.Loading` hardcoded (not in this diff)

---

## Fix Log

### #1 — ✅ Fixed (2026-09-01)

- `src/app/pages/library/book/book-detail/book-detail.component.ts` — added `originalBook` (the record as loaded); `onSave` in Update mode now patches the loaded record instead of a fresh `new Book()`, so ISBN/Detail/PublishedYear/PageCount/OriginLangID/BookLangID ride along in the PUT body.
- `src/app/pages/library/organization/organization-detail/organization-detail.component.ts` — same pattern via `originalOrganization`; `Detail` (not exposed by the org edit form) is preserved.
- Tests: `book-detail.component.spec.ts` — edit-mode fixture now loads a book with all non-form fields populated; new test *"edit save preserves fields the form does not expose (no wipe on PUT)"* asserts both the object passed to `updateBook` and its `writeJSONObject()` output. `organization-detail.component.spec.ts` — new test *"edit save preserves Detail the form does not expose (no wipe on PUT)"*.
- Verified: `ng test --include "**/book-detail.component.spec.ts" --include "**/organization-detail.component.spec.ts"` → 23/23 passed.

### #2 & #4 — ✅ Fixed together (2026-09-01)

These two findings live in the same handlers/templates of person-detail and organization-detail, so one redesign fixes both.

- `person-detail.component.ts` + `.html`, `organization-detail.component.ts` + `.html`:
  - `onRoleModeChanged(rid, row)` / `onTypeModeChanged(tid, row)` now take the **row object** (template passes `data` instead of `$index`) and store a **copy** of the selected dictionary entry instead of the shared `allRoles()`/`allTypes()` instance — so the template's `[(ngModel)]="data.ID"` can no longer mutate the service-cached dictionary (#2).
  - `onRemoveRoleAssignment(row)` / `onRemoveTypeAssignment(row)` likewise address rows by **object identity** instead of page-slice `$index` — removing a row on page 2 of the front-paginated table now removes that row, not the page-1 row at the same slot (#4).
  - Unknown dictionary id is now a no-op instead of silently dropping the assignment.
- Tests: `person-detail.component.spec.ts` — new *"role rows"* suite (copy-not-share assertion, cache-ID preservation after simulated ngModel write, unknown-id no-op, exact identity removal, 12-row page-slice regression guard). `organization-detail.component.spec.ts` — mirrored *"type rows"* suite.
- Verified: `ng test --include "**/person-detail.component.spec.ts" --include "**/organization-detail.component.spec.ts"` → 29/29 passed.

### #3 — ✅ Fixed (2026-09-01)

- `src/app/services/library-storage.service.ts` — new private helper `_syncListCache(list, updated)`: replaces the matching-ID row in a fetchAll\*-cache buffer in place (never appends — an update is not a create). Wired into `updatePerson` (`_listPerson`), `updateOrganization` (`_listOrganization`), `updateLocation` (`_listLocation`).
- **Correction to the review:** `updateBook` needs no sync — there is no book cache (`_listBook`/`fetchAllBooks` do not exist; the book list is always server-paged). The finding's book mention was inaccurate.
- Tests: `library-storage.service.spec.ts` — new `updatePerson` / `updateOrganization` / `updateLocation` suites (these methods previously had **no** spec coverage). Each primes the cache via a GET, performs the update PUT, then asserts the follow-up `fetchAll*` is served from the buffer **without a network call** and yields the saved values.
- Verified: `ng test --include "**/library-storage.service.spec.ts"` → 53/53 passed.

### #5 — ✅ Fixed (2026-09-01)

- `src/app/services/library-storage.service.ts` — the `catchError` of all four `read*` methods (`readPerson`, `readOrganization`, `readLocation`, `readBook`) now passes non-`HttpErrorResponse` errors through untouched, so the "not found" `Error` raised in `map()` reaches the caller verbatim instead of being re-formatted through `_buildHttpErrorMessage` (which produced `undefined undefined: ""; …`). Genuine HTTP failures still go through the old formatter.
- Tests: `library-storage.service.spec.ts` — the readPerson not-found test now asserts the exact message `Error: Person 999 not found` and no `undefined` substring; new not-found tests added for `readOrganization`, `readLocation`, `readBook` (previously only empty-value-array responses were untested there).
- Verified: `ng test --include "**/library-storage.service.spec.ts"` → 56/56 passed.

### #6 & #9 — ✅ Fixed together (2026-09-01)

One redesign of the fetch-triggering flow in `src/app/pages/library/book/book-list/book-list.component.ts` resolves both.

- The one-shot `initialFetchDone` guard and `doLoad()` are gone. `loadDataFromServer()` now records the last query actually issued (`lastQuery`: page, size, sort, search text, filter reference) and returns early only when the incoming request is an **exact repeat** of it.
- #9: nz-table's synthetic initial emission repeats ngOnInit's query → absorbed; but a real user interaction arriving *before* it is never swallowed (the old guard could).
- #6: `onSearch()` now refetches page 1 **with the retained active sort** (`sortField`/`sortOrder` stored from every `onQueryParamsChange`); when it resets `pageIndex` the resulting `nzQueryParams` echo equals `lastQuery` → no second request. From page 1 (no signal change, no echo) it still fetches exactly once.
- Tests: `book-list.component.spec.ts` — new *"query dedupe, sort retention and language reactivity"* suite: search-keeps-sort + echo-no-double-fetch (3 fetches for sort→page4→search, echo swallowed); repeated-vs-changed emission; filter/search commit on unchanged page+sort still refetches (dedupe key includes them).
- Verified: `ng test --include "**/book-list.component.spec.ts" --include "**/library-storage.service.spec.ts"` → 75/75 passed.

### #7 — ✅ Fixed (2026-09-01)

- `src/app/services/library-storage.service.ts` `fetchBooks()` — free-text `$filter` clause is now `contains(tolower(NativeName),tolower('term')) or contains(tolower(ChineseName),tolower('term'))`. SQLite's `contains` maps to case-sensitive `instr()`; wrapping both sides in `tolower` restores parity with the person/org/location pages' case-insensitive client-side search. Verified the backend allows OData functions (plain `[EnableQuery]`, no `ODataValidationSettings` restrictions in `achihapi`).
- The structured filter dialog's `contains`/`startswith` (via `toODataFilter`) is shared with other list pages and was left as-is; noted here intentionally.
- Tests: `library-storage.service.spec.ts` — the `$filter` composition assertion updated to the `tolower`-wrapped form.
- Verified: same run as #6/#9.

### #8 — ✅ Fixed (2026-09-01)

- `book-list.component.ts` — added a `langTick` signal fed by `TranslocoService.langChanges$`; `filterMenuText` now depends on it, so the Filter-menu summary recomputes on runtime language switches.
- `shared/filter-dialog/filter-dialog.component.ts` — same `langTick` wired into the dialog's four imperative-`translate()` computeds (`propertyOptions`, `operatorOptions`, `treeNodes` titles, `previewText`), covering language switches while the dialog is open. (`nzTitle`/tree titles are built at dialog-open time, so they were already current-per-open.)
- Tests: `book-list.component.spec.ts` — *"filterMenuText recomputes when the language changes at runtime"*; `filter-dialog.component.spec.ts` — *"translated options recompute when the language changes while the dialog is open"* (en → zh → en round-trip). Both restore the active language afterwards.
- Verified: book-list run above; dialog spec → 15/15 passed.

### #10 — ✅ Fixed (2026-09-01)

- `src/app/pages/library/config/book-category-hierarchy/book-category-hierarchy.component.ts` — `_buildTree` rewritten to render **every** category: it tracks which IDs were reached from `ParentID=null` roots, and appends a "Uncategorized (missing or invalid parent)" bucket with any unreachable nodes (deleted/nonexistent parent, self-parent, parent cycles). The recursion is only reachable-from-roots, so cycles terminate.
- `src/assets/i18n/en.json` / `zh.json` — new `Library.CategoryUnassignedParent` key.
- Tests: `book-category-hierarchy.component.spec.ts` — new tests *"surfaces orphans under an unassigned bucket"* (root + dangling-parent + A↔B cycle → 2 top-level nodes, bucket holds 7/8/9) and *"does not add an unassigned bucket when every node is reachable"*.
- Verified: `ng test --include "**/book-category-hierarchy.component.spec.ts"` → 6/6 passed.

---

### C1 — ✅ Fixed (2026-09-01)

- `organization-list.component.ts:182` log drift corrected (`"PersonListComponent"` → `"OrganizationListComponent"`; file now has 5× the correct name, 0× the wrong one).
- The five rule-identical 72-line filter-bar LESS files (verified identical ignoring comments) consolidated into one source: new `src/styles/filter-bar.less`; `src/app/pages/library/{book/book-list, organization/organization-list, person/person-list, organization-selection-dlg, person-selection-dlg}/*.component.less` are now a single `@import 'filter-bar';`. `angular.json` `stylePreprocessorOptions.includePaths` gained `src/styles`.
- The copy-pasted TypeScript filter-bar wiring across the 5 list components was **intentionally not extracted**: the components differ (server-side paging vs client-side, different properties/schemas), and a premature base class would obscure those differences. Revisit if a 6th list page is added.
- Verified: the 5 consumer specs (build compiles the consolidated LESS) → 60/60 passed.

### C2 — ✅ Fixed (2026-09-01)

- `src/app/shared/filter-dialog/filter-dialog-model.ts` — dead ternary `return isRoot ? '' : ''` → plain `return ''` with a comment. No behavior change; existing `filter-dialog-model.spec.ts` coverage stays green.

### C3 — 🚫 Won't fix — intentional design (user-approved 2026-09-01)

- `filter-dialog.component.ts` hand-rolled splitter duplicates `NzSplitterModule` in spirit, but the design doc (`docs/filter-dialog-generic-design.md` §splitter) specifies behaviors NzSplitter doesn't provide without fighting it: 25–65% clamp, pointer + keyboard resize on a `role="separator"`, and stacked panes below ~720px. Swapping would regress the documented design.

### C4 — 🚫 Won't fix — convention + placeholders (user-approved 2026-09-01)

- `src/app/model/index.ts` `export *` matches the codebase-wide barrel convention (`@services/index`, `@model/index` imports everywhere). The seemingly-dead exports are feature placeholders: `GenderEnum` sits directly above commented-out gender fields, `MovieGenreJson` above commented-out movie code — pruning conflicts with the reversible-disable pattern used for Blog/Event too.

### C5 — ✅ Fixed (2026-09-01)

- `achihui/package.json` `engines.node`: `^24.15.0` → `^22.22.3 || ^24.15.0 || >=26.0.0` (exactly Angular 22.1's own range; CI runs Node 24, unaffected).
- `../hih/CLAUDE.md` "Requires Node ≥ 20" → the actual supported range (Node 20 is dead under Angular 22).

---

## Final Verification (2026-09-01)

- **Full test suite** (`ng test --watch false`): **1239 passed, 0 failed**, 53 pre-existing skips; 1292 total vs 1269 before — **23 new tests** added by this fix pass.
- **Lint** (`ng lint`): clean. (One courtesy fix along the way: two pre-existing prettier errors on the uncommitted `config.component.html` working-tree changes — stray spaces before `| transloco` pipes — auto-fixed with `eslint --fix`.)
- **Production build** (`ng build --configuration production`): succeeds within budgets; the `@import 'filter-bar'` resolution via `stylePreprocessorOptions` verified.

## Files Touched This Pass

| Area | Files |
|---|---|
| #1 save-wipe | `book-detail.component.ts`, `organization-detail.component.ts` + both specs |
| #2/#4 cache mutation + page-slice | `person-detail.component.{ts,html}`, `organization-detail.component.{ts,html}` + both specs |
| #3/#5/#7 service | `library-storage.service.ts`, `library-storage.service.spec.ts` |
| #6/#8/#9 book list + dialog i18n | `book-list.component.ts`, `shared/filter-dialog/filter-dialog.component.ts` + both specs |
| #8 i18n keys | (none added — existing `Filter.NewFilter` used) |
| #10 hierarchy | `book-category-hierarchy.component.ts` + spec; `en.json`, `zh.json` (+`Library.CategoryUnassignedParent`) |
| C1/C2/C5 | `src/styles/filter-bar.less` (new), 5 component `.less`, `angular.json`, `organization-list.component.ts`, `filter-dialog-model.ts`, `package.json`, `../hih/CLAUDE.md` |
