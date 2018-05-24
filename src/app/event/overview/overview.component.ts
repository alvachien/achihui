import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UIStatusService, EventStorageService } from '../../services';
import { LogLevel, UIStatusEnum, HomeDef, Language_En, Language_Zh, Language_ZhCN,
  GeneralEvent, MomentDateFormat, HabitEventDetailWithCheckInStatistics } from '../../model';
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
    private _storageService: EventStorageService) {
    // Do nothing
    if (_uistatus.CurrentLanguage === Language_Zh) {
      this.initialLocaleCode = Language_ZhCN;
    } else {
      this.initialLocaleCode = Language_En;
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
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        events: events,
      });
    });
  }
}
