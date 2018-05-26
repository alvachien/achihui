import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UIStatusService, EventStorageService } from '../../services';
import { LogLevel, UIStatusEnum, HomeDef, Language_En, Language_Zh, Language_ZhCN,
  GeneralEvent, MomentDateFormat, HabitEventDetailWithCheckInStatistics } from '../../model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import 'fullcalendar';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'hih-event-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('fcal') elemcalendar: ElementRef;
  // ctrlCalendar: FullCalendar.Calendar;
  initialLocaleCode: string = 'en';
  listEvent: any[];

  constructor(private _uistatus: UIStatusService,
    private _router: Router,
    private _storageService: EventStorageService) {
    // Do nothing
    if (_uistatus.CurrentLanguage === Language_Zh) {
      this.initialLocaleCode = 'zh-cn';
    } else {
      this.initialLocaleCode = 'en';
    }

    this.listEvent = [];
  }

  ngOnInit(): void {
    // Do nothing
  }

  ngAfterViewInit(): void {
    let dtbgn: moment.Moment = moment();
    let dtend: moment.Moment = moment().add(1, 'months');

    // title: 'Long Event',
    // start: '2018-03-07',
    // end: '2018-03-10'
    forkJoin(
      this._storageService.fetchAllEvents(100, 0, true, dtbgn, dtend),
      this._storageService.fetchHabitDetailWithCheckIn(dtbgn, dtend),
    ).subscribe((x: any) => {
      let events: any[] = [];
      this.listEvent = [];

      if (x[0]) {
        for (let ci of x[0].contentList) {
          let gevnt: GeneralEvent = new GeneralEvent();
          gevnt.onSetData(ci);
          this.listEvent.push(gevnt);

          let evnt: any = {
            title: gevnt.Name,
            start: gevnt.StartTimeFormatString,
            end: gevnt.EndTimeFormatString,
            event_id: gevnt.ID,
            event_type: 'general',
          };

          events.push(evnt);
        }
      }
      if (x[1]) {
        for (let ci2 of x[1]) {
          let hevnt: HabitEventDetailWithCheckInStatistics = new HabitEventDetailWithCheckInStatistics();
          hevnt.onSetData(ci2);
          this.listEvent.push(hevnt);

          let evnt: any = {
            title: hevnt.name,
            start: hevnt.StartDateFormatString,
            end: hevnt.EndDateFormatString,
            event_id: hevnt.habitID,
            event_type: 'habit',
          };

          events.push(evnt);
        }
      }

      // Do nothing
      let containerEl: any = $(this.elemcalendar.nativeElement);
      // this.elemcalendar.nativeElement.
      containerEl.fullCalendar({
        // options here
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay,listWeek',
        },
        defaultDate: moment().format(MomentDateFormat),
        locale: this.initialLocaleCode,
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        events: events,
        eventClick: function(calEvent, jsEvent, view) {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Enter OverviewComponent's eventClick ${view.name} - ${calEvent.title}, ${jsEvent.pageX} - ${jsEvent.pageY}`);
          }

          if (calEvent.event_type === 'general') {
            // General event
            this._router.navigate(['/event/general/display/' + calEvent.event_id.toString()]);

          } else if (calEvent.event_type === 'habit') {
            // Habit
            this._router.navigate(['/event/habit/display/' + calEvent.event_id.toString()]);
          }
      
          // alert('Event: ' + calEvent.title);
          // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
          // alert('View: ' + view.name);
      
          // // change the border color just for fun
          // $(this).css('border-color', 'red');
      
        }
      });
    });
  }
}
