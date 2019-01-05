import { Component, OnInit, AfterViewInit, ViewChild, Inject, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../environments/environment';
import { appNavItems, appLanguage, LogLevel, UIStatusEnum, HomeDef, HomeMsg, HomeMember } from '../model';
import { AuthService, HomeDefDetailService, UIStatusService } from '../services';
import { Observable, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-home-msg',
  templateUrl: './home-message.component.html',
  styleUrls: [
    './home-message.component.scss',
  ],
})
export class HomeMessageComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  displayedColumns: string[] = ['id', 'userfrom', 'userto', 'title', 'senddate'];
  dataSource: MatTableDataSource<HomeMsg>;
  sentBox: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults: boolean;

  constructor(private _homeDefService: HomeDefDetailService,
    private _authService: AuthService,
    public _dialog: MatDialog) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HomeMessageComponent constructor...');
    }
    this.isLoadingResults = true;
    this.sentBox = false;

    this._homeDefService.fetchAllMembersInChosedHome();

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource([]);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HomeMessageComponent ngOnInit...');
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HomeMessageComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.fetchMessages();
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering HomeMessageComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  public onSwitchSentBox(): void {
    this.sentBox = !this.sentBox;

    // Update
    this.fetchMessages();
  }

  public onCreateMessage(): void {
    // Show a dialog to create message
    let usrTo: string = '';
    let title: string = '';
    let content: string = '';

    let dialogRef: any = this._dialog.open(HomeMessageDialogComponent, {
      width: '500px',
      data: { Members: this._homeDefService.MembersInChosedHome, UserTo: usrTo, Title: title, Content: content, isCreateMode: true },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (!result.UserTo || !result.Title || !result.Content) {
          // Show error dialog
          return;
        }

        // Create the real message
        let msg: HomeMsg = new HomeMsg();
        msg.HID = this._homeDefService.ChosedHome.ID;
        msg.Content = result.Content;
        msg.Title = result.Title;
        msg.ReadFlag = false;
        msg.UserFrom = this._authService.authSubject.getValue().getUserId();
        msg.UserTo = result.UserTo;

        this._homeDefService.createHomeMessage(msg).subscribe((x: any) => {
          let data: any = this.dataSource.data.slice();
          data.push(x);
          this.dataSource.data = data;
        });
      }
    });
  }

  public onDeleteMsg(row: any): void {
    // Delete the message
    this._homeDefService.deleteHomeMessage(row, this.sentBox).subscribe((x: any) => {
      // Do a refresh?
      this.fetchMessages();
    });
  }

  public onOpenMsg(row: HomeMsg): void {
    // Have to re-read the message?
    let dialogRef: any = this._dialog.open(HomeMessageDialogComponent, {
      width: '500px',
      data: { Members: this._homeDefService.MembersInChosedHome, UserTo: row.UserTo, Title: row.Title, Content: row.Content, isCreateMode: false },
    });

    dialogRef.afterClosed().subscribe((x: any) => {
      this._homeDefService.markHomeMessageHasRead(row).subscribe((y: any) => {
        // Empty
      });
    });
  }

  // Fetch all messages
  private fetchMessages(): void {
    this.paginator.page
      .pipe(
      takeUntil(this._destroyed$),
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this._homeDefService!.getHomeMessages(this.sentBox, this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize );
      }),
      map((data: any) => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;

        let rslts: HomeMsg[] = [];
        if (data && data.contentList && data.contentList instanceof Array) {
          for (let ci of data.contentList) {
            let rst: HomeMsg = new HomeMsg();
            rst.onSetData(ci);

            rslts.push(rst);
          }
        }

        return rslts;
      }),
      catchError(() => {
        this.isLoadingResults = false;

        return of([]);
      }),
      ).subscribe((data: any) => this.dataSource.data = data);
  }
}

@Component({
  selector: 'hih-home-msg-dialog',
  templateUrl: 'home-message.dialog.html',
  styleUrls: ['./home-message.dialog.scss'],
})
export class HomeMessageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<HomeMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      // Empty
  }

  onNoClick(): void {
    this.dialogRef.close(undefined);
  }
}
