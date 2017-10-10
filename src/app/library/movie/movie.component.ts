import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-movie',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./movie.component.scss']
})
export class MovieComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
