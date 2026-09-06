//
// Unit tests for odata-filter.ts — pure functions, no Angular.
//

import { FilterJoinType, FilterOperation, IFilterCondition, IFilterDefinition } from 'actslib';

import { FilterableProperty } from './filter-dialog-model';
import { odataEscapeString, toODataFilter } from './odata-filter';

enum DocStatus {
  Draft = 0,
  Published = 1,
}

const SCHEMA: FilterableProperty[] = [
  { key: 'Title', labelKey: 'Doc.Title', kind: 'string' },
  { key: 'Score', labelKey: 'Doc.Score', kind: 'number' },
  { key: 'Created', labelKey: 'Doc.Created', kind: 'date' },
  { key: 'Status', labelKey: 'Doc.Status', kind: 'enum', enumValues: DocStatus },
];

function cond(property: string, operation: FilterOperation, lowValue?: unknown, highValue?: unknown): IFilterCondition {
  const c: IFilterCondition = { property, operation };
  if (lowValue !== undefined) {
    c.lowValue = lowValue as never;
  }
  if (highValue !== undefined) {
    c.highValue = highValue as never;
  }
  return c;
}

describe('odataEscapeString', () => {
  it('doubles single quotes', () => {
    expect(odataEscapeString("d'Artagnan")).toEqual("d''Artagnan");
  });

  it('leaves other characters alone', () => {
    expect(odataEscapeString('Tom & Jerry "x"')).toEqual('Tom & Jerry "x"');
  });
});

describe('toODataFilter — empty trees', () => {
  it('undefined → empty string', () => {
    expect(toODataFilter(undefined, SCHEMA)).toEqual('');
  });

  it('empty root (match-all) → empty string', () => {
    expect(toODataFilter({ join: FilterJoinType.AND, conditions: [] }, SCHEMA)).toEqual('');
  });

  it('tree where everything is skipped → empty string', () => {
    expect(
      toODataFilter({ join: FilterJoinType.AND, conditions: [cond('Nope', FilterOperation.Equal, 1)] }, SCHEMA),
    ).toEqual('');
  });
});

describe('toODataFilter — comparisons', () => {
  it('maps each comparison operator and quotes strings / leaves numbers bare', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [
        cond('Score', FilterOperation.Equal, 5),
        cond('Score', FilterOperation.GreaterThan, 3),
        cond('Score', FilterOperation.GreaterOrEqual, 2),
        cond('Score', FilterOperation.LessThan, 9),
        cond('Score', FilterOperation.LessOrEqual, 8),
        cond('Title', FilterOperation.Equal, 'hi'),
      ],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual(
      "Score eq 5 and Score gt 3 and Score ge 2 and Score lt 9 and Score le 8 and Title eq 'hi'",
    );
  });

  it('escapes single quotes in string literals', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Title', FilterOperation.Equal, "d'Artagnan")],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual("Title eq 'd''Artagnan'");
  });

  it('undefined join defaults to AND', () => {
    const def: IFilterDefinition = {
      conditions: [cond('Score', FilterOperation.Equal, 1), cond('Score', FilterOperation.Equal, 2)],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('Score eq 1 and Score eq 2');
  });
});

describe('toODataFilter — string functions', () => {
  it('BeginsWith/EndsWith/Contains → startswith/endswith/contains with quoted value', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.OR,
      conditions: [
        cond('Title', FilterOperation.BeginsWith, 'O'),
        cond('Title', FilterOperation.EndsWith, "'Br"),
        cond('Title', FilterOperation.Contains, 'x'),
      ],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual(
      "startswith(Title,'O') or endswith(Title,'''Br') or contains(Title,'x')",
    );
  });

  it('string functions on a numeric literal are skipped', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Score', FilterOperation.Contains, 7)],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('');
  });
});

describe('toODataFilter — Between', () => {
  it('number Between → parenthesized ge/le pair', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Score', FilterOperation.Between, 3, 8)],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('(Score ge 3 and Score le 8)');
  });

  it('date Between accepts yyyy-MM-dd strings unquoted', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Created', FilterOperation.Between, '2020-01-01', '2020-12-31')],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('(Created ge 2020-01-01 and Created le 2020-12-31)');
  });

  it('missing bound skips the condition', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Score', FilterOperation.Between, 3, undefined), cond('Score', FilterOperation.GreaterThan, 1)],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('Score gt 1');
  });
});

describe('toODataFilter — dates', () => {
  it('Date instance → unquoted yyyy-MM-dd', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Created', FilterOperation.GreaterThan, new Date(2020, 0, 5))],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('Created gt 2020-01-05');
  });

  it('malformed date string is skipped', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Created', FilterOperation.Equal, '2020-1-5')],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('');
  });
});

describe('toODataFilter — enum shapes as emitted', () => {
  it('single choice → Equal with the raw choice value', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Status', FilterOperation.Equal, DocStatus.Draft)],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('Status eq 0');
  });

  it('multi choice (OR-of-Equal group) → parenthesized or-chain', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [
        {
          join: FilterJoinType.OR,
          conditions: [cond('Status', FilterOperation.Equal, 0), cond('Status', FilterOperation.Equal, 1)],
        },
      ],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('(Status eq 0 or Status eq 1)');
  });
});

describe('toODataFilter — nesting and parenthesization', () => {
  it('AND root containing an OR group parenthesizes only the group', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [
        cond('Score', FilterOperation.GreaterThan, 2),
        {
          join: FilterJoinType.OR,
          conditions: [cond('Title', FilterOperation.Equal, 'a'), cond('Title', FilterOperation.Equal, 'b')],
        },
      ],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual("Score gt 2 and (Title eq 'a' or Title eq 'b')");
  });

  it('single-member groups add no parentheses', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [{ join: FilterJoinType.OR, conditions: [cond('Score', FilterOperation.Equal, 1)] }],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('Score eq 1');
  });

  it('depth-3 tree end to end', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.OR,
      conditions: [
        cond('Title', FilterOperation.Contains, 'x'),
        {
          join: FilterJoinType.AND,
          conditions: [
            {
              join: FilterJoinType.OR,
              conditions: [cond('Score', FilterOperation.Between, 1, 2), cond('Status', FilterOperation.Equal, 1)],
            },
            cond('Created', FilterOperation.GreaterOrEqual, new Date(2021, 11, 30)),
          ],
        },
      ],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual(
      "contains(Title,'x') or (((Score ge 1 and Score le 2) or Status eq 1) and Created ge 2021-12-30)",
    );
  });
});

describe('toODataFilter — defensive skips', () => {
  it('unknown property is skipped, siblings survive', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Nope', FilterOperation.Equal, 1), cond('Score', FilterOperation.Equal, 4)],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('Score eq 4');
  });

  it('undefined lowValue is skipped', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Title', FilterOperation.Equal, undefined), cond('Score', FilterOperation.Equal, 4)],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('Score eq 4');
  });

  it('NaN number is skipped', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Score', FilterOperation.Equal, Number.NaN)],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('');
  });

  it('numeric strings are coerced for number props', () => {
    const def: IFilterDefinition = {
      join: FilterJoinType.AND,
      conditions: [cond('Score', FilterOperation.Equal, '7')],
    };
    expect(toODataFilter(def, SCHEMA)).toEqual('Score eq 7');
  });
});
