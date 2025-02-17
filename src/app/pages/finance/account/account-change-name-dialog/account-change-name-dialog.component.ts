import { Component, Input, NgZone, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { FinanceOdataService } from '@services/index';
import { SafeAny } from '@common/any';

@Component({
  selector: 'hih-account-change-name-dialog',
  templateUrl: './account-change-name-dialog.component.html',
  styleUrls: ['./account-change-name-dialog.component.less'],
  imports: [
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    TranslocoModule,
  ]
})
export class AccountChangeNameDialogComponent implements OnInit {
  // Header forum
  public headerFormGroup: UntypedFormGroup;
  @Input() accountid?: number;
  @Input() name?: string;
  @Input() comment?: string;
  isSubmitting = false;

  constructor(private modal: NzModalRef, private _zone: NgZone, private odataService: FinanceOdataService) {
    this.headerFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      nameControl: new UntypedFormControl('', [Validators.required, Validators.maxLength(30)]),
      cmtControl: new UntypedFormControl('', Validators.maxLength(45)),
    });
  }

  ngOnInit(): void {
    this._zone.run(() => {
      this.headerFormGroup.get('idControl')?.setValue(this.accountid);
      this.headerFormGroup.get('nameControl')?.setValue(this.name);
      this.headerFormGroup.get('cmtControl')?.setValue(this.comment);
    });
  }

  get isSubmittedDisabled(): boolean {
    if (!this.headerFormGroup.valid) {
      return true;
    }
    if (this.isSubmitting) {
      return true;
    }
    return false;
  }

  onSubmit(): void {
    this.isSubmitting = true;

    const arcontent: SafeAny = {};
    if (this.headerFormGroup.get('nameControl')?.dirty) {
      arcontent.Name = this.headerFormGroup.get('nameControl')?.value;
    }
    if (this.headerFormGroup.get('cmtControl')?.dirty) {
      arcontent.Comment = this.headerFormGroup.get('cmtControl')?.value;
    }

    this.odataService.changeAccountByPatch(this.accountid ?? 0, arcontent).subscribe({
      next: () => {
        // Close the dialog
        this.modal.destroy();
      },
      error: () => {
        // Show error
        // this.modalService.warning({
        //   nzTitle: translate('Common.Warning'),
        //   nzContent: translate('Finance.CurrentNodeNotAccount'),
        //   nzClosable: true
        // });
        this.isSubmitting = false;
      },
    });
  }
  onCancel(): void {
    // Close the dialog
    this.modal.destroy();
  }
  destroyModal() {
    // Do nothing
  }
}
