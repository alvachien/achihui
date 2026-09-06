/**
 * filter-dialog-model.ts — editor types + ALL pure logic of the generic
 * filter dialog (seed, mutate, validation, emit, summarize).
 *
 * Every function here is pure over plain objects so the interesting logic is
 * testable without TestBed (see filter-dialog-model.spec.ts). The component
 * file only holds signals and wires the template.
 *
 * Specification: docs/filter-dialog-generic-design.md
 */
import {
  EnumLike,
  FilterJoinType,
  FilterOperation,
  FilterValue,
  IFilterCondition,
  IFilterDefinition,
  FilterMember,
} from 'actslib';

// ---------------------------------------------------------------------------
// Public contract (design §4)
// ---------------------------------------------------------------------------

/** What kind of values a property carries. Drives the default operator list,
 *  the value editor, and the seed/emit dispatch. */
export type FilterPropertyKind = 'string' | 'number' | 'date' | 'enum';

/** One choice of an enum property's multiple-choice editor. */
export interface FilterEnumChoice {
  value: string | number;
  /** i18n key, translated by the dialog */
  labelKey: string;
}

/** A valueless, app-specific operator. The page supplies the actslib
 *  encoding and the fold-back recognizer. */
export interface FilterCustomOperator {
  /** editor-local id, never crosses the dialog boundary */
  id: string;
  labelKey: string;
  /** actslib condition this operator emits on Submit */
  emit(property: string): IFilterCondition;
  /** true when `condition` is one of this operator's emissions (seed fold-back) */
  recognize(condition: IFilterCondition): boolean;
}

/** One filterable property of the page's target shape. */
export interface FilterableProperty {
  /** actslib condition property name (matched against the evaluated target) */
  key: string;
  labelKey: string;
  kind: FilterPropertyKind;
  /** offered operators; default = per-kind actslib set, ∩ when given */
  operations?: FilterOperation[];
  /** kind 'enum': actslib enum validation, passed through to each condition */
  enumValues?: EnumLike;
  /** kind 'enum': choices rendered as the multiple-value editor */
  choices?: FilterEnumChoice[];
  /** valueless operators appended to the operator select */
  customOperators?: FilterCustomOperator[];
  /** number/date editors: input constraints (ui only; not enforced on text input) */
  numberRange?: { min?: number; max?: number };
  /** transforms the raw editor value before it is emitted (case-fold / trim) */
  prepareValue?: (value: string | number) => string | number;
}

export interface FilterDialogData {
  properties: FilterableProperty[];
  /** seed = the filter currently in effect; empty/undefined starts blank */
  root?: IFilterDefinition;
  /** deepest group level the toolbar offers; default 4 */
  maxDepth?: number;
  /** dialog title key; default 'Filter.EditFilter' */
  titleKey?: string;
}

export interface FilterDialogResult {
  root: IFilterDefinition;
}

/** Default dialog title key (design §4). */
export const DEFAULT_FILTER_TITLE_KEY = 'Filter.EditFilter';
/** Default deepest group level (design §4). */
export const DEFAULT_FILTER_MAX_DEPTH = 4;

// ---------------------------------------------------------------------------
// Editor state model (design §5.1)
// ---------------------------------------------------------------------------

/** One editable leaf. All value kinds COEXIST: switching property/operator
 *  never loses input, and the template only shows the controls the current
 *  dispatch selects.
 *
 *  Note: actslib requires `Date` instances for date conditions and `string`
 *  for string conditions, so the editors hold raw input values (string for
 *  text/date, number for number) and `emitTree` converts per kind.
 *  `lowValue`/`highValue` hold the Between bounds in the kind's native
 *  representation already (number for number, 'yyyy-MM-dd' for date, string
 *  for string). */
export interface SharedFilterDialogLeaf {
  id: number;
  kind: 'leaf';
  propertyKey: string;
  /** a FilterOperation value, or a customOperator id */
  operator: string;
  /** string editor */
  textValue: string;
  /** number single-value editor */
  numberValue: number | null;
  /** date single-value editor ('yyyy-MM-dd' or '') */
  dateValue: string;
  /** Between low bound */
  lowValue: string | number | null;
  /** Between high bound */
  highValue: string | number | null;
  /** enum editor */
  selectedChoices: Array<string | number>;
}

export interface SharedFilterDialogNode {
  id: number;
  kind: 'group';
  join: FilterJoinType;
  members: Array<SharedFilterDialogLeaf | SharedFilterDialogNode>;
}

export type SharedFilterDialogMember = SharedFilterDialogLeaf | SharedFilterDialogNode;

export function isDialogNode(m: SharedFilterDialogMember): m is SharedFilterDialogNode {
  return m.kind === 'group';
}

/** Monotonic editor-local id source. Ids are unique per session, which is all
 *  the tree invariants require; tests never assert specific values. */
let idCounter = 0;
export function nextEditorId(): number {
  return ++idCounter;
}

// ---------------------------------------------------------------------------
// Operator derivation from actslib (design §4.1)
// ---------------------------------------------------------------------------

/** actslib's per-kind support matrix, in offered order (familiar → exotic). */
export const DEFAULT_OPERATIONS: Record<FilterPropertyKind, FilterOperation[]> = {
  string: [
    FilterOperation.BeginsWith,
    FilterOperation.Contains,
    FilterOperation.Equal,
    FilterOperation.EndsWith,
    FilterOperation.GreaterThan,
    FilterOperation.GreaterOrEqual,
    FilterOperation.LessThan,
    FilterOperation.LessOrEqual,
    FilterOperation.Between,
  ],
  number: [
    FilterOperation.GreaterThan,
    FilterOperation.GreaterOrEqual,
    FilterOperation.Equal,
    FilterOperation.LessOrEqual,
    FilterOperation.LessThan,
    FilterOperation.Between,
  ],
  date: [
    FilterOperation.GreaterThan,
    FilterOperation.GreaterOrEqual,
    FilterOperation.Equal,
    FilterOperation.LessOrEqual,
    FilterOperation.LessThan,
    FilterOperation.Between,
  ],
  enum: [FilterOperation.Equal],
};

/** i18n label key for every actslib operation. Comparison symbols get their
 *  own keys so the host project could word them differently; the shipped
 *  dictionaries render them as symbols (design §9). */
export const FILTER_OPERATION_LABEL_KEYS: Record<FilterOperation, string> = {
  [FilterOperation.BeginsWith]: 'Filter.opBeginsWith',
  [FilterOperation.Contains]: 'Filter.opContains',
  [FilterOperation.Equal]: 'Filter.opEqual',
  [FilterOperation.EndsWith]: 'Filter.opEndsWith',
  [FilterOperation.GreaterThan]: 'Filter.opGreaterThan',
  [FilterOperation.GreaterOrEqual]: 'Filter.opGreaterOrEqual',
  [FilterOperation.LessThan]: 'Filter.opLessThan',
  [FilterOperation.LessOrEqual]: 'Filter.opLessOrEqual',
  [FilterOperation.Between]: 'Filter.opBetween',
};

export function isFilterOperation(value: string): value is FilterOperation {
  return (Object.values(FilterOperation) as string[]).includes(value);
}

/** Effective operators offered for a property: the per-kind default list,
 *  narrowed by the whitelist while following the whitelist's order when one
 *  is given (design §4.1). */
export function effectiveOperations(prop: FilterableProperty): FilterOperation[] {
  const defaults = DEFAULT_OPERATIONS[prop.kind];
  if (!prop.operations) {
    return [...defaults];
  }
  return prop.operations.filter((op) => defaults.includes(op));
}

export function findProperty(schema: FilterableProperty[], key: string): FilterableProperty | undefined {
  return schema.find((p) => p.key === key);
}

/** Properties offered in the property select: an empty effective operator
 *  list is a schema bug (design §4.1) → skipped. */
export function selectableProperties(schema: FilterableProperty[]): FilterableProperty[] {
  return schema.filter((p) => effectiveOperations(p).length > 0);
}

/** Schema problems reported by `checkFilterSchema` (logged in dev mode by the
 *  component, never thrown). */
export function checkFilterSchema(schema: FilterableProperty[]): string[] {
  const warnings: string[] = [];
  for (const p of schema) {
    if (effectiveOperations(p).length === 0) {
      warnings.push(`filter-dialog: property '${p.key}' has no effective operations; it will not be offered.`);
    }
    if (p.kind === 'enum' && (!p.choices || p.choices.length === 0)) {
      warnings.push(`filter-dialog: enum property '${p.key}' declares no choices; its value editor will be empty.`);
    }
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// Value-editor dispatch (design §6)
// ---------------------------------------------------------------------------

export type FilterValueEditor =
  | 'text' // string single value
  | 'number' // number single value
  | 'date' // date single value
  | 'between-text'
  | 'between-number'
  | 'between-date'
  | 'enum'
  | 'none'; // custom (valueless) operator

export function findCustomOperator(
  prop: FilterableProperty | undefined,
  operator: string,
): FilterCustomOperator | undefined {
  return prop?.customOperators?.find((co) => co.id === operator);
}

/** The editor the detail pane shows for a leaf. */
export function valueEditorFor(prop: FilterableProperty | undefined, operator: string): FilterValueEditor {
  if (!prop) {
    return 'none';
  }
  if (findCustomOperator(prop, operator)) {
    return 'none';
  }
  if (prop.kind === 'enum') {
    return 'enum';
  }
  if (operator === FilterOperation.Between) {
    return prop.kind === 'number' ? 'between-number' : prop.kind === 'date' ? 'between-date' : 'between-text';
  }
  switch (prop.kind) {
    case 'number':
      return 'number';
    case 'date':
      return 'date';
    default:
      return 'text';
  }
}

/** True when the operator consumes the editor value (custom ops encode it). */
export function operatorHasValue(prop: FilterableProperty | undefined, operator: string): boolean {
  return !findCustomOperator(prop, operator);
}

// ---------------------------------------------------------------------------
// Date helpers (editor holds 'yyyy-MM-dd'; actslib holds Date)
// ---------------------------------------------------------------------------

export function dateToEditorValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function editorValueToDate(s: string): Date | null {
  if (!s) {
    return null;
  }
  const d = new Date(`${s}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

/** Format any FilterValue for display: dates as yyyy-MM-dd, rest via String. */
export function formatFilterValue(v: FilterValue): string {
  return v instanceof Date ? dateToEditorValue(v) : String(v);
}

// ---------------------------------------------------------------------------
// Seed: IFilterDefinition → editor tree (design §5.2, §6.3, §6.4)
// ---------------------------------------------------------------------------

function isFilterCondition(m: FilterMember): m is IFilterCondition {
  return typeof (m as IFilterCondition).property === 'string';
}

/** Detect the strict enum fold-back shape of §6.3: an OR group whose direct
 *  members are ALL `Equal` conditions on the same enum property. Returns the
 *  property and the chosen values, or null. Shared by seedTree and summarize
 *  so both agree on what folds. */
export function tryFoldEnumGroup(
  def: IFilterDefinition,
  schema: FilterableProperty[],
): { propertyKey: string; values: Array<string | number> } | null {
  if (def.join !== FilterJoinType.OR || def.conditions.length === 0) {
    return null;
  }
  let propertyKey: string | null = null;
  const values: Array<string | number> = [];
  for (const member of def.conditions) {
    if (!isFilterCondition(member) || member.operation !== FilterOperation.Equal) {
      return null;
    }
    if (propertyKey === null) {
      propertyKey = member.property;
    } else if (member.property !== propertyKey) {
      return null;
    }
    values.push(member.lowValue as string | number);
  }
  const key: string = propertyKey ?? '';
  const prop = findProperty(schema, key);
  if (!prop || prop.kind !== 'enum') {
    return null;
  }
  return { propertyKey: key, values };
}

function blankLeaf(propertyKey: string, operator: string): SharedFilterDialogLeaf {
  return {
    id: nextEditorId(),
    kind: 'leaf',
    propertyKey,
    operator,
    textValue: '',
    numberValue: null,
    dateValue: '',
    lowValue: null,
    highValue: null,
    selectedChoices: [],
  };
}

function leafFromCondition(cond: IFilterCondition, schema: FilterableProperty[]): SharedFilterDialogLeaf | null {
  const prop = findProperty(schema, cond.property);
  if (!prop) {
    // condition on an unknown property cannot be edited; drop it (the page's
    // schema owns the editable surface)
    return null;
  }
  // custom-op recognize runs FIRST (§6.4)
  const custom = prop.customOperators?.find((co) => co.recognize(cond));
  if (custom) {
    return blankLeaf(prop.key, custom.id);
  }
  const leaf = blankLeaf(prop.key, prop.kind === 'enum' ? FilterOperation.Equal : cond.operation);
  if (cond.operation === FilterOperation.Between) {
    leaf.lowValue = condBoundToEditorValue(cond.lowValue, prop.kind);
    leaf.highValue = condBoundToEditorValue(cond.highValue, prop.kind);
    return leaf;
  }
  switch (prop.kind) {
    case 'enum':
      leaf.selectedChoices = [cond.lowValue as string | number];
      break;
    case 'number':
      leaf.numberValue = typeof cond.lowValue === 'number' ? cond.lowValue : null;
      break;
    case 'date':
      leaf.dateValue = cond.lowValue instanceof Date ? dateToEditorValue(cond.lowValue) : '';
      break;
    default:
      leaf.textValue = typeof cond.lowValue === 'string' ? cond.lowValue : '';
  }
  return leaf;
}

function condBoundToEditorValue(v: FilterValue | undefined, kind: FilterPropertyKind): string | number | null {
  if (v === undefined || v === null) {
    return null;
  }
  if (kind === 'number') {
    return typeof v === 'number' ? v : null;
  }
  if (kind === 'date') {
    return v instanceof Date ? dateToEditorValue(v) : null;
  }
  return v instanceof Date ? dateToEditorValue(v) : String(v);
}

function seedMember(member: FilterMember, schema: FilterableProperty[]): SharedFilterDialogMember | null {
  if (isFilterCondition(member)) {
    return leafFromCondition(member, schema);
  }
  const folded = tryFoldEnumGroup(member, schema);
  if (folded) {
    const leaf = blankLeaf(folded.propertyKey, FilterOperation.Equal);
    leaf.selectedChoices = folded.values;
    return leaf;
  }
  return seedNode(member, schema);
}

/** copy-in one group definition (recurses through seedMember). */
export function seedNode(def: IFilterDefinition, schema: FilterableProperty[]): SharedFilterDialogNode {
  const node: SharedFilterDialogNode = {
    id: nextEditorId(),
    kind: 'group',
    join: def.join ?? FilterJoinType.AND,
    members: [],
  };
  for (const member of def.conditions ?? []) {
    const seeded = seedMember(member, schema);
    if (seeded) {
      node.members.push(seeded);
    }
  }
  return node;
}

export function seedTree(def: IFilterDefinition | undefined, schema: FilterableProperty[]): SharedFilterDialogNode {
  return seedNode(def ?? { conditions: [] }, schema);
}

// ---------------------------------------------------------------------------
// Emit: editor tree → IFilterDefinition (design §5.2, §6)
// ---------------------------------------------------------------------------

function applyPrepare(prop: FilterableProperty, value: string | number): string | number {
  return prop.prepareValue ? prop.prepareValue(value) : value;
}

function emitLeaf(leaf: SharedFilterDialogLeaf, schema: FilterableProperty[]): FilterMember | null {
  const prop = findProperty(schema, leaf.propertyKey);
  if (!prop) {
    return null;
  }
  // custom operators own their value: emit() runs as-is, prepareValue skipped (§6.4)
  const custom = findCustomOperator(prop, leaf.operator);
  if (custom) {
    return custom.emit(prop.key);
  }

  if (prop.kind === 'enum') {
    const enumCond = (v: string | number): IFilterCondition => ({
      property: prop.key,
      operation: FilterOperation.Equal,
      lowValue: v,
      enumValues: prop.enumValues,
    });
    if (leaf.selectedChoices.length === 1) {
      return enumCond(leaf.selectedChoices[0]);
    }
    return { join: FilterJoinType.OR, conditions: leaf.selectedChoices.map(enumCond) };
  }

  if (leaf.operator === FilterOperation.Between) {
    const cond: IFilterCondition = {
      property: prop.key,
      operation: FilterOperation.Between,
      lowValue: boundToFilterValue(leaf.lowValue, prop, true),
      highValue: boundToFilterValue(leaf.highValue, prop, true),
    };
    if (prop.enumValues) {
      cond.enumValues = prop.enumValues;
    }
    return cond;
  }

  const cond: IFilterCondition = { property: prop.key, operation: leaf.operator as FilterOperation };
  switch (prop.kind) {
    case 'number':
      cond.lowValue = leaf.numberValue ?? 0;
      break;
    case 'date':
      cond.lowValue = editorValueToDate(leaf.dateValue) ?? new Date(0);
      break;
    default:
      cond.lowValue = applyPrepare(prop, leaf.textValue);
  }
  if (prop.enumValues) {
    cond.enumValues = prop.enumValues;
  }
  return cond;
}

function boundToFilterValue(bound: string | number | null, prop: FilterableProperty, forEmit: boolean): FilterValue {
  if (prop.kind === 'number') {
    return typeof bound === 'number' ? bound : 0;
  }
  if (prop.kind === 'date') {
    return editorValueToDate(String(bound ?? '')) ?? new Date(0);
  }
  const s = typeof bound === 'string' ? bound : String(bound ?? '');
  return forEmit ? String(applyPrepare(prop, s)) : s;
}

function emitMember(member: SharedFilterDialogMember, schema: FilterableProperty[]): FilterMember | null {
  if (isDialogNode(member)) {
    return emitNode(member, schema);
  }
  return emitLeaf(member, schema);
}

/** Submit output: leaves → conditions/groups; drops nothing (validation
 *  already guarantees completeness); root may emit `conditions: []` (=
 *  match-all = cleared filter). */
export function emitTree(root: SharedFilterDialogNode, schema: FilterableProperty[]): IFilterDefinition {
  return emitNode(root, schema);
}

function emitNode(node: SharedFilterDialogNode, schema: FilterableProperty[]): IFilterDefinition {
  const conditions = node.members.map((m) => emitMember(m, schema)).filter((m): m is FilterMember => m !== null);
  return { join: node.join, conditions };
}

// ---------------------------------------------------------------------------
// Immutable mutators (design §5.2, §5.3)
// ---------------------------------------------------------------------------

function mapMembers(
  node: SharedFilterDialogNode,
  fn: (m: SharedFilterDialogMember) => SharedFilterDialogMember | null,
): SharedFilterDialogNode {
  const members = node.members.map(fn).filter((m): m is SharedFilterDialogMember => m !== null);
  return { ...node, members };
}

function walkRebuild(
  node: SharedFilterDialogNode,
  rebuild: (n: SharedFilterDialogNode) => SharedFilterDialogNode,
): SharedFilterDialogNode {
  const members = node.members.map((m) => (isDialogNode(m) ? walkRebuild(m, rebuild) : m));
  return rebuild({ ...node, members });
}

/** Append `member` to the group with `parentId` (returns a new root). */
export function insertMember(
  root: SharedFilterDialogNode,
  parentId: number,
  member: SharedFilterDialogMember,
): SharedFilterDialogNode {
  const insert = (n: SharedFilterDialogNode): SharedFilterDialogNode =>
    n.id === parentId ? { ...n, members: [...n.members, member] } : n;
  return walkRebuild(root, insert);
}

/** Remove the member (leaf or group) with `memberId` from its parent. The
 *  root itself is never deleted. */
export function deleteMember(root: SharedFilterDialogNode, memberId: number): SharedFilterDialogNode {
  const drop = (n: SharedFilterDialogNode): SharedFilterDialogNode =>
    mapMembers(n, (m) => (m.id === memberId ? null : m));
  return walkRebuild(root, drop);
}

/** Replace the join of the group with `nodeId`. */
export function patchNode(root: SharedFilterDialogNode, nodeId: number, join: FilterJoinType): SharedFilterDialogNode {
  const fix = (n: SharedFilterDialogNode): SharedFilterDialogNode => (n.id === nodeId ? { ...n, join } : n);
  return walkRebuild(root, fix);
}

/** Replace the leaf with `leafId` by id inside its parent (shallow merge). */
export function patchLeaf(
  root: SharedFilterDialogNode,
  leafId: number,
  patch: Partial<SharedFilterDialogLeaf>,
): SharedFilterDialogNode {
  return walkRebuildPatch(root, leafId, patch);
}

function walkRebuildPatch(
  node: SharedFilterDialogNode,
  leafId: number,
  patch: Partial<SharedFilterDialogLeaf>,
): SharedFilterDialogNode {
  const members = node.members.map((m) => {
    if (isDialogNode(m)) {
      return walkRebuildPatch(m, leafId, patch);
    }
    return m.id === leafId ? { ...m, ...patch } : m;
  });
  return { ...node, members };
}

/** Find the id of the group a member belongs to (root if direct member). */
export function parentIdOf(root: SharedFilterDialogNode, memberId: number): number | null {
  if (root.id === memberId) {
    return null;
  }
  let found: number | null = null;
  const visit = (n: SharedFilterDialogNode): void => {
    for (const m of n.members) {
      if (m.id === memberId) {
        found = n.id;
        return;
      }
      if (isDialogNode(m)) {
        visit(m);
        if (found !== null) {
          return;
        }
      }
    }
  };
  visit(root);
  return found;
}

/** Nesting depth of a member: root = 1. */
export function depthOf(root: SharedFilterDialogNode, memberId: number): number {
  if (root.id === memberId) {
    return 1;
  }
  let result = 0;
  const visit = (n: SharedFilterDialogNode, depth: number): void => {
    for (const m of n.members) {
      if (m.id === memberId) {
        result = depth;
        return;
      }
      if (isDialogNode(m)) {
        visit(m, depth + 1);
        if (result > 0) {
          return;
        }
      }
    }
  };
  visit(root, 2);
  return result;
}

/** Locate an editor member by id anywhere in the tree. */
export function findMember(root: SharedFilterDialogNode, memberId: number): SharedFilterDialogMember | null {
  if (root.id === memberId) {
    return root;
  }
  for (const m of root.members) {
    if (m.id === memberId) {
      return m;
    }
    if (isDialogNode(m)) {
      const nested = findMember(m, memberId);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}

/** True when `node` (or anything under it) contains `memberId`. */
export function containsMember(node: SharedFilterDialogNode, memberId: number): boolean {
  return node.members.some((m) => m.id === memberId || (isDialogNode(m) && containsMember(m, memberId)));
}

/** A new row = first selectable property, its first operator, blank values. */
export function emptyLeaf(schema: FilterableProperty[]): SharedFilterDialogLeaf {
  const first = selectableProperties(schema)[0];
  if (!first) {
    return blankLeaf('', '');
  }
  const ops = effectiveOperations(first);
  return blankLeaf(first.key, ops[0] ?? first.customOperators?.[0]?.id ?? '');
}

/** A new group with the given id, AND-joined, empty (the toolbar's +group). */
export function emptyNode(id: number): SharedFilterDialogNode {
  return { id, kind: 'group', join: FilterJoinType.AND, members: [] };
}

// ---------------------------------------------------------------------------
// Validation (design §8)
// ---------------------------------------------------------------------------

export type FilterLeafError = 'needsValue' | 'enumNeedsChoice' | 'invalidRange';

export interface ValidationState {
  hasMissingValue: boolean;
  /** leaf id → the reason its value editor is offending */
  leafErrors: Map<number, FilterLeafError>;
  /** nested groups with < 2 members (root exempt) */
  invalidGroupIds: number[];
  isValid: boolean;
}

/** i18n hint key for each leaf error (plus the shared group message). */
export const FILTER_LEAF_ERROR_KEYS: Record<FilterLeafError, string> = {
  needsValue: 'Filter.NeedsValue',
  enumNeedsChoice: 'Filter.EnumNeedsChoice',
  invalidRange: 'Filter.InvalidRange',
};
export const FILTER_GROUP_NEEDS_TWO_KEY = 'Filter.GroupNeedsTwo';

function leafError(leaf: SharedFilterDialogLeaf, schema: FilterableProperty[]): FilterLeafError | null {
  const prop = findProperty(schema, leaf.propertyKey);
  if (!prop) {
    return 'needsValue';
  }
  if (!operatorHasValue(prop, leaf.operator)) {
    return null;
  }
  if (prop.kind === 'enum') {
    return leaf.selectedChoices.length === 0 ? 'enumNeedsChoice' : null;
  }
  if (leaf.operator === FilterOperation.Between) {
    if (leaf.lowValue === null || leaf.highValue === null || leaf.lowValue === '' || leaf.highValue === '') {
      return 'needsValue';
    }
    // §6.2: both filled; low <= high for numeric and date compare; string
    // Between is lexicographic and needs no extra rule
    if (prop.kind === 'number') {
      return Number(leaf.lowValue) <= Number(leaf.highValue) ? null : 'invalidRange';
    }
    if (prop.kind === 'date') {
      return String(leaf.lowValue) <= String(leaf.highValue) ? null : 'invalidRange';
    }
    return null;
  }
  switch (prop.kind) {
    case 'number':
      return leaf.numberValue === null ? 'needsValue' : null;
    case 'date':
      return leaf.dateValue === '' ? 'needsValue' : null;
    default:
      return leaf.textValue.trim() === '' ? 'needsValue' : null;
  }
}

/** validateTree: blank/missing values and non-branching nested groups block
 *  Submit; root exempt (0 = clear-filter, 1 = single-condition filter). */
export function validateTree(root: SharedFilterDialogNode, schema: FilterableProperty[]): ValidationState {
  const leafErrors = new Map<number, FilterLeafError>();
  const invalidGroupIds: number[] = [];
  const visit = (n: SharedFilterDialogNode, isRoot: boolean): void => {
    if (!isRoot && n.members.length < 2) {
      invalidGroupIds.push(n.id);
    }
    for (const m of n.members) {
      if (isDialogNode(m)) {
        visit(m, false);
      } else {
        const err = leafError(m, schema);
        if (err) {
          leafErrors.set(m.id, err);
        }
      }
    }
  };
  visit(root, true);
  return {
    hasMissingValue: leafErrors.size > 0,
    leafErrors,
    invalidGroupIds,
    isValid: leafErrors.size === 0 && invalidGroupIds.length === 0,
  };
}

// ---------------------------------------------------------------------------
// Summarize (design §9)
// ---------------------------------------------------------------------------

export type FilterLabels = (key: string) => string;

/** Operator display for phrases: comparison symbols verbatim, word operators
 *  via the i18n map (design §9). */
export function operatorLabel(op: FilterOperation | string, labels: FilterLabels): string {
  if (!isFilterOperation(op)) {
    return op;
  }
  switch (op) {
    case FilterOperation.GreaterThan:
      return '>';
    case FilterOperation.GreaterOrEqual:
      return '>=';
    case FilterOperation.LessThan:
      return '<';
    case FilterOperation.LessOrEqual:
      return '<=';
    case FilterOperation.Equal:
      return '=';
    default:
      return labels(FILTER_OPERATION_LABEL_KEYS[op]);
  }
}

/** Value display inside a summarized condition (choice labels for enums). */
function conditionValueText(
  cond: IFilterCondition,
  prop: FilterableProperty | undefined,
  labels: FilterLabels,
): string {
  if (!prop) {
    return formatFilterValue(cond.lowValue ?? '');
  }
  if (prop.kind === 'enum') {
    return enumChoiceLabel(prop, cond.lowValue as string | number | undefined, labels);
  }
  return formatFilterValue(cond.lowValue ?? '');
}

function enumChoiceLabel(prop: FilterableProperty, value: string | number | undefined, labels: FilterLabels): string {
  if (value === undefined) {
    return '';
  }
  const choice = prop.choices?.find((c) => c.value === value);
  return choice ? labels(choice.labelKey) : String(value);
}

function summarizeCondition(cond: IFilterCondition, schema: FilterableProperty[], labels: FilterLabels): string {
  const prop = findProperty(schema, cond.property);
  const propLabel = prop ? labels(prop.labelKey) : cond.property;
  const custom = prop?.customOperators?.find((co) => co.recognize(cond));
  if (custom) {
    return `${propLabel} ${labels(custom.labelKey)}`;
  }
  if (cond.operation === FilterOperation.Between) {
    return `${propLabel} ${formatFilterValue(cond.lowValue ?? '')}≤x≤${formatFilterValue(cond.highValue ?? '')}`;
  }
  return `${propLabel} ${operatorLabel(cond.operation, labels)} ${conditionValueText(cond, prop, labels)}`;
}

function summarizeDef(
  def: IFilterDefinition,
  schema: FilterableProperty[],
  labels: FilterLabels,
  isRoot: boolean,
): string {
  const folded = tryFoldEnumGroup(def, schema);
  if (folded) {
    const prop = findProperty(schema, folded.propertyKey);
    const propLabel = prop ? labels(prop.labelKey) : folded.propertyKey;
    const values = folded.values.map((v) => (prop ? enumChoiceLabel(prop, v, labels) : String(v))).join('/');
    return `${propLabel} ${values}`;
  }
  const join = def.join ?? FilterJoinType.AND;
  const joinText = join === FilterJoinType.OR ? labels('Filter.Or') : labels('Filter.And');
  const parts = def.conditions
    .map((m) => (isFilterCondition(m) ? summarizeCondition(m, schema, labels) : summarizeDef(m, schema, labels, false)))
    .filter((s) => s.length > 0);
  if (parts.length === 0) {
    // An empty group contributes nothing to the summary - root or nested alike.
    return '';
  }
  const text = parts.join(` ${joinText} `);
  return isRoot ? text : `(${text})`;
}

/** preview + menu label (parenthesized notation, per-group join, choice lists
 *  as `a/b/c`, Between as `low ≤ x ≤ high`). `maxLength` caps menu labels
 *  with an ellipsis; the live preview is uncapped. */
export function summarizeFilterDefinition(
  def: IFilterDefinition,
  schema: FilterableProperty[],
  labels: FilterLabels,
  maxLength?: number,
): string {
  const text = summarizeDef(def, schema, labels, true);
  if (maxLength && text.length > maxLength) {
    return `${text.slice(0, maxLength - 1)}…`;
  }
  return text;
}

/** Tree-row label for an editor member (design §9): groups show their join
 *  word and member count, leaves the condition phrase. */
export function summarizeMember(
  member: SharedFilterDialogMember,
  schema: FilterableProperty[],
  labels: FilterLabels,
): string {
  if (isDialogNode(member)) {
    const joinText = member.join === FilterJoinType.OR ? labels('Filter.Or') : labels('Filter.And');
    return `${joinText} (${member.members.length})`;
  }
  const emitted = emitLeaf(member, schema);
  if (emitted === null) {
    return '';
  }
  return isFilterCondition(emitted)
    ? summarizeCondition(emitted, schema, labels)
    : summarizeDef(emitted, schema, labels, false);
}
