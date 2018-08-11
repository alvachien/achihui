import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog, MatSnackBar, MatTableDataSource, MatPaginator } from '@angular/material';
import { AccountCategory, AssetCategory, DocumentType } from '../../model';
import { FinanceStorageService } from '../../services';

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
    // Do nothing
  }

  ngOnInit(): void {
    // Do nothing
  }

  ngAfterViewInit(): void {
    // this._storageService.fetchAllAccountCategories()
    // this._storageService.fetchAllDocTypes()
    // this._storageService.fetchAllAssetCategories()
  }
}
