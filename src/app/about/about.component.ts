import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'hih-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  version: string;
  relDate: string;

  constructor() {
    // Empty
  }

  ngOnInit(): void {
    this.version = environment.CurrentVersion;
    this.relDate = environment.ReleasedDate;
  }
}
