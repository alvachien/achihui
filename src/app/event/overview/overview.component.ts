import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UIStatusService, EventStorageService } from '../../services';
import { LogLevel, UIStatusEnum, HomeDef, languageEn, languageZh, languageZhCN,
  GeneralEvent, momentDateFormat, HabitEventDetailWithCheckInStatistics,
} from '../../model';
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
    if (_uistatus.CurrentLanguage === languageZh) {
      this.initialLocaleCode = 'zh-cn';
    } else {
      this.initialLocaleCode = 'en';
    }

    this.listEvent = [];
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngOnInit of OverviewComponent...');
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ngAfterViewInit of OverviewComponent...');
    }

    let dtbgn: moment.Moment = moment();
    let dtend: moment.Moment = moment().add(1, 'months');

    // title: 'Long Event',
    // start: '2018-03-07',
    // end: '2018-03-10'
    let containerEl: any = $(this.elemcalendar.nativeElement);
    let that: any = this;
    // this.elemcalendar.nativeElement.
    containerEl.fullCalendar({
      // options here
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay,listWeek',
      },
      defaultDate: moment().format(momentDateFormat),
      locale: this.initialLocaleCode,
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      eventLimit: true, // allow "more" link when too many events
      eventSources: [
        // General events
        {
          events: (start: any, end: any, timezone: any, callback: any) => {
            that._storageService.fetchAllEvents(100, 0, true, start, end).subscribe((data: any) => {
              let arevents: any[] = [];
              for (let ci of data.contentList) {
                let gevnt: GeneralEvent = new GeneralEvent();
                gevnt.onSetData(ci);

                let evnt: any = {
                  title: gevnt.Name,
                  start: gevnt.StartTimeFormatString,
                  end: gevnt.EndTimeFormatString,
                  id: 'G' + gevnt.ID.toString(),
                  event_type: 'general',
                  event_id: gevnt.ID,
                };

                arevents.push(evnt);
              }
              callback(arevents);
            });
          },
          color: 'yellow',   // an option!
          textColor: 'black', // an option!
        },

        // Habit events
        {
          events: (start: any, end: any, timezone: any, callback: any) => {
            that._storageService.fetchHabitDetailWithCheckIn(start, end).subscribe((data: any) => {
              let arevents: any[] = [];
              for (let ci2 of data) {
                let hevnt: HabitEventDetailWithCheckInStatistics = new HabitEventDetailWithCheckInStatistics();
                hevnt.onSetData(ci2);

                let evnt: any = {
                  title: hevnt.name,
                  start: hevnt.StartDateFormatString,
                  end: hevnt.EndDateFormatString,
                  id: 'H' + hevnt.habitID.toString(),
                  event_type: 'habit',
                  event_id: hevnt.habitID,
                };
                arevents.push(evnt);
              }

              callback(arevents);
            });
          },
          color: 'grey',   // an option!
          textColor: 'black', // an option!
        },
      ],
      eventClick: (calEvent: any, jsEvent: any, view: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Enter OverviewComponent's eventClick
            ${view.name} - ${calEvent.title}, ${jsEvent.pageX} - ${jsEvent.pageY}`);
        }

        if (calEvent.event_type === 'general') {
          // General event
          that.onNavigateToGeneralEvent(+calEvent.event_id);
        } else if (calEvent.event_type === 'habit') {
          // Habit
          this.onNavigateToHabitEvent(calEvent.event_id);
        }
      },
    });
  }

  public onNavigateToGeneralEvent(id: number): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering onNavigateToGeneralEvent of OverviewComponent...');
    }
    this._router.navigate(['/event/general/display/' + id.toString()]);
  }
  public onNavigateToHabitEvent(id: number): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering onNavigateToHabitEvent of OverviewComponent...');
    }
    this._router.navigate(['/event/habit/display/' + id.toString()]);
  }
}
