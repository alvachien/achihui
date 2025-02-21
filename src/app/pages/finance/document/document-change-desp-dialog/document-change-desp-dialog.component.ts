import { Component, inject, Input, NgZone, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { FinanceOdataService } from '@services/index';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'hih-document-change-desp-dialog',
  templateUrl: './document-change-desp-dialog.component.html',
  styleUrls: ['./document-change-desp-dialog.component.less'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    TranslocoModule,
    NzModalModule,
    RouterModule,
  ]
})
export class DocumentChangeDespDialogComponent implements OnInit {
  // Header forum
  public headerFormGroup: UntypedFormGroup;
  @Input() documentid?: number;
  @Input() documentdesp?: string;
  isSubmitting = false;

  private readonly modal = inject(NzModalRef);
  private readonly _zone = inject(NgZone);
  private readonly odataService = inject(FinanceOdataService);
  
  constructor() {
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
      .changeDocumentDespViaPatch(this.documentid ?? 0, this.headerFormGroup.get('despControl')?.value)
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
    // TBD.
  }
}
