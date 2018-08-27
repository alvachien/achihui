import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog, MatSnackBar, MatTableDataSource, MatPaginator } from '@angular/material';
import { LogLevel, AccountCategory, AssetCategory, DocumentType } from '../../model';
import { FinanceStorageService } from '../../services';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'hih-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit, AfterViewInit {
  dataSourceAcntCtgy: MatTableDataSource<AccountCategory> = new MatTableDataSource<AccountCategory>();
  dataSourceAsstCtgy: MatTableDataSource<AssetCategory> = new MatTableDataSource<AssetCategory>();
  dataSourceDocType: MatTableDataSource<DocumentType> = new MatTableDataSource<DocumentType>();
  displayedColumnsAcntCtgy: string[] = ['id', 'name', 'assetflag', 'comment'];
  displayedColumnsDocType: string[] = ['id', 'name', 'comment'];
  displayedColumnsAsstCtgy: string[] = ['id', 'name', 'desp'];
  @ViewChild('paginatorAcntCtgy') paginatorAcntCtgy: MatPaginator;
  @ViewChild('paginatorDocType') paginatorDocType: MatPaginator;
  @ViewChild('paginatorAstCtgy') paginatorAstCtgy: MatPaginator;

  constructor(public _storageService: FinanceStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering constructor of ConfigComponent ...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngOnInit of ConfigComponent ...');
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngAfterViewInit of ConfigComponent ...');
    }

    forkJoin(
    this._storageService.fetchAllAccountCategories(),
    this._storageService.fetchAllDocTypes(),
    this._storageService.fetchAllAssetCategories(),
    ).subscribe((x: any) => {
      // Bind to the tables
      this.dataSourceAcntCtgy.data = x[0];
      this.dataSourceDocType.data = x[1];
      this.dataSourceAsstCtgy.data = x[2];
    });
  }
}
