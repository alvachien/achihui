import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'hih-account-change-name-dialog',
  templateUrl: './account-change-name-dialog.component.html',
  styleUrls: ['./account-change-name-dialog.component.less'],
})
export class AccountChangeNameDialogComponent implements OnInit {
  // Header forum
  public headerFormGroup: FormGroup;
  @Input() name?: string;
  @Input() comment?: string;

  constructor(private modal: NzModalRef) { 
    this.headerFormGroup = new FormGroup({
      nameControl: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      cmtControl: new FormControl('', Validators.maxLength(45)),
    });
  }

  ngOnInit(): void {
    // Add some code
    this.headerFormGroup.get('nameControl')?.setValue(this.name);
    this.headerFormGroup.get('cmtControl')?.setValue(this.comment);
  }

  destroyModal() {

  }
}
