import { Component, OnInit } from '@angular/core';
import { ControlContainer, Validators } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, AccountExtraAsset,
  RepeatFrequencyEnum, UIDisplayStringUtil,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

export function getAccountExtAssetFormGroup(): any {
  return {
    ctgyControl: ['', Validators.required],
    nameControl: ['', Validators.required],
    commentControl: '',
  };
}

@Component({
  selector: 'hih-account-ext-asset-ex',
  templateUrl: './account-ext-asset-ex.component.html',
  styleUrls: ['./account-ext-asset-ex.component.scss'],
})
export class AccountExtAssetExComponent implements OnInit {

  constructor(public controlContainer: ControlContainer,
    public _storageService: FinanceStorageService) {
      // Do nothing
    }

  ngOnInit(): void {
    // Do nothing
  }
}
