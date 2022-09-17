import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';

import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  Book, momentDateFormat, getUIModeString, Person, Organization, BookCategory, Location, } from '../../../../model';
import { LibraryStorageService } from 'src/app/services';

@Component({
  selector: 'hih-location-detail',
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.less'],
})
export class LocationDetailComponent implements OnInit {

  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean = false;
  public routerID = -1; // Current object ID in routing
  public currentMode: string = '';
  public uiMode: UIMode = UIMode.Create;
  detailFormGroup: FormGroup;

  get isEditable(): boolean {
    return isUIEditable(this.uiMode);
  }

  constructor(private storageService: LibraryStorageService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LocationDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.detailFormGroup = new FormGroup({
      idControl: new FormControl({ value: undefined, disabled: true }),
      nameControl: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      cmtControl: new FormControl('', [Validators.maxLength(100)]),
    });
  }

  ngOnInit(): void {
  }

  onSave(): void {    
  }
}
