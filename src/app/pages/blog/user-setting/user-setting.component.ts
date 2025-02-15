import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { UIMode } from 'actslib';

import { ModelUtility, ConsoleLogTypeEnum, BlogUserSetting } from '../../../model';
import { BlogOdataService } from '../../../services';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';

@Component({
  selector: 'hih-user-setting',
  templateUrl: './user-setting.component.html',
  styleUrls: ['./user-setting.component.less'],
  imports: [
    NzPageHeaderModule,
    NzSpinModule,
    TranslocoModule,
    NzButtonModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class UserSettingComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  detailFormGroup: UntypedFormGroup;
  uiMode: UIMode = UIMode.Invalid;

  get isSaveButtonEnabled(): boolean {
    return this.uiMode === UIMode.Update && this.detailFormGroup.enabled && this.detailFormGroup.valid;
  }

  constructor(private odataService: BlogOdataService, private modalService: NzModalService) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering UserSettingComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.detailFormGroup = new UntypedFormGroup({
      userControl: new UntypedFormControl({ value: undefined, disabled: true }, [Validators.required]),
      deployControl: new UntypedFormControl({ value: undefined, disable: true }, [Validators.required]),
      titleControl: new UntypedFormControl('', [Validators.required]),
      footerControl: new UntypedFormControl('', [Validators.required]),
      authorControl: new UntypedFormControl(),
      authorDespControl: new UntypedFormControl(),
      authorImageControl: new UntypedFormControl(),
    });
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering UserSettingComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);
    this.odataService
      .readUserSetting()
      .pipe(takeUntil(this._destroyed$))
      .subscribe({
        next: (val) => {
          if (val !== null) {
            this.uiMode = UIMode.Update;
            this.detailFormGroup.get('userControl')?.setValue(val.owner);
            this.detailFormGroup.get('deployControl')?.setValue(val.deploy);
            this.detailFormGroup.get('titleControl')?.setValue(val.title);
            this.detailFormGroup.get('footerControl')?.setValue(val.footer);
            this.detailFormGroup.get('authorControl')?.setValue(val.author);
            this.detailFormGroup.get('authorDespControl')?.setValue(val.authordesp);
            this.detailFormGroup.get('authorImageControl')?.setValue(val.authorimage);
            this.detailFormGroup.enable();
            this.detailFormGroup.get('userControl')?.disable();
            this.detailFormGroup.get('deployControl')?.disable();
          } else {
            this.uiMode = UIMode.Invalid;
            this.detailFormGroup.disable();
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering UserSettingComponent ngOnInit, readUserSetting failed ${err}`,
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

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering UserSettingComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering UserSettingComponent onSave...',
      ConsoleLogTypeEnum.debug
    );

    if (!this.isSaveButtonEnabled) {
      return;
    }

    const settings = new BlogUserSetting();
    settings.owner = this.detailFormGroup.get('userControl')?.value;
    settings.deploy = this.detailFormGroup.get('deployControl')?.value;
    settings.title = this.detailFormGroup.get('titleControl')?.value;
    settings.footer = this.detailFormGroup.get('footerControl')?.value;
    settings.author = this.detailFormGroup.get('authorControl')?.value;
    settings.authordesp = this.detailFormGroup.get('authorDespControl')?.value;
    settings.authorimage = this.detailFormGroup.get('authorImageControl')?.value;

    this.odataService
      .updateUserSetting(settings)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: () => {
          this.modalService.confirm({
            nzTitle: translate('Common.Confirm'),
            nzContent: translate('Blog.DeployContentNow'),
            nzOkText: 'OK',
            nzCancelText: translate('Comon.Cancel'),
            nzOnOk: () => {
              this.odataService.deploySetting(settings.owner).subscribe({
                next: () => {
                  // Show success dialog
                  const ref: NzModalRef = this.modalService.success({
                    nzTitle: translate('Blog.DeploySuccess'),
                    nzContent: translate('Common.WillCloseIn1Second'),
                  });
                  setTimeout(() => {
                    ref.close();
                  }, 1000);
                },
                error: (derr) => {
                  // Popup another dialog
                  this.modalService.error({
                    nzTitle: translate('Common.Error'),
                    nzContent: derr.toString(),
                  });
                },
              });
            },
            nzOnCancel: () => {
              // Do nothing
            },
          });
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering UserSettingComponent onSave failed ${err}`,
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
}
