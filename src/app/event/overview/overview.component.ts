import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UIStatusService, EventStorageService } from '../../services';
import { LogLevel, UIStatusEnum, HomeDef, languageEn, languageZh, languageZhCN,
  GeneralEvent, momentDateFormat, HabitEventDetailWithCheckInStatistics,
} from '../../model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Calendar } from 'fullcalendar';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'hih-event-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('fcal') elemcalendar: ElementRef;
  ctrlCalendar: Calendar;
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

    let that: any = this;
    this.ctrlCalendar = new Calendar(this.elemcalendar.nativeElement, {
      // options here
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay,listWeek',
      },
      defaultDate: new Date(),
      locale: this.initialLocaleCode,
      themeSystem: 'standard',
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      eventLimit: true, // allow "more" link when too many events
      eventSources: [
        // General events
        (arg: any, successCallback: any, failureCallback: any) => {
          let dtbgn: moment.Moment = moment(arg.startStr);
          let dtend: moment.Moment = moment(arg.endStr);
          that._storageService.fetchAllEvents(100, 0, true, dtbgn, dtend).subscribe((data: any) => {
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
                color: 'yellow',
                textColor: 'black',
              };

              arevents.push(evnt);
            }
            successCallback(arevents);
          });
        },

        // Habit events
        (arg: any, successCallback: any, failureCallback: any) => {
          let dtbgn: moment.Moment = moment(arg.startStr);
          let dtend: moment.Moment = moment(arg.endStr);
          that._storageService.fetchHabitDetailWithCheckIn(dtbgn, dtend).subscribe((data: any) => {
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
                color: 'grey',
                textColor: 'white',
              };
              arevents.push(evnt);
            }

            successCallback(arevents);
          });
        },
      ],
      eventClick: (arg: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Enter OverviewComponent's eventClick
            ${arg.view.name} - ${arg.event.title}, ${arg.jsEvent.pageX} - ${arg.jsEvent.pageY}`);
        }

        if (arg.event.extendedProps.event_type === 'general') {
          // General event
          that.onNavigateToGeneralEvent(+arg.event.extendedProps.event_id);
        } else if (arg.event.extendedProps.event_type === 'habit') {
          // Habit
          this.onNavigateToHabitEvent(arg.event.extendedProps.event_id);
        }
      },
    });

    this.ctrlCalendar.render();
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
