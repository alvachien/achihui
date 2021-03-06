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
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  public currentDocument: Document;
  // Attributes
  baseCurrency: string;
  arControlCenters: ControlCenter[] = [];
  arAccountCategories: AccountCategory[] = [];
  arDocTypes: DocumentType[] = [];
  arTranType: TranType[] = [];
  arUIAccounts: UIAccountForSelection[] = [];
  arUIOrders: UIOrderForSelection[] = [];
  arCurrencies: Currency[] = [];
  // Form group
  docFormGroup: FormGroup;

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

    this.currentDocument = new Document();
    this.baseCurrency = this.homeService.ChosedHome.BaseCurrency;
    this.docFormGroup = new FormGroup({
      headerControl: new FormControl(this.currentDocument, Validators.required),
      itemsControl: new FormControl()
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit, activateRoute: ${x}`,
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
          forkJoin([
            this.odataService.fetchAllCurrencies(),
            this.odataService.fetchAllDocTypes(),
            this.odataService.fetchAllTranTypes(),
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllAccounts(),
            this.odataService.fetchAllControlCenters(),
            this.odataService.fetchAllOrders(),
            this.odataService.readDocument(this.routerID),
          ])
          .pipe(takeUntil(this._destroyed$),
            finalize(() => {
              this.isLoadingResults = false;
            }))
            .subscribe({
              next: rsts => {
                this.arCurrencies = rsts[0] as Currency[];
                this.arDocTypes = rsts[1] as DocumentType[];
                this.arTranType = rsts[2] as TranType[];
                this.arAccountCategories = rsts[3] as AccountCategory[];
                this.arUIAccounts = BuildupAccountForSelection(rsts[4] as Account[], rsts[3] as AccountCategory[]);
                this.arControlCenters = rsts[5] as ControlCenter[];
                const arorders = rsts[6] as Order[];
                this.arUIOrders = BuildupOrderForSelection(arorders, true);

                this.currentDocument = rsts[7] as Document;

                this.docFormGroup.get('headerControl').setValue(this.currentDocument);
                this.docFormGroup.get('itemsControl').setValue(this.currentDocument.Items);

                if (this.uiMode === UIMode.Display) {
                  this.docFormGroup.disable();
                } else {
                  this.docFormGroup.enable();
                }
              },
              error: err => {
                ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in DocumentDetailComponent ngOninit, forkJoin : ${err}`,
                  ConsoleLogTypeEnum.error);

                this.uiMode = UIMode.Invalid;
                this.modalService.create({
                  nzTitle: translate('Common.Error'),
                  nzContent: err,
                  nzClosable: true,
                });
              }
            });
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
