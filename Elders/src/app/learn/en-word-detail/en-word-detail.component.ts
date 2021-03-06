import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef, ViewEncapsulation, ViewChild,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, UIMode, getUIModeString, EnWord, EnWordExplain, UICommonLabelEnum } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { popupDialog, } from '../../message-dialog';

@Component({
  selector: 'hih-learn-en-word-detail',
  templateUrl: './en-word-detail.component.html',
  styleUrls: ['./en-word-detail.component.scss'],
})
export class EnWordDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _createSub: Subscription;
  private _readSub: Subscription;

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: EnWord | undefined;
  public uiMode: UIMode = UIMode.Create;

  displayedColumns: string[] = ['id', 'pos', 'langkey', 'detail'];
  dataSource: MatTableDataSource<EnWordExplain>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EnWordDetailComponent constructor...');
    }
    this.detailObject = new EnWord();
    this.dataSource = new MatTableDataSource(this.detailObject.Explains);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EnWordDetailComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    // Distinguish current mode
    this._activateRoute.url.subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering EnWordDetailComponent ngOnInit for activateRoute URL: ${x}`);
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
          if (!this._readSub) {
            this._readSub = this._storageService.readEnWordEvent.subscribe((x2: any) => {
              if (x2 instanceof EnWord) {
                if (environment.LoggingLevel >= LogLevel.Debug) {
                  console.debug(`AC_HIH_UI [Debug]: Entering EnWordDetailComponent, ngOninit, readEnWordEvent`);
                }

                this.detailObject = x2;
              } else {
                if (environment.LoggingLevel >= LogLevel.Error) {
                  console.error(`AC_HIH_UI [Error]: Entering EnWordDetailComponent, ngOninit, readEnWordEvent, failed: ${x}`);
                }
                this.detailObject = new EnWord();
              }
            });
          }

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
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EnWordDetailComponent ngOnDestroy...');
    }
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering EnWordDetailComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
    if (this._readSub) {
      this._readSub.unsubscribe();
    }
    if (this._createSub) {
      this._createSub.unsubscribe();
    }
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
      if (!this._createSub) {
        this._createSub = this._storageService.createEnWordEvent.subscribe((x: any) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.debug(`AC_HIH_UI [Debug]: Entering EnWordDetailComponent, onSubmit, createEnWordEvent`);
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
            popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
              x ? x.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
          }
        });
      }

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
