import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { EventStorageService } from '../../services';

@Component({
  selector: 'hih-event-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
})
export class CategoryListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'parid', 'fulldisplay', 'comment'];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public _storageService: EventStorageService,
    private _router: Router) { }

  ngOnInit(): void {
    // Empty for now

    // this.dataSource = new BookCategoryDataSource(this._storageService, this.paginator);
    // this._storageService.fetchAllBookCategories().subscribe((x) => {
    //  // Just ensure the request has been fired
    // });
  }
}
