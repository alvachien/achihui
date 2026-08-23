import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'hih-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
})
export class DocumentComponent {}
