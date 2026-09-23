//
// Unit test for flat-tree.ts
//
// These helpers are the single assembly behind the transaction-type picker, the
// control-center picker and the book-detail category tree, so the walk has to hold
// for the awkward dictionaries all three of those can be handed: rows with a 0/absent
// parent, rows whose parent was deleted, and rows stranded on a parent cycle.
//

import { FlatTreeRow, FlatTreeNode, buildFlatTree, dottedPathTitle } from './flat-tree';

/** Sibling titles of a level, so assertions read as the tree, not as its node objects. */
const titles = (nodes: FlatTreeNode[]): string[] => nodes.map((n) => n.title);

describe('buildFlatTree', () => {
  it('nests each row under its parent and keeps the input order among siblings', () => {
    const rows: FlatTreeRow[] = [
      { id: 1, parentId: 0, title: 'Income' },
      { id: 2, parentId: 1, title: 'Salary' },
      { id: 3, parentId: 1, title: 'Bonus' },
      { id: 4, parentId: 0, title: 'Outgoing' },
    ];

    const roots = buildFlatTree(rows);

    expect(titles(roots)).toEqual(['Income', 'Outgoing']);
    expect(titles(roots[0].children)).toEqual(['Salary', 'Bonus']);
    expect(roots[1].children).toEqual([]);
  });

  it('keys nodes by the stringified id and marks a childless row as a leaf', () => {
    const roots = buildFlatTree([
      { id: 1, parentId: 0, title: 'Income' },
      { id: 2, parentId: 1, title: 'Salary' },
    ]);

    expect(roots[0].key).toEqual('1');
    expect(roots[0].isLeaf).toEqual(false);
    expect(roots[0].children[0].key).toEqual('2');
    expect(roots[0].children[0].isLeaf).toEqual(true);
  });

  // The drift this helper was extracted to end: the two tree-select wrappers read a
  // 0 parent as a root, book-detail read only null/undefined that way. All three
  // senses have to mean the same thing, since ParentId 0 is what the fetch services
  // store for a root.
  it.each([
    ['0', 0],
    ['undefined', undefined],
    ['null', null],
  ])('reads a %s parent as a root', (_label, parentId) => {
    const roots = buildFlatTree([{ id: 7, parentId: parentId, title: 'Root' }]);

    expect(titles(roots)).toEqual(['Root']);
  });

  it('attaches a row whose parent is absent at the top level, as a selectable leaf', () => {
    const roots = buildFlatTree([
      { id: 1, parentId: 0, title: 'Income' },
      { id: 2, parentId: 1, title: 'Salary' },
      { id: 3, parentId: 99, title: 'Orphan' },
    ]);

    // Hoisted, not dropped and not bucketed: a selection tree has no non-selectable node.
    expect(titles(roots)).toEqual(['Income', 'Orphan']);
    expect(roots[1].isLeaf).toEqual(true);
    expect(roots[1].children).toEqual([]);
  });

  // Following either of these would recurse forever, so the row is treated as
  // unreachable - and its own children are deliberately NOT walked.
  it('hoists a self-parented row instead of recursing forever', () => {
    const roots = buildFlatTree([{ id: 3, parentId: 3, title: 'Self' }]);

    expect(titles(roots)).toEqual(['Self']);
    expect(roots[0].isLeaf).toEqual(true);
  });

  it('hoists the rows stranded on a parent cycle instead of recursing forever', () => {
    const roots = buildFlatTree([
      { id: 1, parentId: 2, title: 'A' },
      { id: 2, parentId: 1, title: 'B' },
    ]);

    expect(titles(roots)).toEqual(['A', 'B']);
    expect(roots.every((n) => n.isLeaf)).toEqual(true);
  });

  it('returns an empty tree for an empty dictionary', () => {
    expect(buildFlatTree([])).toEqual([]);
  });
});

describe('dottedPathTitle', () => {
  interface Walkable {
    title: string;
    parentNode: Walkable | null;
  }
  const leaf = (title: string, parentNode: Walkable | null): Walkable => ({ title: title, parentNode: parentNode });

  it('joins the node and its ancestors from the root down', () => {
    const root = leaf('Income', null);
    const child = leaf('Salary', root);

    expect(dottedPathTitle(leaf('Base', child))).toEqual('Income.Salary.Base');
  });

  it('returns the bare title for a node without a parent', () => {
    expect(dottedPathTitle(leaf('Income', null))).toEqual('Income');
  });

  // nzDisplayWith is called with the node it has, which is undefined while the model
  // holds an id the tree does not contain - the placeholder path.
  it('returns undefined for a missing node', () => {
    expect(dottedPathTitle(undefined)).toBeUndefined();
    expect(dottedPathTitle(null)).toBeUndefined();
  });
});
