import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, NzModalRef } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { ModelUtility, ConsoleLogTypeEnum, BlogPost, UIMode,
  BlogUserSetting, } from '../../../model';
import { BlogOdataService, UIStatusService, } from '../../../services';

@Component({
  selector: 'hih-user-setting',
  templateUrl: './user-setting.component.html',
  styleUrls: ['./user-setting.component.less'],
})
export class UserSettingComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line: variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults = false;
  detailFormGroup: FormGroup;
  uiMode: UIMode;

  get isSaveButtonEnabled(): boolean {
    return this.uiMode === UIMode.Change
      && this.detailFormGroup.enabled
      && this.detailFormGroup.valid;
  }

  constructor(private odataService: BlogOdataService,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering UserSettingComponent constructor...',
      ConsoleLogTypeEnum.debug);
  
    this.detailFormGroup = new FormGroup({
      userControl: new FormControl({value: undefined, disabled: true}, [Validators.required]),
      deployControl: new FormControl({value: undefined, disable: true}, [Validators.required]),
      titleControl: new FormControl('', [Validators.required]),
      footerControl: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering UserSettingComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this.odataService.readUserSetting()
      .pipe(takeUntil(this._destroyed$))
      .subscribe({
        next: next => {
          if (next !== null) {
            this.uiMode = UIMode.Change;
            this.detailFormGroup.get('userControl').setValue(next.owner);
            this.detailFormGroup.get('deployControl').setValue(next.deploy);
            this.detailFormGroup.get('titleControl').setValue(next.title);
            this.detailFormGroup.get('footerControl').setValue(next.footer);
            this.detailFormGroup.enable();
            this.detailFormGroup.get('userControl').disable();
            this.detailFormGroup.get('deployControl').disable();
          } else {
            this.uiMode = UIMode.Invalid;
            this.detailFormGroup.disable();
          }
        },
        error: err => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering UserSettingComponent ngOnInit, readUserSetting failed ${err}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });
        }
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering UserSettingComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering UserSettingComponent onSave...',
      ConsoleLogTypeEnum.debug);

    if (!this.isSaveButtonEnabled) {
      return;
    }

    let settings = new BlogUserSetting();
    settings.owner = this.detailFormGroup.get('userControl').value;
    settings.deploy = this.detailFormGroup.get('deployControl').value;
    settings.title = this.detailFormGroup.get('titleControl').value;
    settings.footer = this.detailFormGroup.get('footerControl').value;

    this.odataService.updateUserSetting(settings)
      .pipe(takeUntil(this._destroyed$))
      .subscribe({
        next: next => {
          this.modalService.confirm({
            nzTitle: 'Confirm',
            nzContent: 'Deploy the setting now?',
            nzOkText: 'OK',
            nzCancelText: 'Cancel',
            nzOnOk: okrst => {
              this.odataService.deploySetting(settings.owner).subscribe({
                next: rst => {
                  // Show success dialog
                  const ref: NzModalRef = this.modalService.success({
                    nzTitle: 'Deploy complete without error',
                    nzContent: 'Closed in 1 sec',
                  });
                  setTimeout(() => {
                    ref.close();
                  }, 1000);
                },
                error: derr => {
                  // Popup another dialog
                  this.modalService.error({
                    nzTitle: 'Error',
                    nzContent: derr,
                  })
                }
              });                  
            },
            nzOnCancel: cancrst => {
            }
          });
        },
        error: err => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering UserSettingComponent onSave failed ${err}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });
        }
      })
  }
}
