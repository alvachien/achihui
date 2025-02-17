import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';
import moment from 'moment';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';

import { ModelUtility, ConsoleLogTypeEnum, GeneralEvent, getUIModeString } from '@model/index';
import { HomeDefOdataService, EventStorageService } from '@services/index';

@Component({
  selector: 'hih-normal-event-detail',
  templateUrl: './normal-event-detail.component.html',
  styleUrls: ['./normal-event-detail.component.less'],
  imports: [
    NzPageHeaderModule,
    TranslocoModule,
    NzSpinModule,
    NzBreadCrumbModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
  ]
})
export class NormalEventDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  public routerID = -1; // Current object ID in routing
  public currentMode = '';
  public uiMode: UIMode = UIMode.Create;
  detailFormGroup: UntypedFormGroup;

  get isEditable(): boolean {
    return isUIEditable(this.uiMode);
  }

  constructor(
    private storageService: EventStorageService,
    private homeService: HomeDefOdataService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering NormalEventDetailComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.detailFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      nameControl: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
      dateControl: new UntypedFormControl(undefined, [Validators.required]),
      contentControl: new UntypedFormControl(''),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering NormalEventDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering NormalEventDetailComponent ngOnInit activateRoute: ${x}`,
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
            .readGeneralEvent(this.routerID)
            .pipe(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              takeUntil(this._destroyed$!),
              finalize(() => (this.isLoadingResults = false))
            )
            .subscribe({
              next: (e: GeneralEvent) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Debug]: Entering NormalEventDetailComponent ngOnInit forkJoin.`,
                  ConsoleLogTypeEnum.debug
                );

                this.detailFormGroup.get('idControl')?.setValue(e.ID);
                this.detailFormGroup.get('nameControl')?.setValue(e.Name);
                this.detailFormGroup.get('dateControl')?.setValue([e.StartDate?.toDate(), e.EndDate?.toDate()]);
                this.detailFormGroup.get('contentControl')?.setValue(e.Content);

                if (this.uiMode === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else if (this.uiMode === UIMode.Update) {
                  this.detailFormGroup.enable();
                  this.detailFormGroup.get('idControl')?.disable();
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering NormalEventDetailComponent ngOnInit forkJoin failed ${err}...`,
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
          this.detailFormGroup.get('dateControl')?.setValue([new Date(), new Date()]);
          this.detailFormGroup.get('idControl')?.setValue('NEW OBJECT');
          break;
        }
      }
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering NormalEventDetailComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering NormalEventDetailComponent onSave...',
      ConsoleLogTypeEnum.debug
    );

    const objtbo = new GeneralEvent();
    objtbo.IsPublic = true;
    // eslint-disable-next-line no-unsafe-optional-chaining
    objtbo.Name = this.detailFormGroup.get('nameControl')?.value;
    // eslint-disable-next-line no-unsafe-optional-chaining
    const [startdt, enddt] = this.detailFormGroup.get('dateControl')?.value;
    if (startdt) {
      objtbo.StartDate = moment(startdt);
    }
    if (enddt) {
      objtbo.EndDate = moment(enddt);
    }
    objtbo.HID = this.homeService.ChosedHome?.ID ?? 0;
    objtbo.Content = this.detailFormGroup.get('contentControl')?.value;

    if (this.uiMode === UIMode.Create) {
      this.storageService
        .createGeneralEvent(objtbo)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .pipe(takeUntil(this._destroyed$!))
        .subscribe({
          next: (e) => {
            // Succeed.
            this.router.navigate(['/event/normal-event/display/' + (e.ID ?? 0).toString()]);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering NormalEventDetailComponent onSave failed ${err}...`,
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
      // Do nothing for now.
    }
  }
}
