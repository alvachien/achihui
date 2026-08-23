import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'hih-cash-report',
  templateUrl: './cash-report.component.html',
  styleUrls: ['./cash-report.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
})
export class CashReportComponent {}
