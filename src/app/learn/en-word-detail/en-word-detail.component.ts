import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LogLevel, UIMode, getUIModeString, EnWord, EnWordExplain, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-learn-en-word-detail',
  templateUrl: './en-word-detail.component.html',
  styleUrls: ['./en-word-detail.component.scss'],
})
export class EnWordDetailComponent implements OnInit, AfterViewInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: EnWord | undefined;
  public uiMode: UIMode = UIMode.Create;

  displayedColumns: string[] = ['id', 'pos', 'langkey', 'detail'];
  dataSource: MatTableDataSource<EnWordExplain>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService) {
    this.detailObject = new EnWord();
    this.dataSource = new MatTableDataSource(this.detailObject.Explains);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering EnWordDetailComponent ngOnInit...');
    }

    // Distinguish current mode
    this._activateRoute.url.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering EnWordDetailComponent ngOnInit for activateRoute URL: ${x}`);
      }

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.onInitCreateMode();
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Change;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);

        if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
          this._storageService.readEnWordEvent.subscribe((x2: any) => {
            if (x2 instanceof EnWord) {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.log(`AC_HIH_UI [Debug]: Entering EnWordDetailComponent, ngOninit, readEnWordEvent`);
              }

              this.detailObject = x2;
            } else {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Error]: Entering EnWordDetailComponent, ngOninit, readEnWordEvent, failed: ${x}`);
              }
              this.detailObject = new EnWord();
            }
          });

          this._storageService.readEnWord(this.routerID);
        }
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ngOnInit in EnWordDetailComponent with activateRoute URL : ${error}`);
      }
    }, () => {
      // Empty
    });
  }

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  public canSubmit(): boolean {
    return true;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string): void {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  public onCreateExplain(): void {
    let nexp: EnWordExplain = new EnWordExplain();
    this.detailObject.Explains.push(nexp);
  }

  public onSubmit(): void {
    if (this.uiMode === UIMode.Create) {
      this._storageService.createEnWordEvent.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering EnWordDetailComponent, onSubmit, createEnWordEvent`);
        }

        // Navigate back to list view
        if (x instanceof EnWord) {
          // Show the snackbar
          let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.CreatedSuccess),
            this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
            duration: 3000,
          });

          let recreate: boolean = false;
          snackbarRef.onAction().subscribe(() => {
            recreate = true;

            this.onInitCreateMode();
          });

          snackbarRef.afterDismissed().subscribe(() => {
            // Navigate to display
            if (!recreate) {
              this._router.navigate(['/learn/enword/display/' + x.ID.toString()]);
            }
          });
        } else {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            Content: x.toString(),
            Button: MessageDialogButtonEnum.onlyok,
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo,
          }).afterClosed().subscribe((x2: any) => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Entering EnWordDetailComponent, onSubmit, Message dialog result ${x2}`);
            }
          });
        }
      });

      this._storageService.createEnWord(this.detailObject);
    } else if (this.uiMode === UIMode.Change) {
      // Update current account
      // TBD!
    }
  }

  public onCancel(): void {
    // Empty
  }

  private onInitCreateMode(): void {
    this.detailObject = new EnWord();
    this.uiMode = UIMode.Create;
    this.detailObject.HID = this._homedefService.ChosedHome.ID;
  }
}
