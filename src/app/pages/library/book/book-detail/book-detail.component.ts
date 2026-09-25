import {
  Component,
  OnInit,
  ViewContainerRef,
  computed,
  inject,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
  Type,
} from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { translate, TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import {
  BaseListModel,
  ModelUtility,
  ConsoleLogTypeEnum,
  Book,
  BookReadingRecord,
  BookReadingStatus,
  getUIModeString,
  Person,
  Organization,
  BookCategory,
  Location,
} from '@model/index';
import { HomeDefOdataService, LibraryStorageService } from '@services/index';
import { FlatTreeNode, buildFlatTree } from '@common/flat-tree';
import { BookAssociationsComponent } from '../book-associations';
import { PersonSelectionDlgComponent } from '../../person-selection-dlg';
import { OrganizationSelectionDlgComponent } from '../../organization-selection-dlg';
import { LocationSelectionDlgComponent } from '../../location-selection-dlg';

@Component({
  selector: 'hih-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzSpinModule,
    NzBreadCrumbModule,
    TranslocoModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzDividerModule,
    NzInputModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzTableModule,
    NzTagModule,
    RouterModule,
    NzModalModule,
    BookAssociationsComponent,
  ],
})
export class BookDetailComponent implements OnInit {
  isLoadingResults = signal(false);
  isSubmitting = signal(false);
  public routerID = signal(-1); // Current object ID in routing
  public currentMode = signal('');
  public uiMode = signal<UIMode>(UIMode.Create);
  detailFormGroup: UntypedFormGroup;
  listAuthors = signal<Person[]>([]);
  listTranslators = signal<Person[]>([]);
  listPresses = signal<Organization[]>([]);
  listCategories = signal<BookCategory[]>([]);
  listLocations = signal<Location[]>([]);
  // Per-book reading log, shown inline in Display mode so the records are
  // visible without navigating to the reading-record list (the header link
  // still leads there for create/finalize/delete management).
  readingRecords = signal<BookReadingRecord[]>([]);
  isLoadingReadingRecords = signal(false);
  // Categories as loaded. The tree and the id snapshot are both DERIVED from this
  // one array (not built once and stored), because node titles come from the
  // imperative translate() - which carries no implicit active-language dependency -
  // so a language switch has to rebuild them (see langTick).
  private readonly categories = signal<BookCategory[]>([]);
  // Bumped on every runtime language switch (see the constructor) so the computeds
  // below, which call the imperative translate(), recompute. Same idiom as
  // book-list/document-list/reading-record-list.
  private readonly langTick = signal(0);
  // Selectable category tree feeding the inline tree-select rows rendered by
  // BookAssociationsComponent (the old category-selection dialog is gone).
  readonly categoryTree = computed(() => {
    this.langTick();
    return this._buildCategoryTree(this.categories());
  });
  // id -> category, from the same array the tree is built from. Resolving a pick
  // against this snapshot is what keeps the rendered value and the row's model in
  // step: the service's cached dictionary can belong to another home by the time the
  // pick arrives (fetchAllBookCategories only writes its cache while the home still
  // matches), and a lookup that missed there left the tree-select showing a category
  // the row never carried — which onSave then dropped, with nothing shown to the user.
  private readonly categoryById = computed(() => {
    const map = new Map<number, BookCategory>();
    this.categories().forEach((c) => map.set(c.ID, c));
    return map;
  });
  // The record as loaded from the server. Update-mode saves patch THIS object
  // instead of a fresh one: the backend PUT applies every column of the body
  // (SetValues), so any field the edit form does not expose (OriginLangID,
  // BookLangID — the only two left) must still carry its loaded value, or it
  // gets nulled on save.
  private originalBook: Book | null = null;

  private readonly storageService = inject(LibraryStorageService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modal = inject(NzModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly destroyedRef = inject(DestroyRef);
  private readonly translocoService = inject(TranslocoService);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookDetailComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.detailFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      nnameControl: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
      cnameControl: new UntypedFormControl('', [Validators.maxLength(100)]),
      chnIsNativeControl: new UntypedFormControl(false),
      // Bibliographic fields. Lengths mirror the entity's StringLength
      // attributes (ISBN 50, Detail 200); both are optional, so a blank input
      // must stay submittable.
      isbnControl: new UntypedFormControl('', [Validators.maxLength(50)]),
      // No min/max validators: the API column carries no range constraint, and a
      // validation rule here would lock a legacy row out of any edit. nzMin/nzMax
      // on the input are the UI guard only (see the template).
      pyearControl: new UntypedFormControl(null),
      pgcntControl: new UntypedFormControl(null),
      // Copies held. Seeded to 1 rather than null: cataloguing a book means the
      // home has it, and 0 is the "gone" state, so a blank create form must not
      // imply removal. Edit mode overwrites this from the loaded record.
      ccntControl: new UntypedFormControl(1),
      detailControl: new UntypedFormControl('', [Validators.maxLength(200)]),
    });

    // categoryTree's node titles come from the imperative translate(), which carries
    // no implicit active-language dependency of its own - bump langTick on every
    // runtime switch so that computed rebuilds them (and its own error modal text
    // stays the only other baked string, which is read at open time).
    this.translocoService.langChanges$
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe(() => this.langTick.update((n) => n + 1));
  }

  get isEditable(): boolean {
    return isUIEditable(this.uiMode());
  }

  // The inline reading-log section renders only in Display mode (per the
  // request): Create has no book id yet, and Edit keeps the form focused.
  get isDisplayMode(): boolean {
    return this.uiMode() === UIMode.Display;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.activateRoute.url.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering BookDetailComponent ngOnInit activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug,
      );

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.uiMode.set(UIMode.Create);
        } else if (x[0].path === 'edit') {
          this.routerID.set(+x[1].path);

          this.uiMode.set(UIMode.Update);
        } else if (x[0].path === 'display') {
          this.routerID.set(+x[1].path);

          this.uiMode.set(UIMode.Display);
        }
        this.currentMode.set(getUIModeString(this.uiMode()));
      }

      switch (this.uiMode()) {
        case UIMode.Update:
        case UIMode.Display: {
          this.isLoadingResults.set(true);
          // Categories feed the inline tree-select rows, so they load up-front
          // now that the selection dialog is gone (the dictionary is cached by
          // the service; this only builds the tree once).
          forkJoin([this.storageService.fetchAllBookCategories(), this.storageService.readBook(this.routerID())])
            .pipe(
              finalize(() => this.isLoadingResults.set(false)),
              takeUntilDestroyed(this.destroyedRef),
            )
            .subscribe({
              next: (e) => {
                // The tree and the pick handler's id snapshot are derived from this
                // one array (see categoryTree / categoryById), so a displayed node can
                // always be resolved back to the category it stands for.
                this.categories.set(e[0]);

                const bk: Book = e[1];
                this.originalBook = bk;
                this.detailFormGroup.get('idControl')?.setValue(bk.ID);
                this.detailFormGroup.get('nnameControl')?.setValue(bk.NativeName);
                this.detailFormGroup.get('cnameControl')?.setValue(bk.ChineseName);
                this.detailFormGroup.get('chnIsNativeControl')?.setValue(bk.ChineseIsNative);
                this.detailFormGroup.get('isbnControl')?.setValue(bk.ISBN);
                this.detailFormGroup.get('pyearControl')?.setValue(bk.PublishedYear);
                this.detailFormGroup.get('pgcntControl')?.setValue(bk.PageCount);
                this.detailFormGroup.get('ccntControl')?.setValue(bk.CopyCount);
                this.detailFormGroup.get('detailControl')?.setValue(bk.Detail);
                this.listAuthors.set(bk.Authors);
                this.listCategories.set(bk.Categories);
                this.listLocations.set(bk.Locations);
                this.listPresses.set(bk.Presses);
                this.listTranslators.set(bk.Translators);

                if (this.uiMode() === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else if (this.uiMode() === UIMode.Update) {
                  this.detailFormGroup.enable();
                  this.detailFormGroup.get('idControl')?.disable();
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering BookDetailComponent ngOnInit forkJoin failed ${err}...`,
                  ConsoleLogTypeEnum.error,
                );
                this.modal.error({
                  nzTitle: translate('Common.Error'),
                  nzContent: err.toString(),
                  nzClosable: true,
                });
              },
            });

          // Display mode only: load the book's reading log inline (independent
          // of the book fetch above - it only needs the route id).
          if (this.uiMode() === UIMode.Display) {
            this.loadReadingRecords(this.routerID());
          }
          break;
        }

        case UIMode.Create:
        default: {
          this.detailFormGroup.get('idControl')?.setValue('NEW OBJECT');
          this.storageService
            .fetchAllBookCategories()
            .pipe(takeUntilDestroyed(this.destroyedRef))
            .subscribe({
              next: (cts: BookCategory[]) => this.categories.set(cts),
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering BookDetailComponent ngOnInit fetchAllBookCategories failed ${err}...`,
                  ConsoleLogTypeEnum.error,
                );
                this.modal.error({
                  nzTitle: translate('Common.Error'),
                  nzContent: err.toString(),
                  nzClosable: true,
                });
              },
            });
          break;
        }
      }
    });
  }

  // Opens a selection dialog. `nzData` reaches the dialog only via the NZ_MODAL_DATA
  // injection token, and the user's checks live in the dialog component's own state -
  // so the selection is read back from the content component in nzOnOk (which runs
  // before the content is destroyed).
  private openSelectionDlg(
    title: string,
    content: Type<{ setOfCheckedId: () => Set<number> }>,
    setOfCheckedId: Set<number>,
    nzDataExtra: Record<string, unknown>,
    onOk: (setOfCheckedId: Set<number>) => void,
  ): void {
    const modal: NzModalRef = this.modal.create({
      nzTitle: title,
      nzWidth: 900,
      nzContent: content,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        setOfCheckedId: setOfCheckedId,
        ...nzDataExtra,
      },
      nzOnOk: () => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Debug]: Entering BookDetailComponent selection dlg, OK button...`,
          ConsoleLogTypeEnum.debug,
        );
        const inst = modal.getContentComponent() as { setOfCheckedId: () => Set<number> } | null;
        if (inst) {
          onOk(inst.setOfCheckedId());
        }
      },
    });
    modal.afterClose.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe(() => {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering BookDetailComponent selection dlg, dialog closed...',
        ConsoleLogTypeEnum.debug,
      );
    });
  }

  onAssignAuthor(): void {
    this.openSelectionDlg(
      translate('Library.SelectAuthor'),
      PersonSelectionDlgComponent,
      new Set<number>(this.listAuthors().map((prn) => prn.ID)),
      {},
      (checked) => this.listAuthors.set(this.storageService.Persons.filter((prn) => checked.has(prn.ID))),
    );
  }
  onAssignTranslator(): void {
    this.openSelectionDlg(
      translate('Library.SelectTranslator'),
      PersonSelectionDlgComponent,
      new Set<number>(this.listTranslators().map((prn) => prn.ID)),
      {},
      (checked) => this.listTranslators.set(this.storageService.Persons.filter((prn) => checked.has(prn.ID))),
    );
  }
  onAssignPress(): void {
    this.openSelectionDlg(
      translate('Library.SelectPress'),
      OrganizationSelectionDlgComponent,
      new Set<number>(this.listPresses().map((prs) => prs.ID)),
      {},
      (checked) => this.listPresses.set(this.storageService.Organizations.filter((org) => checked.has(org.ID))),
    );
  }
  // Categories are assigned inline (no dialog): append a blank row and let its
  // tree-select fill the category in. Blank rows carry ID 0 and are dropped on save.
  onAssignCategory(): void {
    this.listCategories.update((arr) => [...arr, new BookCategory()]);
  }

  // Node keys are stringified category IDs (see _buildCategoryTree).
  onCategoryPicked(evt: { key: string | null; row: BookCategory }): void {
    if (evt.key === null) {
      // The row's tree-select was cleared (its built-in clear button): reset the
      // row to blank so the data matches the now-empty select. Doing nothing
      // would keep the old assignment visible nowhere but saved anyway.
      this.listCategories.update((arr) => arr.map((c) => (c === evt.row ? new BookCategory() : c)));
      return;
    }
    const id = +String(evt.key ?? 0);
    if (!(id > 0)) {
      return;
    }
    const ctgy = this.categoryById().get(id);
    if (!ctgy) {
      // Unreachable while the tree and this snapshot are built from one array: a node
      // can only be picked if it came from it. Kept loud rather than silent because the
      // tree-select has already rendered the pick — returning quietly here would leave
      // the row showing a category it does not carry, which onSave discards without a
      // word. Reset the row so what is displayed and what is stored agree again.
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Error]: BookDetailComponent.onCategoryPicked cannot resolve category ${id} from the tree snapshot...`,
        ConsoleLogTypeEnum.error,
      );
      this.modal.error({
        nzTitle: translate('Common.Error'),
        nzContent: translate('Library.CategorySelectionFailed'),
        nzClosable: true,
      });
      this.listCategories.update((arr) => arr.map((c) => (c === evt.row ? new BookCategory() : c)));
      return;
    }
    // Store a COPY, never the shared service-cached dictionary entry — rows are
    // mutable data (person-detail idiom).
    const copy = new BookCategory();
    copy.ID = ctgy.ID;
    copy.HID = ctgy.HID;
    copy.Name = ctgy.Name;
    copy.ParentID = ctgy.ParentID;
    copy.Comment = ctgy.Comment;
    // Picking a category that another row already carries MOVES the assignment:
    // drop that other row so the book never holds duplicate relation rows.
    this.listCategories.update((arr) =>
      arr.map((c) => (c === evt.row ? copy : c)).filter((c) => c.ID !== id || c === copy),
    );
  }

  // Same node shape as BookCategoryHierarchyComponent (translated title + id), built
  // by the shared assembly so this tree, the transaction-type picker and the
  // control-center picker can no longer disagree about what a root is (see
  // @common/flat-tree). Rows the walk cannot reach are attached as top-level roots
  // rather than an "uncategorized" bucket: in a selection tree every node must be a
  // real, selectable category.
  private _buildCategoryTree(value: BookCategory[]): FlatTreeNode[] {
    return buildFlatTree(
      value.map((val) => ({
        id: val.ID,
        parentId: val.ParentID,
        title: translate(val.Name) + '(' + val.ID.toString() + ')',
      })),
    );
  }
  onAssignLocation(): void {
    this.openSelectionDlg(
      translate('Library.SelectLocation'),
      LocationSelectionDlgComponent,
      new Set<number>(this.listLocations().map((loc) => loc.ID)),
      {},
      (checked) => this.listLocations.set(this.storageService.Locations.filter((loc) => checked.has(loc.ID))),
    );
  }

  onRemoveAuthor(id: number): void {
    this.listAuthors.update((arr) => arr.filter((p) => p.ID !== id));
  }

  onRemoveTranslator(id: number): void {
    this.listTranslators.update((arr) => arr.filter((p) => p.ID !== id));
  }

  // By ROW IDENTITY, not ID: blank (not-yet-picked) rows all share ID 0, so an
  // id-based filter would remove the wrong row(s) — or none.
  onRemoveCategory(row: BookCategory): void {
    this.listCategories.update((arr) => arr.filter((c) => c !== row));
  }

  onRemovePress(id: number): void {
    this.listPresses.update((arr) => arr.filter((p) => p.ID !== id));
  }

  onRemoveLocation(id: number): void {
    this.listLocations.update((arr) => arr.filter((l) => l.ID !== id));
  }

  // Fetch this book's reading log (newest first). Best-effort: a failure leaves
  // the section empty rather than raising a modal - the book itself is the
  // primary content, and the header link still reaches the full list.
  private loadReadingRecords(bookId: number): void {
    if (!(bookId > 0)) {
      return;
    }
    this.isLoadingReadingRecords.set(true);
    this.storageService
      .fetchBookReadingRecords(100, 0, { field: 'FromDate', order: 'desc' }, undefined, `BookId eq ${bookId}`)
      .pipe(
        finalize(() => this.isLoadingReadingRecords.set(false)),
        takeUntilDestroyed(this.destroyedRef),
      )
      .subscribe({
        next: (x: BaseListModel<BookReadingRecord>) => this.readingRecords.set(x.contentList ?? []),
        error: () => this.readingRecords.set([]),
      });
  }

  // Reader display name: the record stores the token's User id, while the home
  // member list carries the DisplayAs (same resolution as reading-record-list).
  getReaderName(user: string): string {
    const member = (this.homeService.MembersInChosedHome ?? []).find(
      (m: { User: string; DisplayAs: string }) => m.User === user,
    );
    return member?.DisplayAs || user;
  }

  // nz-tag color per lifecycle state (mirrors reading-record-list): Reading is
  // in flight (blue), Completed terminal-good (green), Aborted terminal-neutral.
  statusColor(status: BookReadingStatus): string {
    switch (status) {
      case BookReadingStatus.Reading:
        return 'processing';
      case BookReadingStatus.Completed:
        return 'success';
      case BookReadingStatus.Aborted:
      default:
        return 'default';
    }
  }

  // The enum member names double as the translation keys.
  statusLabelKey(status: BookReadingStatus): string {
    return `Library.ReadingStatus.${status}`;
  }

  onSave(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent onSave...', ConsoleLogTypeEnum.debug);

    // Guard: do nothing when the form is invalid (e.g. empty required NativeName),
    // and prevent duplicate submissions on double-click.
    if (this.detailFormGroup.invalid || this.isSubmitting()) {
      return;
    }
    this.isSubmitting.set(true);

    // Update mode patches the loaded record (see originalBook) so fields this
    // form does not expose survive the PUT; create mode starts from a blank Book.
    const objtbo = this.uiMode() === UIMode.Update && this.originalBook ? this.originalBook : new Book();
    objtbo.ChineseName = this.detailFormGroup.get('cnameControl')?.value;
    objtbo.NativeName = this.detailFormGroup.get('nnameControl')?.value;
    objtbo.ChineseIsNative = this.detailFormGroup.get('chnIsNativeControl')?.value;
    objtbo.ISBN = this.detailFormGroup.get('isbnControl')?.value;
    objtbo.PublishedYear = this.detailFormGroup.get('pyearControl')?.value;
    objtbo.PageCount = this.detailFormGroup.get('pgcntControl')?.value;
    objtbo.CopyCount = this.detailFormGroup.get('ccntControl')?.value;
    objtbo.Detail = this.detailFormGroup.get('detailControl')?.value;
    objtbo.HID = this.homeService.ChosedHome?.ID ?? 0;
    objtbo.Authors = this.listAuthors().slice();
    objtbo.Translators = this.listTranslators().slice();
    // Drop blank inline rows (added via onAssignCategory but never picked): they
    // carry ID 0 and would serialize as CategoryId 0, which the API rejects
    // (person-detail guard).
    objtbo.Categories = this.listCategories().filter((c) => c.ID > 0);
    objtbo.Locations = this.listLocations().slice();
    objtbo.Presses = this.listPresses().slice();

    // Duplicate pre-check: books have no local cache, so the check goes through the
    // service's dedicated method (exact-match $filter, self-excluded in update mode),
    // mirroring the API guard's rule. This is a heuristic (TOCTOU) - the API guard is
    // authoritative: on a pre-check FETCH failure we still submit and surface the
    // server's 400 through the regular error modal.
    this.storageService
      .checkBookDuplicate(
        objtbo.NativeName,
        objtbo.ChineseName,
        this.uiMode() === UIMode.Update ? this.routerID() : undefined,
      )
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (dup) => {
          if (dup) {
            this.isSubmitting.set(false);
            this.modal.warning({
              nzTitle: translate('Common.Warning'),
              nzContent: translate('Library.DuplicatedNameWarning'),
              nzClosable: true,
            });
            return;
          }
          this.submitBook(objtbo);
        },
        error: () => this.submitBook(objtbo),
      });
  }

  private submitBook(objtbo: Book): void {
    if (this.uiMode() === UIMode.Create) {
      this.storageService
        .createBook(objtbo)
        .pipe(
          takeUntilDestroyed(this.destroyedRef),
          finalize(() => this.isSubmitting.set(false)),
        )
        .subscribe({
          next: (e) => {
            // Succeed.
            this.router.navigate(['/library/book/display/' + e.ID.toString()]);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering BookDetailComponent onSave failed ${err}...`,
              ConsoleLogTypeEnum.error,
            );
            this.modal.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    } else if (this.uiMode() === UIMode.Update) {
      objtbo.ID = this.routerID();
      this.storageService
        .updateBook(objtbo)
        .pipe(
          takeUntilDestroyed(this.destroyedRef),
          finalize(() => this.isSubmitting.set(false)),
        )
        .subscribe({
          next: (e) => {
            // Succeed.
            this.router.navigate(['/library/book/display/' + e.ID.toString()]);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering BookDetailComponent onSave failed ${err}...`,
              ConsoleLogTypeEnum.error,
            );
            this.modal.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    }
  }
}
