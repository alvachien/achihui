import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'hih-home-def',
  templateUrl: './home-def.component.html',
  styleUrls: ['./home-def.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
})
export class HomeDefComponent {}
