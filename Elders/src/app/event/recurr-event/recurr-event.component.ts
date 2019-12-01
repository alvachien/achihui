import { Component, OnInit } from '@angular/core';
import { Observable, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'hih-event-recurrevent',
  template: `<router-outlet></router-outlet>`,
})
export class RecurrEventComponent implements OnInit {

  constructor() {
    // Empty
   }

  ngOnInit(): void {
    // Empty
  }
}
