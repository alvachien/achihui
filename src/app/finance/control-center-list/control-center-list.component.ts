import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, ControlCenter, UICommonLabelEnum } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';
import { fadeAnimation } from '../../utility';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

/**
 * Data source of Control center
 */
export class ControlCenterDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ControlCenter[]> {
    const displayDataChanges = [
      this._storageService.listControlCenterChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.ControlCenters.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'hih-finance-control-center-list',
  templateUrl: './control-center-list.component.html',
  styleUrls: ['./control-center-list.component.scss'],
  animations: [fadeAnimation],
})
export class ControlCenterListComponent implements OnInit {

  displayedColumns = ['id', 'name', 'comment'];
  dataSource: ControlCenterDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog) { }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit...');
    }

    this.dataSource = new ControlCenterDataSource(this._storageService, this.paginator);
    this._storageService.fetchAllControlCenters().subscribe((x) => {
      // Just ensure the REQUEST has been sent
    });
  }

  public onCreateCC() {
    this._router.navigate(['/finance/controlcenter/create']);
  }

  public onDisplayCC(acnt: ControlCenter) {
    this._router.navigate(['/finance/controlcenter/display', acnt.Id]);
  }

  public onChangeCC(acnt: ControlCenter) {
    this._router.navigate(['/finance/controlcenter/edit', acnt.Id]);
  }

  public onDeleteCC(acnt: any) {
    // Show a confirmation dialog for the deletion
    const dlginfo: MessageDialogInfo = {
      Header: this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfirmTitle),
      Content: this._uiStatusService.getUILabel(UICommonLabelEnum.DeleteConfrimContent),
      Button: MessageDialogButtonEnum.yesno,
    };

    this._dialog.open(MessageDialogComponent, {
      disableClose: false,
      width: '500px',
      data: dlginfo,
    }).afterClosed().subscribe((x2) => {
      // Do nothing!
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
      }

      if (x2) {
        // Todo!
      }
    });
  }

  public onRefresh() {
    this._storageService.fetchAllControlCenters(true).subscribe((x) => {
      // Just ensure the REQUEST has been sent
    });
  }
}
