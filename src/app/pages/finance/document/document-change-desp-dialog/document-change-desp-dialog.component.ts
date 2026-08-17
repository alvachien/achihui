import { Component, inject, input, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    TranslocoModule,
    NzModalModule,
    RouterModule,
  ],
})
export class DocumentChangeDespDialogComponent implements OnInit {
  // Header forum
  public headerFormGroup: UntypedFormGroup;
  readonly documentid = input<number>();
  readonly documentdesp = input<string>();
  isSubmitting = signal(false);

  private readonly modal = inject(NzModalRef);
  private readonly odataService = inject(FinanceOdataService);

  constructor() {
    this.headerFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      despControl: new UntypedFormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.headerFormGroup.get('idControl')?.setValue(this.documentid());
    this.headerFormGroup.get('despControl')?.setValue(this.documentdesp());
  }

  get isSubmittedDisabled(): boolean {
    if (!this.headerFormGroup.valid) {
      return true;
    }
    if (this.isSubmitting()) {
      return true;
    }
    return false;
  }

  onSubmit(): void {
    this.isSubmitting.set(true);

    this.odataService
      .changeDocumentDespViaPatch(this.documentid() ?? 0, this.headerFormGroup.get('despControl')?.value)
      .subscribe({
        next: () => {
          this.modal.destroy();
        },
        error: () => {
          this.isSubmitting.set(false);
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
