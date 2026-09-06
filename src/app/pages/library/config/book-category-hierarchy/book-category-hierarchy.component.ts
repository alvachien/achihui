import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzTreeModule, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { ModelUtility, ConsoleLogTypeEnum, BookCategory } from '@model/index';
import { LibraryStorageService, UIStatusService } from '@services/index';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hih-book-category-hierarchy',
  templateUrl: './book-category-hierarchy.component.html',
  styleUrls: ['./book-category-hierarchy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzSpinModule, NzTreeModule, TranslocoModule],
})
export class BookCategoryHierarchyComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  isLoadingResults = signal(false);
  bcTreeNodes = signal<NzTreeNodeOptions[]>([]);

  public readonly odataService = inject(LibraryStorageService);

  public readonly uiStatusService = inject(UIStatusService);

  public readonly modalService = inject(NzModalService);

  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookCategoryHierarchyComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookCategoryHierarchyComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.isLoadingResults.set(true);
    this.odataService
      .fetchAllBookCategories()
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoadingResults.set(false)),
      )
      .subscribe({
        next: (x: BookCategory[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering BookCategoryHierarchyComponent OnInit, fetchAllBookCategories...',
            ConsoleLogTypeEnum.debug,
          );

          if (x) {
            this.bcTreeNodes.set(this._buildTree(x));
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering BookCategoryHierarchyComponent OnInit, fetchAllBookCategories failed ${err}`,
            ConsoleLogTypeEnum.error,
          );
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  private _mkNode(val: BookCategory): NzTreeNodeOptions {
    return {
      key: val.ID.toString(),
      // name translated like the table view's Name cell (`Name | transloco`)
      title: translate(val.Name) + '(' + val.ID.toString() + ')',
    };
  }

  // Renders every category: nodes reachable from ParentID-null roots form the
  // tree; anything not rendered (ParentID pointing at a deleted/missing
  // category, self-parented rows, or parent cycles) previously vanished from
  // this tab entirely - it now lands in an explicit "unknown parent" bucket so
  // the user can find and re-parent it.
  private _buildTree(value: BookCategory[]): NzTreeNodeOptions[] {
    const rendered = new Set<number>();

    const buildChildren = (parentId: number | null): NzTreeNodeOptions[] => {
      const children: NzTreeNodeOptions[] = [];
      value.forEach((val: BookCategory) => {
        if ((val.ParentID ?? null) === parentId) {
          rendered.add(val.ID);
          const node: NzTreeNodeOptions = this._mkNode(val);
          const kids = buildChildren(val.ID);
          node.children = kids;
          node.isLeaf = kids.length === 0;
          children.push(node);
        }
      });
      return children;
    };

    const roots = buildChildren(null);

    const orphans = value.filter((val: BookCategory) => !rendered.has(val.ID));
    if (orphans.length > 0) {
      roots.push({
        key: 'unassigned',
        title: translate('Library.CategoryUnassignedParent'),
        isLeaf: false,
        children: orphans.map((val: BookCategory) => {
          const node: NzTreeNodeOptions = this._mkNode(val);
          node.children = [];
          node.isLeaf = true;
          return node;
        }),
      });
    }

    return roots;
  }
}
