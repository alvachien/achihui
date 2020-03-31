import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Observable, forkJoin, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { Account, Document, DocumentItem, Currency, financeDocTypeBorrowFrom,
  ControlCenter, Order, TranType, financeDocTypeLendTo, UIMode,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  DocumentType, IAccountCategoryFilter, AccountExtraLoan, ConsoleLogTypeEnum,
  momentDateFormat, financeTranTypeLendTo, financeTranTypeBorrowFrom, costObjectValidator, ModelUtility,
  financeAccountCategoryBorrowFrom, financeAccountCategoryLendTo,
} from '../../../../model';
import { HomeDefOdataService, FinanceOdataService, UIStatusService, AuthService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';

@Component({
  selector: 'hih-document-loan-repay-create',
  templateUrl: './document-loan-repay-create.component.html',
  styleUrls: ['./document-loan-repay-create.component.less'],
})
export class DocumentLoanRepayCreateComponent implements OnInit {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;

  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Variables
  arControlCenters: ControlCenter[];
  arOrders: Order[];
  arTranTypes: TranType[];
  arAccounts: Account[];
  arDocTypes: DocumentType[];
  arCurrencies: Currency[];
  baseCurrency: string;

  constructor() { }

  ngOnInit() {
  }
}
