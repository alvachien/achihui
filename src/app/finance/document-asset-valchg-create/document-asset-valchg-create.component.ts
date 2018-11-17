import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
    Input, Output, ViewContainerRef,
  } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatChipInputEvent } from '@angular/material';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAsset,
UIFinAssetOperationDocument, AccountExtraAsset, RepeatFrequencyEnum, UICommonLabelEnum,
BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
IAccountCategoryFilterEx, financeTranTypeAssetSoldoutIncome, momentDateFormat,
InfoMessage, MessageType, financeDocTypeAssetSoldOut, financeTranTypeAssetSoldout, FinanceAssetSoldoutDocumentAPI,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
selector: 'hih-document-asset-valchg-create',
templateUrl: './document-asset-valchg-create.component.html',
styleUrls: ['./document-asset-valchg-create.component.scss'],
})
export class DocumentAssetValChgCreateComponent implements OnInit {
  constructor(public _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    private _currService: FinCurrencyService,
    private _router: Router,
    private _formBuilder: FormBuilder) {
  }
  
  ngOnInit(): void {
    // DO nothing
  }
}
