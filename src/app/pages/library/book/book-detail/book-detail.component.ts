import {
  Component,
  OnInit,
  ViewContainerRef,
  inject,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
  Type,
} from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import {
  ModelUtility,
  ConsoleLogTypeEnum,
  Book,
  getUIModeString,
  Person,
  Organization,
  BookCategory,
  Location,
} from '@model/index';
import { HomeDefOdataService, LibraryStorageService } from '@services/index';
import { BookAssociationsComponent } from '../book-associations';
import { PersonSelectionDlgComponent } from '../../person-selection-dlg';
import { OrganizationSelectionDlgComponent } from '../../organization-selection-dlg';
import { BookCategorySelectionDlgComponent } from '../../config/book-category-selection-dlg';
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
    NzCheckboxModule,
    RouterModule,
    NzModalModule,
    BookAssociationsComponent,
  ],
})
export class BookDetailComponent implements OnInit {
  isLoadingResults = signal(false);
  public routerID = signal(-1); // Current object ID in routing
  public currentMode = signal('');
  public uiMode = signal<UIMode>(UIMode.Create);
  detailFormGroup: UntypedFormGroup;
  listAuthors = signal<Person[]>([]);
  listTranslators = signal<Person[]>([]);
  listPresses = signal<Organization[]>([]);
  listCategories = signal<BookCategory[]>([]);
  listLocations = signal<Location[]>([]);

  private readonly storageService = inject(LibraryStorageService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modal = inject(NzModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly destroyedRef = inject(DestroyRef);

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
    });
  }

  get isEditable(): boolean {
    return isUIEditable(this.uiMode());
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
          this.storageService
            .readBook(this.routerID())
            .pipe(
              finalize(() => this.isLoadingResults.set(false)),
              takeUntilDestroyed(this.destroyedRef),
            )
            .subscribe({
              next: (e: Book) => {
                this.detailFormGroup.get('idControl')?.setValue(e.ID);
                this.detailFormGroup.get('nnameControl')?.setValue(e.NativeName);
                this.detailFormGroup.get('cnameControl')?.setValue(e.ChineseName);
                this.detailFormGroup.get('chnIsNativeControl')?.setValue(e.ChineseIsNative);
                this.listAuthors.set(e.Authors);
                this.listCategories.set(e.Categories);
                this.listLocations.set(e.Locations);
                this.listPresses.set(e.Presses);
                this.listTranslators.set(e.Translators);

                if (this.uiMode() === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else if (this.uiMode() === UIMode.Update) {
                  this.detailFormGroup.enable();
                  this.detailFormGroup.get('idControl')?.disable();
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering BookDetailComponent ngOnInit readBook failed ${err}...`,
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

        case UIMode.Create:
        default: {
          // Do nothing
          this.detailFormGroup.get('idControl')?.setValue('NEW OBJECT');
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
    modal.afterClose.subscribe(() => {
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
  onAssignCategory(): void {
    this.openSelectionDlg(
      translate('Library.SelectCategory'),
      BookCategorySelectionDlgComponent,
      new Set<number>(this.listCategories().map((ctg) => ctg.ID)),
      {},
      (checked) => this.listCategories.set(this.storageService.BookCategories.filter((ctgy) => checked.has(ctgy.ID))),
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

  onRemoveCategory(id: number): void {
    this.listCategories.update((arr) => arr.filter((c) => c.ID !== id));
  }

  onRemovePress(id: number): void {
    this.listPresses.update((arr) => arr.filter((p) => p.ID !== id));
  }

  onRemoveLocation(id: number): void {
    this.listLocations.update((arr) => arr.filter((l) => l.ID !== id));
  }

  onSave(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent onSave...', ConsoleLogTypeEnum.debug);

    const objtbo = new Book();
    objtbo.ChineseName = this.detailFormGroup.get('cnameControl')?.value;
    objtbo.NativeName = this.detailFormGroup.get('nnameControl')?.value;
    objtbo.ChineseIsNative = this.detailFormGroup.get('chnIsNativeControl')?.value;
    objtbo.HID = this.homeService.ChosedHome?.ID ?? 0;
    objtbo.Authors = this.listAuthors().slice();
    objtbo.Translators = this.listTranslators().slice();
    objtbo.Categories = this.listCategories().slice();
    objtbo.Locations = this.listLocations().slice();
    objtbo.Presses = this.listPresses().slice();

    if (this.uiMode() === UIMode.Create) {
      this.storageService
        .createBook(objtbo)
        .pipe(takeUntilDestroyed(this.destroyedRef))
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
      // Do nothing for now.
    }
  }
}
