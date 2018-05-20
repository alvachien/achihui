import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UIStatusService, EventStorageService } from '../../services';
import { LogLevel, UIStatusEnum, HomeDef, Language_En, Language_Zh, Language_ZhCN,
  GeneralEvent } from '../../model';
import * as FullCalendar from 'fullcalendar';
import * as moment from 'moment';

@Component({
  selector: 'hih-event-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('fcal') elemcalendar: ElementRef;
  ctrlCalendar: FullCalendar.Calendar;
  initialLocaleCode: string = 'en';
  listEvent: GeneralEvent[];

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
    this._storageService.fetchAllEvents(100, 0, true, dtbgn, dtend).subscribe((x: any) => {
      let events: any[] = [];
      this.listEvent = [];
      for (let ci of x.contentList) {
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

      // Do nothing
      this.ctrlCalendar = new FullCalendar.Calendar(this.elemcalendar.nativeElement, {
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,basicWeek,basicDay',
        },
        defaultView: 'month',
        editable: true,
        weekNumbers: true,
        navLinks: true, // can click day/week names to navigate views
        eventLimit: true,
        events: events,
      });

      this.ctrlCalendar.render();
      });
  }
}
