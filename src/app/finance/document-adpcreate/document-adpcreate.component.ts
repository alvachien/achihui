import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent } from '@angular/material';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAdvancePayment,
  UIFinAdvPayDocument, TemplateDocADP, AccountExtraAdvancePayment, RepeatFrequencyEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  UIDisplayStringUtil, IAccountCategoryFilter, financeAccountCategoryAdvanceReceived,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService, AuthService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { AccountExtADPComponent } from '../account-ext-adp';

@Component({
  selector: 'hih-document-adpcreate',
  templateUrl: './document-adpcreate.component.html',
  styleUrls: ['./document-adpcreate.component.scss'],
})
export class DocumentADPCreateComponent implements OnInit {
  // Step: Generic info
  public firstFormGroup: FormGroup;

  constructor(public _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    private _currService: FinCurrencyService,
    private _router: Router,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnInit...');
    }

    this.firstFormGroup = this._formBuilder.group({
      accountControl: ['', Validators.required],
      dateControl: new FormControl({ value: moment() }, Validators.required),
      amountControl: ['', Validators.required],
      despControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
    });
  }
}
