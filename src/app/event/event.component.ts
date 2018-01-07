import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-event',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

  constructor() {
    //console.log('Enter constructor of EventComponent');
  }

  ngOnInit() {
    //console.log('Enter ngOnInit of EventComponent');
  }
}
