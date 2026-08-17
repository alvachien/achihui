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
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { ModelUtility, ConsoleLogTypeEnum, getUIModeString, Person, PersonRole } from '@model/index';
import { HomeDefOdataService, LibraryStorageService } from '@services/index';

@Component({
  selector: 'hih-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzButtonModule,
    NzTableModule,
    NzSelectModule,
    NzDividerModule,
    NzCheckboxModule,
    NzModalModule,
    TranslocoModule,
    RouterModule,
  ],
})
export class PersonDetailComponent implements OnInit {
  isLoadingResults = signal(false);
  public routerID = signal(-1); // Current object ID in routing
  public currentMode = signal('');
  public uiMode = signal<UIMode>(UIMode.Create);
  detailFormGroup: UntypedFormGroup;
  listRoles = signal<PersonRole[]>([]);
  allRoles = signal<PersonRole[]>([]);

  get isEditable(): boolean {
    return isUIEditable(this.uiMode());
  }

  private readonly storageService = inject(LibraryStorageService);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PersonDetailComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.detailFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      nnameControl: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
      cnameControl: new UntypedFormControl('', [Validators.maxLength(100)]),
      chnIsNativeControl: new UntypedFormControl(false),
      detailControl: new UntypedFormControl('', [Validators.maxLength(100)]),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PersonDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    this.activateRoute.url.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering PersonDetailComponent ngOnInit activateRoute: ${x}`,
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

          forkJoin([this.storageService.fetchAllPersonRoles(), this.storageService.readPerson(this.routerID())])
            .pipe(
              takeUntilDestroyed(this.destroyedRef),
              finalize(() => this.isLoadingResults.set(false)),
            )
            .subscribe({
              next: (e) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Debug]: Entering PersonDetailComponent ngOnInit forkJoin.`,
                  ConsoleLogTypeEnum.debug,
                );
                this.allRoles.set(e[0]);

                this.detailFormGroup.get('idControl')?.setValue(e[1].ID);
                this.detailFormGroup.get('nnameControl')?.setValue(e[1].NativeName);
                this.detailFormGroup.get('cnameControl')?.setValue(e[1].ChineseName);
                this.detailFormGroup.get('chnIsNativeControl')?.setValue(e[1].ChineseIsNative);
                this.detailFormGroup.get('detailControl')?.setValue(e[1].Detail);
                if (e[1].Roles) {
                  this.listRoles.set(e[1].Roles.slice());
                }

                if (this.uiMode() === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else if (this.uiMode() === UIMode.Update) {
                  this.detailFormGroup.enable();
                  this.detailFormGroup.get('idControl')?.disable();
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering PersonDetailComponent ngOnInit forkJoin failed ${err}...`,
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
            .fetchAllPersonRoles()
            .pipe(
              takeUntilDestroyed(this.destroyedRef),
              finalize(() => this.isLoadingResults.set(false)),
            )
            .subscribe({
              next: (rtndata) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Debug]: Entering PersonDetailComponent ngOnInit fetchAllPersonRoles.`,
                  ConsoleLogTypeEnum.debug,
                );
                this.allRoles.set(rtndata);
                this.detailFormGroup.get('idControl')?.setValue('NEW OBJECT');
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering PersonDetailComponent ngOnInit fetchAllPersonRoles ${err}...`,
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
      }
    });
  }

  onAssignRole(): void {
    this.listRoles.update((arr) => [...arr, new PersonRole()]);
  }
  onRemoveRoleAssignment(rid: number): void {
    this.listRoles.update((arr) => arr.filter((p) => p.ID !== rid));
  }

  onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering PersonDetailComponent onSave...',
      ConsoleLogTypeEnum.debug,
    );

    const objtbo = new Person();
    objtbo.ChineseName = this.detailFormGroup.get('cnameControl')?.value;
    objtbo.NativeName = this.detailFormGroup.get('nnameControl')?.value;
    objtbo.ChineseIsNative = this.detailFormGroup.get('chnIsNativeControl')?.value;
    objtbo.HID = this.homeService.ChosedHome?.ID ?? 0;
    objtbo.Roles = this.listRoles().slice();

    if (this.uiMode() === UIMode.Create) {
      this.storageService
        .createPerson(objtbo)
        .pipe(takeUntilDestroyed(this.destroyedRef))
        .subscribe({
          next: (e) => {
            // Succeed.
            this.router.navigate(['/library/person/display/' + e.ID.toString()]);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering PersonDetailComponent onSave createPerson failed ${err}...`,
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
      // TBD.
    }
  }
}
