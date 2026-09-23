import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTreeNode } from 'ng-zorro-antd/tree';

import { TranType } from '@model/index';
import { SafeAny } from '@common/any';
import { FlatTreeRow, buildFlatTree, dottedPathTitle } from '@common/flat-tree';

/**
 * Transaction-type picker as an inline tree-select (no flat dropdown, no dialog).
 *
 * The control's value is the transaction type ID (number | undefined), so it
 * drops into both `[(ngModel)]` (document item rows) and `formControlName`
 * (document/plan forms) exactly where the old `nz-select` of
 * `[nzValue]="tt.Id" [nzLabel]="tt.FullDisplayText"` used to sit. The
 * FullDisplayText is rebuilt on the collapsed trigger by walking the selected
 * node's parents, keeping the familiar '主业收入.工资' label.
 *
 * Income/outgoing styling: every node renders through the custom template with
 * the global .hih-trantype-node-* classes (see src/styles.less - global
 * because the dropdown lives in a body-level CDK overlay the component styles
 * cannot reach). The direction is each node's OWN `Expense` flag, the same
 * marker the report views use to split IN/OUT amounts.
 */
@Component({
  selector: 'hih-trantype-tree-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NzTreeSelectModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TranTypeTreeSelectComponent),
      multi: true,
    },
  ],
  // The outer CVA's `touched` has to follow the inner control's blur. nz-tree-select
  // does report its own CVA touched (a FocusMonitor on its element plus
  // closeDropdown), but that callback belongs to the inner NgModel this template
  // binds - nothing forwards it to the control the wrapper exposes, so `touched`
  // could never become true from focus-then-leave alone (the `nz-select` this
  // wrapper replaced did fire it on blur). Focus leaving this host subtree IS that
  // blur: in single (non-multiple) mode the search input renders inside the trigger,
  // so the entire control lives in the host.
  host: { '(focusout)': 'onHostFocusOut()' },
  template: `
    <nz-tree-select
      style="width: 100%"
      [nzNodes]="tree().nodes"
      [ngModel]="nodeValue()"
      [nzDisabled]="isDisabled()"
      [nzAllowClear]="allowClear()"
      [nzDropdownStyle]="dropdownStyle"
      [nzDisplayWith]="displayWith"
      [nzTreeTemplate]="nodeTpl"
      nzShowSearch
      (ngModelChange)="onPick($event)"
    ></nz-tree-select>
    <ng-template #nodeTpl let-node>
      <span
        class="hih-trantype-node"
        [class.hih-trantype-node-outgoing]="isExpense(node.key)"
        [class.hih-trantype-node-income]="!isExpense(node.key)"
      >
        <span aria-hidden="true">{{ isExpense(node.key) ? '↓' : '↑' }}</span
        >{{ node.title }}
      </span>
    </ng-template>
  `,
  styles: [':host { display: block; }'],
})
export class TranTypeTreeSelectComponent implements ControlValueAccessor {
  /** Flat transaction-type dictionary; the fetchers sort income before outgoing, so roots and children inherit that grouping. */
  readonly tranTypes = input<TranType[]>([]);
  /** Host-level disable (display modes), on top of the reactive-form `setDisabledState`. */
  readonly disabled = input<boolean>(false);
  /**
   * Clear (x) affordance on the trigger. Defaults to **false** - the `nz-select` this
   * wrapper replaced defaulted it to false too, while `nz-tree-select` defaults it to
   * true, which silently made every converted field clearable. A site that wants the
   * button (and the `undefined` its clear emits) opts in explicitly.
   */
  readonly allowClear = input<boolean>(false);

  private readonly _value = signal<number | undefined>(undefined);
  private readonly _formDisabled = signal(false);
  private _fnChange: (value: number | undefined) => void = () => {};
  private _fnTouched: () => void = () => {};

  // CVA callbacks arrive from OUTSIDE this view's change detection (the host's
  // NgModel/FormBuilder write path): the plain-signal writes below do not mark
  // this OnPush view for check when they run mid-tick, so re-check explicitly
  // (same belt-and-suspenders the zoneless migration uses everywhere).
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isDisabled = computed(() => this.disabled() || this._formDisabled());

  /** ngModel value of the inner tree-select: the ID as its node key string, or null (placeholder). */
  readonly nodeValue = computed<string | null>(() => (this._value() === undefined ? null : String(this._value())));

  /** Hierarchical nodes + key -> Expense direction map, rebuilt when the dictionary changes. */
  readonly tree = computed(() => {
    const tts = this.tranTypes();
    // The direction map is a plain walk of the dictionary, independent of the
    // hierarchy, so it is built here rather than recovered from the nodes.
    const expenseByKey: { [key: string]: boolean } = {};
    const rows: FlatTreeRow[] = [];
    tts.forEach((tt) => {
      if (tt.Id === undefined) {
        // An unsaved row has no id to key a node (or a direction) by.
        return;
      }
      rows.push({ id: tt.Id, parentId: tt.ParId, title: tt.Name });
      expenseByKey[String(tt.Id)] = tt.Expense;
    });
    return { nodes: buildFlatTree(rows), expenseByKey };
  });

  // Caps the dropdown panel like the book-category tree-select does - the
  // tree renders every expanded node and would otherwise grow very tall.
  readonly dropdownStyle: { [key: string]: string } = { 'max-height': '300px', overflow: 'auto' };

  isExpense(key: string): boolean {
    return this.tree().expenseByKey[key] === true;
  }

  /** Full dotted path of the selected node ('主业收入.工资'), from its parent chain. */
  readonly displayWith = (node: NzTreeNode | undefined): string | undefined => dottedPathTitle(node);

  /** The tree-select CVA emits the picked node key, or null from its clear button. */
  onPick(key: SafeAny): void {
    const s = key as string | null;
    const id = s === null || s === undefined || s === '' ? undefined : +s;
    this._value.set(id);
    this.cdr.markForCheck();
    this._fnChange(id);
    this._fnTouched();
  }

  // Forwarded from the host's focusout (see the decorator): this is what makes
  // focus-then-leave count as a touch, so a host's `nzErrorTip` on a required field
  // can render. Idempotent - AbstractControl.markAsTouched only acts on the
  // transition, so the extra calls from picks and repeated blurs are harmless.
  onHostFocusOut(): void {
    this._fnTouched();
  }

  writeValue(value: SafeAny): void {
    if (value === null || value === undefined) {
      this._value.set(undefined);
      this.cdr.markForCheck();
      return;
    }
    const n = typeof value === 'string' ? Number(value) : (value as number);
    this._value.set(typeof n === 'number' && !Number.isNaN(n) ? n : undefined);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: SafeAny): void {
    this._fnChange = fn;
  }

  registerOnTouched(fn: SafeAny): void {
    this._fnTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._formDisabled.set(isDisabled);
    this.cdr.markForCheck();
  }
}
