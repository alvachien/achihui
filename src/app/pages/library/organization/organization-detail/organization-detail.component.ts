import { Component, inject, OnInit, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { ModelUtility, ConsoleLogTypeEnum, getUIModeString, Organization, OrganizationType } from '@model/index';
import { HomeDefOdataService, LibraryStorageService } from '@services/index';
import { SafeAny } from '@common/any';

@Component({
  selector: 'hih-organization-detail',
  templateUrl: './organization-detail.component.html',
  styleUrls: ['./organization-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzButtonModule,
    TranslocoModule,
    NzTableModule,
    NzSelectModule,
    NzModalModule,
    NzDividerModule,
    NzCheckboxModule,
    RouterModule,
  ],
})
export class OrganizationDetailComponent implements OnInit {
  isLoadingResults = signal(false);
  isSubmitting = signal(false);
  public routerID = signal(-1); // Current object ID in routing
  public currentMode = signal('');
  public uiMode = signal<UIMode>(UIMode.Create);
  detailFormGroup: UntypedFormGroup;
  listTypes = signal<OrganizationType[]>([]);
  allTypes = signal<OrganizationType[]>([]);
  // The record as loaded from the server. Update-mode saves patch THIS object
  // instead of a fresh one: the backend PUT applies every column of the body
  // (SetValues), so fields the edit form does not expose (Detail) must still
  // carry their loaded value, or they get nulled on save.
  private originalOrganization: Organization | null = null;

  private readonly storageService = inject(LibraryStorageService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationDetailComponent constructor...',
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
      'AC_HIH_UI [Debug]: Entering OrganizationDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.activateRoute.url.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering OrganizationDetailComponent ngOnInit activateRoute: ${x}`,
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
          forkJoin([
            this.storageService.fetchAllOrganizationTypes(),
            this.storageService.readOrganization(this.routerID()),
          ])
            .pipe(
              takeUntilDestroyed(this.destroyedRef),
              finalize(() => this.isLoadingResults.set(false)),
            )
            .subscribe({
              next: (e) => {
                this.allTypes.set(e[0]);
                this.originalOrganization = e[1];

                this.detailFormGroup.get('idControl')?.setValue(e[1].ID);
                this.detailFormGroup.get('nnameControl')?.setValue(e[1].NativeName);
                this.detailFormGroup.get('cnameControl')?.setValue(e[1].ChineseName);
                this.detailFormGroup.get('chnIsNativeControl')?.setValue(e[1].ChineseIsNative);
                this.listTypes.set(e[1].Types?.slice() ?? []);

                if (this.uiMode() === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else if (this.uiMode() === UIMode.Update) {
                  this.detailFormGroup.enable();
                  this.detailFormGroup.get('idControl')?.disable();
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering OrganizationDetailComponent readOrganization failed ${err}...`,
                  ConsoleLogTypeEnum.error,
                );
                this.modalService.error({
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
          this.storageService
            .fetchAllOrganizationTypes()
            .pipe(
              takeUntilDestroyed(this.destroyedRef),
              finalize(() => this.isLoadingResults.set(false)),
            )
            .subscribe({
              next: (rtndata) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Debug]: Entering OrganizationDetailComponent onInit fetchAllOrganizationTypes.`,
                  ConsoleLogTypeEnum.debug,
                );
                this.allTypes.set(rtndata);
                this.detailFormGroup.get('idControl')?.setValue('NEW OBJECT');
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering OrganizationDetailComponent onInit fetchAllOrganizationTypes ${err}...`,
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
      }
    });
  }

  onAssignType(): void {
    this.listTypes.update((arr) => [...arr, new OrganizationType()]);
  }
  // Rows are removed/replaced by object identity, never by $index: the template
  // iterates typeTable.data — the CURRENT PAGE slice of the front-paginated
  // table — so $index does not address the full listTypes() array (an action on
  // a page-2 row would otherwise hit the page-1 row at the same slot).
  onRemoveTypeAssignment(row: OrganizationType): void {
    this.listTypes.update((arr) => arr.filter((p) => p !== row));
  }
  // Syncs the selected type's Name/Comment onto the row when the dropdown changes,
  // so the displayed columns reflect the user's selection instead of staying stale.
  onTypeModeChanged(tid: SafeAny, row: OrganizationType): void {
    const type = this.allTypes().find((p) => p.ID === +tid);
    if (!type) {
      return;
    }
    // Store a COPY, never the shared allTypes() entry itself: the template's
    // [(ngModel)]="data.ID" writes into the row object, so a shared reference
    // would corrupt the service-cached dictionary for every consumer.
    const copy = new OrganizationType();
    copy.ID = type.ID;
    copy.HomeID = type.HomeID;
    copy.Name = type.Name;
    copy.Comment = type.Comment;
    this.listTypes.update((arr) => arr.map((p) => (p === row ? copy : p)));
  }

  onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationDetailComponent onSave...',
      ConsoleLogTypeEnum.debug,
    );

    // Guard: do nothing when the form is invalid (e.g. empty required NativeName),
    // and prevent duplicate submissions on double-click.
    if (this.detailFormGroup.invalid || this.isSubmitting()) {
      return;
    }
    this.isSubmitting.set(true);

    // Update mode patches the loaded record (see originalOrganization) so fields
    // this form does not expose survive the PUT; create mode starts from blank.
    const objtbo =
      this.uiMode() === UIMode.Update && this.originalOrganization ? this.originalOrganization : new Organization();
    objtbo.ChineseIsNative = this.detailFormGroup.get('chnIsNativeControl')?.value;
    objtbo.ChineseName = this.detailFormGroup.get('cnameControl')?.value;
    objtbo.NativeName = this.detailFormGroup.get('nnameControl')?.value;
    objtbo.Types = this.listTypes().slice();
    objtbo.HID = this.homeService.ChosedHome?.ID ?? 0;

    // Duplicate pre-check against the (cached, home-scoped) organization list, using the
    // same rule as the API guard: {NativeName | non-empty ChineseName} of the input
    // matching any OTHER row's NativeName/ChineseName, compared trimmed and
    // case-insensitively. In create mode routerID() is -1, so the self-exclusion is
    // inert. This is a heuristic (TOCTOU) - the API guard is authoritative: on a
    // pre-check FETCH failure we still submit and surface the server's 400 in the modal.
    this.storageService
      .fetchAllOrganizations()
      .pipe(takeUntilDestroyed(this.destroyedRef))
      .subscribe({
        next: (orgs) => {
          const norm = (s?: string | null): string => (s ?? '').trim().toLowerCase();
          const nn = norm(objtbo.NativeName);
          const cn = norm(objtbo.ChineseName);
          const dup = orgs.some(
            (p) =>
              p.ID !== this.routerID() &&
              ((!!nn && (norm(p.NativeName) === nn || norm(p.ChineseName) === nn)) ||
                (!!cn && (norm(p.NativeName) === cn || norm(p.ChineseName) === cn))),
          );
          if (dup) {
            this.isSubmitting.set(false);
            this.modalService.warning({
              nzTitle: translate('Common.Warning'),
              nzContent: translate('Library.DuplicatedNameWarning'),
              nzClosable: true,
            });
            return;
          }
          this.submitOrganization(objtbo);
        },
        error: () => this.submitOrganization(objtbo),
      });
  }

  private submitOrganization(objtbo: Organization): void {
    if (this.uiMode() === UIMode.Create) {
      this.storageService
        .createOrganization(objtbo)
        .pipe(
          takeUntilDestroyed(this.destroyedRef),
          finalize(() => this.isSubmitting.set(false)),
        )
        .subscribe({
          next: (e) => {
            // Succeed.
            this.router.navigate(['/library/organization/display/' + e.ID.toString()]);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering OrganizationDetailComponent ngOnInit createOrganization failed ${err}...`,
              ConsoleLogTypeEnum.error,
            );
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    } else if (this.uiMode() === UIMode.Update) {
      objtbo.ID = this.routerID();
      this.storageService
        .updateOrganization(objtbo)
        .pipe(
          takeUntilDestroyed(this.destroyedRef),
          finalize(() => this.isSubmitting.set(false)),
        )
        .subscribe({
          next: (e) => {
            // Succeed.
            this.router.navigate(['/library/organization/display/' + e.ID.toString()]);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering OrganizationDetailComponent onSave updateOrganization failed ${err}...`,
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
  }
}
