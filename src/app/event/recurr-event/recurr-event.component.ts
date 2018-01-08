import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';

@Component({
  selector: 'app-recurr-event',
  templateUrl: './recurr-event.component.html',
  styleUrls: ['./recurr-event.component.scss']
})
export class RecurrEventComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
