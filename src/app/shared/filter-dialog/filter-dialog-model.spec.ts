//
// Unit tests for filter-dialog-model.ts — pure functions, no Angular.
//

import { FilterJoinType, FilterOperation, IFilterCondition, IFilterDefinition } from 'actslib';

import {
  FilterCustomOperator,
  FilterableProperty,
  SharedFilterDialogLeaf,
  SharedFilterDialogNode,
  checkFilterSchema,
  containsMember,
  dateToEditorValue,
  deleteMember,
  depthOf,
  effectiveOperations,
  emptyLeaf,
  emitTree,
  findMember,
  isDialogNode,
  patchLeaf,
  patchNode,
  parentIdOf,
  seedTree,
  insertMember,
  summarizeFilterDefinition,
  summarizeMember,
  validateTree,
  valueEditorFor,
} from './filter-dialog-model';

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
    customOperators: [IS_MULTIWORD],
    prepareValue: (v) => String(v).trim().toLowerCase(),
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
  {
    key: 'score',
    labelKey: 'Doc.Score',
    kind: 'number',
    numberRange: { min: 0, max: 5 },
  },
  { key: 'createdAt', labelKey: 'Doc.Created', kind: 'date' },
];

// i18n stand-in: 'Doc.Title' -> 'title', 'Filter.And' -> 'AND', ...
const labels = (key: string): string => {
  const map: Record<string, string> = {
    'Doc.Title': 'title',
    'Doc.Status': 'status',
    'Doc.Score': 'score',
    'Doc.Created': 'created',
    'Doc.Multiword': 'is multi-word',
    'Doc.Draft': 'draft',
    'Doc.Published': 'published',
    'Doc.Archived': 'archived',
    'Filter.And': 'AND',
    'Filter.Or': 'OR',
    'Filter.opBeginsWith': 'starts with',
    'Filter.opContains': 'contains',
    'Filter.opEqual': 'is',
    'Filter.opEndsWith': 'ends with',
    'Filter.opBetween': 'between',
    'Filter.opGreaterThan': '>',
    'Filter.opGreaterOrEqual': '>=',
    'Filter.opLessThan': '<',
    'Filter.opLessOrEqual': '<=',
  };
  return map[key] ?? key;
};

function makeLeaf(patch: Partial<SharedFilterDialogLeaf>): SharedFilterDialogLeaf {
  return {
    id: 1,
    kind: 'leaf',
    propertyKey: '',
    operator: '',
    textValue: '',
    numberValue: null,
    dateValue: '',
    lowValue: null,
    highValue: null,
    selectedChoices: [],
    ...patch,
  };
}

function root(...members: Array<SharedFilterDialogLeaf | SharedFilterDialogNode>): SharedFilterDialogNode {
  return { id: 0, kind: 'group', join: FilterJoinType.AND, members };
}

describe('effectiveOperations (operator derivation from actslib)', () => {
  it('derives defaults per kind', () => {
    const stringOps = effectiveOperations({ key: 'a', labelKey: 'a', kind: 'string' });
    expect(stringOps).toContain(FilterOperation.BeginsWith);
    expect(stringOps).toContain(FilterOperation.Between);
    const enumOps = effectiveOperations({ key: 'e', labelKey: 'e', kind: 'enum' });
    expect(enumOps).toEqual([FilterOperation.Equal]);
    const numOps = effectiveOperations({ key: 'n', labelKey: 'n', kind: 'number' });
    expect(numOps).not.toContain(FilterOperation.Contains);
    expect(numOps).toEqual([
      FilterOperation.GreaterThan,
      FilterOperation.GreaterOrEqual,
      FilterOperation.Equal,
      FilterOperation.LessOrEqual,
      FilterOperation.LessThan,
      FilterOperation.Between,
    ]);
  });

  it('narrows by whitelist and follows its order', () => {
    const prop: FilterableProperty = {
      key: 'r',
      labelKey: 'r',
      kind: 'number',
      operations: [FilterOperation.Equal, FilterOperation.GreaterThan],
    };
    expect(effectiveOperations(prop)).toEqual([FilterOperation.Equal, FilterOperation.GreaterThan]);
  });

  it('drops operations the kind cannot do', () => {
    const prop: FilterableProperty = {
      key: 'r',
      labelKey: 'r',
      kind: 'number',
      operations: [FilterOperation.Contains, FilterOperation.Equal],
    };
    expect(effectiveOperations(prop)).toEqual([FilterOperation.Equal]);
  });

  it('checkFilterSchema flags empty-operation and enum-without-choices properties', () => {
    const warnings = checkFilterSchema([
      { key: 'x', labelKey: 'x', kind: 'string', operations: [FilterOperation.Contains] }, // fine
      { key: 'y', labelKey: 'y', kind: 'enum', choices: [] }, // enum without choices
      { key: 'z', labelKey: 'z', kind: 'string', operations: [] }, // no effective ops
    ]);
    expect(warnings.length).toBe(2);
    expect(warnings.join()).toContain("'y'");
    expect(warnings.join()).toContain("'z'");
  });
});

describe('valueEditorFor (dispatch table §6)', () => {
  const textProp = SCHEMA[0];
  const enumProp = SCHEMA[1];
  const numProp = SCHEMA[2];
  const dateProp = SCHEMA[3];

  it('maps every dispatch row', () => {
    expect(valueEditorFor(textProp, FilterOperation.Contains)).toBe('text');
    expect(valueEditorFor(numProp, FilterOperation.GreaterThan)).toBe('number');
    expect(valueEditorFor(dateProp, FilterOperation.Equal)).toBe('date');
    expect(valueEditorFor(textProp, FilterOperation.Between)).toBe('between-text');
    expect(valueEditorFor(numProp, FilterOperation.Between)).toBe('between-number');
    expect(valueEditorFor(dateProp, FilterOperation.Between)).toBe('between-date');
    expect(valueEditorFor(enumProp, FilterOperation.Equal)).toBe('enum');
    expect(valueEditorFor(textProp, IS_MULTIWORD.id)).toBe('none');
  });
});

describe('seedTree (copy-in + fold-back)', () => {
  it('seeds blank without a def and never mutates the caller def', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [{ property: 'title', operation: FilterOperation.Contains, lowValue: 'foo' }],
    };
    const snapshot = JSON.stringify(def);
    const tree = seedTree(undefined, SCHEMA);
    expect(tree.members.length).toBe(0);
    const seeded = seedTree(def, SCHEMA);
    expect(JSON.stringify(def)).toBe(snapshot);
    expect(seeded.members.length).toBe(1);
  });

  it('seeds a string condition into textValue', () => {
    const tree = seedTree(
      { conditions: [{ property: 'title', operation: FilterOperation.Contains, lowValue: 'foo' }] },
      SCHEMA,
    );
    const leaf = tree.members[0] as SharedFilterDialogLeaf;
    expect(leaf.propertyKey).toBe('title');
    expect(leaf.operator).toBe(FilterOperation.Contains);
    expect(leaf.textValue).toBe('foo');
  });

  it('seeds Between bounds for number and date kinds', () => {
    const tree = seedTree(
      {
        conditions: [
          { property: 'score', operation: FilterOperation.Between, lowValue: 2, highValue: 4 },
          {
            property: 'createdAt',
            operation: FilterOperation.Between,
            lowValue: new Date(2026, 0, 1),
            highValue: new Date(2026, 0, 31),
          },
        ],
      },
      SCHEMA,
    );
    const num = tree.members[0] as SharedFilterDialogLeaf;
    expect(num.lowValue).toBe(2);
    expect(num.highValue).toBe(4);
    const dt = tree.members[1] as SharedFilterDialogLeaf;
    expect(dt.lowValue).toBe(dateToEditorValue(new Date(2026, 0, 1)));
    expect(dt.highValue).toBe(dateToEditorValue(new Date(2026, 0, 31)));
  });

  it('folds an OR-of-Equal enum group into one multi-choice leaf', () => {
    const tree = seedTree(
      {
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
      SCHEMA,
    );
    const leaf = tree.members[0] as SharedFilterDialogLeaf;
    expect(isDialogNode(leaf as never)).toBe(false);
    expect(leaf.selectedChoices).toEqual([DocStatus.Draft, DocStatus.Published]);
  });

  it('seeds a lone enum Equal as a checked single choice', () => {
    const tree = seedTree(
      { conditions: [{ property: 'status', operation: FilterOperation.Equal, lowValue: DocStatus.Draft }] },
      SCHEMA,
    );
    const leaf = tree.members[0] as SharedFilterDialogLeaf;
    expect(leaf.selectedChoices).toEqual([DocStatus.Draft]);
  });

  it('does NOT fold an OR group of mixed properties', () => {
    const tree = seedTree(
      {
        conditions: [
          {
            join: FilterJoinType.OR,
            conditions: [
              { property: 'status', operation: FilterOperation.Equal, lowValue: DocStatus.Draft },
              { property: 'score', operation: FilterOperation.Equal, lowValue: 3 },
            ],
          },
        ],
      },
      SCHEMA,
    );
    const group = tree.members[0];
    expect(isDialogNode(group)).toBe(true);
    expect((group as SharedFilterDialogNode).members.length).toBe(2);
  });

  it('custom recognize runs before generic Equal/Between handling', () => {
    const tree = seedTree(
      { conditions: [{ property: 'title', operation: FilterOperation.Contains, lowValue: ' ' }] },
      SCHEMA,
    );
    const leaf = tree.members[0] as SharedFilterDialogLeaf;
    expect(leaf.operator).toBe(IS_MULTIWORD.id);
  });

  it('preserves structure at any depth', () => {
    const tree = seedTree(
      {
        join: FilterJoinType.AND,
        conditions: [
          { property: 'title', operation: FilterOperation.Contains, lowValue: 'a' },
          {
            join: FilterJoinType.OR,
            conditions: [
              { property: 'score', operation: FilterOperation.GreaterThan, lowValue: 3 },
              {
                join: FilterJoinType.AND,
                conditions: [
                  { property: 'title', operation: FilterOperation.BeginsWith, lowValue: 'b' },
                  {
                    join: FilterJoinType.OR,
                    conditions: [
                      {
                        join: FilterJoinType.AND,
                        conditions: [{ property: 'score', operation: FilterOperation.LessThan, lowValue: 1 }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      SCHEMA,
    );
    let depth = 0;
    let node: SharedFilterDialogNode | null = tree;
    while (node) {
      depth++;
      const child: SharedFilterDialogNode | null =
        node.members.length > 1
          ? (node.members[1] as SharedFilterDialogNode)
          : node.members.length === 1 && isDialogNode(node.members[0])
            ? (node.members[0] as SharedFilterDialogNode)
            : null;
      node = child;
    }
    expect(depth).toBe(5);
  });
});

describe('emitTree (dispatch §6)', () => {
  it('empty root emits conditions: [] (match-all = cleared filter)', () => {
    const def = emitTree(root(), SCHEMA);
    expect(def.conditions).toEqual([]);
    expect(def.join).toBe(FilterJoinType.AND);
  });

  it('string leaf applies prepareValue (trim + lowercase)', () => {
    const leaf = makeLeaf({ propertyKey: 'title', operator: FilterOperation.Contains, textValue: '  Foo  ' });
    const def = emitTree(root(leaf), SCHEMA);
    const cond = def.conditions[0] as IFilterCondition;
    expect(cond.lowValue).toBe('foo');
  });

  it('custom operator emits its own condition and skips prepareValue', () => {
    const leaf = makeLeaf({ propertyKey: 'title', operator: IS_MULTIWORD.id, textValue: ' untouched ' });
    const def = emitTree(root(leaf), SCHEMA);
    const cond = def.conditions[0] as IFilterCondition;
    expect(cond).toEqual({ property: 'title', operation: FilterOperation.Contains, lowValue: ' ' });
  });

  it('enum: 1 choice emits a bare Equal condition; N emit an OR group; both carry enumValues', () => {
    const one = makeLeaf({
      propertyKey: 'status',
      operator: FilterOperation.Equal,
      selectedChoices: [DocStatus.Draft],
    });
    const defOne = emitTree(root(one), SCHEMA);
    expect(defOne.conditions.length).toBe(1);
    expect(defOne.conditions[0]).toEqual({
      property: 'status',
      operation: FilterOperation.Equal,
      lowValue: DocStatus.Draft,
      enumValues: DocStatus,
    });

    const many = makeLeaf({
      propertyKey: 'status',
      operator: FilterOperation.Equal,
      selectedChoices: [DocStatus.Draft, DocStatus.Published],
    });
    const defMany = emitTree(root(many), SCHEMA);
    const group = defMany.conditions[0] as IFilterDefinition;
    expect(group.join).toBe(FilterJoinType.OR);
    expect((group.conditions as IFilterCondition[]).length).toBe(2);
    expect((group.conditions as IFilterCondition[])[1]).toEqual({
      property: 'status',
      operation: FilterOperation.Equal,
      lowValue: DocStatus.Published,
      enumValues: DocStatus,
    });
  });

  it('number single + Between emit numbers; date emits Dates', () => {
    const num = makeLeaf({ propertyKey: 'score', operator: FilterOperation.GreaterOrEqual, numberValue: 3 });
    const between = makeLeaf({ propertyKey: 'score', operator: FilterOperation.Between, lowValue: 2, highValue: 4 });
    const date = makeLeaf({ propertyKey: 'createdAt', operator: FilterOperation.LessThan, dateValue: '2026-05-01' });
    const def = emitTree(root(num, between, date), SCHEMA);
    expect((def.conditions[0] as IFilterCondition).lowValue).toBe(3);
    expect((def.conditions[1] as IFilterCondition).lowValue).toBe(2);
    const emittedDate = (def.conditions[2] as IFilterCondition).lowValue as Date;
    expect(emittedDate instanceof Date).toBe(true);
    expect(dateToEditorValue(emittedDate)).toBe('2026-05-01');
  });

  it('drops conditions whose property is no longer in the schema', () => {
    const leaf = makeLeaf({ propertyKey: 'gone', operator: FilterOperation.Equal, textValue: 'x' });
    const def = emitTree(root(leaf), SCHEMA);
    expect(def.conditions.length).toBe(0);
  });
});

describe('round-trip: emitTree(seedTree(emitTree(seed))) === emitTree(seed)', () => {
  it('stable for representative trees', () => {
    const seed: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [
        { property: 'title', operation: FilterOperation.Contains, lowValue: 'foo' },
        { property: 'title', operation: FilterOperation.Contains, lowValue: ' ' }, // custom op
        { property: 'score', operation: FilterOperation.Between, lowValue: 1, highValue: 5 },
        {
          join: FilterJoinType.OR,
          conditions: [
            { property: 'status', operation: FilterOperation.Equal, lowValue: DocStatus.Draft, enumValues: DocStatus },
            {
              property: 'status',
              operation: FilterOperation.Equal,
              lowValue: DocStatus.Published,
              enumValues: DocStatus,
            },
          ],
        },
        {
          join: FilterJoinType.OR,
          conditions: [
            { property: 'createdAt', operation: FilterOperation.GreaterThan, lowValue: new Date(2026, 0, 1) },
            { property: 'score', operation: FilterOperation.LessOrEqual, lowValue: 2 },
          ],
        },
      ],
    };
    const first = emitTree(seedTree(seed, SCHEMA), SCHEMA);
    const second = emitTree(seedTree(first, SCHEMA), SCHEMA);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});

describe('mutators are immutable through the root', () => {
  it('insertMember / deleteMember / patchLeaf / patchNode return new objects along the path', () => {
    const leaf = makeLeaf({ propertyKey: 'title', operator: FilterOperation.Contains, textValue: 'a' });
    const inner: SharedFilterDialogNode = {
      id: 10,
      kind: 'group',
      join: FilterJoinType.AND,
      members: [leaf],
    };
    const tree = root(inner);
    const before = JSON.stringify(tree);

    const inserted = insertMember(tree, 10, makeLeaf({ id: 99 }));
    expect(inner.members.length).toBe(1);
    const insertedInner = findMember(inserted, 10) as SharedFilterDialogNode;
    expect(insertedInner.members.length).toBe(2);

    const patched = patchLeaf(tree, leaf.id, { textValue: 'b' });
    expect((findMember(patched, leaf.id) as SharedFilterDialogLeaf).textValue).toBe('b');
    expect(JSON.stringify(tree)).toBe(before); // original untouched

    const joined = patchNode(tree, 10, FilterJoinType.OR);
    expect((findMember(joined, 10) as SharedFilterDialogNode).join).toBe(FilterJoinType.OR);

    const deleted = deleteMember(patched, leaf.id);
    expect((findMember(deleted, 10) as SharedFilterDialogNode).members.length).toBe(0);
    // the deleted leaf can no longer be patched (its id is gone)
    expect(findMember(deleted, leaf.id)).toBeNull();
  });

  it('parentIdOf / depthOf / containsMember', () => {
    const leaf = makeLeaf({ id: 5 });
    const inner: SharedFilterDialogNode = { id: 7, kind: 'group', join: FilterJoinType.AND, members: [leaf] };
    const tree = root(inner); // tree root id = 0
    expect(parentIdOf(tree, leaf.id)).toBe(7);
    expect(parentIdOf(tree, 7)).toBe(0);
    expect(parentIdOf(tree, 0)).toBeNull();
    expect(depthOf(tree, leaf.id)).toBe(3);
    expect(depthOf(tree, 7)).toBe(2);
    expect(depthOf(tree, 0)).toBe(1);
    expect(containsMember(tree, leaf.id)).toBe(true);
    expect(containsMember(inner, leaf.id)).toBe(true);
  });

  it('emptyLeaf seeds the first selectable property with its first operator', () => {
    const leaf = emptyLeaf(SCHEMA);
    expect(leaf.propertyKey).toBe('title');
    expect(leaf.operator).toBe(FilterOperation.BeginsWith);
    expect(leaf.textValue).toBe('');
  });
});

describe('validateTree matrix (§8)', () => {
  const cases: Array<{ name: string; leaf: SharedFilterDialogLeaf; expected: string | null }> = [
    {
      name: 'blank string',
      leaf: makeLeaf({ propertyKey: 'title', operator: FilterOperation.Contains, textValue: '  ' }),
      expected: 'needsValue',
    },
    {
      name: 'filled string',
      leaf: makeLeaf({ propertyKey: 'title', operator: FilterOperation.Contains, textValue: 'a' }),
      expected: null,
    },
    {
      name: 'custom op blank value',
      leaf: makeLeaf({ propertyKey: 'title', operator: IS_MULTIWORD.id }),
      expected: null,
    },
    {
      name: 'number null',
      leaf: makeLeaf({ propertyKey: 'score', operator: FilterOperation.Equal, numberValue: null }),
      expected: 'needsValue',
    },
    {
      name: 'number set',
      leaf: makeLeaf({ propertyKey: 'score', operator: FilterOperation.Equal, numberValue: 0 }),
      expected: null,
    },
    {
      name: 'date blank',
      leaf: makeLeaf({ propertyKey: 'createdAt', operator: FilterOperation.Equal, dateValue: '' }),
      expected: 'needsValue',
    },
    {
      name: 'enum zero choices',
      leaf: makeLeaf({ propertyKey: 'status', operator: FilterOperation.Equal, selectedChoices: [] }),
      expected: 'enumNeedsChoice',
    },
    {
      name: 'enum one choice',
      leaf: makeLeaf({ propertyKey: 'status', operator: FilterOperation.Equal, selectedChoices: [DocStatus.Draft] }),
      expected: null,
    },
    {
      name: 'between one bound missing',
      leaf: makeLeaf({ propertyKey: 'score', operator: FilterOperation.Between, lowValue: 1, highValue: null }),
      expected: 'needsValue',
    },
    {
      name: 'between reversed',
      leaf: makeLeaf({ propertyKey: 'score', operator: FilterOperation.Between, lowValue: 4, highValue: 2 }),
      expected: 'invalidRange',
    },
    {
      name: 'between reversed date (lexicographic)',
      leaf: makeLeaf({
        propertyKey: 'createdAt',
        operator: FilterOperation.Between,
        lowValue: '2026-05-01',
        highValue: '2026-04-01',
      }),
      expected: 'invalidRange',
    },
    {
      name: 'string between reversed allowed (lexicographic semantics)',
      leaf: makeLeaf({ propertyKey: 'title', operator: FilterOperation.Between, lowValue: 'z', highValue: 'a' }),
      expected: null,
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      const state = validateTree(root(c.leaf), SCHEMA);
      const err = state.leafErrors.get(c.leaf.id) ?? null;
      expect(err).toBe(c.expected);
    });
  }

  it('nested groups with < 2 members are invalid; root exempt', () => {
    const goodLeaf = makeLeaf({ id: 2, propertyKey: 'title', operator: FilterOperation.Contains, textValue: 'a' });
    const emptyGroup: SharedFilterDialogNode = { id: 1, kind: 'group', join: FilterJoinType.AND, members: [] };
    const singleGroup: SharedFilterDialogNode = { id: 3, kind: 'group', join: FilterJoinType.OR, members: [goodLeaf] };
    const state = validateTree(root(emptyGroup, singleGroup), SCHEMA);
    expect(state.invalidGroupIds.sort()).toEqual([1, 3]);
    expect(state.isValid).toBe(false);
    // root itself with one member is fine
    const rootState = validateTree({ id: 0, kind: 'group', join: FilterJoinType.AND, members: [goodLeaf] }, SCHEMA);
    expect(rootState.invalidGroupIds.length).toBe(0);
    expect(rootState.isValid).toBe(true);
  });

  it('unknown property leaf is invalid (needsValue)', () => {
    const state = validateTree(
      root(makeLeaf({ propertyKey: 'nope', operator: FilterOperation.Equal, textValue: 'x' })),
      SCHEMA,
    );
    expect(state.hasMissingValue).toBe(true);
  });
});

describe('summarizeFilterDefinition (§9)', () => {
  it('renders the spec example phrase', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [
        { property: 'title', operation: FilterOperation.BeginsWith, lowValue: 'foo' },
        {
          join: FilterJoinType.OR,
          conditions: [
            {
              join: FilterJoinType.OR,
              conditions: [
                { property: 'status', operation: FilterOperation.Equal, lowValue: DocStatus.Draft },
                { property: 'status', operation: FilterOperation.Equal, lowValue: DocStatus.Published },
              ],
            },
            { property: 'score', operation: FilterOperation.GreaterOrEqual, lowValue: 3 },
          ],
        },
      ],
    };
    expect(summarizeFilterDefinition(def, SCHEMA, labels)).toBe(
      'title starts with foo AND (status draft/published OR score >= 3)',
    );
  });

  it('renders Between as low ≤ x ≤ high', () => {
    const def: IFilterDefinition = {
      conditions: [{ property: 'score', operation: FilterOperation.Between, lowValue: 2, highValue: 4 }],
    };
    expect(summarizeFilterDefinition(def, SCHEMA, labels)).toBe('score 2≤x≤4');
  });

  it('renders custom operators via their label', () => {
    const def: IFilterDefinition = {
      conditions: [{ property: 'title', operation: FilterOperation.Contains, lowValue: ' ' }],
    };
    expect(summarizeFilterDefinition(def, SCHEMA, labels)).toBe('title is multi-word');
  });

  it('empty def summarizes to the empty string', () => {
    expect(summarizeFilterDefinition({ conditions: [] }, SCHEMA, labels)).toBe('');
  });

  it('caps menu labels with an ellipsis', () => {
    const def: IFilterDefinition = {
      conditions: [{ property: 'title', operation: FilterOperation.Contains, lowValue: 'aaaaaaaaaaaaaaaaaaaa' }],
    };
    const short = summarizeFilterDefinition(def, SCHEMA, labels, 12);
    expect(short.length).toBe(12);
    expect(short.endsWith('…')).toBe(true);
  });

  it('summarizeMember labels groups and leaves', () => {
    const leaf = makeLeaf({ propertyKey: 'title', operator: FilterOperation.Contains, textValue: 'foo' });
    expect(summarizeMember(leaf, SCHEMA, labels)).toBe('title contains foo');
    const group: SharedFilterDialogNode = { id: 9, kind: 'group', join: FilterJoinType.OR, members: [leaf] };
    expect(summarizeMember(group, SCHEMA, labels)).toBe('OR (1)');
  });
});
