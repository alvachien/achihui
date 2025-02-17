import { Component, Input, NgZone, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import moment from 'moment';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FinanceOdataService } from '@services/index';

@Component({
  selector: 'hih-document-change-date-dialog',
  templateUrl: './document-change-date-dialog.component.html',
  styleUrls: ['./document-change-date-dialog.component.less'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    NzInputModule,
    NzDatePickerModule,
    TranslocoModule,
  ]
})
export class DocumentChangeDateDialogComponent implements OnInit {
  // Header forum
  public headerFormGroup: UntypedFormGroup;
  @Input() documentid?: number;
  @Input() documentdate?: Date;
  isSubmitting = false;

  constructor(private modal: NzModalRef, private _zone: NgZone, private odataService: FinanceOdataService) {
    this.headerFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      dateControl: new UntypedFormControl(new Date(), [Validators.required]),
    });
  }

  ngOnInit(): void {
    this._zone.run(() => {
      this.headerFormGroup.get('idControl')?.setValue(this.documentid);

      this.headerFormGroup.get('dateControl')?.setValue(this.documentdate);
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

    this.odataService
      .changeDocumentDateViaPatch(this.documentid ?? 0, moment(this.headerFormGroup.get('dateControl')?.value))
      .subscribe({
        next: () => {
          this.modal.destroy();
        },
        error: () => {
          this.isSubmitting = false;
          // Show error
          // this.modalService.warning({
          //   nzTitle: translate('Common.Warning'),
          //   nzContent: translate('Finance.CurrentNodeNotAccount'),
          //   nzClosable: true
          // });
        },
      });
  }
  onCancel(): void {
    // Close the dialog
    this.modal.destroy();
  }
  destroyModal() {
    // TBD
  }
}
