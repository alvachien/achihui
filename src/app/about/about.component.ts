import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'hih-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  version: string;
  relDate: string;

  constructor() {
    this.version = environment.CurrentVersion;
    this.relDate = environment.ReleasedDate;
  }
}
