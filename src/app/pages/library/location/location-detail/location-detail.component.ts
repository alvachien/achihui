import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';

import {
  ModelUtility,
  ConsoleLogTypeEnum,
  UIDisplayStringUtil,
  getUIModeString,
  Location,
  UIDisplayString,
  LocationTypeEnum,
} from '@model/index';
import { HomeDefOdataService, LibraryStorageService } from '@services/index';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
    selector: 'hih-location-detail',
    templateUrl: './location-detail.component.html',
    styleUrls: ['./location-detail.component.less'],
    imports: [
      NzPageHeaderModule,
      NzBreadCrumbModule,
      NzSpinModule,
      NzFormModule,
      FormsModule,
      ReactiveFormsModule,
      NzButtonModule,
      NzSelectModule,
      NzModalModule,
      TranslocoModule,
      RouterModule,
    ]
})
export class LocationDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  public routerID = -1; // Current object ID in routing
  public currentMode = '';
  public uiMode: UIMode = UIMode.Create;
  detailFormGroup: UntypedFormGroup;
  arLocationStrings: UIDisplayString[] = [];

  private readonly storageService = inject(LibraryStorageService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly homeService = inject(HomeDefOdataService);
  private readonly modalService = inject(NzModalService);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering LocationDetailComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.arLocationStrings = UIDisplayStringUtil.getLocationTypeEnumDisplayStrings();
    this.detailFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      nameControl: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
      locTypeControl: new UntypedFormControl(LocationTypeEnum.PaperBook, [Validators.required]),
      cmtControl: new UntypedFormControl('', [Validators.maxLength(100)]),
    });
  }

  get isEditable(): boolean {
    return isUIEditable(this.uiMode);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering LocationDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering LocationDetailComponent ngOnInit activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug
      );

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
          this.storageService
            .readLocation(this.routerID)
            .pipe(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              takeUntil(this._destroyed$!),
              finalize(() => (this.isLoadingResults = false))
            )
            .subscribe({
              next: (e: Location) => {
                this.detailFormGroup.get('idControl')?.setValue(e.ID);
                this.detailFormGroup.get('nameControl')?.setValue(e.Name);
                this.detailFormGroup.get('cmtControl')?.setValue(e.Comment);
                this.detailFormGroup.get('locTypeControl')?.setValue(e.LocType);

                if (this.uiMode === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else if (this.uiMode === UIMode.Update) {
                  this.detailFormGroup.enable();
                  this.detailFormGroup.get('idControl')?.disable();
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering LocationDetailComponent ngOnInit readLocation failed ${err}...`,
                  ConsoleLogTypeEnum.error
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
          this.detailFormGroup.get('idControl')?.setValue('NEW OBJECT');

          break;
        }
      }
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering LocationDetailComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering LocationDetailComponent onSave...',
      ConsoleLogTypeEnum.debug
    );

    const objtbo = new Location();
    objtbo.Name = this.detailFormGroup.get('nameControl')?.value;
    objtbo.Comment = this.detailFormGroup.get('cmtControl')?.value;
    objtbo.LocType = this.detailFormGroup.get('locTypeControl')?.value as LocationTypeEnum;
    objtbo.HID = this.homeService.ChosedHome?.ID ?? 0;

    if (this.uiMode === UIMode.Create) {
      this.storageService
        .createLocation(objtbo)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .pipe(takeUntil(this._destroyed$!))
        .subscribe({
          next: (e) => {
            // Succeed.
            this.router.navigate(['/library/location/display/' + e.ID.toString()]);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LocationDetailComponent onSave createLocation failed ${err}...`,
              ConsoleLogTypeEnum.error
            );
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    } else if (this.uiMode === UIMode.Update) {
      objtbo.ID = this.routerID;
      // TBD.
    }
  }
}
