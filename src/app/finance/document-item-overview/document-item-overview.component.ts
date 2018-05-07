import { Component, OnInit, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatPaginator, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, DocumentItemWithBalance, TranTypeReport, TemplateDocBase,
  TemplateDocADP, TemplateDocLoan, UICommonLabelEnum, OverviewScopeEnum, getOverviewScopeRange, isOverviewDateInScope,
  UIOrderForSelection, UIAccountForSelection, BuildupAccountForSelection, BuildupOrderForSelection } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';

/**
 * Data source of ADP & Loan docs
 */
export class TmpDocStillOpenDataSource extends DataSource<any> {
  constructor(private _parentComponent: DocumentItemOverviewComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<TemplateDocBase[]> {
    const displayDataChanges: any[] = [
      this._parentComponent.tmpDocEvent,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._parentComponent.tmpDocs.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-fin-document-item-overview',
  templateUrl: './document-item-overview.component.html',
  styleUrls: ['./document-item-overview.component.scss'],
})
export class DocumentItemOverviewComponent implements OnInit {

  displayedByControlCenterColumns: string[] = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp', 'Balance'];
  displayedByOrderColumns: string[] = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp', 'Balance'];
  displayedTmpDocColumns: string[] = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp'];
  dataSourceTmpDoc: TmpDocStillOpenDataSource | undefined;
  tmpDocEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
  tmpDocs: TemplateDocBase[] = [];
  public arUIAccount: UIAccountForSelection[] = [];
  public arUIOrder: UIOrderForSelection[] = [];
  @ViewChild('paginatorByAccount') paginatorByAccount: MatPaginator;
  @ViewChild('paginatorByControlCenter') paginatorByControlCenter: MatPaginator;
  @ViewChild('paginatorByOrder') paginatorByOrder: MatPaginator;
  @ViewChild('paginatorTmpDoc') paginatorTmpDoc: MatPaginator;

  selectedAccount: number;
  selectedControlCenter: number;
  selectedOrder: number;
  selectedAccountScope: OverviewScopeEnum;
  selectedControlCenterScope: OverviewScopeEnum;
  selectedOrderScope: OverviewScopeEnum;
  selectedTmpScope: OverviewScopeEnum;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    public _currService: FinCurrencyService) {
    this.selectedAccountScope = OverviewScopeEnum.All;
    this.selectedControlCenterScope = OverviewScopeEnum.All;
    this.selectedOrderScope = OverviewScopeEnum.All;
    this.selectedTmpScope = OverviewScopeEnum.CurrentMonth;
  }

  ngOnInit(): void {
    this.dataSourceTmpDoc = new TmpDocStillOpenDataSource(this, this.paginatorTmpDoc);

    forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
    ]).subscribe((x: any) => {
      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories, true, true, true);
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this._storageService.Orders, true);

      // Refresh the template documents
      this.onTmpDocsRefresh();
    });
  }

  public onTmpDocsRefresh(): void {
    let { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this.selectedTmpScope);
    forkJoin([
      this._storageService.getADPTmpDocs(bgn, end),
      this._storageService.getLoanTmpDocs(bgn, end),
    ]).subscribe((x: any) => {
      this.tmpDocs = [];

      if (x[0] instanceof Array && x[0].length > 0) {
        for (let dta of x[0]) {
          let adpdoc: TemplateDocADP = new TemplateDocADP();
          adpdoc.onSetData(dta);
          this.tmpDocs.push(adpdoc);
        }
      }
      if (x[1] instanceof Array && x[1].length > 0) {
        for (let dta of x[1]) {
          let loandoc: TemplateDocLoan = new TemplateDocLoan();
          loandoc.onSetData(dta);
          this.tmpDocs.push(loandoc);
        }
      }

      // Sort it by date
      this.tmpDocs.sort((a: any, b: any) => {
        if (a.TranDate.isSame(b.TranDate)) { return 0; }
        if (a.TranDate.isBefore(b.TranDate)) { return -1; } else { return 1; }
      });

      this.tmpDocEvent.emit();
    });
  }

  public onPostTmpDocument(doc: any): void {
    if (doc instanceof TemplateDocADP) {
      // Do the ADP posting!
      this._storageService.doPostADPTmpDoc(doc).subscribe((x: any) => {
        // Show the posted document - after the snackbar!
        this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), 'OK', {
          duration: 3000,
        }).afterDismissed().subscribe(() => {
          // Navigate to display
          this._router.navigate(['/finance/document/displaynormal/' + x.id]);
        });
      }, (error: any) => {
        // Show error dialog!
      });
    } else if (doc instanceof TemplateDocLoan) {
      // Do the Loan posting!
      this._storageService.doPostLoanTmpDoc(doc).subscribe((x: any) => {
        // Show the posted document - after the snackbar!
        this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted), 'OK', {
          duration: 3000,
        }).afterDismissed().subscribe(() => {
          // Navigate to display
          this._router.navigate(['/finance/document/displaynormal/' + x.id]);
        });
      }, (error: any) => {
        // Show error dialog!
      });
    }
  }
}
