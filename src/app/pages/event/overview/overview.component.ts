import { Component } from '@angular/core';
import { NzCalendarMode } from 'ng-zorro-antd/calendar';

@Component({
    selector: 'hih-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.less'],
    standalone: false
})
export class OverviewComponent {
  selectedDate = new Date();
  mode: NzCalendarMode = 'month';

  panelChange(change: { date: Date; mode: string }): void {
    console.log(change.date, change.mode);
  }
}
