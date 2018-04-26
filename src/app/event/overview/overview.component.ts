import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UIStatusService, EventStorageService } from '../../services';
import { LogLevel, UIStatusEnum, HomeDef, Language_En, Language_Zh, Language_ZhCN } from '../../model';
import * as FullCalendar from 'fullcalendar';

@Component({
  selector: 'hih-event-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('fcal') elemcalendar: ElementRef;
  ctrlCalendar: FullCalendar.Calendar;
  initialLocaleCode: string = 'en';

  constructor(private _uistatus: UIStatusService) {
    // Do nothing
    if (_uistatus.CurrentLanguage === Language_Zh) {
      this.initialLocaleCode = Language_ZhCN;
    } else {
      this.initialLocaleCode = Language_En;
    }
  }

  ngOnInit(): void {
    // Do nothing
  }

  ngAfterViewInit(): void {
    this.ctrlCalendar = new FullCalendar.Calendar(this.elemcalendar.nativeElement, {
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay,listMonth',
      },
      editable: true,
      weekNumbers: true,
      locale: this.initialLocaleCode,
      navLinks: true, // can click day/week names to navigate views
      eventLimit: true,
    });

    this.ctrlCalendar.render();
  }
}
