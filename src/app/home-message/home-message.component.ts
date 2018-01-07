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
  templateUrl: './home-msg.component.html',
  styleUrls: ['./home-msg.component.scss']
})
export class HomeMessageComponent implements OnInit {
  displayedColumns = ['id', 'userto', 'title', 'senddate'];
  dataSource: MatTableDataSource<HomeMsg>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults: boolean;

  constructor(private _homeDefService: HomeDefDetailService,
    private _authService: AuthService,
    public _dialog: MatDialog) {
    this.isLoadingResults = true;

    this._homeDefService.fetchAllMembersInChosedHome();

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource([]);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.paginator.page
      .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this._homeDefService!.getHomeMessages(this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize );
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
      })
      ).subscribe(data => this.dataSource.data = data);
  }

  
  public onCreateMessage(): void {
    // Show a dialog to create message
    let usrTo: string = '';
    let title: string = '';
    let content: string = '';

    let dialogRef = this._dialog.open(HomeMessageDialog, {
      width: '250px',
      data: { Members: this._homeDefService.curHomeMembers, UserTo: usrTo, Title: title, Content: content  }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      //this.animal = result;
    });

    // let msg: HomeMsg = new HomeMsg();
    // msg.HID = this._homeDefService.ChosedHome.ID;
    // msg.Content = 'Test';
    // msg.Title = 'Test';
    // msg.ReadFlag = false;    
    // msg.UserFrom = this._authService.authSubject.getValue().getUserId();
    // msg.UserTo = msg.UserFrom;

    // this._homeDefService.createHomeMessage(msg).subscribe(x => {
    //   let data = this.dataSource.data.slice();
    //   data.push(x);
    //   this.dataSource.data = data;
    // });
  }
}

@Component({
  selector: 'app-home-msg-dialog',
  templateUrl: 'home-message.dialog.html',
  styleUrls: ['./home-message.dialog.scss'],
})
export class HomeMessageDialog {

  constructor(
    public dialogRef: MatDialogRef<HomeMessageDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
