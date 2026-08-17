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
  public routerID = signal(-1); // Current object ID in routing
  public currentMode = signal('');
  public uiMode = signal<UIMode>(UIMode.Create);
  detailFormGroup: UntypedFormGroup;
  listTypes = signal<OrganizationType[]>([]);
  allTypes = signal<OrganizationType[]>([]);

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

                this.detailFormGroup.get('idControl')?.setValue(e[1].ID);
                this.detailFormGroup.get('nnameControl')?.setValue(e[1].NativeName);
                this.detailFormGroup.get('cnameControl')?.setValue(e[1].ChineseName);
                this.detailFormGroup.get('chnIsNativeControl')?.setValue(e[1].ChineseIsNative);
                this.listTypes.set(e[1].Types.slice());

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
  onRemoveTypeAssignment(tid: number): void {
    this.listTypes.update((arr) => arr.filter((p) => p.ID !== tid));
  }
  onTypeModeChanged(tid: SafeAny) {
    const tidx = this.allTypes().findIndex((p) => p.ID === +tid);
    if (tidx !== -1) {
      // TBD
    } else {
      // TBD
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering OrganizationDetailComponent onSave...',
      ConsoleLogTypeEnum.debug,
    );

    const objtbo = new Organization();
    objtbo.ChineseIsNative = this.detailFormGroup.get('chnIsNativeControl')?.value;
    objtbo.ChineseName = this.detailFormGroup.get('cnameControl')?.value;
    objtbo.NativeName = this.detailFormGroup.get('nnameControl')?.value;
    objtbo.Types = this.listTypes().slice();
    objtbo.HID = this.homeService.ChosedHome?.ID ?? 0;

    if (this.uiMode() === UIMode.Create) {
      this.storageService
        .createOrganization(objtbo)
        .pipe(takeUntilDestroyed(this.destroyedRef))
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
      objtbo.ID = this.detailFormGroup.get('idControl')?.value;
    }
  }
}
