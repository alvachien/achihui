import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ConsoleLogTypeEnum, ModelUtility } from 'src/app/model';

@Component({
  selector: 'hih-borrow-record-create-dlg',
  templateUrl: './borrow-record-create-dlg.component.html',
  styleUrls: ['./borrow-record-create-dlg.component.less'],
})
export class BorrowRecordCreateDlgComponent implements OnInit {
  detailFormGroup: FormGroup;

  constructor() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.detailFormGroup = new FormGroup({
      idControl: new FormControl({value: undefined, disabled: true}),
      bookControl: new FormControl(null, [Validators.required]),
      fromOrgControl: new FormControl(),
      dateRangeControl: new FormControl([new Date(), new Date()]),
      hasRtnedControl: new FormControl(true),
      cmtControl: new FormControl(''),
    });
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
  }
}
