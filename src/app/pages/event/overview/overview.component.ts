import { FormsModule } from '@angular/forms';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NzCalendarModule, NzCalendarMode } from 'ng-zorro-antd/calendar';

@Component({
  selector: 'hih-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.less'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzCalendarModule, FormsModule],
})
export class OverviewComponent {
  selectedDate = new Date();
  mode: NzCalendarMode = 'month';

  panelChange(change: { date: Date; mode: string }): void {
    console.log(change.date, change.mode);
  }
}
