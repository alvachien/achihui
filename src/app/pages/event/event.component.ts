import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCalendarMode, NzCalendarModule } from 'ng-zorro-antd/calendar';

@Component({
  selector: 'hih-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.less'],
  imports: [
    FormsModule,
    FormsModule,
    NzCalendarModule
  ]
})
export class EventComponent {
  selectedDate = new Date();
  mode: NzCalendarMode = 'month';

  panelChange(change: { date: Date; mode: string }): void {
    console.log(change.date, change.mode);
  }
}
