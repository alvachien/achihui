# Library Module Review - 2026-08-17

> **Fix status (same day):** Priorities 1-3 have been fixed on branch `fix/ui-issue`, plus several priority-6 items that were trivially adjacent (transloco-on-user-data, missing `NzButtonModule` in location-list, stale pagination after delete, duplicate injections in book-list, borrow-list HasReturned column + Create button + org-name fetch, untranslated strings). Remaining work: priority 4 (read\* not-found handling, create-during-fetch wipe, duplicate initial fetch), priority 5 (edit workflows), the rest of priority 6 (form validation guards, NG0955 duplicate-track crash, orphan modals on destroy), and priority 7 (tests - the whole vitest suite is currently broken on this branch independently of these changes, failing at import with `SyntaxError` on 126/135 files even on a clean checkout of HEAD).

Full review of the library feature (`achihui/src/app/pages/library/**`, `src/app/services/library-storage.service.ts`, `src/app/model/librarymodel.ts`), cross-checked against the OData EDM models in `achihapi/src/hihapi/Models/Library/*.cs` and the installed NG-ZORRO 22 modal source. All findings below were verified against the actual code.

Findings are grouped by priority: fix top-to-bottom.

---

## Priority 1 - Service layer (small diffs, unbreak the whole module)

### 1.1 Invalid `$select` casing causes 400 on the book list and borrow list
- `src/app/services/library-storage.service.ts:828` - `$select=ID,HomeID,NativeName,ChineseName,Detail`
- `src/app/services/library-storage.service.ts:996` - `$select=ID,HomeID,BookId,FromOrganization,FromDate,ToDate,Comment`
- The EDM property is `Id` (`achihapi/src/hihapi/Models/Library/LibraryBook.cs:115`, `LibraryBookBorrowRecord.Id`); OData `$select` is case-sensitive, so `fetchBooks()` and `fetchBookBorrowRecords()` always fail with 400 ("Could not find a property named 'ID'").

### 1.2 Borrow record `IsReturned` / `User` never selected
- `library-storage.service.ts:996` omits both properties, so `BookBorrowRecord.onSetData` leaves every record with `HasReturned = false` and `User = ''`. The return workflow cannot work even after the casing fix.

### 1.3 Borrow record dates parsed with the wrong format - render crash
- `src/app/model/librarymodel.ts:1082-1087` - `parse(data.FromDate, 'yyyy-MM-dd', new Date())`, but the API returns full ISO timestamps (`2026-08-17T00:00:00+08:00`) -> `Invalid Date` -> `FromDateString`/`ToDateString` getters throw `RangeError: Invalid time value` while rendering `borrow-record-list.component.html:45-46`.

### 1.4 DELETE URLs use slash keys instead of OData parenthesis keys
- `library-storage.service.ts:446, 614, 786, 962, 1091` - `` `${url}/${pid}` `` should be `` `${url}(${pid})` ``.
- CLAUDE.md documents `DELETE /{entity}({key})`; no `UrlKeyDelimiter.Slash` is configured in `achihapi`, so library deletes 404. (Confirm once at runtime.)

### 1.5 Error messages stringify as `[object Object]`
- Every `catchError` block (e.g. `library-storage.service.ts:177`): `error.statusText + '; ' + error.error` - `error.error` is a parsed JSON object for JSON bodies, so users see `[object Object]`.

---

## Priority 2 - NG-ZORRO modal data pattern (one pattern fixes ~8 dialogs)

### 2.1 Every selection dialog is non-functional
The code passes data via `nzData` and expects it to reach the dialog component or mutate a shared `Set`. NG-ZORRO 22 delivers `nzData` **only** via the `NZ_MODAL_DATA` injection token (`ng-zorro-antd-modal.mjs:1322`); no component in the repo injects it, and the dialogs' `updateCheckedSet` creates a *new* `Set` inside a `model()` signal instead of mutating the caller's Set.

Consequences:
- `book-detail.component.ts:185-348` - assigning authors/translators/presses/categories/locations silently discards every user check; pre-assigned items are not pre-checked.
- `borrow-record-create-dlg.component.ts:59, 95-134` - `selectedBook` input is never set, `onChooseBook()` is an empty stub, so `isSubmittedAllowed` is permanently false: **the borrow dialog can never be submitted**.
- Affects: `person-selection-dlg`, `organization-selection-dlg`, `location-selection-dlg`, `config/book-category-selection-dlg`.

**Fix pattern:** dialogs `inject(NZ_MODAL_DATA)` for inputs (initial checked set, `singleSelection`, ...) and call `this.modalRef.close(result)` / `destroy(result)` with the selection; callers read the result from the `afterClose`/`NzModalRef` instead of re-reading an unmutated Set.

### 2.2 Borrow-record create dialog secondary defects (fix together with 2.1)
- No validation of the payload: `handleOk()` never calls `BookBorrowRecord.onVerify()`; no `Validators.required` on the date range; `BookID`/`BorrowFrom` degrade to `0` via `?? 0` (`borrow-record-create-dlg.component.ts:146-168`).
- `hasRtnedControl` defaults to `true` (line 56) - a fresh borrow is submitted with `IsReturned: true`.
- No client-side check for borrowing an already-borrowed (un-returned) book; client validation permits a same-day borrow that the API rejects (`librarymodel.ts:1024` checks `isAfter` only; API rejects `ToDate <= FromDate`).
- The Create button is commented out in `borrow-record-list.component.html:10`, and its `nzOnOk` only logs - no list refresh.
- Hardcoded untranslated strings ("Choose Book", "Select Organization", "Date Range", "Cancel", "Submit").

---

## Priority 3 - Cross-home cache race

- `library-storage.service.ts:105-125` with `map` callbacks at `:154-164, 211-222, 267-285, 330-341, 498-509, 666-677`.
- Requests are not keyed to the home ID they were issued for. If a fetch for home A is in flight when the user switches to home B (effect calls `resetCaches()`), A's response arrives and writes A's data into the cache and marks it loaded - home B then serves home A's people/books with no HTTP call (cross-tenant data mixing).

**Fix pattern:** capture the home ID when the fetch starts; in the `map`/tap, skip cache writes if `curHomeSelected` has changed.

---

## Priority 4 - Data-correctness / service behaviors (after 1-3)

- `readPerson`/`readOrganization`/`readLocation`/`readBook` (`:384, 552, 719, 902`) return a blank entity (ID 0) instead of an error when the filter matches nothing - stale detail links show an empty record rather than "not found".
- Create-during-fetch wipes the just-created row from the buffer (`createPerson` :424 vs fetch map `:331`; same for org/location). `createLocation` dedupes by ID (:761-763) but `createPerson`/`createOrganization` push unconditionally - make consistent.
- Duplicate initial fetch on the book list: `ngOnInit` calls `loadDataFromServer` (`book-list.component.ts:67`) while `nz-table` also emits its initial `nzQueryParams`.

## Priority 5 - Missing / dead workflows

- Books/persons/organizations/locations can never be edited: no `edit/:id` route in any `*.routes.ts`; `onEdit` stubs are `{ // TBD }`; `onSave`'s Update branch is `// Do nothing for now` (`book-detail.component.ts:423`). `person.routes.ts` et al. also define a redundant `person` child path nothing links to.
- "Select Translator" is a rendered dead button (`book-detail.component.ts:229`, `book-associations.component.html:42`).
- Borrow-from org names blank on a fresh session: `borrow-record-list.component.ts:100-102` fetches org *types* but `getBorrowFromName` reads `Organizations`, which is never fetched.
- Empty scaffolding stubs: `config/organization-type-selection-dlg`, `config/person-role-selection-dlg` (unreferenced "works!" placeholders).
- `search/` is an "under construction" placeholder, reachable only by direct URL.

## Priority 6 - Validation & UX defects

- No `detailFormGroup.valid` check and no double-submit guard in any detail component's `onSave` (book/person/org/location detail) - empty-name POSTs and duplicate records on double-click; the models' `onVerify()` is never called.
- `person-detail.component.ts:197-210` silently drops the Detail field on save.
- Required markers without validators: organization Chinese Name (`organization-detail.component.html:41` vs `:71`), location Comment (`location-detail.component.html:51` vs `:72`).
- Duplicate `@for` track keys crash person/organization detail when two rows are added before selecting a role/type (`new PersonRole()`/`new OrganizationType()` have `ID = 0` -> NG0955): `person-detail.component.html:101`, `organization-detail.component.html:79`. Removing one unselected row removes all (filter-by-ID at `person-detail.component.ts:193`, `organization-detail.component.ts:188`).
- Role/type table rows go stale after dropdown selection (`[(ngModel)]="data.ID"` only rewrites the ID; Name/Comment stay empty; duplicate role selection unchecked): `person-detail.component.html:104-116`, `organization-detail.component.html:82-94`.
- Stale `listRoles` when navigating between two display URLs if the second person has no Roles (`person-detail.component.ts:129-131`); organization-detail instead throws if `Types` is undefined.
- User-entered names piped through `transloco`: `config/book-category-list.component.html:14`, `config/organization-type-list.component.html:14`, `config/person-role-list.component.html:14`, `config/book-category-selection-dlg.component.html:21`, `location-list.component.html:33`.
- `location-list.component.ts` does not import `NzButtonModule` - all buttons render unstyled.
- Stale pagination after delete (book-list `:184-191`, borrow-record-list `:205-208`): row removed locally, `totalCount` not updated -> empty last page.
- Service-created modals are never closed on component destroy (`book-list.component.ts:133`, `book-detail.component.ts:189, 237, 282, 327`) - navigating away leaves orphan overlays whose `nzOnOk` still runs.
- Select-all header renders checked while the list is empty/loading (`.every()` on empty array): all three selection dialogs.
- `organization-selection-dlg` `singleSelection` never enforced (`:41-44`); Submit silently disabled when 2+ rows checked.
- Swapped column headers: `book-associations.component.html` (Name/NativeName values transposed, :12-13/:24-25, :48-49/:61-62, :121-122/:132-133); `person-list.component.html:16-17` and `organization-list.component.html:16-17` headers sit over the wrong columns.
- Nested duplicate breadcrumb in `config.component.html:2-6`; page title reuses the `Finance.ConfigObjects` key.
- `organization-selection-dlg` footer/table headers hardcoded in English; `nzTip="Loading..."` in `borrow-record-list.component.html:1`; "OK" in `search.component.html:3`.
- Redundant declarations in `book-list.component.ts:38/41` (NzModalModule twice) and `:52,54` (NzModalService injected twice); unused injections (`NzModalRef`, `NzMessageService`, `ChangeDetectorRef`), unused `loading`/`roleFilter` in the dialogs; empty `onTypeModeChanged` (`organization-detail.component.ts:191`).

## Priority 7 - Test gaps that let the above survive

- No spec asserts OData query strings - why the `$select` `ID`/`Id` casing bugs (1.1) passed.
- No spec covers dialog OK-propagation (2.1), delete flows, form validation, or home-switch cache reset (the spec's `HomeDefOdataService` stub has no `curHomeSelected` signal).
- `borrow-record-list.component.spec.ts:86` asserts `.length` on a signal (passes vacuously).
- `book-detail.component.spec.ts:151-163` "assign author" test has zero assertions.
- Most list/dialog specs are "should create"-only.

---

## Verified clean

- Subscription teardown: `takeUntilDestroyed` used consistently; `afterClose` subscriptions complete; no timer leaks.
- `@for` track expressions use stable `data.ID` everywhere except the NG0955 cases above.
- Route config matches the nav menu; no dangling references to deleted folders after the blog restructure.
- OData `$filter`/`$expand`/`$orderby` building is otherwise correct (only numeric IDs interpolated; expands reference existing EDM navs).

## Review method

Four parallel reviews (service layer, book UI, person/org/location UI, borrow/search/config UI) plus manual verification of the shell wiring (`app.routes.ts`, `app.component.html`) and spot-checks of the top findings against `achihapi` EDM models and `node_modules` NG-ZORRO source.
