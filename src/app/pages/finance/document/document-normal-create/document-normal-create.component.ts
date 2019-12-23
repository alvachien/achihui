import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import * as moment from 'moment';

import { financeDocTypeNormal, UIMode } from '../../../../model';

@Component({
  selector: 'hih-document-normal-create',
  templateUrl: './document-normal-create.component.html',
  styleUrls: ['./document-normal-create.component.less']
})
export class DocumentNormalCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _docDate: moment.Moment;

  public docForm: FormGroup;
  public curDocType: number = financeDocTypeNormal;
  public curMode: UIMode = UIMode.Create;
  get curDocDate(): moment.Moment {
    return this._docDate;
  }

  constructor() {
    this.docForm = new FormGroup({
      headerControl: new FormControl('', Validators.required),
      itemControl: new FormControl(''),
    });
  }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave(): void {
    // Save the doc
  }
}
