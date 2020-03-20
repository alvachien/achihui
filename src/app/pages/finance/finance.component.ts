import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { Currency, ModelUtility, ConsoleLogTypeEnum } from '../../model';
import { FinanceOdataService } from '../../services';

@Component({
  selector: 'hih-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.less'],
})
export class FinanceComponent implements OnInit {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  public dataSource: Currency[] = [];
  isLoadingResults: boolean;

  listDataMap = {
    eight: [
      { type: 'warning', content: 'This is warning event.' },
      { type: 'success', content: 'This is usual event.' }
    ],
    ten: [
      { type: 'warning', content: 'This is warning event.' },
      { type: 'success', content: 'This is usual event.' },
      { type: 'error', content: 'This is error event.' }
    ],
    eleven: [
      { type: 'warning', content: 'This is warning event' },
      { type: 'success', content: 'This is very long usual event........' },
      { type: 'error', content: 'This is error event 1.' },
      { type: 'error', content: 'This is error event 2.' },
      { type: 'error', content: 'This is error event 3.' },
      { type: 'error', content: 'This is error event 4.' }
    ]
  };
  constructor(
    public currService: FinanceOdataService,
    public modalService: NzModalService) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering FinanceComponent constructor...`,
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
  }

  getMonthData(date: Date): number | null {
    if (date.getMonth() === 8) {
      return 1394;
    }
    return null;
  }
}
