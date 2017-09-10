import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MdPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { LogLevel, DocumentType } from '../../model';
import { FinanceStorageService } from '../../services';

/**
 * Data source of Document type
 */
export class DocumentTypeDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService, 
    private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentType[]> {
    const displayDataChanges = [
      this._storageService.listDocTypeChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._storageService.DocumentTypes.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() { }
}

@Component({
  selector: 'app-document-type-list',
  templateUrl: './document-type-list.component.html',
  styleUrls: ['./document-type-list.component.scss']
})
export class DocumentTypeListComponent implements OnInit {

  displayedColumns = ['id', 'name', 'comment'];
  dataSource: DocumentTypeDataSource | null;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router) { }

  ngOnInit() {
    this.dataSource = new DocumentTypeDataSource(this._storageService, this.paginator);
    
    this._storageService.fetchAllDocTypes();
  }
}
