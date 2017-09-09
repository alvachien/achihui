import { Component, OnInit } from '@angular/core';
import { LearnStorageService } from '../../services';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {

  constructor(private _learnService: LearnStorageService) { }

  ngOnInit() {
    this._learnService.fetchAllCategories();
  }
}
