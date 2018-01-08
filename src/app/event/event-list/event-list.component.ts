import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LogLevel, LearnObject } from '../../model';
import { EventStorageService } from '../../services';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {

  constructor(private _storageService: EventStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter constructor of EventListComponent`);
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter ngOnInit of EventListComponent`);
    }
  }
}
