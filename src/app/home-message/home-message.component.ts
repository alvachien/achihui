import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../environments/environment';
import { appNavItems, appLanguage, LogLevel, UIStatusEnum, HomeDef, HomeMsg, HomeMember } from '../model';
import { AuthService, HomeDefDetailService, UIStatusService } from '../services';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';

@Component({
  selector: 'app-home-msg',
  templateUrl: './home-message.component.html',
  styleUrls: [
    './home-message.component.scss',
  ],
})
export class HomeMessageComponent implements OnInit, AfterViewInit {
  displayedColumns = ['id', 'userfrom', 'userto', 'title', 'senddate'];
  dataSource: MatTableDataSource<HomeMsg>;
  sentBox: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults: boolean;

  constructor(private _homeDefService: HomeDefDetailService,
    private _authService: AuthService,
    public _dialog: MatDialog) {
    this.isLoadingResults = true;
    this.sentBox = false;

    this._homeDefService.fetchAllMembersInChosedHome();

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource([]);
  }

  ngOnInit(): void {
    // Empty
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.fetchMessages();
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
      data: { Members: this._homeDefService.MembersInChosedHome, UserTo: usrTo, Title: title, Content: content },
    });

    dialogRef.afterClosed().subscribe(result => {
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

        this._homeDefService.createHomeMessage(msg).subscribe(x => {
          let data = this.dataSource.data.slice();
          data.push(x);
          this.dataSource.data = data;
        });
      }
    });
  }

  // Fetch all messages
  private fetchMessages(): void {
    this.paginator.page
      .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this._homeDefService!.getHomeMessages(this.sentBox, this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize );
      }),
      map(data => {
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

        return observableOf([]);
      }),
      ).subscribe(data => this.dataSource.data = data);    
  }
}

@Component({
  selector: 'app-home-msg-dialog',
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
