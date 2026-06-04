# Karma to Vitest Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the project's test infrastructure from Karma/Jasmine to Vitest (the Angular 21 default), updating all configuration files, the test setup entry point, and every spec file's API usage so that all existing tests pass under Vitest.

**Architecture:** Replace the Karma runner and Jasmine framework with Angular's official `@angular/build:unit-test` builder (which runs Vitest under the hood). All existing `*.spec.ts` files are preserved but updated to use Vitest APIs (`vi.spyOn`, `vi.fn()`, `beforeEach`/`beforeAll` from `vitest`, etc.) instead of Jasmine APIs (`jasmine.createSpyObj`, `spyOn` on partial objects, etc.). The test setup file is replaced with a Vitest-compatible version. The `karma.conf.js` is deleted.

**Tech Stack:** Angular 21, `@angular/build` 21.2.12 (already installed), Vitest (via Angular builder), jsdom, TypeScript 5.9, existing ~100 spec files, ~154 `waitForAsync` references, ~98 `jasmine.createSpyObj` references, ~2500 `fakeAsync`/`tick`/`flush` references.

---

## Key Jasmine → Vitest API Mapping

| Jasmine API | Vitest Replacement |
|---|---|
| `jasmine.createSpyObj('Name', ['method'])` | `vi.fn()` for each method, manually build object, or use a helper |
| `spyOn(obj, 'method' as never)` | `vi.spyOn(obj, 'method')` |
| `waitForAsync(fn)` | `await waitForAsync(fn)` or just use `async/await` — Angular re-exports `waitForAsync` but under Vitest it wraps `vi.waitFor` |
| `fakeAsync(fn)` / `tick()` / `flush()` / `discardPeriodicTasks()` | Angular re-exports these from `@angular/core/testing` — they work with Vitest in Angular 21 |
| `expect(x).withContext('msg').toEqual(y)` | `expect(x, msg).toEqual(y)` or `expect(x).toEqual(y)` |
| `inject([Token], (svc) => {...})` | `TestBed.inject(Token)` directly in the test |

## File Mapping

### Files to Create
- `vitest.config.ts` — Vitest configuration
- `src/test-setup.ts` — Replacement for `src/test.ts`, initializes Angular TestBed for Vitest

### Files to Modify
- `package.json` — Remove karma/jasmine devDependencies, add `jsdom` devDependency
- `angular.json` — Change test builder from `@angular-devkit/build-angular:karma` to `@angular/build:unit-test`
- `tsconfig.spec.json` — Remove `jasmine` from `types`, remove `src/test.ts` and `src/polyfills.ts` from `files`
- `package.json` scripts — Update `devtest` and `test-headless` scripts
- `src/app/**/*.spec.ts` — All ~100 spec files: replace Jasmine APIs with Vitest equivalents
- `src/testing/fake-data-helper.ts` — No changes needed (pure data, no Jasmine API)
- `src/testing/*.ts` — No changes needed (no Jasmine API usage)

### Files to Delete
- `karma.conf.js` — No longer needed
- `src/test.ts` — Replaced by `src/test-setup.ts`

---

### Task 1: Update Configuration Files

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test-setup.ts`
- Modify: `package.json`
- Modify: `angular.json` (lines 126-167, test architect)
- Modify: `tsconfig.spec.json`

- [ ] **Step 1: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcovonly'],
    },
  },
  resolve: {
    mainFields: ['module', 'main'],
  },
});
```

- [ ] **Step 2: Create `src/test-setup.ts`**

This replaces `src/test.ts`. The key difference: under Vitest we still need to initialize the Angular testing environment, but we do NOT import `zone.js/dist/zone-testing` since zone.js is handled via the `polyfills` in `angular.json`.

```typescript
import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Initialize the Angular testing environment
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
```

- [ ] **Step 3: Update `package.json` — devDependencies**

Remove these devDependencies:
- `jasmine-core`
- `karma`
- `karma-chrome-launcher`
- `karma-coverage`
- `karma-jasmine`
- `karma-jasmine-html-reporter`
- `@types/jasmine`

Add:
- `jsdom`: `"^26.0.0"`

The final devDependencies section should be:
```json
"devDependencies": {
  "@angular-devkit/build-angular": "^21.2.11",
  "@angular/cli": "^21.2.11",
  "@angular/compiler-cli": "^21.2.13",
  "@types/node": "^22.13.1",
  "jsdom": "^26.0.0",
  "typescript": "~5.9.0"
}
```

- [ ] **Step 4: Update `package.json` — scripts**

Change:
```json
"devtest": "ng test --code-coverage",
"test-headless": "ng test --watch=false --no-progress --browsers=ChromeHeadlessNoSandbox --code-coverage",
```
To:
```json
"devtest": "ng test --code-coverage",
"test-headless": "ng test --watch=false --code-coverage",
```

(`--browsers` and `--no-progress` flags don't apply to Vitest; the `unit-test` builder handles these differently. `--watch=false` and `--code-coverage` are supported by `@angular/build:unit-test`.)

- [ ] **Step 5: Update `angular.json` — test architect**

Replace the entire `"test"` block in `angular.json`:

**Before:**
```json
"test": {
  "builder": "@angular-devkit/build-angular:karma",
  "options": {
    "polyfills": ["zone.js", "zone.js/testing"],
    "tsConfig": "tsconfig.spec.json",
    "karmaConfig": "karma.conf.js",
    "inlineStyleLanguage": "less",
    "assets": [...],
    "styles": [...],
    "stylePreprocessorOptions": {...},
    "scripts": [...]
  }
}
```

**After:**
```json
"test": {
  "builder": "@angular/build:unit-test",
  "options": {
    "tsConfig": "tsconfig.spec.json",
    "runnerConfig": "vitest.config.ts",
    "browsers": []
  }
}
```

Note: The `polyfills`, `assets`, `styles`, `stylePreprocessorOptions`, and `scripts` options are not supported by the `unit-test` builder — Vitest runs in Node/jsdom, not a real browser, so these are irrelevant for unit tests. The builder will warn about unsupported options if they are included.

- [ ] **Step 6: Update `tsconfig.spec.json`**

**Before:**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jasmine"]
  },
  "files": ["src/test.ts", "src/polyfills.ts"],
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

**After:**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": []
  },
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

- [ ] **Step 7: Delete `karma.conf.js` and `src/test.ts`**

```bash
rm karma.conf.js src/test.ts
```

- [ ] **Step 8: Install dependencies and verify build**

```bash
npm install
npm run build
```

Expected: Build succeeds. We don't run tests yet — the spec files still have Jasmine APIs and will fail.

---

### Task 2: Create a Global `vi` Helper and Migrate `jasmine.createSpyObj` Usages

**Context:** There are 98 occurrences of `jasmine.createSpyObj` across 95 spec files. Vitest doesn't have a direct `createSpyObj` equivalent. We'll create a small utility function in `src/testing/vitest-helpers.ts` that mimics Jasmine's `createSpyObj`, so we can do a mechanical find-and-replace instead of rewriting each one by hand.

**Files:**
- Create: `src/testing/vitest-helpers.ts`
- Modify: `src/testing/index.ts` — export from vitest-helpers

- [ ] **Step 1: Create `src/testing/vitest-helpers.ts`**

```typescript
import { vi } from 'vitest';

/**
 * Mimics jasmine.createSpyObj for Vitest compatibility.
 * Creates an object with a 'name' property and spy methods for each method name.
 *
 * Usage:
 *   const spy = createSpyObj('Router', ['navigate', 'navigateByUrl']);
 *   spy.navigate.and.returnValue(Promise.resolve(true));
 *
 * becomes:
 *   const spy = createSpyObj('Router', ['navigate', 'navigateByUrl']);
 *   (spy.navigate as any).mockReturnValue(Promise.resolve(true));
 *
 * We also provide `.and` compatibility to minimize spec file changes:
 *   - spy.method.and.returnValue(v) → spy.method.mockReturnValue(v)
 *   - spy.method.and.callFake(fn) → spy.method.mockImplementation(fn)
 *   - spy.method.and.callThrough() → spy.method.mockImplementation(fn) (no-op, already a mock)
 *   - spy.method.and.throwError(msg) → spy.method.mockImplementation(() => { throw new Error(msg); })
 *
 * @param name Display name (for debugging)
 * @param methodNames Array of method names to create as spies
 * @returns Object with spy methods
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function createSpyObj<T extends string>(
  name: string,
  methodNames: T[]
): Record<T, ReturnType<typeof vi.fn>> & { _name: string } {
  const obj: any = { _name: name };
  for (const methodName of methodNames) {
    const spy = vi.fn();
    // Add `.and` compatibility layer
    (spy as any).and = {
      returnValue: (val: any) => spy.mockReturnValue(val),
      callFake: (fn: (...args: any[]) => any) => spy.mockImplementation(fn),
      callThrough: () => spy,
      throwError: (msg: string) =>
        spy.mockImplementation(() => {
          throw new Error(msg);
        }),
    };
    obj[methodName] = spy;
  }
  return obj;
}
```

- [ ] **Step 2: Export from `src/testing/index.ts`**

Add this line to the exports:
```typescript
export * from './vitest-helpers';
```

- [ ] **Step 3: Commit**

```bash
git add src/testing/vitest-helpers.ts src/testing/index.ts vitest.config.ts src/test-setup.ts package.json angular.json tsconfig.spec.json
git rm karma.conf.js src/test.ts
git commit -m "refactor(testing): replace Karma/Jasmine with Vitest configuration"
```

---

### Task 3: Migrate All Spec Files — Systematic API Replacement

**Context:** This is the bulk of the work. Every `src/**/*.spec.ts` file needs these changes:

1. **`jasmine.createSpyObj('Name', ['a','b'])` → `createSpyObj<'a'|'b'>('Name', ['a','b'])`** (from our helper)
2. **`spyOn(obj, 'method' as never)` → `vi.spyOn(obj, 'method')`** (need to import `vi` from `vitest`)
3. **`expect(x).withContext('msg').toEqual(y)` → `expect(x, msg).toEqual(y)`**
4. **`.and.returnValue(v)` on spies created via `createSpyObj` stays the same** (our helper supports it)
5. **`inject([Service], (svc) => {...})` → use `TestBed.inject(Service)` in the test body**
6. **Add `import { vi, describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest'`** where needed — Angular's `@angular/build:unit-test` builder auto-injects these globals, so we DON'T need explicit imports for `describe`/`it`/`expect`/`beforeEach`/`afterEach`. But we DO need `import { vi } from 'vitest'` wherever we use `vi.fn()`, `vi.spyOn()`, etc.

**Spec files to migrate** (all files under `src/app` and `src/testing` ending in `.spec.ts`):

We'll use a batch approach — run sed/regex replacements across all spec files, then manually verify and fix any edge cases.

**Files:**
- Modify: All `src/app/**/*.spec.ts` files (~100 files)

- [ ] **Step 1: Replace `jasmine.createSpyObj` with `createSpyObj`**

In all `src/**/*.spec.ts` files, replace:
```
jasmine\.createSpyObj
```
with:
```
createSpyObj
```

Then add the import for `createSpyObj` from `@testing` in files that use it. Note: some files already import from `../../testing` or `@testing/*`; for those that don't but now need `createSpyObj`, add the import.

- [ ] **Step 2: Replace `spyOn(..., ... as never)` pattern**

In all `src/**/*.spec.ts` files, replace:
```typescript
spyOn(obj, 'method' as never)
```
with:
```typescript
vi.spyOn(obj, 'method')
```

And ensure `vi` is imported from `vitest` in those files.

Pattern to search for: `spyOn\(.*,.*as never\)`

For each file with this pattern, the replacement is:
```
// Before:
spyOn(authServiceStub, 'doLogin' as never);
// After:
vi.spyOn(authServiceStub, 'doLogin');
```

Add `import { vi } from 'vitest';` to the file if not already present.

- [ ] **Step 3: Replace `.withContext()` chaining**

Jasmine's `expect(x).withContext('msg').toEqual(y)` needs to become `expect(x, msg).toEqual(y)`.

Pattern: `\.withContext\(['"](.+?)['"]\)\.to`

Replacement: `, '$1').to`

Specifically, in the `expect(...)` call:
```
// Before:
expect(something.length).withContext('should be empty').toEqual(0);
// After:
expect(something.length, 'should be empty').toEqual(0);
```

Note: `.withContext()` can chain to any matcher, not just `.toEqual`. The regex needs to handle:
- `.withContext('msg').toEqual(...)` → `expect(..., 'msg').toEqual(...)`
- `.withContext('msg').toBe(...)` → `expect(..., 'msg').toBe(...)`
- `.withContext('msg').toBeGreaterThan(...)` → `expect(..., 'msg').toBeGreaterThan(...)`
- `.withContext('msg').toBeTruthy()` → `expect(..., 'msg').toBeTruthy()`
- `.withContext('msg').toContain(...)` → `expect(..., 'msg').toContain(...)`
- `.withContext('msg').toHaveBeenCalled()` → `expect(..., 'msg').toHaveBeenCalled()`
- `.withContext('msg').toHaveBeenCalledTimes(n)` → `expect(..., 'msg').toHaveBeenCalledTimes(n)`
- `.withContext('msg').not` → chain `.not` after the matcher

This is a complex regex. The safest approach is to transform:
```
expect(X).withContext('MSG').MATCHER(Y)
```
to:
```
expect(X, 'MSG').MATCHER(Y)
```

And also:
```
expect(X).withContext('MSG').not.MATCHER(Y)
```
to:
```
expect(X, 'MSG').not.MATCHER(Y)
```

- [ ] **Step 4: Replace `inject()` usage**

Some tests use Angular's `inject([Token], (svc) => {...})`. Under Vitest this works but is deprecated. Replace with direct `TestBed.inject()`:

```typescript
// Before:
it('should work', inject([AuthService], (service: AuthService) => {
  expect(service).toBeTruthy();
}));

// After:
it('should work', () => {
  const service = TestBed.inject(AuthService);
  expect(service).toBeTruthy();
});
```

Files affected: `src/app/services/auth.service.spec.ts` (line 32)

- [ ] **Step 5: Verify `fakeAsync`/`tick`/`flush`/`discardPeriodicTasks` imports**

These are re-exported by `@angular/core/testing` and work under Vitest in Angular 21. The existing imports should remain unchanged:
```typescript
import { fakeAsync, tick, flush, discardPeriodicTasks } from '@angular/core/testing';
```

No changes needed — just verify they compile.

- [ ] **Step 6: Remove `jasmine`-specific imports**

Remove any explicit imports of `jasmine` (e.g., `import { jasmine } from ...`). There shouldn't be any explicit jasmine imports since `jasmine` is a global in Karma.

- [ ] **Step 7: Run tests and fix compilation errors**

```bash
npm run test-headless
```

This will likely fail with compilation errors. Fix them iteratively:

1. **Type errors** — Usually caused by `spyOn` on objects where the method type doesn't match. Use `vi.spyOn(obj, 'method' as any)` if needed.
2. **Missing `vi` import** — Add `import { vi } from 'vitest'` where `vi.spyOn` or `vi.fn()` is used.
3. **`withContext` remnants** — Any remaining `.withContext()` calls need manual fixing.
4. **`inject` errors** — If the `inject` function doesn't work, convert to `TestBed.inject()`.

- [ ] **Step 8: Commit**

```bash
git add "src/app/**/*.spec.ts"
git commit -m "refactor(testing): migrate all spec files from Jasmine API to Vitest"
```

---

### Task 4: Update CI Workflow

**Files:**
- Modify: `.github/workflows/build-test.yml`

- [ ] **Step 1: Update the test command**

The `test-headless` script has already been updated in Task 1. The CI workflow references it, so no change is needed to the workflow file itself — just verify that the script works headlessly.

However, we should also remove any Chrome/Puppeteer dependencies from the workflow if they exist. Current workflow:

```yaml
- name: Test
  run: npm run test-headless
```

This is correct as-is — Vitest runs in jsdom (Node.js), so no browser installation is needed. The workflow can stay unchanged.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/build-test.yml
git commit -m "ci: verify test-headless works with Vitest"
```

---

### Task 5: Final Verification and Cleanup

**Files:**
- Modify: any remaining files with issues

- [ ] **Step 1: Run full test suite**

```bash
npm run test-headless
```

All tests must pass. If any fail, diagnose and fix:

- **Component creation failures**: May need `TestBed.compileComponents()` to be awaited or removed (in Angular 21 + Vitest, `compileComponents` is synchronous and can be called without `waitForAsync`).
- **HTTP test failures**: `HttpTestingController` works the same under Vitest.
- **Zone.js timing issues**: `fakeAsync`/`tick`/`flush` work under Vitest in Angular 21. If issues arise, check that `zone.js/testing` is not being imported twice (it should NOT be in `test-setup.ts` since it's provided via `angular.json` polyfills — but since we removed the polyfills from the test target, we may need to add zone.js imports to `test-setup.ts`).

- [ ] **Step 2: Verify code coverage works**

```bash
npm run devtest
```

- [ ] **Step 3: Clean up unused imports**

Search for and remove any remaining references to:
- `jasmine` global usage
- `.withContext()` chains
- `waitForAsync` if it can be replaced with simpler `async/await`

- [ ] **Step 4: Update README.md if it mentions Karma/testing**

Check if README.md mentions Karma or the old test setup and update accordingly.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: complete Karma to Vitest migration, all tests passing"
```

---

## Risk Notes

1. **`fakeAsync`/`tick`/`flush`**: Angular 21 officially supports these under Vitest. They are NOT deprecated. ~2500 usages across 88 files — this is the biggest risk area. If they don't work, we'll need to convert to `async/await` with `await fixture.whenStable()`.

2. **`waitForAsync`**: Angular re-exports this. Under Vitest it wraps `vi.waitFor()`. If issues arise, replace with `async/await` + `await TestBed.compileComponents()`.

3. **`withContext()`**: Vitest's `expect` doesn't have `.withContext()`. We convert to `expect(value, message)`. The message appears in failure output but won't be as nicely formatted.

4. **Ng-Zorro-Antd components**: Tests that use `NzLayoutModule`, `NzTableModule`, etc., should work the same since they're just Angular modules loaded in TestBed.

5. **`src/test.ts` vs `src/test-setup.ts`**: The old `test.ts` imported `zone.js/dist/zone-testing`. Under Vitest with Angular 21, zone.js testing utilities are auto-loaded by the builder. We explicitly initialize the TestBed in `test-setup.ts` but don't import zone.js.

Sources:
- [Migrating from Karma to Vitest - Angular Official Docs](https://angular.dev/guide/testing/migrate-to-vitest)
- [Migrate from Karma To Vitest - ANGULARarchitects](https://www.angulararchitects.io/blog/migrate-from-karma-to-vitest/)
- [Vitest in Angular 21: Faster Testing](https://javascript-conference.com/blog/angular-21-vitest-testing/)
- [Migrating from Jasmine/Karma to Vitest in Angular 21 - Dev.to](https://dev.to/codewithrajat/migrating-from-jasminekarma-to-vitest-in-angular-21-a-step-by-step-guide-developers-complete-3g9l)
- [Testing Angular 21 Components with Vitest: A Complete Guide](https://dev.to/olayeancarh/testing-angular-21-components-with-vitest-a-complete-guide-8l2)
