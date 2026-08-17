# Angular 22 Upgrade — Record & Deferred-Items Tracker

**Date:** 2026-08-13/14 · **Scope:** `achihui` (Angular 21.2.13 → 22.1.x) · **Status:** upgrade complete; all 4 deferred items closed (items 2 & 3 & 4 done 2026-08-15)

## 1. Upgrade summary (complete)

| Check | Result |
|---|---|
| `npm run build` | exit 0, 0 errors |
| `npm run lint` | exit 0, all files pass |
| `npm run test-headless` | exit 0, 1040 passed, 53 skipped (matches pre-upgrade baseline) |
| Environment | Node v24.18.0 satisfies `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0`; CI already on Node 24 |

### Version changes
- `@angular/*` `^21.2.13` → `^22.1.x`; `@angular/cli`/`@angular/build` → `^22.1.3`
- `ng-zorro-antd` → 22.0.1, `ngx-echarts`/`ngx-markdown` → 22.0.0
- `angular-auth-oidc-client` stays on 21.x (peers `@angular >=20` — no bump needed)
- `typescript` `~5.9.0` → `~6.0.3` (Angular 22 requires `>=6.0 <6.1`)
- `zone.js` → 0.16.2, `@angular-eslint` → 22.1.0, `@typescript-eslint` → 8.67, `vitest` → 4.1.10
- `engines.node` → `^22.22.3 || ^24.15.0 || >=26.0.0`
- Migrations run: `@angular/core`, `@angular/cli`, `ng-zorro-antd` (`--migrate-only --from=21 --allow-dirty`)

### Breaking changes encountered & fixes
1. **ng-zorro 22 removed `nz-input-group`** → `nz-input-wrapper`. The wrapper declares `inputDir = contentChild.required(NzInputDirective)`, so it **requires an `input[nz-input]` child** — wrapping `<nz-input-number>` throws **NG0951**. Fix: use `nz-input-number`'s own `[nzAddonBefore]`/`[nzSuffix]` inputs (no wrapper). Casing also changed: `nzAddOnBefore` → `nzAddonBefore`.
2. **ngx-markdown 22**: `KatexOptions` internal → use exported `MarkedKatexOptions`; `katex` attribute requires the `marked-katex-extension` package (added as devDep — without it, async unhandled rejections make vitest exit 1 despite passing tests).
3. **TypeScript 6.0**: `baseUrl` deprecated → added `"ignoreDeprecations": "6.0"` to `tsconfig.json`.
4. **zone.js 0.16**: `import 'zone.js/dist/zone'` no longer resolvable → `import 'zone.js'` in `polyfills.ts` (the real loader is angular.json `polyfills: ["zone.js"]`).
5. **Angular 22 made OnPush the default CD**; `ChangeDetectionStrategy.Default` renamed to `Eager` (migration renamed it across 114 components). angular-eslint 22 rule `prefer-on-push-component-change-detection` flags all 114 → **disabled in `eslint.config.js`** (deferred item 4).
6. **ng-zorro 22 requires `NzDateAdapter`** for date pickers. App: `provideNzDateFnsAdapter()` in `app.config.ts`. Tests: globally via **`src/test-providers.ts`** (`export default [provideNzDateFnsAdapter()]`) wired through the builder's `providersFile` option in `angular.json` (also added to `tsconfig.spec.json` `files`). This single fix took failures 146 → 25 (resolved NG0201 + the cascading "Cannot configure the test module" from NG0201-corrupted compiler state).

### Test-environment notes
- The `@angular/build:unit-test` (Vitest) builder initializes the test environment itself (`BrowserTestingModule`) and puts user `setupFiles` (incl. `src/test-setup.ts`) into vitest `setupFiles`. The project's `initTestEnvironment(BrowserDynamicTestingModule, …)` in `test-setup.ts` is a **no-op** (swallowed by try/catch) — the builder's init governs.
- `TestBed.resetTestingModule()` in an afterEach hook does **not** fix "configureTestingModule after instantiation" — the real cause was NG0201-corrupted compiler state (fixed by providing `NzDateAdapter`).

## 2. Deferred items — progress tracker

| # | Item | Status |
|---|---|---|
| 1 | Drop unused `@angular-devkit/build-angular` devDep | ✅ **Done** 2026-08-14 |
| 2 | Remove deprecated `@angular/animations` | ✅ **Done** 2026-08-15 (app-only; devDep retained — see below) |
| 3 | Remove deprecated `@angular/platform-browser-dynamic` | ✅ **Done** 2026-08-15 |
| 4 | Migrate 114 `Eager` components to OnPush + re-enable eslint rule | ✅ **Done** 2026-08-15 |
| 5 | npm audit vulnerabilities (7) | ✅ **Done** 2026-08-14 (incidental) |

### Item 1 — Drop `@angular-devkit/build-angular` (✅)
Removed from devDeps. Two fragile transitive deps surfaced and were made explicit:
- `@angular/build` (referenced by every builder in angular.json) → direct devDep `^22.1.3`
- `less` (stylesheet preprocessor; optional peer of `@angular/build`) → direct devDep `^4.2.0`

Results: node_modules **1058 → 658 packages**; `npm install` needs a clean resolve (`rm -rf node_modules package-lock.json`) because Angular's exact-version `compiler`/`compiler-cli` peers conflict on incremental installs. Build/lint/test verified green. **Incidentally fixed item 5**: fresh resolve → **0 vulnerabilities** (was 7).

### Item 2 — Remove `@angular/animations` (✅ app-only; devDep retained)

**Outcome:** `@angular/animations` is no longer in the production app or its bundle.
It remains a `devDependency` (test-only) because the test noop-animation driver
needs it — full removal is **not possible** (verified).

What was done (2026-08-15):
1. Removed the `provideAnimationsAsync()` call (and its already-deleted import) from
   `app.config.ts`. The app now provides **no animation driver** → verified: the prod
   bundle contains no `@angular/animations` / `AnimationEngine` code.
2. Demoted `@angular/animations` from `dependencies` → `devDependencies`.
3. Removed the redundant per-spec `NoopAnimationsModule` import + array entry from
   **91 spec files** (one-shot scripted transform + lint `--fix` for prettier reflow).
4. Added a **single global** `provideNoopAnimations()` to `src/test-providers.ts`
   (the builder's `providersFile`), replacing the 91 per-spec providers.

Why the devDep cannot be dropped (the doc's earlier "migrate 93 specs to
`provideNoopAnimations()`, then drop the package" plan is **not achievable**):
- `provideNoopAnimations()` is exported from `@angular/platform-browser/animations`,
  whose `animations.mjs` **statically imports `@angular/animations/browser`**
  (`NoopAnimationDriver`, `ɵAnimationEngine`, …). So the modern provider pulls the
  package just as `NoopAnimationsModule` did — switching APIs does not drop it.
- `@angular/platform-browser` declares `@angular/animations` only as an **optional
  peer** (`peerDependenciesMeta.optional = true`); npm will **not** install it
  transitively. It must be listed explicitly, so it stays in `devDependencies`.
- It is genuinely needed at test time: ng-zorro 22 has **zero** static
  `@angular/animations` references, but its overlay/modal rendering still requires an
  `AnimationDriver` at runtime. Removing the driver entirely broke **144** modal/overlay
  tests (`expected 1 to be 0` on rendered-dialog-DOM assertions); the global noop
  driver restored all 1040. The app itself is unaffected because it is zoneless and
  has no animation bindings (`[@...]`/`trigger()`/`animate()`).

**Net result:** no animation code ships to production; one global test provider
replaces 91 per-spec imports. Verified: `npm run build` / `lint` / `test-headless`
all green — 1040 passed / 53 skipped (baseline holds).

### Item 3 — Remove `@angular/platform-browser-dynamic` (✅ done 2026-08-15)
Deprecated in v22 ("use `@angular/platform-browser`"). `main.ts` already uses `bootstrapApplication` from `@angular/platform-browser`, so the dynamic package was test-only legacy. Removed:
1. The no-op `TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting())` block (and its imports, incl. the now-unused `TestBed` import) from `src/test-setup.ts`. The `@angular/build:unit-test` builder initializes its own `BrowserTestingModule`; the project's init was swallowed by try/catch and governed nothing.
2. `BrowserDynamicTestingModule` import + `imports:` array entry from **72 spec files** (one-shot scripted transform; CRLF-aware this time, no sparse-comma regression). The per-spec import was redundant with the builder's environment.
3. `@angular/platform-browser-dynamic` from `dependencies` in `package.json`. Confirmed nothing else depends on it (`npm ls` empty after removal; not a peer of ng-zorro / angular-auth / @angular/cli / @angular/build). node_modules 678 → 677.

Verified: build / lint / `test-headless` all green — 1040 passed / 53 skipped (baseline holds). Unlike item 2, full removal **was** achievable here: unlike the animation driver, `BrowserDynamicTestingModule` is a test-module type with no runtime need once the builder's environment governs — the full suite passed with it gone.

### Item 4 — OnPush migration (✅ done 2026-08-15)
Migrated 114 `ChangeDetectionStrategy.Eager` declarations → `ChangeDetectionStrategy.OnPush` (110 component `.ts` files + 4 test-host components declared inside spec files; 115 occurrences total), then **re-enabled** the `@angular-eslint/prefer-on-push-component-change-detection` rule in `eslint.config.js` (removed the override).

This was a **behavioral no-op, done mechanically** — and the reason is the app's zoneless configuration (`provideZonelessChangeDetection()` in `app.config.ts`). `Eager` and `OnPush` differ only in *scheduling* (Eager re-checks every CD cycle; OnPush re-checks only when marked dirty), but zoneless CD never runs periodic cycles — it runs only when a signal write, `markForCheck()`, or async pipe schedules a check, at which point both strategies refresh identically. The Signals migration (see `signal-migration-analysis.md`) was already complete, and the 32 components using `ChangeDetectorRef` all call `cdr.markForCheck()` (the OnPush-correct pattern) — e.g. `collection-list.component.ts`. So the per-component verification the original tracker expected was not needed; a single `ChangeDetectionStrategy.Eager` → `.OnPush` replacement was safe and complete.

Verified: build / lint (rule now **enforced**, all components satisfy it) / `test-headless` all green — 1040 passed / 53 skipped (baseline holds).

### Item 5 — npm audit (✅ done, incidental)
Fresh dependency resolve (item 1) picked patched transitive versions → `npm audit` reports **0 vulnerabilities**. No `--force` fixes applied.
