import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-library',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
