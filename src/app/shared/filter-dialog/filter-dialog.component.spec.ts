//
// DOM tests for the generic filter dialog (design §11).
//

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { ApartmentOutline, DeleteOutline, PlusOutline } from '@ant-design/icons-angular/icons';
import { FilterJoinType, FilterOperation, IFilterDefinition } from 'actslib';
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

  it('should create with a blank seeded tree and root preselected', async () => {
    await setupDialog({ properties: SCHEMA });
    expect(component).toBeTruthy();
    expect(component.root().members.length).toBe(0);
    expect(component.selectedId()).toBe(component.root().id);
    expect(component.canSubmit()).toBe(true); // empty root = cleared filter, valid
  });

  it('tree refreshes after toolbar inserts and deletes', async () => {
    await setupDialog({ properties: SCHEMA });
    component.addCondition();
    fixture.detectChanges();
    expect(component.root().members.length).toBe(1);
    expect(treeRowTexts().some((t) => t.length > 0)).toBe(true);

    component.addCondition();
    fixture.detectChanges();
    expect(component.root().members.length).toBe(2);

    // delete the selected leaf, selection falls back to the parent (root)
    const leafId = component.selectedId();
    component.deleteSelected();
    fixture.detectChanges();
    expect(component.root().members.length).toBe(1);
    expect(component.selectedId()).toBe(component.root().id);
    expect(leafId).not.toBe(component.root().id);
  });

  it('edits flow through the root signal (identity changes — the OnPush guard)', async () => {
    await setupDialog({ properties: SCHEMA });
    component.addCondition();
    fixture.detectChanges();
    const before = component.root();
    component.setTextValue('hello');
    expect(component.root()).not.toBe(before); // immutable replacement through the signal
    const leaf = component.root().members[0] as SharedFilterDialogLeaf;
    expect(leaf.textValue).toBe('hello');
    fixture.detectChanges();
    expect(treeRowTexts().some((t) => t.includes('hello'))).toBe(true);
  });

  it('value fields survive a property→operator→property round-trip (§6.1)', async () => {
    await setupDialog({ properties: SCHEMA });
    component.addCondition();
    fixture.detectChanges();
    component.setTextValue('keepme');
    component.setProperty('score');
    component.setNumberValue(3);
    component.setProperty('title');
    fixture.detectChanges();
    const leaf = component.root().members[0] as SharedFilterDialogLeaf;
    expect(leaf.textValue).toBe('keepme');
    expect(leaf.numberValue).toBe(3);
  });

  it('switching property switches the operator list and the value editor', async () => {
    await setupDialog({ properties: SCHEMA });
    component.addCondition();
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
    component.addCondition();
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
    const result = args[0] as { root: IFilterDefinition };
    const group = result.root.conditions[0] as IFilterDefinition;
    expect(group.join).toBe(FilterJoinType.OR);
    expect(group.conditions.length).toBe(2);
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
    const leaf = component.root().members[0] as SharedFilterDialogLeaf;
    expect(leaf.selectedChoices).toEqual([DocStatus.Draft, DocStatus.Published]);
    component.selectedId.set(leaf.id);
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
    component.addCondition();
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
    component.addCondition();
    component.setOperator(IS_MULTIWORD.id);
    fixture.detectChanges();
    expect(component.valueEditor()).toBe('none');
    expect(fixture.nativeElement.textContent).toContain('This operator needs no value.');
    expect(component.canSubmit()).toBe(true); // valueless ops never block Submit
  });

  it('nested groups with < 2 members block Submit and show the warning icon', async () => {
    await setupDialog({ properties: SCHEMA });
    component.addGroup(); // inserts a group holding one empty leaf; selects it
    fixture.detectChanges();
    // one member → the nested group is invalid and blocks Submit
    expect(component.canSubmit()).toBe(false);
    expect(treeRowTexts().some((t) => t.includes('⚠'))).toBe(true);

    // add a sibling into the selected group, then fill both leaves
    component.addCondition();
    fixture.detectChanges();
    component.setTextValue('b');
    const group = component.root().members[0] as SharedFilterDialogNode;
    const firstLeaf = group.members[0] as SharedFilterDialogLeaf;
    component.selectedId.set(firstLeaf.id);
    component.setTextValue('a');
    fixture.detectChanges();

    expect(component.canSubmit()).toBe(true);
    expect(treeRowTexts().some((t) => t.includes('⚠'))).toBe(false);
  });

  it('depth cap disables +group at the deepest level; root is never deletable', async () => {
    await setupDialog({ properties: SCHEMA, maxDepth: 2 });
    expect(buttonByText('Group')?.disabled).toBe(false);
    component.addGroup();
    fixture.detectChanges();
    component.selectedId.set((component.root().members[0] as SharedFilterDialogNode).id);
    fixture.detectChanges();
    expect(buttonByText('Group')?.disabled).toBe(true); // now at depth 2

    expect(buttonByText('Delete')?.disabled).toBe(false);
    component.selectedId.set(component.root().id);
    fixture.detectChanges();
    expect(buttonByText('Delete')?.disabled).toBe(true); // root exempt
  });

  it('Submit closes with { root }; Cancel closes with undefined and mutates nothing', async () => {
    await setupDialog({ properties: SCHEMA });
    component.addCondition();
    component.setTextValue('abc');
    fixture.detectChanges();

    const before = component.root();
    submitButton().click();
    fixture.detectChanges();
    expect(component.root()).toBe(before); // Submit must not mutate editor state
    const args = closeArgs(modalRef);
    expect((args[0] as { root: IFilterDefinition }).root.conditions).toEqual([
      {
        property: 'title',
        operation: FilterOperation.BeginsWith,
        lowValue: 'abc',
      },
    ]);

    component.cancel();
    fixture.detectChanges();
    expect(closeArgs(modalRef)[1]).toBeUndefined();
    expect(component.root()).toBe(before);
  });

  it('live preview summarizes the emitted tree', async () => {
    await setupDialog({ properties: SCHEMA });
    component.addCondition();
    component.setTextValue('foo');
    component.addCondition();
    component.setProperty('score');
    component.setNumberValue(3);
    fixture.detectChanges();
    // Doc.* keys are not in en.json — transloco renders missing keys verbatim
    expect(component.previewText()).toBe('Doc.Title starts with foo AND Doc.Score > 3');
  });

  it('renders the tree via nz-tree with keys following the root signal', async () => {
    await setupDialog({ properties: SCHEMA });
    // pre-insert selection is the root
    expect(component.selectedKeys()).toEqual([String(component.root().id)]);

    // selection follows the newly inserted leaf (id-based, survives replacement)
    component.addCondition();
    fixture.detectChanges();
    const first = component.root().members[0];
    expect(component.selectedKeys()).toEqual([String(first.id)]);

    // a leaf selected means the next insert targets its parent (the root)
    component.addCondition();
    fixture.detectChanges();
    const second = component.root().members[1];
    expect(component.selectedKeys()).toEqual([String(second.id)]);
    expect(treeRowTexts().length).toBe(3); // root + two leaves
  });

  it('translated options recompute when the language changes while the dialog is open', async () => {
    await setupDialog({ properties: SCHEMA });
    component.addCondition();
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
