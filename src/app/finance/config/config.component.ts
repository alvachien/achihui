import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { AccountCategory, AssetCategory, DocumentType } from '../../model';

@Component({
  selector: 'hih-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit {
  dataSourceAcntCtgy: MatTableDataSource<AccountCategory> = new MatTableDataSource<AccountCategory>();
  dataSourceAsstCtgy: MatTableDataSource<AssetCategory> = new MatTableDataSource<AssetCategory>();
  dataSourceDocType: MatTableDataSource<DocumentType> = new MatTableDataSource<DocumentType>();
  displayedColumnsAcntCtgy: string[] = ['id', 'name', 'assetflag', 'comment'];
  displayedColumnsDocType: string[] = ['id', 'name', 'comment'];
  displayedColumnsAsstCtgy: string[] = ['id', 'name', 'desp'];

  constructor() {
    // Do nothing
  }

  ngOnInit(): void {
    // Do nothing
  }
}
