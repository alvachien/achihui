import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-person',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
