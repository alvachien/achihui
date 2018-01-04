import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {

  constructor() {
    console.log('Enter constructor of EventListComponent');
  }

  ngOnInit() {
    console.log('Enter ngOnInit of EventListComponent');
  }
}
