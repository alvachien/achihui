import { Component, OnInit } from '@angular/core';
import { Observable, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'hih-event-category',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {

  constructor() {
    // Empty
  }

  ngOnInit(): void {
    // Empty
  }
}
