import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';

import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  Book, momentDateFormat, getUIModeString, Person, PersonRole,
} from '../../../../model';
import { AuthService, HomeDefOdataService, LibraryStorageService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.less'],
})
export class PersonDetailComponent implements OnInit, OnDestroy {

  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean = false;
  public routerID = -1; // Current object ID in routing
  public currentMode: string = '';
  public uiMode: UIMode = UIMode.Create;
  detailFormGroup: FormGroup;
  listRoles: PersonRole[] = [];
  allRoles: PersonRole[] = [];

  get isEditable(): boolean {
    return isUIEditable(this.uiMode);
  }

  constructor(private storageService: LibraryStorageService,
    private homeService: HomeDefOdataService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PersonDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.detailFormGroup = new FormGroup({
      idControl: new FormControl({ value: undefined, disabled: true }),
      nnameControl: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      cnameControl: new FormControl('', [Validators.maxLength(100)]),
      chnIsNativeControl: new FormControl(false),
      detailControl: new FormControl('', [Validators.maxLength(100)]),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PersonDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering PersonDetailComponent ngOnInit activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug);
      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.uiMode = UIMode.Create;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Update;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);
      }

      switch (this.uiMode) {
        case UIMode.Update:
        case UIMode.Display: {
          this.isLoadingResults = true;

          forkJoin([
            this.storageService.fetchAllPersonRoles(),
            this.storageService.readPerson(this.routerID),
          ])
            .pipe(
              takeUntil(this._destroyed$!),
              finalize(() => this.isLoadingResults = false)
            )
            .subscribe({
              next: (e: any) => {
                ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering PersonDetailComponent ngOnInit forkJoin.`,
                  ConsoleLogTypeEnum.debug);
                this.allRoles = e[0];

                this.detailFormGroup.get('idControl')?.setValue(e[1].ID);
                this.detailFormGroup.get('nnameControl')?.setValue(e[1].NativeName);
                this.detailFormGroup.get('cnameControl')?.setValue(e[1].ChineseName);
                this.detailFormGroup.get('chnIsNativeControl')?.setValue(e[1].ChineseIsNative);
                this.detailFormGroup.get('detailControl')?.setValue(e[1].Detail);
                if (e[1].Roles) {
                  this.listRoles = e[1].Roles.slice();
                }

                if (this.uiMode === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else if (this.uiMode === UIMode.Update) {
                  this.detailFormGroup.enable();
                  this.detailFormGroup.get('idControl')?.disable();
                }
              },
              error: err => {
                ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PersonDetailComponent ngOnInit forkJoin failed ${err}...`,
                  ConsoleLogTypeEnum.error);
                this.modalService.error({
                  nzTitle: translate('Common.Error'),
                  nzContent: err,
                  nzClosable: true,
                });
              }
            });
          break;
        }

        case UIMode.Create:
        default: {
          this.storageService.fetchAllPersonRoles().pipe(
            takeUntil(this._destroyed$!),
            finalize(() => this.isLoadingResults = false)
          ).subscribe({
            next: rtndata => {
              ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering PersonDetailComponent ngOnInit fetchAllPersonRoles.`,
                ConsoleLogTypeEnum.debug);
              this.allRoles = rtndata;
              this.detailFormGroup.get('idControl')?.setValue('NEW OBJECT');
            },
            error: err => {
              ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PersonDetailComponent ngOnInit fetchAllPersonRoles ${err}...`,
                ConsoleLogTypeEnum.error);
              this.modalService.error({
                nzTitle: translate('Common.Error'),
                nzContent: err,
                nzClosable: true,
              });
            }
          });
          break;
        }
      }
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PersonDetailComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onAssignRole(): void {
    this.listRoles = [...this.listRoles, new PersonRole()];    
  }
  onRemoveRoleAssignment(rid: number): void {
    let ntypeidx = this.listRoles.findIndex(p => p.ID === rid);
    if (ntypeidx !== -1) {
      this.listRoles.splice(ntypeidx, 1);
      this.listRoles = [...this.listRoles];
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PersonDetailComponent onSave...',
      ConsoleLogTypeEnum.debug);

    const objtbo = new Person();
    objtbo.ChineseName = this.detailFormGroup.get('cnameControl')?.value;
    objtbo.NativeName = this.detailFormGroup.get('nnameControl')?.value;
    objtbo.ChineseIsNative = this.detailFormGroup.get('chnIsNativeControl')?.value;
    objtbo.HID = this.homeService.ChosedHome?.ID!;
    objtbo.Roles = this.listRoles.slice();

    if (this.uiMode === UIMode.Create) {
      this.storageService.createPerson(objtbo)
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: e => {
          // Succeed.
          this.router.navigate(['/library/person/display/' + e.ID.toString()]);
        },
        error: err => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PersonDetailComponent onSave createPerson failed ${err}...`,
            ConsoleLogTypeEnum.error);
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });
        }
      });
    } else if (this.uiMode === UIMode.Update) {
      objtbo.ID = this.routerID;
      // TBD.
    }
  }
}
