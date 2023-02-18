import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';

import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  Book, momentDateFormat, getUIModeString, Person, Organization, BookCategory, Location, } from '../../../model';
import { HomeDefOdataService, LibraryStorageService, UIStatusService, } from '../../../services';

@Component({
  selector: 'hih-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less'],
})
export class SearchComponent {

  constructor(private storageService: LibraryStorageService,
    private homeService: HomeDefOdataService,) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering SearchComponent constructor...',
      ConsoleLogTypeEnum.debug);
  }

}
