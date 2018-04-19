import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, DocumentType } from '../../model';
import { FinanceStorageService } from '../../services';

/**
 * Data source of Document type
 */
export class DocumentTypeDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentType[]> {
    const displayDataChanges: any[] = [
      this._storageService.listDocTypeChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.DocumentTypes.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-finance-document-type-list',
  templateUrl: './document-type-list.component.html',
  styleUrls: ['./document-type-list.component.scss'],
})
export class DocumentTypeListComponent implements OnInit {

  displayedColumns: string[] = ['id', 'name', 'comment'];
  dataSource: DocumentTypeDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router) {
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    this.isLoadingResults = true;
    this.dataSource = new DocumentTypeDataSource(this._storageService, this.paginator);

    this._storageService.fetchAllDocTypes().subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
