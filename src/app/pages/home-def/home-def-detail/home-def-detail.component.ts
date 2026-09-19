import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { UIMode, isUIEditable } from 'actslib';

import {
  HomeDef,
  Currency,
  getUIModeString,
  HomeMember,
  ModelUtility,
  ConsoleLogTypeEnum,
  UIDisplayString,
  UIDisplayStringUtil,
  HomeMemberRelationEnum,
} from '../../../model';
import { AuthService, HomeDefOdataService, FinanceOdataService } from '../../../services';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'hih-home-def-detail',
  templateUrl: './home-def-detail.component.html',
  styleUrls: ['./home-def-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    TranslocoModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzDividerModule,
    NzTableModule,
    NzInputModule,
    NzCheckboxModule,
    NzModalModule,
    NzButtonModule,
    RouterModule,
  ],
})
export class HomeDefDetailComponent implements OnInit {
  private readonly routerID = signal(-1); // Current object ID in routing

  public isLoadingResults = signal(false);
  public currentMode = signal<string | null>(null);
  public uiMode = signal<UIMode>(UIMode.Create);
  public arCurrencies = signal<Currency[]>([]);
  public detailFormGroup: UntypedFormGroup;
  public listMembers = signal<HomeMember[]>([]);
  public listMemRel: UIDisplayString[] = [];

  private readonly authService = inject(AuthService);
  private readonly finService = inject(FinanceOdataService);
  private readonly storageService = inject(HomeDefOdataService);
  private readonly router = inject(Router);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly modalService = inject(NzModalService);
  private readonly destroyedRef = inject(DestroyRef);

  get IsCreateMode(): boolean {
    return this.uiMode() === UIMode.Create;
  }
  get isFieldChangable(): boolean {
    return isUIEditable(this.uiMode());
  }
  get isSaveAllowed(): boolean {
    if (this.isFieldChangable) {
      return this.detailFormGroup.valid && this.isItemsValid;
    }
    return false;
  }
  get isDeleteItemAllowed(): boolean {
    if (this.isFieldChangable) {
      return true;
    }
    return false;
  }
  get isItemsValid(): boolean {
    if (this.listMembers().length > 0) {
      let bvalid = true;
      let selfitem = 0;
      this.listMembers().forEach((val: HomeMember) => {
        if (!val.isValid) {
          bvalid = false;
        }
        if (val.Relation === HomeMemberRelationEnum.Self) {
          ++selfitem;
        }
      });
      if (selfitem !== 1) {
        bvalid = false;
      }

      return bvalid;
    }
    return false;
  }
  get currentHomeDefObject(): HomeDef {
    const hdobj = new HomeDef();
    hdobj.Name = this.detailFormGroup.get('nameControl')?.value;
    hdobj.BaseCurrency = this.detailFormGroup.get('baseCurrControl')?.value;
    this.listMembers().forEach((val) => {
      hdobj.Members.push(val);
    });

    return hdobj;
  }

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefDetailComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.listMemRel = UIDisplayStringUtil.getHomeMemberRelationEnumStrings();

    this.detailFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      nameControl: new UntypedFormControl('', Validators.required),
      detailControl: new UntypedFormControl(),
      baseCurrControl: new UntypedFormControl('', Validators.required),
      hostControl: new UntypedFormControl(
        {
          value: this.authService.authSubject().getUserId(),
          disabled: true,
        },
        Validators.required,
      ),
    });
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );

    // Distinguish current mode
    this.activateRoute.url.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((x) => {
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
          forkJoin([this.finService.fetchAllCurrencies(), this.storageService.readHomeDef(this.routerID())])
            .pipe(
              takeUntilDestroyed(this.destroyedRef),
              finalize(() => this.isLoadingResults.set(false)),
            )
            .subscribe({
              next: (rsts) => {
                this.arCurrencies.set(rsts[0]);

                this.detailFormGroup.get('idControl')?.setValue(rsts[1].ID);
                this.detailFormGroup.get('nameControl')?.setValue(rsts[1].Name);
                this.detailFormGroup.get('baseCurrControl')?.setValue(rsts[1].BaseCurrency);
                this.detailFormGroup.get('hostControl')?.setValue(rsts[1].Host);
                this.detailFormGroup.get('detailControl')?.setValue(rsts[1].Details);
                this.detailFormGroup.markAsUntouched();
                this.detailFormGroup.markAsPristine();

                if (this.uiMode() === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else if (this.uiMode() === UIMode.Update) {
                  this.detailFormGroup.enable();
                  this.detailFormGroup.get('idControl')?.disable();
                }

                this.listMembers.set(rsts[1].Members.slice());
              },
              error: (err) => {
                // Show error dialog
                this.modalService.create({
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
          this.isLoadingResults.set(true);
          this.finService
            .fetchAllCurrencies()
            .pipe(
              takeUntilDestroyed(this.destroyedRef),
              finalize(() => this.isLoadingResults.set(false)),
            )
            .subscribe({
              next: (curries: Currency[]) => {
                this.arCurrencies.set(curries);

                // Insert one home member by default
                const nm = new HomeMember();
                nm.User = this.authService.authSubject().getUserId() ?? '';
                nm.Relation = HomeMemberRelationEnum.Self;
                nm.DisplayAs = nm.User;
                this.listMembers.set([nm]);
              },
              error: (err) => {
                // Show error dialog
                this.modalService.create({
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

  onChange() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefDetailComponent onChange...',
      ConsoleLogTypeEnum.debug,
    );
  }

  onSave() {
    // Save the data
    if (this.uiMode() === UIMode.Create) {
      // Create mode
      const hdobj = new HomeDef();
      hdobj.Name = this.detailFormGroup.get('nameControl')?.value;
      hdobj.BaseCurrency = this.detailFormGroup.get('baseCurrControl')?.value;
      hdobj.Host = this.detailFormGroup.get('hostControl')?.value;
      hdobj.Details = this.detailFormGroup.get('detailControl')?.value;

      this.listMembers().forEach((val) => hdobj.Members.push(val));
      if (!hdobj.isValid) {
        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: 'Errors',
          nzClosable: true,
        });

        return;
      }

      this.storageService
        .createHomeDef(hdobj)
        .pipe(takeUntilDestroyed(this.destroyedRef))
        .subscribe({
          next: (val) => {
            // Shall create successfully.
            this.router.navigate(['/homedef/display/' + val.ID.toString()]);
          },
          error: (err) => {
            // Show error
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    } else if (this.uiMode() === UIMode.Update) {
      // Change mode
      const hdobj = new HomeDef();
      hdobj.ID = +this.routerID();
      hdobj.Name = this.detailFormGroup.get('nameControl')?.value;
      hdobj.BaseCurrency = this.detailFormGroup.get('baseCurrControl')?.value;
      hdobj.Host = this.detailFormGroup.get('hostControl')?.value;
      hdobj.Details = this.detailFormGroup.get('detailControl')?.value;

      this.listMembers().forEach((val) => hdobj.Members.push(val));
      if (!hdobj.isValid) {
        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: 'Errors',
          nzClosable: true,
        });

        return;
      }

      this.storageService
        .changeHomeDef(hdobj)
        .pipe(takeUntilDestroyed(this.destroyedRef))
        .subscribe({
          next: () => {
            // Shall create successfully.
            this.router.navigate(['/homedef/display/' + hdobj.ID.toString()]);
          },
          error: (err) => {
            // Show error
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    }
  }

  onCreateMember() {
    const nmem = new HomeMember();
    const memes = this.listMembers().slice();
    if (this.routerID()) {
      nmem.HomeID = +this.routerID();
    }
    memes.push(nmem);
    this.listMembers.set(memes);
  }
  onDeleteMember(idx: number) {
    const memes = this.listMembers().slice();
    memes.splice(idx, 1);
    this.listMembers.set(memes);
  }
}
