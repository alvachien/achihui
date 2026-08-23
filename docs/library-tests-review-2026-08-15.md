# H.I.H. Library Test Coverage Review — 2026-08-15

A coverage review of the library feature's test suite in the `achihui` Angular
front end (`src/app/pages/library/**` plus its data service
`src/app/services/library-storage.service.spec.ts`). The review reads every spec
file in the feature and assesses whether the tests are **sufficient** — i.e.
whether they verify real behavior, not just that the component constructor did
not throw.

The triggering change was the book create/display page refactor (tabs → stacked
sections + extracted `BookAssociationsComponent`, see 2026-08-15 work). That
refactor exposed how thin the existing book-detail coverage is, which prompted a
sweep of the whole feature.

## TL;DR

**No, the library component tests are not sufficient.** There is a sharp split
between two layers:

- **Service layer (`library-storage.service.spec.ts`) — solid.** 1,417 lines,
  47 `it()` blocks, covering the full CRUD surface.
- **UI component layer — almost entirely `should create` smoke tests.** 22 of
  23 component specs contain a single `expect(component).toBeTruthy()`
  assertion.

On top of being thin, several specs are **actively misleading**: they contain a
`btest = false` scaffolding pattern that *looks* like it verifies a service spy
but never runs, and many comment out `fixture.detectChanges()` so `ngOnInit`
never executes.

## Method

Read every spec under `src/app/pages/library/` and the library service spec.
For each: counted `it()` blocks, checked whether `detectChanges` is called,
checked for the `btest = false` dead-assertion pattern, and compared assertions
against the component's actual public surface (init, save, error, validation,
association dialogs).

## Evidence

### Per-spec snapshot

| Spec | `it()` | `should create` only? | `btest=false`? | `detectChanges` commented? |
|---|---|---|---|---|
| `person/person-detail` | 7 | no — create/display/edit + error modal | no | yes |
| `book/book-detail` | 6 | no — create/display + error modal | yes | yes |
| `person-selection-dlg` | 7 | no — checked-set logic | yes | yes |
| `book/book-associations` (new) | 4 | no — inputs + outputs | no | no |
| `borrow-record-list` | 3 | no — create + zero-rows render | no | yes |
| `book/book-list` | 1 | **yes** | yes | no |
| `borrow-record-create-dlg` | 1 | **yes** | yes | yes |
| `config/book-category-list` | 1 | **yes** | yes | no |
| `config/book-category-selection-dlg` | 1 | **yes** | no | no |
| `config/config` | 1 | **yes** | no | no |
| `config/organization-type-list` | 1 | **yes** | yes | no |
| `config/organization-type-selection-dlg` | 1 | **yes** | yes | no |
| `config/person-role-list` | 1 | **yes** | yes | no |
| `config/person-role-selection-dlg` | 1 | **yes** | no | no |
| `library` (shell) | 1 | **yes** | no | no |
| `location-selection-dlg` | 1 | **yes** | yes | no |
| `location/location-detail` | 1 | **yes** | yes | no |
| `location/location-list` | 1 | **yes** | yes | no |
| `organization-selection-dlg` | 1 | **yes** | yes | no |
| `organization/organization-detail` | 1 | **yes** | yes | no |
| `organization/organization-list` | 1 | **yes** | yes | no |
| `person/person-list` | 1 | **yes** | yes | no |
| `search` | 1 | **yes** | yes | yes |

Counts (library component specs only): **23 specs, 22 are single-assertion
smoke tests.** The `btest = false` pattern appears in **15** of them; commented
`detectChanges` in **6**.

### The service layer is the strong half

`src/app/services/library-storage.service.spec.ts` — 1,417 lines, 47 `it()`
blocks. Exercises the full CRUD surface across all library entities:

- Book: `fetchBooks`, `readBook`, `createBook`, `deleteBook`
- Person: `readPerson`, `createPerson`, `deletePerson`
- Organization: `readOrganization`, `createOrganization`, `deleteOrganization`
- Location: `readLocation`
- Reference loaders: `fetchAllBookCategories`, `fetchAllLocations`,
  `fetchAllOrganizationTypes`, `fetchAllOrganizations`, `fetchAllPersonRoles`,
  `fetchAllPersons`

This is real, behavior-level coverage of the data layer and is **not** a concern
of this review.

## Findings

### F1. The `btest = false` dead-assertion pattern (High — misleading)

15 of 23 specs contain this shape:

```ts
it('should create', () => {
  expect(component).toBeTruthy();

  const btest = false;
  if (btest) {
    expect(fetchBooksSpy).toHaveBeenCalled();   // never executes
  }
});
```

This was clearly scaffolding for a real assertion that was never finished. It is
**worse than no assertion**: a reader skimming the file sees a spy reference and
infers the init/fetch contract is verified. It is not. The `if (false)` block is
dead code.

**Affected:** `book-detail`, `book-list`, `borrow-record-create-dlg`,
`book-category-list`, `organization-type-list`,
`organization-type-selection-dlg`, `person-role-list`, `location-detail`,
`location-list`, `location-selection-dlg`, `organization-detail`,
`organization-list`, `person-list`, `person-selection-dlg`, `search`.

### F2. `fixture.detectChanges()` commented out (High — component never initializes)

6 specs leave the `detectChanges` call commented:

```ts
beforeEach(() => {
  fixture = TestBed.createComponent(BookDetailComponent);
  component = fixture.componentInstance;
  //fixture.detectChanges();   // ← ngOnInit never runs
});
```

With `detectChanges` commented, `ngOnInit` does not fire → the service fetch
observables are never subscribed → the configured spies are never called → the
test only proves the constructor did not throw. The borrow-record-list spec
*does* uncomment it and successfully asserts `component.dataSet.length` — proving
the pattern works when enabled.

**Affected:** `book-detail`, `borrow-record-create-dlg`, `borrow-record-list`,
`person-detail`, `person-selection-dlg`, `search`. (Note: `person-detail` and
the create/display `describe` blocks *do* call `detectChanges` inside individual
`it`s, so they are partially live — the comment is on the shared `beforeEach`
only.)

### F3. No interaction / behavior testing on list components (High)

No list-component spec asserts any of: fetched data renders into the table,
delete works, filters/search behave, or a fetch error opens the error modal.
`borrow-record-list` is the sole list spec that checks `dataSet.length` (and
only the zero-rows case). The other list specs (`book-list`, `person-list`,
`organization-list`, `location-list`, all config lists) verify nothing beyond
construction.

### F4. Detail components: save/error coverage is uneven and shallow (High)

Only `person-detail` and `book-detail` test the create-save happy path and a
service-error modal. Even those are incomplete:

- **`book-detail`** calls `onAssignAuthor()` but asserts nothing about the
  result; the other four association handlers (`onAssignTranslator`,
  `onAssignPress`, `onAssignCategory`, `onAssignLocation`) are untested.
  `onAssignTranslator()` is a `// TBD.` stub — a test would fail against it.
  The new `onRemoveX()` handlers (added 2026-08-15) have no host-level coverage.
- **`organization-detail`** and **`location-detail`** have zero save/error
  paths — single `should create` only.

### F5. No validation / negative testing (Medium)

No spec sets an empty required field and asserts the form is `invalid` or that
`onSave()` does not call the create spy. The `Validators.required` /
`maxLength` rules on `nnameControl` etc. are unverified.

### F6. Update/edit mode is dead or stub code, yet "passes" trivially (Medium)

- `book-detail`: the `edit` route is not registered in `book.routes.ts`, and
  `onSave()`'s `UIMode.Update` branch is `// Do nothing for now.` There is no
  test that would catch this.
- `person-detail`: has an "edit mode" `describe` that asserts only
  `isEditable()` is true. It does not assert that an Update save actually calls
  the update endpoint — because there is no update implementation to call.

### F7. The two good specs define the intended bar (Reference)

`person-detail` (7 tests) and `person-selection-dlg` (7 tests) demonstrate the
target quality: stub `ActivatedRoute` with real `UrlSegment`s, call
`detectChanges`, use `asyncData`/`asyncError`, assert `isEditable`, assert form
values post-load, assert `router.navigate` on save, assert modal presence on
error. Every other spec in the feature should be lifted to this shape.

## Conclusion

The data layer is well tested. The UI layer is not: most specs prove only that
the constructor does not throw, and a meaningful subset are misleading due to
the `btest = false` pattern and commented `detectChanges`. The refactor
confidence for the book page came from the service spec and manual reasoning,
not from the component spec.

See the companion to-do list below for the prioritized remediation.
