import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'hih-fin-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
})
export class OrderComponent {}
