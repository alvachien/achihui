import { Component, Input, NgZone, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FinanceOdataService } from 'src/app/services';

@Component({
  selector: 'hih-document-change-desp-dialog',
  templateUrl: './document-change-desp-dialog.component.html',
  styleUrls: ['./document-change-desp-dialog.component.less'],
})
export class DocumentChangeDespDialogComponent implements OnInit {
  // Header forum
  public headerFormGroup: UntypedFormGroup;
  @Input() documentid?: number;
  @Input() documentdesp?: string;
  isSubmitting = false;

  constructor(private modal: NzModalRef, private _zone: NgZone, private odataService: FinanceOdataService) {
    this.headerFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      despControl: new UntypedFormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this._zone.run(() => {
      this.headerFormGroup.get('idControl')?.setValue(this.documentid);
      this.headerFormGroup.get('despControl')?.setValue(this.documentdesp);
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
      .changeDocumentDespViaPatch(this.documentid!, this.headerFormGroup.get('despControl')?.value)
      .subscribe({
        next: (val) => {
          this.modal.destroy();
        },
        error: (err) => {
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
  destroyModal() {}
}
