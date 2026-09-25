// Flat-to-hierarchy helpers for the tree-select pickers.
//
// Three components assemble the same shape from a flat, self-referencing
// dictionary (transaction types, control centers, book categories): nodes keyed by
// the row id, titled by the row's (translated) name, children under their parent,
// and everything unreachable attached at the top level. The copies had already
// drifted - `(val.ParId || null) === parentId` in the two tree-select wrappers
// against `?? null` in book-detail, so the same dictionary could render a different
// tree (and a different selectable set) depending on which picker showed it. These
// helpers are the single assembly, deliberately free of ng-zorro types so both
// pickers and the plain callers can share it.
//
// The two *-hierarchy browse views (book-category-hierarchy, tran-type-hierarchy) are
// deliberately NOT built on this: they differ on the unreachable-row policy, which is
// the one thing a selection tree cannot compromise on. book-category-hierarchy parks
// orphans under an "unknown parent" bucket node (fine for browsing, not for picking)
// and tran-type-hierarchy drops them outright.

/**
 * One row of a flat dictionary, in the only shape the builders need.
 *
 * `parentId` of null, undefined or 0 all mean "no parent": 0 is the value these
 * dictionaries carry for a root (the fetch services test `!value.ParId`), and the
 * two tree-select wrappers already folded it that way.
 */
export interface FlatTreeRow {
  id: number;
  parentId?: number | null;
  title: string;
}

/**
 * The node shape produced below: structurally assignable to ng-zorro's
 * `NzTreeNodeOptions` (as well as to the `{ key, title }` shapes the hierarchy
 * views built for themselves).
 */
export interface FlatTreeNode {
  key: string;
  title: string;
  children: FlatTreeNode[];
  isLeaf: boolean;
}

function normalizeParentId(parentId: number | null | undefined): number | null {
  return parentId === undefined || parentId === null || parentId === 0 ? null : parentId;
}

/**
 * Builds ng-zorro tree nodes from a flat dictionary, preserving the input order
 * among siblings.
 *
 * Rows whose parent is absent from the input - and rows stranded on a parent cycle
 * (A parent B, B parent A, or a row parented to itself), which the walk below can
 * never reach - are attached at the TOP level, with no children, rather than being
 * dropped or collected under an "uncategorized" bucket: in a selection tree every
 * node has to be a real, selectable row. Their own subtree is deliberately not
 * walked, since following a cycle would recurse forever.
 */
export function buildFlatTree(rows: FlatTreeRow[]): FlatTreeNode[] {
  const rendered = new Set<number>();

  const mkNode = (row: FlatTreeRow): FlatTreeNode => ({
    key: String(row.id),
    title: row.title,
    children: [],
    isLeaf: true,
  });

  const buildChildren = (parentId: number | null): FlatTreeNode[] => {
    const children: FlatTreeNode[] = [];
    rows.forEach((row) => {
      if (normalizeParentId(row.parentId) === parentId) {
        rendered.add(row.id);
        const node = mkNode(row);
        const kids = buildChildren(row.id);
        node.children = kids;
        node.isLeaf = kids.length === 0;
        children.push(node);
      }
    });
    return children;
  };

  const roots = buildChildren(null);

  rows
    .filter((row) => !rendered.has(row.id))
    .forEach((row) => {
      rendered.add(row.id);
      roots.push(mkNode(row));
    });

  return roots;
}

/**
 * The dotted path of a tree-select's selected node ('主业收入.工资'), rebuilt from
 * its parent chain. nz-tree-select's `nzDisplayWith` hands the component the
 * NzTreeNode, whose `origin` does not carry the joined path even though the model
 * behind it (TranType/ControlCenter `FullDisplayText`) does.
 */
export interface TreeNodeLike {
  title: string;
  parentNode: TreeNodeLike | null;
}

export function dottedPathTitle(node: TreeNodeLike | null | undefined): string | undefined {
  if (!node) {
    return undefined;
  }
  const parts: string[] = [];
  let cur: TreeNodeLike | null = node;
  while (cur) {
    parts.unshift(cur.title);
    cur = cur.parentNode;
  }
  return parts.join('.');
}
