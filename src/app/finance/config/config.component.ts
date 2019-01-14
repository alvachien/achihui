import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog, MatSnackBar, MatTableDataSource, MatPaginator } from '@angular/material';
import { LogLevel, AccountCategory, AssetCategory, DocumentType } from '../../model';
import { FinanceStorageService } from '../../services';
import { environment } from '../../../environments/environment';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'hih-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  dataSourceAcntCtgy: MatTableDataSource<AccountCategory> = new MatTableDataSource<AccountCategory>();
  dataSourceAsstCtgy: MatTableDataSource<AssetCategory> = new MatTableDataSource<AssetCategory>();
  dataSourceDocType: MatTableDataSource<DocumentType> = new MatTableDataSource<DocumentType>();
  displayedColumnsAcntCtgy: string[] = ['id', 'name', 'assetflag', 'comment'];
  displayedColumnsDocType: string[] = ['id', 'name', 'comment'];
  displayedColumnsAsstCtgy: string[] = ['id', 'name', 'desp'];
  @ViewChild('paginatorAcntCtgy') paginatorAcntCtgy: MatPaginator;
  @ViewChild('paginatorDocType') paginatorDocType: MatPaginator;
  @ViewChild('paginatorAstCtgy') paginatorAstCtgy: MatPaginator;

  constructor(public _storageService: FinanceStorageService,
    private _snackbar: MatSnackBar) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ConfigComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ConfigComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);

    forkJoin(
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllAssetCategories(),
    )
    .pipe(takeUntil(this._destroyed$))
    .subscribe((x: any) => {
      // Bind to the tables
      this.dataSourceAcntCtgy.data = x[0];
      this.dataSourceDocType.data = x[1];
      this.dataSourceAsstCtgy.data = x[2];
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering ConfigComponent forkJoin failed: ${error.toString()}`);
      }

      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ConfigComponent ngAfterViewInit...');
    }
    this.dataSourceAcntCtgy.paginator = this.paginatorAcntCtgy;
    this.dataSourceDocType.paginator = this.paginatorDocType;
    this.dataSourceAsstCtgy.paginator = this.paginatorAstCtgy;
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ConfigComponent ngAfterViewInit...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
