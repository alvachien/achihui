import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'hih-statement-of-income-expense',
  templateUrl: './statement-of-income-expense.component.html',
  styleUrls: ['./statement-of-income-expense.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
})
export class StatementOfIncomeExpenseComponent {}
