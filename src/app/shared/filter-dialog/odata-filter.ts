/**
 * odata-filter.ts — bridge from the dialog's actslib `IFilterDefinition`
 * condition tree to an OData v4 `$filter` string fragment.
 *
 * The dialog was designed around client-side evaluation (see
 * docs/filter-dialog-generic-design.md); server-paginated pages instead hand
 * the emitted tree to `toODataFilter()` and append the fragment to their query.
 *
 * Translation rules:
 * - Group join: `AND`/`OR` (undefined defaults to AND, matching actslib).
 *   Multi-member nested groups are parenthesized; the root group is left bare
 *   because callers wrap the fragment themselves.
 * - Comparisons `= > >= < <=` → `eq gt ge lt le`; `Between` → a parenthesized
 *   `ge … and le …` pair (OData v4 has no `between` operator); `BeginsWith/
 *   EndsWith/Contains` → `startswith()/endswith()/contains()`.
 * - Literals by property kind: string/enum values are quoted with `'` doubled
 *   (same rule the services already use), numbers bare, dates as unquoted
 *   `yyyy-MM-dd` — an Edm.Date literal. Edm.DateTimeOffset columns would need
 *   ISO-with-offset output; no page registers those today, so this is not
 *   speculative-coded. A page that hits one should widen `formatLiteral` or
 *   normalize the value through `prepareValue`.
 * - Enum multi-choice never reaches the bridge as a special shape: the dialog
 *   already folds it to an OR group of Equal conditions at emit time.
 *
 * Defensive skips: conditions on properties absent from `schema`, or with
 * unrenderable values, are dropped (the dialog's emit never produces these;
 * only hand-crafted seeds could). A tree that translates to nothing yields
 * `''` = no clause = match-all, consistent with the empty-root contract.
 */
import {
  FilterJoinType,
  FilterOperation,
  FilterValue,
  IFilterCondition,
  IFilterDefinition,
  FilterMember,
} from 'actslib';

import { FilterableProperty, dateToEditorValue, findProperty } from './filter-dialog-model';

/** Escape a string for embedding in an OData single-quoted literal (' → ''). */
export function odataEscapeString(value: string): string {
  return value.replace(/'/g, "''");
}

/** actslib operator → OData comparison operator. */
const COMPARISON_OPERATORS: Partial<Record<FilterOperation, string>> = {
  [FilterOperation.Equal]: 'eq',
  [FilterOperation.GreaterThan]: 'gt',
  [FilterOperation.GreaterOrEqual]: 'ge',
  [FilterOperation.LessThan]: 'lt',
  [FilterOperation.LessOrEqual]: 'le',
};

/** actslib string operator → OData string function name. */
const STRING_FUNCTIONS: Partial<Record<FilterOperation, string>> = {
  [FilterOperation.BeginsWith]: 'startswith',
  [FilterOperation.EndsWith]: 'endswith',
  [FilterOperation.Contains]: 'contains',
};

/** Condition vs. nested group, same discriminator the model uses (module-private there). */
function isCondition(member: FilterMember): member is IFilterCondition {
  return typeof (member as IFilterCondition).property === 'string';
}

/** Render `value` as an OData literal for `prop`, or null when unrenderable (→ skip). */
function formatLiteral(value: FilterValue | undefined, prop: FilterableProperty): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  switch (prop.kind) {
    case 'number': {
      const n = value instanceof Date ? Number.NaN : typeof value === 'number' ? value : Number(value);
      return Number.isFinite(n) ? String(n) : null;
    }
    case 'date': {
      if (value instanceof Date) {
        return dateToEditorValue(value);
      }
      const s = String(value);
      return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
    }
    default: {
      // 'string' and 'enum': enum choices may be numbers (bare) or strings (quoted).
      if (value instanceof Date) {
        return null;
      }
      if (typeof value === 'number') {
        return String(value);
      }
      return `'${odataEscapeString(String(value))}'`;
    }
  }
}

function translateCondition(cond: IFilterCondition, schema: FilterableProperty[]): string {
  const prop = findProperty(schema, cond.property);
  if (!prop) {
    return '';
  }

  if (cond.operation === FilterOperation.Between) {
    const low = formatLiteral(cond.lowValue, prop);
    const high = formatLiteral(cond.highValue, prop);
    if (low === null || high === null) {
      return '';
    }
    return `(${prop.key} ge ${low} and ${prop.key} le ${high})`;
  }

  const fn = STRING_FUNCTIONS[cond.operation];
  if (fn) {
    const v = formatLiteral(cond.lowValue, prop);
    // the OData string functions only accept string literals
    if (v === null || !v.startsWith("'")) {
      return '';
    }
    return `${fn}(${prop.key},${v})`;
  }

  const op = COMPARISON_OPERATORS[cond.operation];
  if (!op) {
    return '';
  }
  const v = formatLiteral(cond.lowValue, prop);
  if (v === null) {
    return '';
  }
  return `${prop.key} ${op} ${v}`;
}

/**
 * Translate an actslib `IFilterDefinition` tree into an OData v4 `$filter`
 * fragment (no outer parentheses; the caller composes and wraps it).
 * Empty/undefined trees — and trees where every condition was skipped —
 * return `''`, i.e. "add no clause".
 */
export function toODataFilter(def: IFilterDefinition | undefined, schema: FilterableProperty[]): string {
  if (!def || !def.conditions || def.conditions.length === 0) {
    return '';
  }
  return translateDefinition(def, schema, true);
}

function translateDefinition(def: IFilterDefinition, schema: FilterableProperty[], isRoot: boolean): string {
  const join = def.join === FilterJoinType.OR ? ' or ' : ' and ';
  const parts: string[] = [];
  for (const member of def.conditions ?? []) {
    const text = isCondition(member) ? translateCondition(member, schema) : translateDefinition(member, schema, false);
    if (text) {
      parts.push(text);
    }
  }
  if (parts.length === 0) {
    return '';
  }
  const text = parts.join(join);
  // Single-member groups are already atoms; only compound nested groups need parens
  // so the AND/OR flattening stays correct at any depth. The root is left bare for
  // the caller to wrap in its own composition.
  if (isRoot || parts.length === 1) {
    return text;
  }
  return `(${text})`;
}
