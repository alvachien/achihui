import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-book',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}