import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';
import * as moment from 'moment';

import {
  ModelUtility,
  ConsoleLogTypeEnum,
  UIDisplayStringUtil,
  GeneralEvent,
  getUIModeString,
  RecurEvent,
  RepeatedDatesAPIInput,
  RepeatFrequencyEnum,
  RepeatedDatesAPIOutput,
} from '../../../../model';
import { HomeDefOdataService, EventStorageService, FinanceOdataService } from '../../../../services';
import { SafeAny } from 'src/common';

@Component({
  selector: 'hih-recur-event-detail',
  templateUrl: './recur-event-detail.component.html',
  styleUrls: ['./recur-event-detail.component.less'],
})
export class RecurEventDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  public routerID = -1; // Current object ID in routing
  public currentMode = '';
  public uiMode: UIMode = UIMode.Create;
  detailFormGroup: UntypedFormGroup;
  public arFrequencies: SafeAny[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();
  dataSet: GeneralEvent[] = [];

  get isEditable(): boolean {
    return isUIEditable(this.uiMode);
  }

  constructor(
    private storageService: EventStorageService,
    private financeService: FinanceOdataService,
    private homeService: HomeDefOdataService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering RecurEventDetailComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.detailFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      nameControl: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
      dateControl: new UntypedFormControl(undefined, [Validators.required]),
      frqControl: new UntypedFormControl(RepeatFrequencyEnum.Month, Validators.required),
      contentControl: new UntypedFormControl(''),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering RecurEventDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering RecurEventDetailComponent ngOnInit activateRoute: ${x}`,
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
            .readRecurEvent(this.routerID)
            .pipe(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              takeUntil(this._destroyed$!),
              finalize(() => (this.isLoadingResults = false))
            )
            .subscribe({
              next: (e: GeneralEvent) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Debug]: Entering RecurEventDetailComponent ngOnInit forkJoin.`,
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
                  `AC_HIH_UI [Error]: Entering RecurEventDetailComponent ngOnInit forkJoin failed ${err}...`,
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
      'AC_HIH_UI [Debug]: Entering RecurEventDetailComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onSimulateGeneratedEvents(): void {
    const dtrange = this.detailFormGroup.get('dateControl')?.value as SafeAny[];

    const datinput: RepeatedDatesAPIInput = {
      StartDate: moment(dtrange[0] as Date),
      EndDate: moment(dtrange[1] as Date),
      RepeatType: this.detailFormGroup.get('frqControl')?.value as RepeatFrequencyEnum,
    };
    this.financeService.getRepeatedDates(datinput).subscribe({
      next: (val) => {
        this.dataSet = [];

        if (val instanceof Array && val.length > 0) {
          val.forEach((valentry: RepeatedDatesAPIOutput, index: number) => {
            const gevent: GeneralEvent = new GeneralEvent();
            gevent.Name = this.detailFormGroup.get('nameControl')?.value + ` ${index + 1} / ${val.length}`;
            gevent.StartDate = valentry.StartDate;
            gevent.EndDate = valentry.EndDate;

            this.dataSet.push(gevent);
          });
        }
      },
      error: (err) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering RecurEventDetailComponent onSimulateGeneratedEvents, getRepeatedDates, failed ${err}`,
          ConsoleLogTypeEnum.error
        );
        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: err.toString(),
          nzClosable: true,
        });
      },
    });
  }

  public onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering RecurEventDetailComponent onSave...',
      ConsoleLogTypeEnum.debug
    );

    const objtbo = new RecurEvent();
    objtbo.IsPublic = true;
    objtbo.Name = this.detailFormGroup.get('nameControl')?.value;
    const [startdt, enddt] = this.detailFormGroup.get('dateControl')?.value;
    if (startdt) {
      objtbo.StartDate = moment(startdt);
    }
    if (enddt) {
      objtbo.EndDate = moment(enddt);
    }
    objtbo.HID = this.homeService.ChosedHome?.ID ?? 0;
    objtbo.Content = this.detailFormGroup.get('contentControl')?.value;
    objtbo.repeatType = this.detailFormGroup.get('frqControl')?.value as RepeatFrequencyEnum;

    if (this.uiMode === UIMode.Create) {
      this.storageService
        .createRecurEvent(objtbo)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .pipe(takeUntil(this._destroyed$!))
        .subscribe({
          next: (e) => {
            // Succeed.
            this.router.navigate(['/event/normal-event/display/' + (e.ID ?? 0).toString()]);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering RecurEventDetailComponent onSave createRecurEvent failed ${err}...`,
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
