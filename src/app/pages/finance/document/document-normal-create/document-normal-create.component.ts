import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import * as moment from 'moment';

import { financeDocTypeNormal, UIMode, Account, Document, UICommonLabelEnum, } from '../../../../model';
import { HomeDefOdataService, UIStatusService, FinanceOdataService } from '../../../../services';

@Component({
  selector: 'hih-fin-document-normal-create',
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

  constructor(
    public homeService: HomeDefOdataService,
    public uiStatusService: UIStatusService,
    public odataService: FinanceOdataService
  ) {
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
    let detailObject: Document = this._generateDocObject();
    if (!detailObject.onVerify({
      ControlCenters: this.odataService.ControlCenters,
      Orders: this.odataService.Orders,
      Accounts: this.odataService.Accounts,
      DocumentTypes: this.odataService.DocumentTypes,
      TransactionTypes: this.odataService.TranTypes,
      Currencies: this.odataService.Currencies,
      BaseCurrency: this.homeService.ChosedHome.BaseCurrency,
    })) {
      // Show a dialog for error details
      // TBD.

      return;
    }
  }

  private _generateDocObject(): Document {
    let detailObject: Document = this.docForm.get('headerControl').value;
    detailObject.HID = this.homeService.ChosedHome.ID;
    detailObject.Items = this.docForm.get('itemControl').value;

    return detailObject;
  }
}
