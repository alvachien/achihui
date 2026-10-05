# Finance / Plan — Review & "Check Progress" Design

**Date:** 2026-10-05 · **Scope:** `achihui/src/app/pages/finance/plan/` + `FinanceOdataService` + `achihapi` plans/reports
**Verified state:** `ng build` exit 0 (56 s); `ng test --watch=false` → 149 files / **1540 tests pass**. The API side for plans (GET/GET(key)/POST/PUT/DELETE) is complete and tenant-guarded. The gaps below are almost entirely UI + service layer.

---

## Part 1 — Gap review

### Status by CRUD capability

| Operation | UI | Service (`FinanceOdataService`) | API (`FinancePlansController`) | Verdict |
|---|---|---|---|---|
| List | ✅ | ✅ `fetchAllPlans` | ✅ GET | works, but **stale cache** (see #4) |
| Display | ⚠️ blank form on bad id | ⚠️ no not-found path | ✅ | partial |
| Create | ✅ | ✅ `createPlan` | ✅ POST | works |
| **Edit** | ❌ commented out | ❌ **no method exists** | ✅ PUT (`FinancePlansController.cs:117`) | **broken** |
| **Delete** | ❌ `// TBD` | ❌ **no method exists** | ✅ DELETE (`FinancePlansController.cs:187`) | **missing** |
| **Progress** | ⚠️ Account type only, wrong semantics | ⚠️ | ✅ report actions exist | **~10 % done** |

### High — the feature is unusable as a lifecycle

1. **Edit mode is a dead end.** `onChangePlan()` (`plan-detail/plan-detail.component.ts:390-426`) is entirely commented-out sample code (references `changeOrder` from another feature). `onSubmit()` sets `isObjectSubmitting = true` first; nothing ever resets it → Save in edit mode switches to a permanent spinner / "SubmissionFailed" screen with an **empty** error message (`plan-detail.component.html:203-245`, `objectIdCreated` is undefined). Backend PUT is complete and properly tenant-guarded (`FinancePlansController.cs:117-185`). Missing: a `changePlan()` service method (PUT `/FinancePlans(id)`) plus re-enabling the flow.
2. **Delete doesn't exist anywhere in the UI stack.** `onDelete()` is `// TBD` (`plan-list/plan-list.component.ts:106-110`) — the red Delete menu item silently does nothing. No `deletePlan` in the service. API DELETE works; `BaseModel.IsDeleteAllowed` defaults true. Needs service method + confirm dialog.
3. **Progress is only half-designed.** `onCheckProgress` (`plan-list.component.ts:112-123`) requires `planData.AccountID`, so for AccountCategory / ControlCenter / TranType plans the Progress menu item does nothing at all — no dialog, no message. All four types are creatable; three are un-trackable. See Part 2 for the full business-requirement analysis.

### Medium — correctness / stale-state bugs

4. **Newly created plans don't appear on the list.** `fetchAllPlans` caches in `listPlan` + `isPlanListLoaded` (`services/finance-odata.service.ts:1595-1646`); `createPlan` never invalidates it; the list's `ngOnInit` calls `onRefresh(false)` (`plan-list.component.ts:95`). Create → navigate back → the plan is invisible until a manual "Refresh". Fix: invalidate the cache in create/change/delete (or `onRefresh(true)` on init).
5. **Progress math ignores what a "plan" means.** `GetAccountBalance` returns the account's *lifetime* net balance in the home base currency (FX-converted per doc, `achihapi/.../FinanceReportsController.cs:160-218`), while the dialog compares it against `TargetBalance` denominated in the *plan's* `TranCurrency` (`plan-list.component.ts:64-66`). Plan StartDate/TargetDate play no role; the currency label is the plan's but the number is base-currency.
6. **`readPlan` swallows "not found."** Returns a default-constructed empty `Plan` when the filter yields no row (`finance-odata.service.ts:1709`), so a bad/foreign id deep-link to `display/:id` renders a blank disabled form instead of an error.

### Medium — visible-but-broken bits in the progress dialog

7. **Currency addons render empty.** `<span nzInputAddonAfter [ngModel]="…TranCurrency"></span>` (`plan-list.component.html:153,164,176`) — `[ngModel]` on a span displays nothing. Working patterns: `<span nzInputAddonAfter>{{ baseCurrency }}</span>` (`reconcile-by-month.component.html:101`) or ng-zorro 22's `[nzAddonAfter]` string input on `nz-input-number`. Same broken pattern exists in `finance-asset-deprec.dlg.html:26`.
8. **Hand-written `$safeNavigationMigration(...)` migration artifacts.** Verified to *compile and run* — it is a real Angular built-in magic function emitted by the `safe-optional-chaining` schematic (`node_modules/@angular/compiler`; that is why the build and all tests stay green). But ~17 template spots (plan-list modal + `document-normal-create.component.html` + `document-transfer-create.component.html`) hand-use a migration escape hatch where plain `?.` is honest app code. Fragile; rewrite before it gets copy-pasted further.
9. **Dialog shows raw ids** — Type as enum number `0-3` (string only in `nzExtra`), Account as numeric `AccountID` with name in extra, ID as number. Functional, debug-looking.

### Low — stubs, dead code, polish

10. `onDisplayPlan()` is an empty stub (`plan-detail.component.ts:500-502`) — the success screen's "Display" does nothing (should navigate to `/finance/plan/display/${objectIdCreated}`).
11. "Create another Plan" button has no handler, hardcoded English, no i18n (`plan-detail.component.html:216`).
12. Success screen reuses `Finance.ActivitySaved` for title **and** subtitle of a Plan — wrong copy inherited from the Activity page.
13. **Orphaned `PlanComponent`**: `plan.component.ts/.html (`<p></p>`)/.less/.spec` — never referenced by `plan.routes.ts` or any router. Dead code; one passing test of noise.
14. Child-mode screen ends in a dead `OK` button with no handler (`plan-list.component.html:23`).
15. List table lacks the columns that make a plan list useful (target amount, currency, target object name, progress %); no empty-state prompt.
16. Validation: Description is `Validators.required` but the label isn't marked `nzRequired`; Amount accepts 0/negatives (UI and API — `FinancePlan.IsValid` checks currency/description/dates/type but never `TargetBalance`).
17. **Test coverage mirrors the gaps**: `plan-detail.spec.ts:65` spies on `changePlan` — a method the real service doesn't have (`createSpyObj` masks its absence) — and has zero update-mode, delete, or modal-render tests; `plan-list.spec.ts` sets the modal flag but never renders its template, so #7/#8 are invisible to CI.

---

## Part 2 — "Check Progress": business requirements

### 1. What a Plan actually asserts

A plan is a claim about money, of one of two fundamentally different shapes:

| PlanType | The business question | Metric kind |
|---|---|---|
| **Account** | "Will account X hold balance **T** by date D?" | **Stock** — balance at a point in time |
| **AccountCategory** | "Did category C **flow** (spend/earn) exceed/under X in [S, D]?" | **Flow** — sum over a window |
| **ControlCenter** | "Did this purpose/project (CC) consume/gain X in [S, D]?" | Flow |
| **TranType** | "Did we overspend on dining-out / undershoot sales in [S, D]?" | Flow |

The current dialog treats all four as the Account case (and only when `AccountID` is set) — that is the root gap, not just the missing click-handler.

### 2. Three semantic decisions behind "progress"

**(a) What counts as "actual" for Account plans**

- *Absolute*: balance today vs T ("do I have the 50k yet?").
- *Delta-from-baseline*: (balance today − balance at StartDate) vs (T − balance at StartDate) ("how far have I come **toward** the goal since I made it?").

The delta reading is what makes StartDate meaningful: baseline 20k, target 50k, today 26k → **20 %**, not 52 %. `GetAccountBalanceEx` already returns balance per selected date, so both are computable — it is a policy choice, not a capability limit. *Recommendation: delta-from-baseline.*

**(b) Direction: target-to-reach vs ceiling-not-to-exceed**

A savings goal and a dining budget are opposite polarity. For the budget, "70 % used" is the meaningful bar (red near 100 %); for a savings goal, 70 % reached means behind. The data model has no GoalType field, but direction is derivable almost everywhere: `FinTransactionType.Expense` flags TranType plans; account categories carry income/expense meaning (`FinanceAccount` switches on `CategoryID`); CC plans are spend-tracking by nature. Net (In − Out) is the ambiguous case. *Recommendation: infer from the referenced object; defer an explicit `GoalDirection` column (EDM + `FinancePlan` + SchemaUpgrade step) until inference proves wrong.*

**(c) Time**

Progress is only meaningful against the window `[StartDate, TargetDate]`: elapsed/total days gives a "should-be-at" pace marker on the bar (linear), days remaining powers a pace hint ("need ≈ 420/week"). After TargetDate the bar freezes at the as-of-TargetDate value and the dialog shows a "Closed / hit / missed by …" state. Today's dialog ignores dates entirely — `GetAccountBalance` is lifetime and unclipped.

### 3. Currency rule (the quiet trap)

All server aggregates convert each document by `ExgRate` into the **home base currency**. `TargetBalance` is in the **plan's** `TranCurrency`. If they differ, `Difference = actual − target` subtracts incompatible numbers — the current dialog already does this silently.

*Recommended rule:*

- plan currency == base → full progress UI;
- plan currency ≠ base → show Actual (base) and Target (plan currency) separately; Difference shows "n/a — currency mismatch". Converting the actual back with *today's* rate would fabricate history.

Alternative (stricter): force plan currency = home base at create-time (the form already defaults to it). Simplest, but removes "save in USD while home base is CNY" plans.

### 4. Can we build this from existing endpoints? (honest audit)

| Need | Endpoint | Verdict |
|---|---|---|
| Balance at 2 dates (Account) | `GetAccountBalanceEx(HomeID, AccountID, [dates])` | ✅ exact, daily precision |
| Flow for TranType, incl. children | `GetReportByTranTypeMOM(..., IncludeChildren, Period=year)` | ⚠️ **month** granularity, one year per call; boundary months counted whole |
| Flow for ControlCenter | `GetReportByControlCenterMOM` | ⚠️ same caveats |
| Flow for **AccountCategory** over a window | — | ❌ **does not exist**; `GetReportByAccount` is not window-bound; category isn't a key anywhere |
| The current dialog's number | `GetAccountBalance` | ✅ exists but wrong semantics (lifetime, unclipped) |

UI-only is possible for 3 of 4 types with month-rounding distortion and multi-year N-calls, and **not possible at all for AccountCategory**.

### 5. Recommended design: one server action owns the semantics

```
POST /FinanceReports/GetPlanProgress  { HomeID, PlanID }
→ {
    PlanType, Direction (Goal|Ceiling),
    Target, TargetCurrency,
    Actual,                     // balanceΔ or clipped period sum, base currency
    StartBaseline, CurrentValue,
    CurrencyComparable: bool,
    DaysTotal, DaysElapsed,     // server-clock = same clock the sums use
    Finished: bool
  }
```

Why server-side: reuses the exact FX / `UseCurr2` logic in `FinanceReportsController` (daily precision via `FinanceDocument.TranDate`); makes category flow a first-class query (`docitem.AccountID → FinanceAccount.CategoryID`); enforces the `HomeMembers` tenant check once; keeps TranType-children rollup consistent with the MOM reports; reduces the UI to one call + a progress bar. ~1 controller method + one EDM binding + integration test. No schema change → the new-entity checklist is not triggered (this is a *function*, not an entity set). Pattern precedent: `GetAccountBalance`.

### 6. UI shape of the finished dialog

- Plan identity block: type name, target object **by name**, window, description — not raw enum/IDs.
- **nz-progress bar**: fill = actual / target; striped + colored by direction (goal: blue→green at 100 %; ceiling: green→red at 100 %); pace tick at `elapsed/total`.
- Rows: Expected (target, plan currency) / Actual (base) / **Difference** (signed, colored, or "n/a — currency mismatch").
- Footer: `x of y days elapsed` + pace hint ("≈ Z/week to hit target" / "over budget by Z, N days left"); past TargetDate → "Closed" state with final numbers.
- Non-Account types finally get real content; `onCheckProgress` no longer bails on empty `AccountID`.
- List progress-% column = deliberate phase 2 (N × `GetPlanProgress`; batch `PlanIDs[]` variant of the action if wanted).

---

## Part 3 — Path to done

1. `changePlan` (PUT) + delete-confirm flow + wire both UI paths → makes the feature usable (High #1, #2).
2. Cache invalidation on create/change/delete (Medium #4).
3. **Check Progress**: resolve the three decisions (Part 2.2–2.3), then implement `GetPlanProgress` (API) + dialog rewrite (UI), per-type (High #3).
4. Post-create buttons (Low #10, #11), currency-addon fix (Medium #7), copy fixes (Low #12).
5. Cleanup: remove `PlanComponent` (Low #13), rewrite `$safeNavigationMigration` artifacts (Medium #8), child-mode button (Low #14).
6. Tests for edit / delete / progress per type; update-mode coverage (Low #17).

## Open decisions (answer these to start implementation)

1. **Account semantics** — delta-from-StartDate (recommended) vs absolute balance?
2. **Direction** — infer from expense flags (recommended) vs explicit Goal/Ceiling field on the create form?
3. **Compute location** — new `GetPlanProgress` API action (recommended) vs UI-only monthly MOM math (coarse; AccountCategory impossible)?
4. **Currency mismatch** — show "n/a" (recommended) vs restrict plans to home base currency?
