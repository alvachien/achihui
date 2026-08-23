/**
 * Global Angular providers applied to the test environment (TestBed) for every
 * spec, via the `@angular/build:unit-test` builder's `providersFile` option.
 *
 * ng-zorro 22 requires an `NzDateAdapter` for any component using a date picker
 * (`NzDatePickerModule`). The app provides it via `provideNzDateFnsAdapter()` in
 * `app.config.ts`; tests must provide it too. Many specs create components that
 * embed `DocumentHeaderComponent` (which uses a date picker), so provide it
 * globally here rather than per-spec.
 *
 * `provideNoopAnimations()` supplies a no-op `AnimationDriver`. The production
 * app no longer provides animations (`provideAnimationsAsync` was removed from
 * `app.config.ts` — `@angular/animations` is a devDep, not shipped to prod), but
 * ng-zorro's overlay/modal machinery still relies on an animation driver at
 * runtime, so specs that assert on rendered dialog/overlay DOM need one. This
 * replaces the 91 former per-spec `NoopAnimationsModule` imports (now removed).
 */
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

export default [provideNzDateFnsAdapter(), provideNoopAnimations()];
