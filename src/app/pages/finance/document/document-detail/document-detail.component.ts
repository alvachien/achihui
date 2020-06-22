import { Component, OnInit, OnDestroy, DefaultIterableDiffer } from '@angular/core';
import { ReplaySubject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map, finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { FinanceOdataService, HomeDefOdataService, UIStatusService } from '../../../../services';
import { Account, Document, ControlCenter, AccountCategory, TranType,
  OverviewScopeEnum, DocumentType, Currency, Order,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  getOverviewScopeRange, UICommonLabelEnum, BaseListModel, ModelUtility, ConsoleLogTypeEnum,
  UIMode, getUIModeString,
} from '../../../../model';
import { UITableColumnItem } from '../../../../uimodel';

@Component({
  selector: 'hih-fin-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.less'],
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  public routerID = -1; // Current object ID in routing
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(
    private homeService: HomeDefOdataService,
    private activateRoute: ActivatedRoute,
    private odataService: FinanceOdataService,
    private modalService: NzModalService,
    private router: Router) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit, fetchAllControlCenters, activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug);

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.uiMode = UIMode.Create;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Change;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }

        this.currentMode = getUIModeString(this.uiMode);
      }

      switch (this.uiMode) {
        case UIMode.Change:
        case UIMode.Display: {
          this.isLoadingResults = true;

          // Read the document
          break;
        }

        case UIMode.Create:
        default:
          break;
      }
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
