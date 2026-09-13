//
// DOM tests for the generic filter dialog (design §11, as corrected by the
// hierarchy contract: single top node under an invisible wrapper, kind-armed
// toolbar, empty tree not submittable, Simplify at the Submit boundary).
//

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { ApartmentOutline, DeleteOutline, PlusOutline } from '@ant-design/icons-angular/icons';
import { FilterJoinType, FilterOperation, FilterRoot } from 'actslib';
import { TranslocoService } from '@jsverse/transloco';
import { getTranslocoModule } from 'testing';

import {
  FilterCustomOperator,
  FilterDialogData,
  FilterableProperty,
  SharedFilterDialogComponent,
  SharedFilterDialogLeaf,
  SharedFilterDialogNode,
} from './index';

enum DocStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

const IS_MULTIWORD: FilterCustomOperator = {
  id: 'isMultiword',
  labelKey: 'Doc.Multiword',
  emit: (property) => ({ property, operation: FilterOperation.Contains, lowValue: ' ' }),
  recognize: (c) => c.operation === FilterOperation.Contains && c.lowValue === ' ',
};

const SCHEMA: FilterableProperty[] = [
  {
    key: 'title',
    labelKey: 'Doc.Title',
    kind: 'string',
    operations: [FilterOperation.BeginsWith, FilterOperation.Contains, FilterOperation.Equal, FilterOperation.EndsWith],
    customOperators: [IS_MULTIWORD],
  },
  {
    key: 'status',
    labelKey: 'Doc.Status',
    kind: 'enum',
    enumValues: DocStatus,
    choices: [
      { value: DocStatus.Draft, labelKey: 'Doc.Draft' },
      { value: DocStatus.Published, labelKey: 'Doc.Published' },
      { value: DocStatus.Archived, labelKey: 'Doc.Archived' },
    ],
  },
  { key: 'score', labelKey: 'Doc.Score', kind: 'number', numberRange: { min: 0, max: 5 } },
  { key: 'createdAt', labelKey: 'Doc.Created', kind: 'date' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function closeArgs(ref: any): unknown[] {
  return ref.close.mock.calls.map((c: unknown[]) => c[0]);
}

describe('SharedFilterDialogComponent', () => {
  let fixture: ComponentFixture<SharedFilterDialogComponent>;
  let component: SharedFilterDialogComponent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let modalRef: any;

  async function setupDialog(data: FilterDialogData): Promise<void> {
    modalRef = { close: vi.fn() };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [FormsModule, getTranslocoModule(), SharedFilterDialogComponent],
      providers: [
        { provide: NZ_MODAL_DATA, useValue: data },
        { provide: NzModalRef, useValue: modalRef },
        // Statically register the toolbar icons so NzIconService never falls
        // back to dynamic (HTTP) loading in the test environment.
        { provide: NZ_ICONS, useValue: [PlusOutline, ApartmentOutline, DeleteOutline] },
      ],
    });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(SharedFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function buttonByText(text: string): HTMLButtonElement | undefined {
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ) as HTMLButtonElement[];
    return buttons.find((b) => b.textContent?.trim() === text);
  }

  function submitButton(): HTMLButtonElement {
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.fd-footer button'),
    ) as HTMLButtonElement[];
    const btn = buttons.find((b) => b.textContent?.trim() === 'Submit');
    if (!btn) {
      throw new Error('Submit button not rendered');
    }
    return btn;
  }

  function treeRowTexts(): string[] {
    const nodes = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.ant-tree-node-content-wrapper'),
    ) as HTMLElement[];
    return nodes.map((n) => n.textContent?.trim() ?? '');
  }

  /** The single top node the navigator shows (the wrapper is never a row). */
  function topMember(): SharedFilterDialogLeaf | SharedFilterDialogNode {
    const top = component.root().members[0];
    if (!top) {
      throw new Error('tree has no top node');
    }
    return top;
  }

  function selectedLeaf(): SharedFilterDialogLeaf {
    const m = component.selectedMember();
    if (!m || 'members' in m) {
      throw new Error('no leaf is selected');
    }
    return m;
  }

  it('opens scaffolded with one blank condition (case 1), selected; Submit gated', async () => {
    await setupDialog({ properties: SCHEMA });
    expect(component).toBeTruthy();
    expect(component.root().members.length).toBe(1); // the wrapper holds ONE node
    expect(component.selectedId()).toBe(topMember().id); // the leaf, not the wrapper
    expect(component.canSubmit()).toBe(false); // blank condition blocks Submit
    expect(submitButton().disabled).toBe(true);
    expect(treeRowTexts().length).toBe(1); // the wrapper is never a row
    // kind-arming: a CONDITION is selected → delete only
    expect(buttonByText('Condition')?.disabled).toBe(true);
    expect(buttonByText('Group')?.disabled).toBe(true);
    expect(buttonByText('Delete')?.disabled).toBe(false);
  });

  it('a seeded bare condition (case 1) opens as the single leaf', async () => {
    const bare = { property: 'title', operation: FilterOperation.Contains, lowValue: 'foo' };
    await setupDialog({ properties: SCHEMA, root: bare });
    expect(component.root().members.length).toBe(1);
    const leaf = selectedLeaf();
    expect(leaf.propertyKey).toBe('title');
    expect(leaf.textValue).toBe('foo');
    expect(component.canSubmit()).toBe(true);
  });

  it('tree refreshes after toolbar inserts and deletes', async () => {
    await setupDialog({ properties: SCHEMA });
    // a condition is selected → inserts disarmed → select the top GROUP after
    // building one: first delete the scaffolded leaf (tree empties, inserts arm)
    component.deleteSelected();
    fixture.detectChanges();
    expect(component.root().members.length).toBe(0);
    expect(component.selectedId()).toBeNull(); // the insert-anchor state
    expect(buttonByText('Delete')?.disabled).toBe(true);

    component.addCondition(); // lands as THE top node
    fixture.detectChanges();
    expect(component.root().members.length).toBe(1);
    expect(treeRowTexts().some((t) => t.length > 0)).toBe(true);

    // a leaf is selected again → inserts disarmed; delete returns the
    // selection to nothing (the tree emptied — the top level holds one node)
    component.deleteSelected();
    fixture.detectChanges();
    expect(component.root().members.length).toBe(0);
    expect(component.selectedId()).toBeNull();
  });

  it('edits flow through the root signal (identity changes — the OnPush guard)', async () => {
    await setupDialog({ properties: SCHEMA });
    fixture.detectChanges();
    const before = component.root();
    component.setTextValue('hello');
    expect(component.root()).not.toBe(before); // immutable replacement through the signal
    expect(selectedLeaf().textValue).toBe('hello');
    fixture.detectChanges();
    expect(treeRowTexts().some((t) => t.includes('hello'))).toBe(true);
  });

  it('operator switches keep values; a property switch resets them', async () => {
    await setupDialog({ properties: SCHEMA });
    fixture.detectChanges();
    const leaf = selectedLeaf();
    component.setTextValue('keepme');
    component.setOperator(FilterOperation.EndsWith);
    expect(selectedLeaf().textValue).toBe('keepme'); // operator switch preserves

    component.setProperty('score');
    const after = selectedLeaf();
    expect(after.id).toBe(leaf.id); // the leaf id survives the swap
    expect(after.propertyKey).toBe('score');
    expect(after.operator).toBe(FilterOperation.GreaterThan); // re-defaulted
    expect(after.textValue).toBe(''); // values reset with the property
  });

  it('switching property switches the operator list and the value editor', async () => {
    await setupDialog({ properties: SCHEMA });
    fixture.detectChanges();
    expect(component.valueEditor()).toBe('text');
    expect(component.operatorOptions().map((o) => o.value)).toContain(FilterOperation.Contains);

    component.setProperty('score');
    fixture.detectChanges();
    expect(component.valueEditor()).toBe('number');
    expect(component.operatorOptions().map((o) => o.value)).not.toContain(FilterOperation.Contains);
    expect(component.operatorOptions().map((o) => o.value)).toContain(FilterOperation.Between);
  });

  it('enum editor renders checkboxes; multi-select emits an OR group; Submit reflects it', async () => {
    await setupDialog({ properties: SCHEMA });
    component.setProperty('status');
    fixture.detectChanges();

    const checkboxes = fixture.nativeElement.querySelectorAll('.fd-choices input[type="checkbox"]');
    expect(checkboxes.length).toBe(3);
    expect(component.canSubmit()).toBe(false); // zero choices invalid
    expect(submitButton().disabled).toBe(true);

    (checkboxes[0] as HTMLInputElement).click();
    (checkboxes[1] as HTMLInputElement).click();
    fixture.detectChanges();
    expect(component.canSubmit()).toBe(true);

    submitButton().click();
    fixture.detectChanges();
    const args = closeArgs(modalRef);
    expect(args.length).toBe(1);
    const result = args[0] as { root: FilterRoot };
    // the wrapper held one member (the enum leaf emitting an OR group), so
    // Simplify unwraps it — the OR group IS the root
    const group = result.root as { join?: FilterJoinType; conditions?: unknown[] };
    expect(group.join).toBe(FilterJoinType.OR);
    expect(group.conditions?.length).toBe(2);
  });

  it('enum fold-back seeds the checkboxes checked', async () => {
    await setupDialog({
      properties: SCHEMA,
      root: {
        join: FilterJoinType.AND,
        conditions: [
          {
            join: FilterJoinType.OR,
            conditions: [
              { property: 'status', operation: FilterOperation.Equal, lowValue: DocStatus.Draft },
              { property: 'status', operation: FilterOperation.Equal, lowValue: DocStatus.Published },
            ],
          },
        ],
      },
    });
    const leaf = selectedLeaf();
    expect(leaf.selectedChoices).toEqual([DocStatus.Draft, DocStatus.Published]);
    fixture.detectChanges();
    // ngModel seeds the checkbox via a microtask — let it settle, then re-render
    await fixture.whenStable();
    fixture.detectChanges();

    const inputs = Array.from(
      fixture.nativeElement.querySelectorAll('.fd-choices input[type="checkbox"]'),
    ) as HTMLInputElement[];
    expect(inputs.length).toBe(3);
    const checked = inputs.filter((i) => i.checked);
    expect(checked.length).toBe(2);
    expect(component.canSubmit()).toBe(true);
  });

  it('Between shows two inputs and gates Submit on low ≤ high', async () => {
    await setupDialog({ properties: SCHEMA });
    component.setProperty('score');
    component.setOperator(FilterOperation.Between);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.fd-field input[type="number"]').length).toBe(2);
    expect(component.canSubmit()).toBe(false);

    component.setLowValue(5);
    component.setHighValue(2);
    fixture.detectChanges();
    expect(component.canSubmit()).toBe(false); // reversed

    component.setLowValue(2);
    component.setHighValue(5);
    fixture.detectChanges();
    expect(component.canSubmit()).toBe(true);
    expect(submitButton().disabled).toBe(false);
  });

  it('custom operator hides the value editor and shows the hint', async () => {
    await setupDialog({ properties: SCHEMA });
    component.setOperator(IS_MULTIWORD.id);
    fixture.detectChanges();
    expect(component.valueEditor()).toBe('none');
    expect(fixture.nativeElement.textContent).toContain('This operator needs no value.');
    expect(component.canSubmit()).toBe(true); // valueless ops never block Submit
  });

  it('a group with < 2 members blocks Submit and shows the warning icon', async () => {
    await setupDialog({ properties: SCHEMA });
    // empty the tree → the inserts arm (nothing selected)
    component.deleteSelected();
    fixture.detectChanges();
    component.addGroup(); // childless OR group, selected — one click, one node
    fixture.detectChanges();
    expect(component.root().members.length).toBe(1);
    expect((topMember() as SharedFilterDialogNode).members.length).toBe(0); // no phantom leaf
    // one member (the group itself is the only node) → invalid, Submit blocked
    expect(component.canSubmit()).toBe(false);
    expect(treeRowTexts().some((t) => t.includes('⚠'))).toBe(true);

    // the group is selected → inserts armed INTO it; fill two leaves
    component.addCondition();
    component.setTextValue('a');
    fixture.detectChanges();
    component.selectedId.set(topMember().id); // re-fetch: inserts replace objects along the path
    component.addCondition();
    fixture.detectChanges();
    const secondLeaf = (topMember() as SharedFilterDialogNode).members[1] as SharedFilterDialogLeaf;
    component.selectedId.set(secondLeaf.id);
    component.setTextValue('b');
    fixture.detectChanges();

    expect(component.canSubmit()).toBe(true);
    expect(treeRowTexts().some((t) => t.includes('⚠'))).toBe(false);
  });

  it('depth cap counts VISIBLE levels (the wrapper is level 0)', async () => {
    await setupDialog({ properties: SCHEMA, maxDepth: 2 });
    // the scaffolded leaf is selected → +group disabled; empty the tree first
    component.deleteSelected();
    fixture.detectChanges();
    expect(buttonByText('Group')?.disabled).toBe(false);
    component.addGroup(); // top group at visible level 1, selected
    fixture.detectChanges();
    expect(buttonByText('Group')?.disabled).toBe(false); // level 1 < 2: can nest
    component.addCondition();
    fixture.detectChanges();
    // now a leaf is selected → +group disabled (a condition arms delete only)
    expect(buttonByText('Group')?.disabled).toBe(true);
    component.selectedId.set(topMember().id);
    fixture.detectChanges();
    expect(buttonByText('Group')?.disabled).toBe(false); // the group can take a nested one

    // ... but the case-2 root CAN always take a nested group at maxDepth 2
    // (condA AND (condB OR condC)); at maxDepth 1 it cannot:
    await setupDialog({ properties: SCHEMA, maxDepth: 1 });
    component.deleteSelected();
    component.addGroup();
    fixture.detectChanges();
    expect(buttonByText('Group')?.disabled).toBe(true); // the top group is already level maxDepth
  });

  it('the invisible wrapper is never selectable or deletable', async () => {
    await setupDialog({ properties: SCHEMA });
    component.deleteSelected();
    component.addGroup();
    fixture.detectChanges();
    expect(component.selectedId()).not.toBe(component.root().id); // the group row, not the wrapper
    expect(component.canDelete()).toBe(true); // the top GROUP row IS deletable
    component.deleteSelected();
    fixture.detectChanges();
    expect(component.root().members.length).toBe(0); // the tree emptied
    expect(component.canDelete()).toBe(false); // nothing selected
  });

  it('Submit closes with a bare condition (case 1); Cancel closes with undefined', async () => {
    await setupDialog({ properties: SCHEMA });
    component.setTextValue('abc');
    fixture.detectChanges();

    const before = component.root();
    submitButton().click();
    fixture.detectChanges();
    expect(component.root()).toBe(before); // Submit must not mutate editor state
    const args = closeArgs(modalRef);
    expect(args.length).toBe(1);
    // single-condition filter crosses the boundary as a BARE condition
    expect(args[0]).toEqual({
      root: { property: 'title', operation: FilterOperation.BeginsWith, lowValue: 'abc' },
    });

    component.cancel();
    fixture.detectChanges();
    expect(closeArgs(modalRef)[1]).toBeUndefined();
    expect(component.root()).toBe(before);
  });

  it('Submit closes with a definition (case 2) for a group tree', async () => {
    await setupDialog({ properties: SCHEMA });
    component.deleteSelected(); // empty the tree → the inserts arm
    component.addGroup(); // the case-2 root group, selected
    component.addCondition();
    component.setTextValue('a');
    component.selectedId.set(topMember().id); // re-fetch, then add a sibling
    component.addCondition();
    const second = (topMember() as SharedFilterDialogNode).members[1] as SharedFilterDialogLeaf;
    component.selectedId.set(second.id);
    component.setProperty('score');
    component.setNumberValue(3);
    fixture.detectChanges();

    submitButton().click();
    fixture.detectChanges();
    const result = (closeArgs(modalRef)[0] ?? {}) as { root: FilterRoot };
    expect((result.root as { conditions?: unknown[] }).conditions?.length).toBe(2);
  });

  it('live preview summarizes the emitted tree', async () => {
    await setupDialog({ properties: SCHEMA });
    component.setTextValue('foo');
    component.deleteSelected(); // empty → +group arms (nothing selected)
    component.addGroup();
    component.addCondition();
    component.setTextValue('foo');
    component.selectedId.set((topMember() as SharedFilterDialogNode).id);
    component.addCondition();
    const second = (topMember() as SharedFilterDialogNode).members[1] as SharedFilterDialogLeaf;
    component.selectedId.set(second.id);
    component.setProperty('score');
    component.setNumberValue(3);
    fixture.detectChanges();
    // Doc.* keys are not in en.json — transloco renders missing keys verbatim
    expect(component.previewText()).toBe('Doc.Title starts with foo AND Doc.Score > 3');
  });

  it('renders the tree via nz-tree with keys following the root signal', async () => {
    await setupDialog({ properties: SCHEMA });
    // the scaffolded leaf is preselected (the wrapper is never a row)
    expect(component.selectedKeys()).toEqual([String(topMember().id)]);

    // delete → empty → insert: selection follows the newly inserted leaf
    component.deleteSelected();
    component.addCondition();
    fixture.detectChanges();
    expect(component.selectedKeys()).toEqual([String(topMember().id)]);
    expect(treeRowTexts().length).toBe(1);
  });

  it('translated options recompute when the language changes while the dialog is open', async () => {
    await setupDialog({ properties: SCHEMA });
    fixture.detectChanges();

    const transloco = TestBed.inject(TranslocoService);
    const enLabels = component.operatorOptions().map((o) => o.label);
    expect(enLabels.length).toBeGreaterThan(0);
    expect(enLabels).toContain('contains'); // Filter.opContains in English

    transloco.setActiveLang('zh');
    const zhLabels = component.operatorOptions().map((o) => o.label);
    expect(zhLabels).not.toEqual(enLabels); // labels recomputed, not frozen
    expect(zhLabels.some((l) => !enLabels.includes(l))).toBe(true);

    transloco.setActiveLang('en'); // leave the global service as others expect it
    expect(component.operatorOptions().map((o) => o.label)).toEqual(enLabels);
  });
});
