import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { TranslocoModule } from '@jsverse/transloco';

import { DATE_SCOPES, DEFAULT_DATE_SCOPE, DateScopeKey, DateScopeRange, resolveDateScope } from './date-scope';

/**
 * hih-date-scope — the filter bar's date-scope segment: a dropdown trigger
 * (styled like the Filter trigger, bolded while off the default) listing the
 * presets from date-scope.ts. Emits the active window on every change;
 * `undefined` means "No restriction" (the page then sends no date clause and
 * precise windows come from the structured filter dialog instead).
 *
 * Host usage: `<hih-date-scope (rangeChange)="onScopeChange($event)" />`
 * between the bar's dividers — the component carries no bar layout itself.
 */
@Component({
  selector: 'hih-date-scope',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzButtonModule, NzDropdownModule, NzIconModule, NzMenuModule, TranslocoModule],
  styleUrls: ['./date-scope.component.less'],
  template: `
    <button
      nz-button
      nzType="link"
      nz-dropdown
      [nzDropdownMenu]="menuScope"
      [class.filter-bar-active]="scope() !== initial()"
    >
      {{ scopeLabel() | transloco }}
      <i nz-icon nzType="down"></i>
    </button>
    <nz-dropdown-menu #menuScope="nzDropdownMenu">
      <ul nz-menu>
        @for (s of scopes; track s.key) {
          <li nz-menu-item (click)="select(s.key)">
            @if (scope() === s.key) {
              <i nz-icon nzType="check"></i>
            }
            {{ s.labelKey | transloco }}
          </li>
        }
      </ul>
    </nz-dropdown-menu>
  `,
})
export class DateScopeComponent {
  readonly scopes = DATE_SCOPES;
  /** The scope pages treat as default: the trigger stays unbolded while equal. */
  readonly initial = input<DateScopeKey>(DEFAULT_DATE_SCOPE);
  /** Active window on change; undefined = no restriction. */
  readonly rangeChange = output<DateScopeRange | undefined>();
  /** Active preset key on every selection (incl. re-picks) - pages use it to
   *  light the filter bar while the scope deviates from the default. */
  readonly keyChange = output<DateScopeKey>();

  readonly scope = signal<DateScopeKey>(this.initial());
  // The initial input is LIVE: a host that swaps it at runtime must move the
  // active scope with it, or the trigger label and the [class.filter-bar-active]
  // binding below would disagree. The user's own select() wins from here on -
  // the effect only re-fires when initial() itself changes.
  private readonly initialSync = effect(() => this.scope.set(this.initial()));
  readonly scopeLabel = computed(
    () => DATE_SCOPES.find((s) => s.key === this.scope())?.labelKey ?? 'DateScope.ThisMonth',
  );

  select(key: DateScopeKey): void {
    // Re-picking the ACTIVE scope re-emits its freshly resolved window: with
    // month/year presets the same key can mean a different span now (a tab
    // left open across a month boundary otherwise has no refresh gesture).
    // Consumers dedupe identical queries, so a true no-op costs nothing.
    // keyChange fires BEFORE rangeChange on purpose: hosts that refetch from
    // the range event may consult the (new) key to decide whether the default
    // preset's window must be re-resolved at query time.
    this.scope.set(key);
    this.keyChange.emit(key);
    this.rangeChange.emit(resolveDateScope(key));
  }
}
