import { Component, OnInit, OnDestroy, DefaultIterableDiffer } from '@angular/core';
import { ReplaySubject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { FinanceOdataService, UIStatusService } from '../../../../services';
import { Account, Document, ControlCenter, AccountCategory, TranType,
  OverviewScopeEnum, DocumentType, Currency, Order,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  getOverviewScopeRange, UICommonLabelEnum, BaseListModel, ModelUtility, ConsoleLogTypeEnum,
} from '../../../../model';
import { UITableColumnItem } from '../../../../uimodel';

@Component({
  selector: 'hih-fin-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.less'],
})
export class DocumentDetailComponent implements OnInit {

  constructor() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
  }
}
