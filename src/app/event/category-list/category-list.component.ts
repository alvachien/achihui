import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LogLevel, BookCategory } from '../../model';
import { LibraryStorageService } from '../../services';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';

@Component({
  selector: 'hih-event-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  displayedColumns = ['id', 'name', 'parid', 'fulldisplay', 'comment'];
  //dataSource: BookCategoryDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: LibraryStorageService,
    private _router: Router) { }

  ngOnInit() {
    //this.dataSource = new BookCategoryDataSource(this._storageService, this.paginator);
    //this._storageService.fetchAllBookCategories().subscribe((x) => {
    //  // Just ensure the request has been fired
    //});
  }
}
