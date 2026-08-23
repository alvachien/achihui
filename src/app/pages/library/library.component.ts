import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'hih-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
})
export class LibraryComponent {}
